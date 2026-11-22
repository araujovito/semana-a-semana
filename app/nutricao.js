"use strict";
/* Contas de nutrição: porções, restrições, trocas, plano do dia, soma de nutrientes e metas. Sem acesso à página.
   Um item de plano é { k: chave do alimento, g: gramas já na porção final, pos: posição no cardápio base } e, quando trocado,
   { de: chave original, motivo: "restricao" (troca automática, pelo perfil) }. O motivo "troca" fica reservado para a troca manual, que ainda não existe.
   Cada refeição do plano tem ainda trocada (há item trocado ou retirado) e fora: [{ k, pos }] (itens retirados por falta de substituto). */

function gramas(g, f) { const v = g * f; return v < 20 ? Math.max(1, Math.round(v)) : Math.round(v / 5) * 5; }
/* Alimento contado em unidades (medida caseira que começa com "unidade": ovo, pão francês, frutas, castanhas) não recebe porção
   quebrada: a porção anda de unidade em unidade. Só quando a unidade pesa 60 g ou mais (banana, laranja, maçã, goiaba, batata, tomate)
   vale meia unidade, porque dá para cortar ao meio e guardar; ovo, pão francês e castanhas são sempre inteiros. Devolve o passo em gramas, ou 0. */
function passoDaUnidade(k) { const a = A[k]; return /^unidade/.test(a.medida) ? (a.gMedida >= 60 ? a.gMedida / 2 : a.gMedida) : 0; }
/* Porção final do alimento k: g gramas da porção base vezes o fator f, arredondada (em unidades, quando o alimento é de unidade). */
function porcao(k, g, f) {
  const u = passoDaUnidade(k);
  return u ? Math.round(Math.max(1, Math.round(g * f / u)) * u) : gramas(g, f);
}
function medida(k, g) {
  const a = A[k], r = Math.round((g / a.gMedida) * 2) / 2;
  if (r < 0.5) return "";
  const n = r === 0.5 ? "½" : Number.isInteger(r) ? String(r) : Math.floor(r) + "½";
  return n + " × " + a.medida;
}
function zeros() { const t = {}; CAMPOS.forEach(c => { t[c] = 0; }); return t; }
function somarItens(itens) {
  const t = zeros();
  itens.forEach(it => { const a = A[it.k]; CAMPOS.forEach(c => { t[c] += a[c] * it.g / 100; }); });
  return t;
}
/* Soma o plano inteiro ou só as refeições em que quais[i] é verdadeiro. */
function somarPlano(plano, quais) {
  let itens = [];
  plano.refeicoes.forEach((r, i) => { if (!quais || quais[i]) itens = itens.concat(r.itens); });
  return somarItens(itens);
}

/* ---------- o que você não come ---------- */
/* Cada restrição do perfil (perfil.naoCome guarda os ids) tira os alimentos que têm a marca no campo "contem" (dados/gerar_alimentos.py).
   "sem" é o trecho usado nas frases da tela Plano. */
const RESTRICOES = [
  { id: "lactose", rotulo: "Leite e derivados (lactose)", marca: "leite", sem: "sem leite e derivados" },
  { id: "ovo", rotulo: "Ovo", marca: "ovo", sem: "sem ovo" },
  { id: "peixe", rotulo: "Peixe", marca: "peixe", sem: "sem peixe" },
  { id: "carne_vermelha", rotulo: "Carne vermelha", marca: "carne_vermelha", sem: "sem carne vermelha" },
  { id: "porco", rotulo: "Carne de porco", marca: "porco", sem: "sem carne de porco" },
  { id: "gluten", rotulo: "Glúten", marca: "gluten", sem: "sem glúten" },
  { id: "vegetariana", rotulo: "Carne, ave e peixe (vegetariana)", marca: "carne", sem: "sem carne, ave e peixe" },
];
const GRUPOS = { proteina: "Carnes, ovos e peixes", laticinio: "Leite, iogurte e queijos", leguminosa: "Feijões", carboidrato: "Arroz, pães e raízes",
  vegetal: "Verduras e legumes", fruta: "Frutas", gordura: "Azeite, castanhas e sementes", bebida: "Bebidas" };
