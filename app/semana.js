"use strict";
/* Visão semanal: uma linha do tempo por semana de tratamento que junta aplicação, peso, sintomas, dias de enjoo e o que ela comeu.
   A semana atual aparece aberta; as anteriores, resumidas (toque abre). Só fatos tirados dos registros: o app não interpreta.

   Semana de tratamento: a mesma conta de situacaoDoseEm (tratamento.js): a semana 1 começa no dia da primeira aplicação e
   cada semana tem 7 dias seguidos a partir daí. Assim "Semana N" aqui é a mesma "Semana N do tratamento" da tela Hoje.
   Cada aplicação entra na semana do dia em que estava PREVISTA (previstaDe, com o dia habitual de hoje): uma aplicação
   adiantada 2 dias continua sendo "a da semana seguinte", e uma atrasada continua na sua semana.

   Limite conhecido (dia habitual por época): o app guarda só o dia habitual de agora (E.diaDose, trocado em "Mudei o dia da
   aplicação", tratamento.js), sem histórico de quando mudou. Por isso todas as aplicações, inclusive as de antes da mudança, são
   classificadas ("no dia previsto", "depois", "antes") pelo dia de agora. Exemplo: aplicava às segundas e passou para quarta;
   as segundas antigas aparecem como "2 dias antes do previsto". Classificar pelo dia vigente em cada época exige gravar o
   histórico das mudanças (formato de E em nucleo.js e MUD.diaDose em tratamento.js, fora deste arquivo); enquanto não houver,
   fica assim. O teste "dia habitual mudou" em testes/unidade/semana.js prende este comportamento para a mudança ser consciente.

   A tela é registrada em TELAS (inicio.js) quando a página termina de carregar, sem botão na barra de abas: abre por #semana. */

/* Padrão de enjoo: diferença mínima entre as médias (na escala 0 nenhum, 1 leve, 2 moderado, 3 forte) para dizer que o enjoo
   "foi maior" nos 2 dias depois da aplicação. Meio nível: abaixo disso a diferença é ruído de registro. Decisão de engenharia. */
const SEMANA_DIF_ENJOO = 0.5;
/* Para o padrão juntando todas as semanas: pelo menos 2 semanas e 3 dias com registro dentro e 3 fora da janela. */
const SEMANA_MIN_SEMANAS = 2, SEMANA_MIN_DIAS = 3;

/* Lista de datas de `de` até `ate`, inclusive. */
function semanaDatas(de, ate) { const out = []; for (let x = de; x <= ate; x = mais(x, 1)) out.push(x); return out; }
/* Maior nível de enjoo registrado em cada dia: { data: 0-3 }. Dia sem registro de sintoma não aparece (não é zero). */
function semanaEnjooPorDia(sintomas) {
  const m = {};
  (sintomas || []).forEach(s => { if (!s || !dataValida(s.data)) return; const n = Math.max(0, Math.min(3, Number(s.enjoo) || 0)); m[s.data] = Math.max(m[s.data] == null ? 0 : m[s.data], n); });
  return m;
}
const semanaMedia = xs => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

/* Níveis de enjoo de uma semana separados em "nos 2 dias depois da aplicação" (dentro) e "nos outros dias da semana" (fora).
   dose: data da aplicação da semana; dias: datas da semana; porDia: de semanaEnjooPorDia. Só entram dias com registro. */
function semanaJanelaEnjoo(dose, dias, porDia) {
  const janela = [mais(dose, 1), mais(dose, 2)], dentro = [], fora = [];
  janela.forEach(x => { if (porDia[x] != null) dentro.push(porDia[x]); });
  dias.forEach(x => { if (janela.indexOf(x) < 0 && porDia[x] != null) fora.push(porDia[x]); });
  return { dentro, fora };
}
/* Verdadeiro quando a média dentro passa a de fora por SEMANA_DIF_ENJOO ou mais. */
function semanaEnjooMaior(j, minDentro, minFora) {
  if (j.dentro.length < minDentro || j.fora.length < minFora) return false;
  return semanaMedia(j.dentro) - semanaMedia(j.fora) >= SEMANA_DIF_ENJOO - 1e-9;
}

