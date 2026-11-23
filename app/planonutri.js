"use strict";
/* Plano da nutricionista: o plano alimentar prescrito a ela, cadastrado como dados, e as contas dele.
   Decisão de 22/11 (empresa/BRIEFING.md): o cardápio do app passa a ser o plano da nutricionista; o cardápio gerado pelo app
   fica como reserva (o dia de enjoo continua usando o do app). Aqui ficam SÓ alimentos, quantidades, horários e a data da
   prescrição. Nada de nome, endereço, telefone ou contato de ninguém.

   Cada refeição: { tipo, hora, opcional, nota, opcoes: [{ nome, itens }] }.
   Cada item: { t: texto como está no plano, partes: [[chave do alimento, gramas]], est: true quando a conta usa estimativa }.
   Item com partes vazias ("canela a gosto") aparece no texto e não entra na conta.

   Regras das medidas caseiras (gramas usados na conta):
   - ovo: 1 unidade = 50 g (medida "unidade" da base); clara: 1 unidade = 33 g (clara de ovo grande, USDA 172183).
   - fatia de pão integral = 25 g (medida "fatia" da base).
   - ml de leite = g (a densidade do leite é 1,03: diferença de 3%, menor que o erro da tabela).
   - azeite: 1 colher de chá = 5 ml = 4,6 g (densidade 0,92).
   - "1 porção de morangos" sem gramas = 100 g, a porção que o próprio plano define no café da manhã (opção 2).
   - banana pequena = 50 g (a banana-prata da base pesa 70 g a unidade; "pequena" = cerca de 70% dela). ESTIMATIVA.
   - maçã pequena = 110 g (medida "unidade pequena" da base). kiwi = 75 g (medida "unidade" da base).
   - colher de sopa de creme de ricota = 15 g (pasta; rótulos usam 30 g = 2 colheres). ESTIMATIVA.
   - goma de tapioca hidratada: 30 g de goma = 22 g de fécula, 20 g = 15 g (a goma pronta tem cerca de 27% de água; ver
     dados/gerar_alimentos.py). ESTIMATIVA.
   - pão sírio integral pequeno = 40 g; wrap integral pequeno = 35 g (tamanho varia por marca). ESTIMATIVA.
   - iogurte natural sem açúcar de 100 a 120 g = 110 g (meio da faixa).
   - tomate sem quantidade = 40 g (meio tomate pequeno da base). ESTIMATIVA.
   - "salada à vontade" ou "alface e tomate" sem quantidade: referência pequena de alface 30 g e tomate 40 g (com cenoura: 20 g
     de alface, 40 de tomate e 20 de cenoura ralada). É ESTIMATIVA e quase não pesa na conta (10 a 20 kcal).
   - "legumes 100 g": mistura de referência de abobrinha 35 g, cenoura 35 g e brócolis 30 g. A quantidade é a do plano; a
     mistura é ESTIMATIVA. Óleo do refogado não entra (o plano não diz quanto).
   - "ovos mexidos" e "omelete" contam o ovo sem óleo (o plano não diz quanto); "frango desfiado" conta o peito de frango;
     "peixe" conta tilápia; "patinho magro" e "patinho moído" contam o patinho grelhado da TACO.
   - arroz "integral ou branco" conta o integral (o branco tem 3% a menos de energia e menos fibra).
   - "castanhas" sem tipo contam castanha de caju; se for castanha-do-pará, a gordura sobe cerca de 2 g. ESTIMATIVA. */