const SEM_RESTRICAO = { marcas: [], naoGosta: [] };
/* Restrições em uso: { marcas: marcas de "contem" vetadas, naoGosta: chaves vetadas }. Perfil antigo pode não ter os campos. */
function restricoesDoPerfil() {
  const p = E.perfil || {}, ids = p.naoCome || [];
  return { marcas: RESTRICOES.filter(r => ids.indexOf(r.id) >= 0).map(r => r.marca), naoGosta: p.naoGosta || [] };
}
function podeComer(k, R) { return R.naoGosta.indexOf(k) < 0 && !(A[k].contem || []).some(c => R.marcas.indexOf(c) >= 0); }

/* ---------- trocas ---------- */
/* Regra de equivalência por grupo, a mesma da tabela de trocas da tela Plano: o alimento que entra vem na quantidade que entrega
   o mesmo tanto do nutriente pelo qual o grupo está no cardápio. Laticínio é por cálcio (e não por proteína) porque o cálcio é o
   que os laticínios trazem de difícil de repor. Vegetal e bebida: mesmos gramas. */
const EQUIVALE = { proteina: "prot", laticinio: "ca", carboidrato: "kcal", leguminosa: "kcal", fruta: "kcal", gordura: "kcal" };
/* Não entram como opção de troca: o whey é suplemento, e o app não indica suplemento. */
const FORA_DAS_TROCAS = ["whey"];
/* Grupo que não tem mais nenhum alimento permitido: a fonte de proteína vira uma leguminosa com a mesma proteína.
   Os outros grupos não têm substituto de outro grupo: o item sai do cardápio e a tela Plano mostra isso. */
const OUTRO_GRUPO = { proteina: "leguminosa" };
/* Porção de um item trocado não passa disto (em gramas), para a equivalência não gerar prato impossível (ex.: 590 g de tofu no lugar de 120 g de frango). */
const TETO_TROCA = 250;
function gramasEquivalentes(de, g, para, campo) {
  const c = campo || EQUIVALE[A[de].grupo];
  if (!c || !(A[de][c] > 0) || !(A[para][c] > 0)) return g;
  return g * A[de][c] / A[para][c];
}
function candidatos(grupo, menos, R) {
  return Object.keys(A).filter(c => c !== menos && A[c].grupo === grupo && FORA_DAS_TROCAS.indexOf(c) < 0 && podeComer(c, R));
}
/* Troca automática de um item que você não come. Critério: alimento permitido do mesmo grupo, de preferência um que não esteja
   em outra refeição do mesmo dia (para não repetir), e entre esses o que fica mais parecido em energia e proteína na quantidade
   equivalente. Empate: ordem da lista de alimentos. Devolve { k, gb (gramas na porção base), outroGrupo } ou null (o item sai). */
function substituto(k, g, R, doDia) {
  const grupo = A[k].grupo;
  let cands = candidatos(grupo, k, R), campo, outro = false;
  if (!cands.length && OUTRO_GRUPO[grupo]) { cands = candidatos(OUTRO_GRUPO[grupo], k, R); campo = EQUIVALE[grupo]; outro = true; }
  if (!cands.length) return null;
  const livres = cands.filter(c => doDia.indexOf(c) < 0); if (livres.length) cands = livres;
  const kcal = A[k].kcal * g / 100, prot = A[k].prot * g / 100;
  let melhor = null;
  cands.forEach(c => {
    const gb = gramasEquivalentes(k, g, c, campo), gc = Math.min(gb, TETO_TROCA);
    const dist = Math.abs(A[c].kcal * gc / 100 - kcal) / Math.max(kcal, 1) + Math.abs(A[c].prot * gc / 100 - prot) / Math.max(prot, 1);
    if (!melhor || dist < melhor.dist - 1e-9) melhor = { k: c, gb, dist, outroGrupo: outro };
  });
  return melhor;
}
/* Cardápio do dia i (0 a 6 = segunda a domingo, 7 = dia de enjoo) com as trocas automáticas resolvidas, ainda na porção base.
   Ordem: item original (se você come) > troca automática > o item sai.
   Cada item: { k, gb, g0 (gramas base do original), papel (grupo do original, que decide a escala), pos, de, motivo, outroGrupo }.
   A troca manual (E.trocas) ainda não existe nas telas e por isso não é lida aqui. */