/* Monta as semanas do tratamento até a data h, da 1 à atual. [] sem aplicação até h. Lê E (doses, pesos, sintomas, dias, perfil).
   Cada semana: { n, de, ate (no máximo h), atual, doses: [{ data, mg, local, atraso (dias depois do previsto; 0 no dia, negativo adiantada) }],
     troca (a dose mudou em relação à aplicação anterior), mg (dose da última aplicação da semana, ou null),
     peso: { pesagens, kg (última da semana), dif e pct (contra a última pesagem antes da semana; null sem ela) },
     sintomas: { registros, enjoo (dias com enjoo), enjooForte (dias moderado ou forte), vomito, preso, solto, refluxo, tontura, cansaco, dor (dias) },
     enjooMarcado (dias com "Dia de enjoo" ligado na tela Hoje),
     comida: { dias (com registro), prot (média nesses dias, g), kcal (média, kcal) },
     enjooDepois: true se o enjoo foi maior nos 2 dias depois da aplicação, janela: { dentro, fora } } */
function semanasDoTratamento(h) {
  const ds = dosesAte(E.doses, h);
  if (!ds.length) return [];
  const d0 = ds[0].data, habitual = diaHabitual(ds, E.diaDose, h), total = Math.floor(entre(d0, h) / 7) + 1;
  const porDia = semanaEnjooPorDia(E.sintomas), out = [];
  for (let n = 1; n <= total; n++) {
    const de = mais(d0, 7 * (n - 1)), fimCheio = mais(de, 6), ate = fimCheio < h ? fimCheio : h;
    out.push({ n, de, ate, atual: n === total, doses: [], troca: false, mg: null });
  }
  /* aplicações: na semana do dia previsto */
  ds.forEach((d, i) => {
    const prev = previstaDe(d.data, habitual);
    const n = Math.max(1, Math.min(total, Math.floor(entre(d0, prev) / 7) + 1)), s = out[n - 1];
    s.doses.push({ data: d.data, mg: d.mg, local: d.local, atraso: entre(prev, d.data) });
    if (i > 0 && d.mg !== ds[i - 1].mg) s.troca = true;
    s.mg = d.mg;
  });
  const ps = pesagensEmOrdem(E.pesos).filter(p => p.data <= h);
  out.forEach(s => {
    const dias = semanaDatas(s.de, s.ate);
    /* peso */
    const naSemana = ps.filter(p => p.data >= s.de && p.data <= s.ate), antes = ps.filter(p => p.data < s.de);
    s.peso = { pesagens: naSemana.length, kg: null, dif: null, pct: null };
    if (naSemana.length) {
      const ult = naSemana[naSemana.length - 1], ref = antes.length ? antes[antes.length - 1] : null;
      s.peso.kg = ult.kg;
      if (ref) { s.peso.dif = ult.kg - ref.kg; s.peso.pct = 100 * s.peso.dif / ref.kg; }
    }
    /* sintomas: contados por dia (dois registros no mesmo dia contam uma vez) */
    const ss = (E.sintomas || []).filter(x => x && x.data >= s.de && x.data <= s.ate);
    const diasCom = f => dias.filter(x => ss.some(r => r.data === x && f(r))).length;
    s.sintomas = { registros: ss.length, enjoo: diasCom(r => r.enjoo >= 1), enjooForte: diasCom(r => r.enjoo >= 2), vomito: diasCom(r => r.vomito),
      preso: diasCom(r => r.intestino === "Preso"), solto: diasCom(r => r.intestino === "Solto"), refluxo: diasCom(r => r.refluxo),
      tontura: diasCom(r => r.tontura), cansaco: diasCom(r => r.cansaco), dor: diasCom(r => r.dor) };
    s.enjooMarcado = dias.filter(x => E.dias[x] && E.dias[x].enjoo).length;
    /* comida */
    let dc = 0, prot = 0, kcal = 0;
    dias.forEach(x => { if (!E.dias[x]) return; const c = consumoDoDia(x); if (!c.registrou) return; dc++; prot += c.total.prot; kcal += c.total.kcal; });
    s.comida = { dias: dc, prot: dc ? prot / dc : null, kcal: dc ? kcal / dc : null };
    /* padrão de enjoo da semana: precisa de aplicação, de registro nos 2 dias depois e de 2 dias com registro fora deles */
    const dose = s.doses.length ? s.doses[s.doses.length - 1].data : null;
    s.janela = dose ? semanaJanelaEnjoo(dose, dias, porDia) : { dentro: [], fora: [] };
    s.enjooDepois = !!dose && semanaEnjooMaior(s.janela, 1, 2);
  });
  return out;
}