const PN_PRESCRITO = "2026-11-04";
const PN_SALADA = [["alface", 30], ["tomate", 40]];
const PN_LEGUMES = [["abobrinha", 35], ["cenoura_coz", 35], ["brocolis", 30]];
function pnI(t, partes, est) { return { t, partes, est: !!est }; }
function pnAlmoco(nome, k, t) {
  return { nome, itens: [
    pnI(t, [[k, 120]]),
    pnI("Salada crua variada à vontade", PN_SALADA, true),
    pnI("Legumes cozidos ou refogados: 100 g", PN_LEGUMES, true),
    pnI("Arroz integral ou branco: 70 g (3 colheres de sopa)", [["arroz_integral", 70]]),
    pnI("Feijão: 80 g (1 concha pequena)", [["feijao_carioca", 80]]),
    pnI("Azeite: 1 colher de chá (5 ml)", [["azeite", 4.6]]),
  ] };
}
const PN_REFEICOES = [
  { tipo: "Café da manhã", hora: "7h30", opcoes: [
    { nome: "Opção 1", itens: [pnI("2 ovos mexidos", [["ovo", 100]]), pnI("1 fatia de pão integral", [["pao_integral", 25]]), pnI("1 fatia de mamão (150 g)", [["mamao", 150]])] },
    { nome: "Opção 2", itens: [pnI("1 iogurte natural proteico (170 g)", [["iogurte_proteico", 170]], true), pnI("2 colheres de sopa de aveia (20 g)", [["aveia", 20]]),
      pnI("1 porção de morangos (100 g)", [["morango", 100]]), pnI("1 colher de chá de chia (5 g)", [["chia", 5]])] },
    { nome: "Opção 3", itens: [pnI("1 tapioca pequena (30 g de goma)", [["fecula_mandioca", 22]], true), pnI("2 ovos mexidos", [["ovo", 100]]), pnI("1 fatia fina de queijo minas (20 g)", [["queijo_minas", 20]])] },
    { nome: "Opção 4", itens: [pnI("2 fatias de pão integral", [["pao_integral", 50]]), pnI("60 g de frango desfiado", [["frango_peito", 60]]), pnI("Tomate", [["tomate", 40]], true)] },
    { nome: "Opção 5", itens: [pnI("200 ml de leite semidesnatado", [["leite_semi", 200]]), pnI("1 banana pequena", [["banana", 50]], true), pnI("1 dose de whey protein (20 g)", [["whey", 20]]), pnI("Canela a gosto", [])] },
  ] },
  { tipo: "Almoço", hora: "13h", nota: "No plano, o almoço é por grupos: a proteína pode ser frango, peixe ou patinho.", opcoes: [
    pnAlmoco("Com frango", "frango_peito", "Frango: 120 g"),
    pnAlmoco("Com peixe", "tilapia", "Peixe: 120 g"),
    pnAlmoco("Com patinho", "carne_patinho", "Patinho magro: 120 g"),
  ] },
  { tipo: "Lanche da tarde", hora: "16h30", opcoes: [
    { nome: "Opção 1", itens: [pnI("1 iogurte proteico (170 g)", [["iogurte_proteico", 170]], true), pnI("1 banana pequena", [["banana", 50]], true), pnI("1 colher de sopa de aveia (10 g)", [["aveia", 10]])] },
    { nome: "Opção 2", itens: [pnI("1 sanduíche com 2 fatias de pão integral", [["pao_integral", 50]]), pnI("60 g de frango desfiado", [["frango_peito", 60]]), pnI("1 colher de sopa de creme de ricota", [["creme_ricota", 15]], true)] },
    { nome: "Opção 3", itens: [pnI("1 crepioca (1 ovo + 20 g de goma)", [["ovo", 50], ["fecula_mandioca", 15]], true), pnI("30 g de queijo minas", [["queijo_minas", 30]]), pnI("1 porção de morangos", [["morango", 100]])] },
    { nome: "Opção 4", itens: [pnI("1 dose de whey protein (20 g)", [["whey", 20]]), pnI("200 ml de leite semidesnatado", [["leite_semi", 200]]), pnI("1 maçã pequena", [["maca", 110]])] },
    { nome: "Opção 5", itens: [pnI("1 iogurte natural (170 g)", [["iogurte", 170]]), pnI("1 colher de sopa de chia (10 g)", [["chia", 10]]), pnI("1 porção de morangos", [["morango", 100]]), pnI("10 g de castanhas", [["castanha_caju", 10]], true)] },
  ] },
  { tipo: "Jantar", hora: "20h", opcoes: [
    { nome: "Opção 1", itens: [pnI("100 g de frango desfiado", [["frango_peito", 100]]), pnI("1 pão sírio integral pequeno", [["pao_sirio_integral", 40]], true),
      pnI("Alface, tomate e cenoura", [["alface", 20], ["tomate", 40], ["cenoura_crua", 20]], true), pnI("1 colher de sopa de creme de ricota", [["creme_ricota", 15]], true)] },
    { nome: "Opção 2", itens: [pnI("Omelete com 2 ovos + 2 claras", [["ovo", 100], ["clara", 66]]), pnI("Legumes refogados (100 g)", PN_LEGUMES, true), pnI("100 g de batata-doce cozida", [["batata_doce", 100]])] },
    { nome: "Opção 3", itens: [pnI("120 g de peixe grelhado", [["tilapia", 120]]), pnI("100 g de purê de abóbora", [["abobora", 100]]), pnI("Legumes cozidos (100 g)", PN_LEGUMES, true)] },
    { nome: "Opção 4", itens: [pnI("100 g de patinho moído", [["carne_patinho", 100]]), pnI("1 wrap integral pequeno", [["wrap_integral", 35]], true), pnI("Alface e tomate", PN_SALADA, true)] },
    { nome: "Opção 5", itens: [pnI("100 g de frango desfiado", [["frango_peito", 100]]), pnI("100 g de mandioca cozida", [["mandioca", 100]]), pnI("Salada variada", PN_SALADA, true)] },
  ] },
  { tipo: "Ceia", hora: "", opcional: true, nota: "Opcional, se houver fome.", opcoes: [
    { nome: "Kiwi", itens: [pnI("1 kiwi", [["kiwi", 75]])] },
    { nome: "Iogurte", itens: [pnI("1 iogurte natural sem açúcar (100–120 g)", [["iogurte", 110]])] },
  ] },
];