function resolverDia(i, R) {
  const d = i === 7 ? C.nausea : C.dias[i], doDia = [];
  d.refeicoes.forEach(r => r.itens.forEach(it => { doDia.push(it[0]); }));
  return { indice: i, nome: d.nome, refeicoes: d.refeicoes.map(r => {
    const itens = [], fora = [];
    r.itens.forEach((it, pos) => {
      const k = it[0], g0 = it[1], papel = A[k].grupo;
      if (podeComer(k, R)) itens.push({ k, gb: g0, g0, papel, pos });
      else {
        const s = substituto(k, g0, R, doDia);
        if (s) itens.push({ k: s.k, gb: s.gb, g0, papel, pos, de: k, motivo: "restricao", outroGrupo: s.outroGrupo });
        else fora.push({ k, pos });
      }
    });
    return { tipo: r.tipo, titulo: r.titulo, preparo: r.preparo, itens, fora };
  }) };
}

/* ---------- escala das porções ---------- */
/* Dois fatores, em vez de um só para tudo:
   - prot: multiplica as fontes de proteína (grupo proteina), para a proteína média da semana chegar à meta de proteína;
   - energia: multiplica carboidrato e leguminosa, para a energia média chegar à meta depois de fixada a proteína. Leguminosa
     (feijões) só acompanha para cima: nunca fica abaixo da porção base, porque traz fibra (R12) e proteína; nos dias de pouca
     energia quem encolhe é arroz, pão e raízes.
   Vegetais, frutas, laticínios e bebidas ficam na porção base: carregam vitaminas, minerais e cálcio com pouca energia,
   e as medidas deles são naturais (um pote, um copo, uma fruta).
   Quem decide o fator de um item é o grupo do alimento original do cardápio (o papel dele na refeição), mesmo depois de trocado.
   Piso por dia: nenhum dia planejado (segunda a domingo) fica abaixo de pisoDia kcal; se ficar, o fator de energia daquele dia sobe
   de 0,05 em 0,05 até passar do piso (no máximo até energiaTeto). O dia de enjoo é leve de propósito: não tem piso e nunca é
   escalado para cima (fatores de no máximo 1).
   Vesícula e fígado (REGRAS_CARDAPIO em app/cardapio.js; relatório empresa/relatorios/pesquisa-vesicula-figado.md):
   - o grupo gordura (azeite, castanhas, sementes, abacate) tem fator próprio em cada refeição: acompanha o de energia, mas
     encolhe menos que o resto do prato (GORDURA_PISO), o azeite ou óleo não passa de azeiteMaxRefeicao e a gordura da refeição
     não passa de gordAlvoRefeicao (R3 e R4). Antes o azeite seguia o fator de energia sem limite (com 1,65, ia de 8 para 13 g);
   - nenhuma refeição passa de kcalMaxRefeicao (R5): se o fator do dia levaria a refeição acima disso, o fator de energia daquela
     refeição desce até caber. A energia que falta vai para as outras refeições, em geral os lanches, porque a busca de
     calcularEscala sobe o fator do dia até a média chegar à meta. As duas contas estão em fatorDaRefeicao. */
const ESCALA = { protMin: 0.5, protMax: 1.75, energiaMin: 0.5, energiaMax: 2, energiaTeto: 3, passo: 0.05, tolerancia: 0.07 };
const PISO_DIA = 1200;
/* Menor fator do grupo gordura quando o resto do prato encolhe (fator de energia abaixo de 1). Nas refeições principais desce pouco,
   para manter a gordura que faz a vesícula esvaziar (R3); nos lanches desce mais, para o dia não passar de 35% de gordura (R4).
   Valores escolhidos pela conferência de perfis de 1.200 a 1.950 kcal (testes/unidade/regras-cardapio.js), não por estudo. */