/* Padrões juntando todas as semanas. Devolve [{ id, texto }], só com o que os registros mostram. */
function semanaPadroesGerais(semanas) {
  const out = [], comDados = semanas.filter(s => s.janela.dentro.length && s.janela.fora.length);
  const j = { dentro: [], fora: [] };
  comDados.forEach(s => { j.dentro = j.dentro.concat(s.janela.dentro); j.fora = j.fora.concat(s.janela.fora); });
  if (comDados.length >= SEMANA_MIN_SEMANAS && semanaEnjooMaior(j, SEMANA_MIN_DIAS, SEMANA_MIN_DIAS)) {
    out.push({ id: "enjoo-depois", texto: "Nas " + comDados.length + " semanas com registro de sintomas, o enjoo foi maior nos 2 dias depois da aplicação: nível médio " +
      fmt(semanaMedia(j.dentro), 1) + ", contra " + fmt(semanaMedia(j.fora), 1) + " nos outros dias (0 é nenhum, 3 é forte)." });
  }
  const trocas = semanas.filter(s => s.troca).map(s => s.n);
  if (trocas.length) out.push({ id: "trocas", texto: (trocas.length === 1 ? "Troca de dose na semana " : "Troca de dose nas semanas ") + semanaLista(trocas) + "." });
  const atrasos = semanas.filter(s => s.doses.some(d => d.atraso > 0)).map(s => s.n);
  if (atrasos.length) out.push({ id: "atrasos", texto: (atrasos.length === 1 ? "Aplicação fora do dia habitual na semana " : "Aplicação fora do dia habitual nas semanas ") + semanaLista(atrasos) + "." });
  return out;
}
/* [2, 4, 5] -> "2, 4 e 5" */
function semanaLista(ns) { return ns.length > 1 ? ns.slice(0, -1).join(", ") + " e " + ns[ns.length - 1] : String(ns[0]); }

/* ---------- textos de uma semana ---------- */
function semanaTextoDose(x) {
  const quando = x.atraso === 0 ? "no dia previsto" : x.atraso > 0 ? nDias(x.atraso) + " depois do previsto" : nDias(-x.atraso) + " antes do previsto";
  return fmt(x.mg, 1) + " mg em " + diaCurto(x.data) + ", " + esc(x.local || "local não anotado") + ", " + quando;
}
function semanaTextoPeso(s, discreto) {
  const p = s.peso;
  if (!p.pesagens) return "sem pesagem";
  const vezes = p.pesagens === 1 ? "1 pesagem" : p.pesagens + " pesagens";
  /* Modo discreto: nada de kg nem diferença na linha; o número fica atrás de um toque, como no gráfico da aba Peso. */
  if (discreto) return vezes;
  return fmt(p.kg, 1) + " kg" + (p.dif != null ? " (" + comSinal(p.dif, 1) + " kg na semana)" : "");
}
function semanaTextoSintomas(x) {
  const p = [], q = (n, t) => { if (n) p.push(t + " em " + nDias(n)); };
  q(x.enjoo, "enjoo"); q(x.vomito, "vômito"); q(x.preso, "intestino preso"); q(x.solto, "intestino solto"); q(x.refluxo, "refluxo");
  q(x.tontura, "tontura"); q(x.cansaco, "cansaço"); q(x.dor, "dor forte na barriga");
  if (!x.registros) return "sem registro";
  /* O app só sabe o que foi marcado: diz "nenhuma dor forte registrada", nunca "sem sinal de alerta" (revisão clínica). */
  return p.length ? p.join(", ") + (x.dor ? "" : "; nenhuma dor forte registrada") : "nenhum sintoma marcado";
}
function semanaTextoComida(s, discreto, metaProt) {
  const c = s.comida;
  if (!c.dias) return "sem registro";
  return "proteína média de " + fmt(c.prot) + " g por dia (meta " + fmt(metaProt) + " g)" + (discreto ? "" : ", energia média de " + fmt(c.kcal) + " kcal") +
    ", em " + nDias(c.dias) + " com registro";
}
/* Fatos que viram destaque na semana (os "padrões" de uma semana). */
function semanaMarcas(s) {
  const m = [];
  if (!s.doses.length) m.push("sem aplicação registrada");
  if (s.troca) m.push("semana com troca de dose");
  if (s.doses.some(d => d.atraso > 0)) m.push("aplicação atrasada");
  if (s.enjooDepois) m.push("o enjoo foi maior nos 2 dias depois da aplicação");
  return m;
}
function semanaCorpo(s, discreto, metaProt) {
  const item = (rot, txt, attr) => '<li' + (attr ? ' data-item="' + attr + '"' : "") + '><span class="semana-rot">' + rot + "</span><span>" + txt + "</span></li>";
  let out = '<ul class="semana-itens">';
  out += item("Aplicação", s.doses.length ? s.doses.map(semanaTextoDose).join("<br>") : "nenhuma registrada", "dose");
  out += item("Peso", semanaTextoPeso(s, discreto), "peso");
  out += item("Sintomas", semanaTextoSintomas(s.sintomas), "sintomas");
  out += item("Dias de enjoo", s.enjooMarcado ? nDias(s.enjooMarcado) + " com o cardápio de enjoo" : "nenhum marcado", "enjoo");
  out += item("Comida", semanaTextoComida(s, discreto, metaProt), "comida");
  out += "</ul>";
  /* Dor forte na barriga marcada: caminho para os sinais de alerta do Guia (cólica biliar e pancreatite ficam lá, com fonte), sem alarde. */
  if (s.sintomas.dor) out += '<div class="semana-guia" data-semana-guia><p class="sub">Dor forte na barriga foi marcada nesta semana. O Guia lista os sinais de alerta e o que fazer em cada um.</p>' +
    '<div class="botoes"><button class="sec" data-ac="ir" data-para="guia">Ver os sinais de alerta no Guia</button></div></div>';
  if (discreto && s.peso.pesagens) out += '<details class="semana-peso"><summary>Ver peso</summary><p>' + fmt(s.peso.kg, 1) + " kg" + (s.peso.dif != null ? ", " + comSinal(s.peso.dif, 1) + " kg na semana (" + comSinal(s.peso.pct, 1) + "%)" : "") + "</p></details>";
  return out;
}
function semanaTitulo(s) { return "Semana " + s.n; }
function semanaPeriodo(s) { return br(s.de) + " a " + br(s.ate) + (s.atual ? " (até hoje)" : ""); }