/* ---------- contas (sem acesso à página) ---------- */
function pnItensDaOpcao(o) { const l = []; o.itens.forEach(x => x.partes.forEach(p => l.push({ k: p[0], g: p[1] }))); return l; }
function pnTotalDaOpcao(o) { return somarItens(pnItensDaOpcao(o)); }
function pnTituloDaOpcao(o) { return o.itens.map(x => x.t).join(", "); }
function pnRotuloRefeicao(ref) { return ref.tipo + (ref.hora ? " · " + ref.hora : "") + (ref.opcional ? " (opcional)" : ""); }
/* Faixa do dia, nutriente por nutriente: mínimo = soma da opção mais baixa de cada refeição obrigatória (sem a ceia, que é
   opcional); máximo = soma da opção mais alta de cada refeição, com a ceia mais alta. */
function pnFaixaDia() {
  const min = zeros(), max = zeros();
  PN_REFEICOES.forEach(ref => {
    const tots = ref.opcoes.map(pnTotalDaOpcao);
    CAMPOS.forEach(c => {
      const v = tots.map(t => t[c]);
      if (!ref.opcional) min[c] += Math.min.apply(null, v);
      max[c] += Math.max.apply(null, v);
    });
  });
  return { min, max };
}

/* ---------- uso no dia ---------- */
/* Interruptor da tela Plano. true liga, false desliga. Ausente: ligado (padrão do app), menos para o perfil de versão anterior
   que ainda não respondeu a pergunta "Segue um plano de uma nutricionista?" (perfil existe e E.ui.puPerguntas não é true;
   teste final do APK, M1). Sem essa exceção, o alvo de proteína e energia virava o do plano dela antes da resposta, enquanto a
   lista de refeições continuava no cardápio do app. Quem instala de novo passa pelo primeiro uso, que obriga a responder e grava
   puPerguntas: com "Não sei", fica no padrão (ligado). Alvo, lista e calorias usam só esta função. */
function pnEmUso() {
  const ui = E.ui || {};
  if (ui.planoNutri === true || ui.planoNutri === false) return ui.planoNutri;
  return !(E.perfil && ui.puPerguntas !== true);
}
/* Qual plano normal vale num dia (r = dia(data)): o que já tem marca naquele dia; sem marca, o interruptor.
   Assim, mudar o interruptor nunca apaga o que já foi contado (dias passados e marcas de hoje, inclusive as de quem vem da
   versão 1); vale para os dias ainda sem marca. data fica na assinatura para uma regra por data, se for preciso. */