const GORDURA_PISO = { principal: 0.85, lanche: 0.75 };
/* Fator de um item pelo grupo. esc.gordura vem de fatorDaRefeicao; sem ele, a gordura segue o fator de energia. */
function fatorDoGrupo(grupo, esc) {
  if (grupo === "gordura") return esc.gordura != null ? esc.gordura : esc.energia;
  if (grupo === "leguminosa") return Math.max(1, esc.energia);
  return grupo === "proteina" ? esc.prot : grupo === "carboidrato" ? esc.energia : 1;
}
function gramasFinais(it, esc) {
  const f = fatorDoGrupo(it.papel, esc), g = porcao(it.k, it.gb, f);
  if (!it.de) return g;
  const teto = Math.max(TETO_TROCA, porcao(it.de, it.g0, f));
  if (g <= teto) return g;
  const u = passoDaUnidade(it.k);
  return u ? Math.max(1, Math.floor(teto / u)) * u : teto;
}
function somaDaRefeicao(itens, esc, campo) { let t = 0; itens.forEach(it => { t += A[it.k][campo] * gramasFinais(it, esc) / 100; }); return t; }
/* Escala de uma refeição a partir da escala do dia { prot, energia }. Devolve { prot, energia, gordura }, todos na grade de ESCALA.passo:
   1. gordura: começa no fator de energia, mas não abaixo de GORDURA_PISO (principal: tipo em REGRAS_CARDAPIO.principais), para a
      refeição não ficar sem a gordura que faz a vesícula esvaziar (R3) quando o resto do prato encolhe; desce enquanto o azeite ou
      óleo passar de azeiteMaxRefeicao ou a gordura da refeição passar de gordAlvoRefeicao (até ESCALA.energiaMin; se a refeição já passa do alvo sem a gordura de adição, fica no mínimo);
   2. energia: desce enquanto a refeição passar de kcalMaxRefeicao (até ESCALA.energiaMin; proteína alta pode não caber nem assim).
   Primeiro uma estimativa linear entre o mínimo e o fator do dia, depois o acerto fino com o arredondamento real das porções. */
function fatorDaRefeicao(itens, esc, principal) {
  const RG = REGRAS_CARDAPIO, fMin = ESCALA.energiaMin, P = ESCALA.passo, e = { prot: esc.prot, energia: esc.energia, gordura: Math.max(principal ? GORDURA_PISO.principal : GORDURA_PISO.lanche, esc.energia) };
  const azeite = x => { let g = 0; itens.forEach(it => { if (RG.gordurasDeAdicao.indexOf(it.k) >= 0) g += gramasFinais(it, x); }); return g; };
  const descer = (campo, passou, estimar) => {
    if (e[campo] <= fMin || !passou()) return;
    const alto = e[campo]; e[campo] = fMin;
    if (passou()) return;
    const v = estimar(alto);
    e[campo] = Math.max(fMin, Math.min(alto, f2(fMin + Math.floor((v - fMin) / P) * P)));
    while (e[campo] > fMin && passou()) e[campo] = f2(e[campo] - P);
    for (;;) { const ant = e[campo], prox = f2(ant + P); if (prox > alto) break; e[campo] = prox; if (passou()) { e[campo] = ant; break; } }
  };
  const gordura = () => somaDaRefeicao(itens, e, "gord"), kcal = () => somaDaRefeicao(itens, e, "kcal");
  // valor da conta (gordura ou kcal) com o fator campo em fMin e em alto, para a estimativa linear
  const nasPontas = (campo, alto, conta) => { const c = e[campo]; e[campo] = fMin; const a = conta(); e[campo] = alto; const b = conta(); e[campo] = c; return { a, b }; };
  const linear = (campo, conta, max) => alto => { const v = nasPontas(campo, alto, conta); return v.b > v.a ? fMin + (max - v.a) / (v.b - v.a) * (alto - fMin) : fMin; };
  descer("gordura", () => azeite(e) > RG.azeiteMaxRefeicao.valor || gordura() > RG.gordAlvoRefeicao.valor, linear("gordura", gordura, RG.gordAlvoRefeicao.valor));
  descer("energia", () => kcal() > RG.kcalMaxRefeicao.valor, linear("energia", kcal, RG.kcalMaxRefeicao.valor));
  return e;
}
function escalar(res, esc) {
  return { indice: res.indice, nome: res.nome, refeicoes: res.refeicoes.map(r => {
    const er = fatorDaRefeicao(r.itens, esc, REGRAS_CARDAPIO.principais.indexOf(r.tipo) >= 0);
    const itens = r.itens.map(it => {
      const o = { k: it.k, g: gramasFinais(it, er), pos: it.pos };
      if (it.de) { o.de = it.de; o.motivo = it.motivo; if (it.outroGrupo) o.outroGrupo = true; }
      return o;
    });
    return { tipo: r.tipo, titulo: r.titulo, preparo: r.preparo, itens, fora: r.fora, trocada: r.fora.length > 0 || itens.some(x => !!x.de) };
  }) };
}
const f2 = x => Math.round(x * 100) / 100;
/* Procura os dois fatores testando todas as combinações da grade (passo de 0,05 dentro dos limites) no cardápio real, já com
   arredondamento das porções, trocas automáticas das restrições R e piso por dia. Escolhe primeiro pela proteína (fica entre as
   combinações a até 3% da meta, ou as mais próximas que os limites deixam) e, entre essas, a de energia mais perto da meta.
   Devolve { prot, energia, dias: [fator de energia de cada dia, de segunda a domingo], kcalMedia, protMedia, noLimite }.
   noLimite: os limites não deixaram a média da semana chegar a 7% das duas metas. */