/* ---------- tela ---------- */
function telaSemana() {
  const h = hoje(), semanas = semanasDoTratamento(h), discreto = !!(E.perfil && E.perfil.discreto === true);
  let out = '<h2 class="semana-topo">Semana a semana</h2>';
  if (!semanas.length) {
    return out + '<div class="cartao destaque" data-semana="vazia"><p style="margin:0">Quando você registrar a primeira aplicação, as semanas do tratamento aparecem aqui, uma a uma, com aplicação, peso, sintomas e comida.</p>' +
      '<div class="botoes"><button data-ac="ir" data-para="diario" data-sub="doses">Registrar aplicação</button></div></div>';
  }
  const metaProt = metas().prot, padroes = semanaPadroesGerais(semanas);
  const marcas = s => { const m = semanaMarcas(s); return m.length ? '<p class="semana-marcas">' + m.map(t => '<span class="semana-marca">' + t + "</span>").join("") + "</p>" : ""; };
  const atual = semanas[semanas.length - 1];
  out += '<div class="cartao destaque semana-atual" data-semana="' + atual.n + '"><div class="linha"><h2 style="margin:0">' + semanaTitulo(atual) + '</h2><span class="sub">' + semanaPeriodo(atual) + "</span></div>" +
    marcas(atual) + semanaCorpo(atual, discreto, metaProt) + "</div>";
  if (padroes.length) out += '<div class="cartao" id="semana-padroes"><h2>O que se repetiu</h2><ul class="semana-lista">' + padroes.map(p => '<li data-padrao="' + p.id + '">' + p.texto + "</li>").join("") + "</ul></div>";
  if (semanas.length > 1) {
    out += '<div class="cartao" id="semana-anteriores"><h2>Semanas anteriores</h2>' + semanas.slice(0, -1).reverse().map(s =>
      '<details data-semana="' + s.n + '"><summary><span class="semana-resumo"><strong>' + semanaTitulo(s) + "</strong> · " + (s.mg != null ? fmt(s.mg, 1) + " mg" : "sem aplicação") +
      (s.troca ? " · troca de dose" : "") + '<span class="sub semana-quando">' + semanaPeriodo(s) + "</span></span></summary>" + marcas(s) + semanaCorpo(s, discreto, metaProt) + "</details>").join("") + "</div>";
  }
  out += '<p class="sub semana-nota">Esta tela só junta o que você registrou. Para entender o que os números significam para você, leve à consulta.</p>';
  return out;
}

/* Registra a tela em TELAS (inicio.js) depois que tudo carregou. Se o endereço já era #semana, desenha de novo, agora com ela. */
if (typeof document !== "undefined" && document.addEventListener) {
  document.addEventListener("DOMContentLoaded", () => {
    if (typeof TELAS === "undefined") return;
    TELAS.semana = telaSemana;
    if (location.hash === "#semana") render(true);
  });
}