function pnDiaUsaNutri(data, r) {
  if ((r.comidoNutri || []).some(Boolean)) return true;
  if ((r.comido || []).some(Boolean)) return false;
  return pnEmUso();
}
/* Campo do registro em vigor no dia: dia de enjoo (cardápio do app), plano da nutricionista ou cardápio do app. */
function pnCampoDoDia(data, r) { return r.enjoo ? "comidoEnjoo" : pnDiaUsaNutri(data, r) ? "comidoNutri" : "comido"; }
/* Opção escolhida para a refeição i no dia: a escolha gravada, senão a do registro, senão a primeira. */
function pnOpcaoDoDia(r, i) {
  const n = PN_REFEICOES[i].opcoes.length, ok = x => Number.isInteger(x) && x >= 0 && x < n;
  const e = (r.opNutri || [])[i], reg = (r.comidoNutri || [])[i];
  return ok(e) ? e : reg && ok(reg.op) ? reg.op : 0;
}
/* O plano da nutricionista no formato que a tela Hoje usa: { nome, nutri, refeicoes: [{ tipo, titulo, itens, op, opcoes, nota }] }. */
function pnPlanoDoDia(data) {
  const r = dia(data);
  return { nome: "Plano da sua nutricionista", nutri: true, refeicoes: PN_REFEICOES.map((ref, i) => {
    const op = pnOpcaoDoDia(r, i), o = ref.opcoes[op];
    return { tipo: pnRotuloRefeicao(ref), titulo: pnTituloDaOpcao(o), itens: pnItensDaOpcao(o), op, opcoes: ref.opcoes, nota: ref.nota || "" };
  }) };
}
/* Plano que a tela Hoje mostra e registra no dia. */
function pnPlanoDaData(data) { const r = dia(data); return !r.enjoo && pnDiaUsaNutri(data, r) ? pnPlanoDoDia(data) : planoDaData(data); }
/* Alvo único de proteína do dia, o mesmo em Hoje, no Painel e no relatório (usabilidade da onda 2, item 5):
   com o plano da nutricionista em uso, o alvo é o começo da faixa do plano dela (combinação de opções mais leve, sem a ceia) e a faixa
   vai desse mínimo ao máximo; sem o plano, a meta e a faixa calculadas pelo app (metas()). m: metas() já calculadas (opcional). */
function alvoProteina(m) {
  m = m || metas();
  if (pnEmUso()) { const f = pnFaixaDia(); return { g: Math.round(f.min.prot), min: Math.round(f.min.prot), max: Math.round(f.max.prot), nutri: true, rotulo: "alvo do plano da nutricionista" }; }
  return { g: m.prot, min: m.protMin, max: m.protMax, nutri: false, rotulo: "meta" };
}
/* Alvo único de energia (teste final do APK, I1): com o plano da nutricionista em uso, a referência é a faixa do plano dela e o
   corte de "comeu pouco" é KCAL_POUCO (consumo.js, o mesmo do aviso da tela Hoje), não o piso do cardápio do app, que fica abaixo
   do plano dela em quase metade das combinações. Sem o plano, vale a meta e o piso do app. */
function alvoEnergia(m) {
  m = m || metas();
  if (pnEmUso()) { const f = pnFaixaDia(); return { kcal: Math.round(f.min.kcal), min: Math.round(f.min.kcal), max: Math.round(f.max.kcal), piso: KCAL_POUCO, nutri: true,
    rotulo: "faixa do plano da nutricionista", notaPiso: fmt(KCAL_POUCO) + " kcal é o ponto em que o app sugere conversar com a sua nutricionista. Se isso se repetir, leve à consulta." }; }
  return { kcal: m.kcal, min: null, max: null, piso: m.pisoDia == null ? PISO_DIA : m.pisoDia, nutri: false, rotulo: "referência",
    notaPiso: fmt(m.pisoDia == null ? PISO_DIA : m.pisoDia) + " kcal é o mínimo por dia que o cardápio do app usa. Se isso se repetir, vale levar ao médico ou ao nutricionista." };
}
/* Referência do cartão de proteína e energia da tela Hoje. Com o plano da nutricionista em uso, a referência é a faixa do plano
   dela (a barra enche no mínimo da faixa) e a meta calculada pelo app não aparece. */
function pnReferenciaDoDia(m) {
  if (!pnEmUso()) return { prot: m.prot, kcal: m.kcal, rotProt: "meta " + m.prot + " g", rotKcal: "meta " + fmt(m.kcal) + " kcal" };
  const f = pnFaixaDia();
  return { prot: alvoProteina(m).g, kcal: Math.round(f.min.kcal), nutri: true,
    rotProt: "plano da nutricionista: " + fmt(f.min.prot) + " a " + fmt(f.max.prot) + " g",
    rotKcal: "plano da nutricionista: " + fmt(f.min.kcal) + " a " + fmt(f.max.kcal) + " kcal" };
}