const MEMO_ESCALA = {};
/* Guarda as escalas já calculadas entre aberturas do app (a primeira conta leva de 0,3 s a alguns segundos num celular fraco:
   auditoria 2). É dado derivado: se o armazenamento falhar ou vier de outra versão do cardápio, a conta é refeita. */
const CHAVE_ESCALA = "semana-a-semana.escala", VERSAO_ESCALA = 3 + "|" + Object.keys(A).length + "|" + JSON.stringify(C).length;
function lerEscalasGuardadas() { try { const x = JSON.parse(localStorage.getItem(CHAVE_ESCALA)); return x && x.v === VERSAO_ESCALA ? x.e : {}; } catch (e) { return {}; } }
function guardarEscala(chave, r) {
  try { const e = lerEscalasGuardadas(), ks = Object.keys(e); if (ks.length > 20) delete e[ks[0]]; e[chave] = r; localStorage.setItem(CHAVE_ESCALA, JSON.stringify({ v: VERSAO_ESCALA, e })); } catch (e) { /* sem cache: só fica mais lento */ }
}
/* protTeto: proteína média máxima aceita (g). Auditoria 2: com meta de energia alta e proteína baixa (IMC abaixo de 25), escolher
   a proteína colada na meta travava a energia no fator mínimo e o cardápio ficava até 545 kcal abaixo da meta. Agora vale
   qualquer proteína de 3% abaixo da meta até o teto (1,6 g/kg do peso de referência), e entre essas ganha a energia mais perto. */