/* ---------- telas ---------- */
/* Escolha da opção dentro do cartão da refeição (tela Hoje). */
function pnEscolhaOpcao(ref, i, d) {
  if (!ref.opcoes || ref.opcoes.length < 2) return "";
  return '<select class="pn-opcao" data-mud="pnOpcao" data-dia="' + d + '" data-i="' + i + '" aria-label="Opção do plano para ' + esc(ref.tipo) + '">' +
    ref.opcoes.map((o, n) => '<option value="' + n + '"' + (n === ref.op ? " selected" : "") + ">" + esc(/^Opção/.test(o.nome) ? o.nome + ": " + pnTituloDaOpcao(o) : o.nome) + "</option>").join("") + "</select>" +
    (ref.nota ? '<div class="sub">' + esc(ref.nota) + "</div>" : "");
}
/* Cartão da tela Plano: interruptor, referência de energia e proteína do plano dela e as opções de cada refeição. */
function pnCartaoPlano(m) {
  const uso = pnEmUso(), disc = m && m.discreto;
  let out = '<div class="cartao pn-plano"><h2>' + (uso ? "Metas diárias: plano da sua nutricionista" : "Plano da sua nutricionista") + "</h2>" +
    '<div class="marcas"><label><input type="checkbox" data-mud="pnUsar"' + (uso ? " checked" : "") + ">Usar o plano da minha nutricionista</label></div>";
  if (!uso) return out + '<p class="sub" style="margin:8px 0 0">Desligado: a tela Hoje usa o cardápio do app e as metas calculadas pelo app.</p></div>';
  const f = pnFaixaDia(), faixa = (c, un) => fmt(f.min[c]) + " a " + fmt(f.max[c]) + " " + un;
  out += '<div class="tres">' + (disc ? "" : '<div><div class="sub">Energia</div><strong>' + faixa("kcal", "kcal") + "</strong></div>") +
    '<div><div class="sub">Proteína</div><strong>' + faixa("prot", "g") + "</strong></div></div>" +
    '<p class="sub" style="margin:10px 0 0">As metas são as da sua nutricionista (plano de ' + brAno(PN_PRESCRITO) + "). A faixa vai da combinação de opções mais leve, sem a ceia, à mais farta, com a ceia. " +
    "É uma estimativa feita pelo app com a tabela de alimentos; o número dela pode ser outro. O cardápio do app, abaixo, fica como reserva, e o dia de enjoo continua usando o dele. " +
    "Um dia que já tem refeição marcada continua no plano em que foi marcado.</p>";
  PN_REFEICOES.forEach(ref => {
    out += "<details><summary>" + esc(pnRotuloRefeicao(ref)) + "</summary>" + (ref.nota ? '<p class="sub">' + esc(ref.nota) + "</p>" : "");
    ref.opcoes.forEach(o => {
      const t = pnTotalDaOpcao(o);
      out += '<div class="pn-op"><strong>' + esc(o.nome) + '</strong> <span class="sub">' + fmt(t.prot) + " g prot" + (disc ? "" : " · " + fmt(t.kcal) + " kcal") + "</span><ul>" +
        o.itens.map(x => "<li>" + esc(x.t) + (x.est ? ' <span class="sub">(quantidade estimada na conta)</span>' : "") + (x.partes.length ? "" : ' <span class="sub">(não entra na conta)</span>') + "</li>").join("") + "</ul></div>";
    });
    out += "</details>";
  });
  return out + "</div>";
}

/* Interruptor da tela Plano. */
MUD.pnUsar = function (c) { E.ui.planoNutri = !!c.checked; salvar(); render(); };
/* Troca de opção numa refeição do dia. Se a refeição já estava marcada, a foto da porção passa a ser a da opção nova
   (ela comeu outra coisa) e a fração marcada fica. */
MUD.pnOpcao = function (c) {
  const h = diaDoToque(c.dataset); if (!h) return;
  const r = arrumarDia(dia(h)), i = Number(c.dataset.i), op = Number(c.value), ref = PN_REFEICOES[i];
  if (!ref || !ref.opcoes[op]) { render(); return; }
  const ops = (r.opNutri || []).slice(); ops[i] = op;
  for (let n = 0; n < ops.length; n++) if (ops[n] === undefined) ops[n] = null;
  r.opNutri = ops;
  const regs = r.comidoNutri.slice(), antes = regs[i];
  if (antes) { regs[i] = Object.assign({}, antes, { op, itens: fotoDosItens(pnItensDaOpcao(ref.opcoes[op])) }); r.comidoNutri = regs; }
  gravarDia(h, r); render();
};