function calcularEscala(kcal, prot, R, pisoDia, protTeto) {
  const piso = pisoDia == null ? PISO_DIA : pisoDia, teto = Math.max(prot * 1.03, protTeto || 0);
  const chave = kcal + "|" + prot + "|" + Math.round(teto) + "|" + piso + "|" + R.marcas.join(",") + "|" + R.naoGosta.join(",");
  if (MEMO_ESCALA[chave]) return MEMO_ESCALA[chave];
  const guardada = lerEscalasGuardadas()[chave];
  if (guardada && Array.isArray(guardada.dias) && guardada.dias.length === 7) return (MEMO_ESCALA[chave] = guardada);
  const dias = [];
  for (let i = 0; i < 7; i++) dias.push(resolverDia(i, R).refeicoes.map(r => ({ itens: r.itens, principal: REGRAS_CARDAPIO.principais.indexOf(r.tipo) >= 0 })));
  // mesma conta de escalar(): cada refeição com o seu fator (fatorDaRefeicao)
  const soma = (refs, esc) => { let k = 0, p = 0; refs.forEach(r => { const er = fatorDaRefeicao(r.itens, esc, r.principal); r.itens.forEach(it => { const g = gramasFinais(it, er), al = A[it.k]; k += al.kcal * g / 100; p += al.prot * g / 100; }); }); return { k, p }; };
  const n = (a, b) => Math.round((b - a) / ESCALA.passo), todas = [];
  for (let a = 0; a <= n(ESCALA.protMin, ESCALA.protMax); a++) for (let b = 0; b <= n(ESCALA.energiaMin, ESCALA.energiaMax); b++) {
    const fp = f2(ESCALA.protMin + a * ESCALA.passo), fe = f2(ESCALA.energiaMin + b * ESCALA.passo), fDias = [];
    let sk = 0, sp = 0;
    dias.forEach(refs => {
      let f = fe, s = soma(refs, { prot: fp, energia: f });
      while (s.k < piso && f < ESCALA.energiaTeto) { f = f2(f + ESCALA.passo); s = soma(refs, { prot: fp, energia: f }); }
      fDias.push(f); sk += s.k / 7; sp += s.p / 7;
    });
    todas.push({ prot: fp, energia: fe, dias: fDias, kcalMedia: sk, protMedia: sp, eP: Math.abs(sp / prot - 1), eK: Math.abs(sk / kcal - 1) });
  }
  let faixa = todas.filter(c => c.protMedia >= prot * 0.97 - 1e-9 && c.protMedia <= teto + 1e-9);
  if (!faixa.length) { const minP = Math.min.apply(null, todas.map(c => c.eP)), corte = Math.max(minP, 0.03) + 1e-9; faixa = todas.filter(c => c.eP <= corte); }
  let m = null;
  faixa.forEach(c => { if (!m || c.eK < m.eK - 1e-9 || (Math.abs(c.eK - m.eK) <= 1e-9 && c.eP < m.eP - 1e-9)) m = c; });
  const r = { prot: m.prot, energia: m.energia, dias: m.dias, kcalMedia: m.kcalMedia, protMedia: m.protMedia, noLimite: m.eK > ESCALA.tolerancia || m.protMedia < prot * (1 - ESCALA.tolerancia) || m.protMedia > teto * (1 + ESCALA.tolerancia) };
  MEMO_ESCALA[chave] = r; guardarEscala(chave, r);
  return r;
}

/* ---------- o que as telas usam ---------- */
/* Plano com gramas finais: escala do perfil e restrições R (R serve para comparar, por exemplo como seria sem restrições). */
function planoCom(i, R) {
  const m = metas(), e = calcularEscala(m.kcal, m.prot, R, m.pisoDia, m.protMax);
  return escalar(resolverDia(i, R), i === 7 ? { prot: Math.min(1, e.prot), energia: Math.min(1, e.energia) } : { prot: e.prot, energia: e.dias[i] });
}
function planoDoDia(i) { return planoCom(i, restricoesDoPerfil()); }
function planoDaData(d) { return planoDoDia(dia(d).enjoo ? 7 : diaSemana(d)); }
function mediaCom(R) {
  const m = zeros();
  for (let i = 0; i < 7; i++) { const t = somarPlano(planoCom(i, R)); CAMPOS.forEach(c => { m[c] += t[c] / 7; }); }
  return m;
}
function mediaSemana() { return mediaCom(restricoesDoPerfil()); }
/* Nutrientes que caem por causa das restrições do perfil: compara a média da semana com e sem elas.
   Entra na lista quem fica abaixo de 80% da meta tendo caído pelo menos 5 pontos (menos que isso é ruído de arredondamento de
   porção), ou quem cai mais de 15 pontos e termina abaixo de 100%.
   Devolve [{ campo, rotulo, pct, pctSem }]. */
function quedasPorRestricao() {
  const R = restricoesDoPerfil();
  if (!R.marcas.length && !R.naoGosta.length) return [];
  const m = metas(), com = mediaCom(R), sem = mediaCom(SEM_RESTRICAO);
  return [["prot", "Proteína", m.prot], ["fibra", "Fibra", m.fibra]].concat(NUTRI.map(n => [n[0], n[1], m.micro[n[0]]])).map(x => {
    return { campo: x[0], rotulo: x[1], pct: Math.round(100 * com[x[0]] / x[2]), pctSem: Math.round(100 * sem[x[0]] / x[2]) };
  }).filter(q => (q.pct < 80 && q.pctSem - q.pct >= 5) || (q.pctSem - q.pct > 15 && q.pct < 100));
}

function pesoAtual() {
  const p = E.pesos.slice().sort(porData);
  return p.length ? p[p.length - 1].kg : (E.perfil ? E.perfil.peso : null);
}
function metas() {
  const p = E.perfil; if (!p) return null;
  const peso = pesoAtual(), alt = p.altura / 100, idade = new Date().getFullYear() - p.nascimento, masc = p.sexo === "M";
  const imc = peso / (alt * alt);
  const tmb = 10 * peso + 6.25 * p.altura - 5 * idade + (masc ? 5 : -161);
  const gasto = tmb * (p.atividade || 1.2);
  const piso = masc ? 1800 : 1200;
  /* Limites de segurança (auditoria 1, achado 2): com IMC atual abaixo de 25, ou gravidez/amamentação marcada no perfil, o app
     não calcula redução de calorias: a energia é o gasto estimado. Abaixo de 18,5 (baixo peso na classificação de IMC da OMS)
     as telas mostram avisoPesoBaixo(). */
  const gestante = p.gestante === true, semDeficit = imc < 25 || gestante, abaixoDoPeso = imc < 18.5;
  const kcalCalc = Math.max(piso, Math.round((gasto - (semDeficit ? 0 : 500)) / 50) * 50);
  const kcal = p.metaKcal || kcalCalc;
  const peso25 = 25 * alt * alt;
  /* Peso de referência da proteína: peso ajustado (peso no IMC 25 mais 25% do excesso) a partir do IMC 25. Em 25 ele coincide
     com o peso real, então a meta não dá salto quando o peso cruza uma faixa (antes só ajustava de 30 para cima: achado 10). */
  const pesoRef = imc > 25 ? peso25 + 0.25 * (peso - peso25) : peso;
  const protCalc = Math.round(1.4 * pesoRef);
  const prot = p.metaProt || protCalc;
  const gord = Math.round(kcal * 0.3 / 9);
  const carb = Math.max(0, Math.round((kcal - prot * 4 - gord * 9) / 4));
  /* Piso por dia do cardápio. Meta de energia informada pelo médico abaixo de 1.200 kcal vale como piso: a decisão clínica é dele. */
  const pisoDia = p.metaKcal && p.metaKcal < PISO_DIA ? p.metaKcal : PISO_DIA;
  const esc = calcularEscala(kcal, prot, restricoesDoPerfil(), pisoDia, Math.round(1.6 * pesoRef));
  return {
    peso, idade, imc, tmb, gasto, piso, kcalCalc, kcal, pesoRef, protCalc, prot,
    semDeficit, abaixoDoPeso, gestante, discreto: p.discreto === true, pisoDia,
    /* Respostas do bloco Saúde do Perfil usadas pelos avisos de vesícula e fígado (perfil.js). aguardaCirurgia só vale com vesícula. */
    vesicula: p.vesicula === true, figado: p.figado === true, aguardaCirurgia: p.vesicula === true && p.aguardaCirurgia === true,
    protMin: Math.round(1.2 * pesoRef), protMax: Math.round(1.6 * pesoRef), gord, carb,
    fibra: masc ? (idade > 50 ? 30 : 38) : (idade > 50 ? 21 : 25),
    agua: p.metaAgua || 2000,
    /* Escala das porções (ver calcularEscala). fator fica por compatibilidade e vale o mesmo que fatorEnergia. */
    fatorProt: esc.prot, fatorEnergia: esc.energia, fatorDias: esc.dias, fator: esc.energia, escalaNoLimite: esc.noLimite, planoKcal: esc.kcalMedia, planoProt: esc.protMedia,
    micro: {
      ca: ((!masc && idade > 50) || idade > 70) ? 1200 : 1000, fe: (!masc && idade <= 50) ? 18 : 8,
      mg: masc ? (idade <= 30 ? 400 : 420) : (idade <= 30 ? 310 : 320), zn: masc ? 11 : 8, k: masc ? 3400 : 2600,
      vita: masc ? 900 : 700, b1: masc ? 1.2 : 1.1, b12: 2.4, folato: 400, vitc: masc ? 90 : 75,
      vitd: idade > 70 ? 20 : 15, vite: 15, vitk: masc ? 120 : 90,
    },
  };
}
