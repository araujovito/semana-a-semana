"use strict";
/* Tela Hoje, organizada pelo tratamento (onda 2, protótipo aprovado e relatório de usabilidade): topo com a semana, a próxima
   aplicação e quanto falta de proteína; marcar o dia (refeições do plano e água); "Como está hoje?" de um toque; caminho único
   para dor na barriga; atalhos; "Ainda hoje". Calorias, peso, vitaminas e treinos ficam fora de Hoje (Painel, Semana, Mover).
   Navegação por dias anteriores. Trecho de alimentação do relatório.
   As contas e o formato do registro estão em consumo.js. */

/* Estado só da tela, nunca gravado: ao reabrir o app volta para hoje.
   diaSel é null (= hoje, calculado na hora a cada desenho e a cada toque) ou uma data PASSADA explícita. Nunca guarda a data de hoje:
   assim, à meia-noite, quem estava em "hoje" passa a ver o novo dia. */
let diaSel = null;
const VOLTA_MAX = 60;     // até quantos dias para trás dá para ver e corrigir

function dataSel() {
  const h = hoje();
  if (diaSel && (diaSel >= h || entre(diaSel, h) > VOLTA_MAX)) diaSel = null;
  return diaSel || h;
}
/* Data em que o toque vale. Cada controle leva em data-dia o dia que a tela mostrava quando foi desenhada: se o dia virou
   com a tela aberta, o toque não grava nada (a refeição que aparecia era a de ontem); a tela é redesenhada e avisa. */
function diaDoToque(d) {
  const agora = dataSel();
  if (d && d.dia && d.dia !== agora) { render(true); aviso("O dia virou. A tela agora mostra hoje: toque de novo para marcar."); return null; }
  return agora;
}
function diaLongoHoje(d) { return SEMANA[diaSemana(d)].toLowerCase() + ", " + br(d); }
function rotuloDia(d) { const n = entre(d, hoje()); return n === 0 ? "Hoje" : n === 1 ? "Ontem" : diaLongoHoje(d); }
function pctBarra(v, meta) { return Math.min(100, meta ? 100 * v / meta : 0).toFixed(0); }
/* Perfil pede para não ver calorias em destaque (campo discreto; ausente = não). */
function semCalorias() { return !!(E.perfil && E.perfil.discreto === true); }

/* Aviso neutro de comer pouco. Texto de saúde: repete o Guia do app (conteudo.js, artigos "Enjoo" e "Sinais de alerta"),
   sem acrescentar orientação nova. motivo vem de motivoComerPouco() em consumo.js. */
const TEXTO_POUCO = {
  enjoo: "Hoje é o 3º dia seguido com o dia de enjoo ligado.",
  vomito: "Você registrou vômito em 2 dias seguidos.",
  energia: "Nos últimos 3 dias com registro, você marcou pouca comida.",
};
function cartaoComerPouco(motivo) {
  return '<div class="cartao aviso-pouco"><h2>Assunto para o médico</h2><p>' + TEXTO_POUCO[motivo] + " Se o enjoo impedir de comer ou beber, o médico pode prescrever remédio ou segurar o aumento de dose.</p>" +
    (motivo === "vomito" ? '<p class="sub">Se você vomita tudo o que bebe, mesmo água em goles pequenos, ou quase não urina e a urina está escura, a orientação do Guia é ir ao pronto-socorro hoje.</p>' : "") +
    '<div class="botoes"><button data-ac="entendiPouco">Entendi</button><button class="sec" data-ac="ir" data-para="guia">Abrir o Guia</button></div></div>';
}

/* ---------- topo: a semana do tratamento, a próxima aplicação e a proteína ----------
   Textos curtos à vista e o porquê num bloco que abre com um toque (relatório de usabilidade da onda 2, item 10).
   TEXTO DE SAÚDE: as orientações de dose atrasada são as do Guia (conteudo.js, "Aplicação" e "Esqueci a dose"), que seguem a bula
   do Mounjaro: pelo menos 3 dias (72 horas) entre duas aplicações; até 4 dias (96 horas) depois do previsto, aplicar e seguir o dia
   habitual; depois disso, pular e aplicar a próxima no dia habitual, nunca duas doses; várias semanas sem aplicar, falar com o médico
   antes de retomar. São as mesmas regras de cartaoTratamentoHoje (tratamento.js), que continua a referência das contas. */
function porQue(texto) { return '<details class="por-que"><summary>Por quê (bula)</summary><p>' + texto + "</p></details>"; }
function blocoDose() {
  const s = situacaoDose(), botao = cls => '<div class="botoes"><button' + (cls ? ' class="' + cls + '"' : "") + ' data-ac="ir" data-para="diario" data-sub="doses">Registrar aplicação</button></div>';
  if (!s) return '<div class="hoje-dose" data-dose="sem"><p>Quando você fizer a primeira aplicação, registre aqui. O app passa a contar as semanas e avisar a data da próxima.</p>' + botao() + "</div>";
  if (s.estado === "medico") {
    return '<div class="hoje-dose" data-dose="medico"><p>A última aplicação registrada foi em ' + brAno(s.ult.data) + ", há " + s.diasSemRegistro + " dias. <strong>Fale com o médico antes de retomar.</strong></p>" +
      porQue("Depois de várias semanas sem aplicar, pode ser preciso recomeçar numa dose menor. Se você aplicou e não anotou, registre a aplicação com a data certa.") + botao("sec") + "</div>";
  }
  const selos = '<div class="hoje-selos"><span class="selo-topo">Semana ' + s.semana + ' do tratamento</span><span class="selo-topo">' + fmt(s.ult.mg, 1) + " mg</span><span class=\"selo-topo\">" + ordinalF(s.semanaNaDose) + " semana nesta dose</span></div>";
  const horas72 = s.diasSemRegistro <= DIAS_ENTRE_DOSES ? '<p class="hoje-nota">A última foi há ' + nDias(s.diasSemRegistro) + ": confira se já passaram 72 horas.</p>" : "";
  let t = "";
  if (s.estado === "emDia") t = "<p><strong>Próxima aplicação: em " + nDias(s.falta) + " (" + diaCurto(s.prox) + ")</strong></p>";
  else if (s.estado === "hoje") t = "<p><strong>Próxima aplicação: hoje.</strong></p>" + horas72;
  else if (s.estado === "atrasada") t = "<p><strong>Atrasada " + nDias(s.atraso) + " (era " + diaCurto(s.prevista) + "). Pode aplicar hoje.</strong> A próxima continua " + diaCurto(s.seguinte) + ".</p>" +
    (s.atraso === DIAS_TOLERANCIA ? '<p class="hoje-nota">Hoje é o 4º dia: se já passaram 96 horas do horário em que você costuma aplicar, pule esta dose.</p>' : "") + horas72 +
    porQue("A aplicação estava prevista para " + diaCurto(s.prevista) + ", há " + nDias(s.atraso) + ". Até 4 dias depois do dia previsto, a orientação da bula é aplicar assim que lembrar e seguir o dia habitual na semana seguinte (" + diaCurto(s.seguinte) + ").");
  else t = "<p><strong>Próxima aplicação: " + diaCurto(s.prox) + ".</strong> Pule a de " + diaCurto(s.prevista) + ". Não aplique duas doses para compensar.</p>" +
    porQue("A que estava prevista para " + diaCurto(s.prevista) + " passou de 4 dias: a orientação da bula é pular essa dose e aplicar a próxima no dia habitual.");
  const quatro = entre(s.inicioNaDose, hoje()) >= 28 && s.ult.mg < 15 ? " Já são 4 semanas nesta dose: subir ou manter é assunto para a consulta." : "";
  return '<div class="hoje-dose" data-dose="' + s.estado + '">' + selos + t + '<p class="hoje-nota">Local sugerido: ' + esc(s.sugerido) + "." + quatro + "</p>" +
    (s.estado === "hoje" || s.estado === "atrasada" ? botao() : s.estado === "pular" ? botao("sec") : "") + "</div>";
}
/* Proteína dita como quanto falta, com um alvo só: a referência do dia (pnReferenciaDoDia: o mínimo da faixa do plano da
   nutricionista quando ele está em uso; senão a meta do app). planoRest: proteína das refeições obrigatórias ainda sem marca. */
function blocoProteina(c, ref, quando, planoRest, enjoo) {
  const a = alvoProteina(), falta = Math.max(0, Math.round(a.g - c.total.prot));
  const alvo = a.rotulo + (a.nutri ? ": " : " ") + a.g + " g";
  return '<div class="hoje-prot"><div class="rot">Proteína ' + quando + '</div><div class="hoje-num"><span data-v="prot">' + fmt(c.total.prot) + "</span><small> g</small></div>" +
    '<div class="hoje-falta">' + (enjoo ? "Dia leve: o que der, em porções pequenas." : falta > 0 ? "Faltam " + falta + " g" : "Chegou ao alvo de hoje") + "</div>" +
    '<div class="hoje-nota">' + alvo + (!enjoo && falta > 0 && planoRest > 0 ? ". As refeições sem marca do plano têm cerca de " + fmt(planoRest) + " g." : ".") + "</div></div>";
}

/* ---------- "Como está hoje?": um toque grava em sintomas (o registro de hoje; cria se não houver) ----------
   "Enjoo forte" pergunta se troca as refeições pelas leves (o dia de enjoo). "Dor na barriga" grava a dor e abre os sinais. */
const COMO = [["bem", "Bem"], ["leve", "Enjoo leve"], ["forte", "Enjoo forte"], ["semFome", "Sem fome"], ["dor", "Dor na barriga"]];
const NOTA_SEM_FOME = "Sem fome.";
function sintomaDeHoje() { const h = hoje(); return E.sintomas.find(s => s.data === h) || null; }
function comoAtivo(s, k) {
  if (!s) return false;
  const semFome = String(s.nota || "").indexOf(NOTA_SEM_FOME) >= 0;
  return k === "bem" ? !s.enjoo && !s.dor && !s.vomito && !semFome : k === "leve" ? s.enjoo === 1 || s.enjoo === 2 : k === "forte" ? s.enjoo === 3 : k === "semFome" ? semFome : !!s.dor;
}
function cartaoComo() {
  const s = sintomaDeHoje();
  return '<div class="cartao hoje-como"><h2>Como está hoje?</h2><div class="como-toques" role="group" aria-label="Como está hoje">' +
    COMO.map(x => '<button class="como' + (comoAtivo(s, x[0]) ? " ativa" : "") + '" data-ac="como" data-k="' + x[0] + '" aria-pressed="' + comoAtivo(s, x[0]) + '">' + x[1] + "</button>").join("") +
    '</div><p class="hoje-nota">Fica no seu registro de sintomas e no relatório da consulta.</p></div>';
}

/* ---------- dor na barriga: um caminho só ----------
   TEXTO DE SAÚDE: os mesmos sinais do cartão da vesícula (perfil.js, avisoVesicula) e do Guia ("Sinais de alerta", conteudo.js),
   divididos por urgência. Fontes: bula americana do Mounjaro, seções 5.2 (pancreatite: dor abdominal forte e persistente, que pode ir
   para as costas, com ou sem vômito), 5.4 (reação alérgica grave) e 5.8 (vesícula); NIDDK, "Symptoms & Causes of Gallstones";
   Manual MSD. O limite de 1 ou 2 horas e a divisão 192 / pronto-socorro / médico são escolha conservadora da equipe e PRECISAM DE
   AVAL MÉDICO (revisao-clinica-onda2.md). */
function htmlSinaisDor(registrou) {
  return (registrou ? '<p class="sub" data-registrou>Registrado no seu dia: dor na barriga.</p>' : "") +
    '<div class="sinal s192"><h3>Ligue 192 agora</h3><p>Dor com febre e pele amarela e também confusão, desmaio ou muita fraqueza. Inchaço no rosto, lábios ou garganta, ou falta de ar.</p></div>' +
    '<div class="sinal sps"><h3>Pronto-socorro hoje</h3><p>Dor forte e contínua no alto da barriga, que pode ir para as costas (pode ser pâncreas). Dor que dura mais de 1 ou 2 horas, ou vem com enjoo e vômito; se for muito forte, vá logo. ' +
    "Febre, mesmo baixa, ou calafrio. Pele ou olhos amarelados, urina escura ou fezes claras. Vômito em que você não consegue segurar nem água.</p></div>" +
    '<div class="sinal smed"><h3>Avise o médico no mesmo dia ou no seguinte</h3><p>Uma crise curta que passou sozinha, sem febre, sem vômito e sem pele amarela.</p></div>' +
    '<div class="botoes">' + (registrou ? "" : '<button class="sec" data-ac="registrarDor">Registrar dor na barriga hoje</button>') + '<button class="sec" data-ac="sinaisGuia">Todos os sinais no Guia</button></div>';
}
function abrirSinaisDor(registrou) { abrirFolha("Dor na barriga: o que fazer", htmlSinaisDor(registrou)); }
/* Cartão curto da vesícula em Hoje (2 linhas e um botão). O cartão completo, com a bula, os sinais e a cirurgia, fica no Plano e no
   Perfil (avisoVesicula em perfil.js). Fonte da frase: bula do Mounjaro, seção 5.8 (ver avisoVesicula). */
function vesiculaCurta() {
  const m = metas(); if (!m || !m.vesicula) return "";
  return '<div class="cartao alerta vesicula-curta" data-aviso="vesicula"><p><strong>Pedra na vesícula.</strong> Com dor forte no alto da barriga, veja na hora o que fazer.</p>' +
    '<div class="botoes"><button class="sec" data-ac="sinaisDor">Dor na barriga: o que fazer</button></div></div>';
}

/* ---------- atalhos: na ordem do uso e do risco (usabilidade, item 8) ---------- */
const ATALHOS = [
  ["comida", "Comida", "i-comer", "plano"], ["agua", "Água", "i-agua", ""], ["como", "Como estou", "i-sintoma", "diario:sintomas"], ["aplic", "Aplicação", "i-caneta", "diario:doses"],
  ["dor", "Dor na barriga", "i-alerta", ""], ["consulta", "Para a consulta", "i-conversa", "diario:relatorio"], ["painel", "Painel", "i-painel", "painel"], ["peso", "Peso", "i-peso", "diario:peso"],
];
function gradeAtalhos(marca) {
  return '<nav class="cartao atalhos" aria-label="Atalhos">' + ATALHOS.map(a => {
    const acao = a[0] === "agua" ? 'data-ac="agua" data-ml="200" data-atalho="agua"' + marca : a[0] === "dor" ? 'data-ac="sinaisDor" data-atalho="dor"' : 'data-ac="atalho" data-para="' + a[3] + '"';
    return '<button class="atalho a-' + a[0] + '" ' + acao + '><span class="q"><svg aria-hidden="true"><use href="#' + a[2] + '"/></svg></span>' + a[1] + "</button>";
  }).join("") + "</nav>";
}

/* ---------- marcar o dia: as refeições do plano, uma linha cada, e a água ---------- */
function cartaoMarcar(card, regs, d, r, m, eHoje, marca) {
  const titulo = r.enjoo ? "Refeições leves" + (eHoje ? " de hoje" : "") : card.nutri ? "Plano da sua nutricionista" : "Refeições de " + esc(String(card.nome).toLowerCase());
  const copos = Math.round(r.agua / 200), meta = Math.max(1, Math.round(m.agua / 200));
  let out = '<div class="cartao hoje-marcar"><div class="linha"><h2 style="margin:0">' + titulo + '</h2><button class="mini sec" data-ac="enjoo"' + marca + ">" + (r.enjoo ? "Voltar ao normal" : "Dia de enjoo") + "</button></div>" +
    '<p class="hoje-nota">Um toque em cada. O que você não marcar fica em branco, sem cobrança.</p>';
  /* TEXTO DE SAÚDE (revisão clínica de 22/11, B2): gordura na medida, nunca "pouca gordura". Fonte: regra R3 do cardápio
     (REGRAS_CARDAPIO.gordMinPrincipal em cardapio.js; Gebhard 1996, Festi 1998, Stokes 2014): refeição quase sem gordura deixa a
     vesícula parada e favorece pedra nova durante a perda de peso; refeição muito gordurosa pode disparar a cólica (MSD, NIDDK). */
  if (m.vesicula && !r.enjoo) out += '<p class="hoje-porque"><strong>Gordura na medida:</strong> um pouco de gordura em cada refeição ajuda a vesícula a esvaziar, e muita de uma vez pode trazer cólica.</p>';
  card.refeicoes.forEach((ref, i) => { out += blocoRefeicao(ref, i, regs[i], d); });
  const c = consumoDoDia(d);
  out += '<div class="botoes"><button class="mini sec" data-ac="prot" data-g="10"' + marca + ">+ 10 g de proteína fora do plano</button>" + (c.protExtra > 0 ? '<button class="mini sec" data-ac="prot" data-g="-10"' + marca + ">− 10 g</button>" : "") + "</div>" +
    '<div class="agua-dia"><div class="linha"><span><strong>Água ' + (eHoje ? "hoje" : "no dia") + '</strong> <span class="sub">' + copos + " de " + meta + ' copos</span></span><strong data-v="agua">' + fmt(r.agua / 1000, 1) + " L</strong></div>" +
    '<div class="botoes"><button class="mini" data-ac="agua" data-ml="200"' + marca + '>+ 1 copo</button><button class="mini" data-ac="agua" data-ml="500"' + marca + '>+ 500 ml</button><button class="mini sec" data-ac="agua" data-ml="-200"' + marca + ">− 1 copo</button></div></div>" +
    '<div class="botoes"><button class="mini sec" data-ac="ir" data-para="plano">Ver porções e nutrientes</button></div></div>';
  return out;
}
/* Horário do plano ("7h30", "13h") em minutos; null se não houver. */
function minutosDe(hora) { const x = /^(\d{1,2})h(\d{2})?$/.exec(hora || ""); return x ? Number(x[1]) * 60 + Number(x[2] || 0) : null; }
function cartaoAindaHoje(card, regs, r, marca) {
  const agora = new Date().getHours() * 60 + new Date().getMinutes();
  const prox = card.nutri ? card.refeicoes.map((ref, i) => ({ i, min: minutosDe(PN_REFEICOES[i].hora) })).find(x => x.min != null && x.min >= agora - 30 && !regs[x.i]) : null;
  return '<div class="cartao hoje-ainda"><h2>Ainda hoje</h2><ul class="ainda">' +
    (prox ? '<li><span class="hora">' + esc(PN_REFEICOES[prox.i].hora) + '</span><span class="txt">Próxima refeição: ' + esc(PN_REFEICOES[prox.i].tipo.toLowerCase()) + "</span></li>" : "") +
    '<li><span class="hora">—</span><span class="txt">Caminhada <span class="sub">(opcional) · ' + r.caminhada + " min hoje</span></span></li></ul>" +
    '<div class="botoes"><button class="mini sec" data-ac="caminhada" data-min="10"' + marca + ">+ 10 min de caminhada</button>" + (r.caminhada ? '<button class="mini sec" data-ac="caminhada" data-min="-10"' + marca + ">− 10</button>" : "") + "</div></div>";
}
function telaHoje() {
  const h = hoje(), d = dataSel(), eHoje = d === h, m = metas(), r = dia(d), card = pnPlanoDaData(d), c = consumoDoDia(d), regs = registrosDoDia(r, d), ref = pnReferenciaDoDia(m);
  const quando = eHoje ? "hoje" : "no dia", atras = entre(d, h), marca = ' data-dia="' + d + '"';
  const planoRest = card.refeicoes.reduce((s, x, i) => s + (regs[i] || (card.nutri && PN_REFEICOES[i].opcional) ? 0 : somarItens(x.itens).prot), 0);
  let out = "";

  if (eHoje) out += '<section class="hoje-topo"><div class="hoje-data">' + esc(diaLongoHoje(d).replace(/^./, x => x.toUpperCase())) + "</div>" + blocoDose() + blocoProteina(c, ref, quando, planoRest, r.enjoo) + "</section>";
  out += '<div class="dias-nav"><button class="sec" data-ac="diaVer" data-n="-1" aria-label="Dia anterior"' + (atras >= VOLTA_MAX ? " disabled" : "") + '>‹ Anterior</button>' +
    '<div class="dia-rotulo"><strong>' + rotuloDia(d) + "</strong>" + (atras <= 1 ? '<div class="sub">' + diaLongoHoje(d) + "</div>" : "") + "</div>" +
    '<button class="sec" data-ac="diaVer" data-n="1" aria-label="Dia seguinte"' + (eHoje ? " disabled" : "") + ">Seguinte ›</button></div>";
  if (!eHoje) out += '<div class="cartao destaque faixa-dia"><div>Você está vendo <strong>' + diaLongoHoje(d) + '</strong>. O que marcar aqui vale para esse dia.</div><button data-ac="diaVer" data-n="0">Voltar para hoje</button></div>' +
    '<div class="cartao">' + blocoProteina(c, ref, quando, 0, r.enjoo) + "</div>";

  if (eHoje) {
    out += avisoGestante() + avisoPesoBaixo();
    if (riscoHipoHoje(h, new Date().getHours())) out += avisoHipoglicemia("hoje");
    const motivo = avisoComerPoucoHoje(h);
    if (motivo) out += cartaoComerPouco(motivo);
  }
  out += cartaoMarcar(card, regs, d, r, m, eHoje, marca);
  if (eHoje) out += cartaoComo() + vesiculaCurta() + gradeAtalhos(marca);
  out += cartaoAindaHoje(card, regs, r, marca);
  return out;
}

/* Uma refeição do plano numa linha: o que é, a opção (trocar) e as quatro marcas de um toque. A já marcada encolhe (classe feita).
   Cada opção é uma caixa de marcar escondida dentro de um rótulo grande: a marcada é [data-mud=refeicao]:checked. Só proteína:
   calorias ficam no Painel (usabilidade, item 5). */
function blocoRefeicao(ref, i, reg, d) {
  const q = reg ? Number(reg.q) || 0 : null, inteira = somarItens(porcaoDoRegistro(q > 0 ? reg : null, ref.itens));
  let out = '<div class="refeicao comida' + (q != null ? " feita-r" : "") + '" data-i="' + i + '"' + (q != null ? ' data-q="' + q + '"' : "") + '><div class="txt">' +
    '<div class="tipo">' + esc(ref.tipo) + (ref.trocada ? ' <span class="marca">· com trocas</span>' : "") + ' <span class="g-prot">· ' + fmt(inteira.prot) + ' g de proteína</span></div><div class="tit">' + esc(ref.titulo) + '</div>' + pnEscolhaOpcao(ref, i, d) +
    '<div class="opcoes" role="group" aria-label="Quanto comeu de ' + esc(ref.tipo) + '">' +
    FRACOES.map(f => '<label class="opcao' + (q === f[0] ? " ativa" : "") + '"><input type="checkbox" data-mud="refeicao" data-dia="' + d + '" data-i="' + i + '" data-q="' + f[0] + '"' + (q === f[0] ? " checked" : "") + ">" + f[1] + "</label>").join("") + "</div>";
  if (q === 0.5 || q === 0.25) out += '<div class="sub contou">Contou: ' + fmt(consumoDaRefeicao(reg, ref.itens).prot) + " g de proteína</div>";
  return out + "</div></div>";
}

function relAlimentacao(de) {
  const L = [], m = metas(), h = hoje(), s = resumoConsumo(de, h), periodo = entre(de, h) + 1, discreto = semCalorias();
  L.push("ALIMENTAÇÃO E ÁGUA (estimativa a partir do que foi marcado no app)");
  if (s.dias) {
    const ap = alvoProteina(m);
    L.push("Dias com registro do que foi comido: " + s.dias + " de " + periodo + ". Média de proteína: " + fmt(s.media.prot) + " g (" + ap.rotulo + (ap.nutri ? ": " : " ") + ap.g + " g)." +
      (discreto ? "" : " Média de energia: " + fmt(s.media.kcal) + " kcal (referência " + m.kcal + " kcal)."));
    L.push('Refeições marcadas como "nada": ' + s.nada + " de " + s.refeicoes + " registradas.");
  } else L.push("Nenhum dia com registro do que foi comido.");
  L.push((s.diasAgua ? "Água: média de " + fmt(s.agua / 1000, 1) + " L em " + s.diasAgua + (s.diasAgua === 1 ? " dia" : " dias") + " com registro (meta " + fmt(m.agua / 1000, 1) + " L)." : "Água: sem registro.") + " Dias de enjoo: " + s.enjoo + ".");
  if (s.dias) {
    const nota = " (estimativa: só entra o que foi marcado, nos dias com registro" + (s.temExtras ? "; inclui suplementos" : "") + ")";
    const comidos = NUTRI.filter(x => s.media[x[0]] < 0.8 * m.micro[x[0]]).map(x => x[1] + " " + fmt(100 * s.media[x[0]] / m.micro[x[0]]) + "%");
    L.push(comidos.length ? "Média do que foi comido abaixo de 80% da meta" + nota + ": " + comidos.join(", ") + "." : "Média do que foi comido: nenhuma vitamina ou mineral abaixo de 80% da meta" + nota + ".");
  }
  const med = mediaSemana(), baixos = NUTRI.filter(x => med[x[0]] < 0.8 * m.micro[x[0]]).map(x => x[1] + " " + fmt(100 * med[x[0]] / m.micro[x[0]]) + "%");
  if (baixos.length) L.push("Cardápio planejado abaixo de 80% da meta (só com comida): " + baixos.join(", ") + ".");
  return L;
}

Object.assign(AC, {
  /* n = -1 (dia anterior), 1 (dia seguinte) ou 0 (voltar para hoje). */
  diaVer(d) {
    const n = Number(d.n), h = hoje();
    if (n === 0) diaSel = null;
    else { const novo = mais(dataSel(), n); if (novo >= h) diaSel = null; else if (entre(novo, h) <= VOLTA_MAX) diaSel = novo; }
    render(true);
  },
  entendiPouco() { E.ui.avisoPouco = hoje(); salvar(); render(); },
  agua(d) { const h = diaDoToque(d); if (!h) return; const r = dia(h); r.agua = Math.max(0, r.agua + Number(d.ml)); gravarDia(h, r); render(); if (d.atalho) aviso("Mais 1 copo de água (200 ml)."); },
  prot(d) { const h = diaDoToque(d); if (!h) return; const r = dia(h); r.protExtra = Math.max(0, r.protExtra + Number(d.g)); gravarDia(h, r); render(); },
  caminhada(d) { const h = diaDoToque(d); if (!h) return; const r = dia(h); r.caminhada = Math.max(0, r.caminhada + Number(d.min)); gravarDia(h, r); render(); },
  /* "Como está hoje?": grava no registro de sintomas de hoje (o mesmo do Diário). Tocar de novo numa opção ligada desliga
     (menos "Dor na barriga", que só se corrige no Diário, e sempre reabre os sinais). */
  como(d) {
    const h = hoje(), k = d.k; let s = sintomaDeHoje(); const novo = !s;
    if (!s) s = { id: novoId(), data: h, enjoo: 0, intestino: "Normal", vomito: false, refluxo: false, tontura: false, cansaco: false, dor: false, nota: "" };
    s = Object.assign({}, s); const ativo = !novo && comoAtivo(s, k), tirarSemFome = () => { s.nota = String(s.nota || "").replace(NOTA_SEM_FOME, "").trim(); };
    let perguntaLeve = false;
    if (k === "bem") { s.enjoo = 0; s.dor = false; s.vomito = false; tirarSemFome(); }
    else if (k === "leve") s.enjoo = ativo ? 0 : 1;
    else if (k === "forte") { s.enjoo = ativo ? 0 : 3; perguntaLeve = !ativo && !dia(h).enjoo; }
    else if (k === "semFome") { if (ativo) tirarSemFome(); else s.nota = (String(s.nota || "").trim() + " " + NOTA_SEM_FOME).trim(); }
    else if (k === "dor") s.dor = true;
    if (novo) E.sintomas.push(s); else E.sintomas = E.sintomas.map(x => (x.id === s.id ? s : x));
    salvar(); render();
    if (k === "dor") abrirSinaisDor(true);
    else if (perguntaLeve) confirmar("Enjoo forte registrado. Trocar as refeições de hoje pelas leves?", function () { const r = arrumarDia(dia(h)); r.enjoo = true; gravarDia(h, r); render(); }, "Trocar pelas leves");
    else aviso("Registrado.");
  },
  sinaisDor() { const s = sintomaDeHoje(); abrirSinaisDor(!!(s && s.dor)); },
  registrarDor() { AC.como({ k: "dor" }); },
  sinaisGuia() { fecharFolha(); irPara("guia"); },
  atalho(d) { const x = String(d.para).split(":"); irPara(x[0], x[1]); },
  /* Troca o cardápio do dia selecionado (normal ou de enjoo). Nada é apagado: cada cardápio tem as suas marcas (comido e comidoEnjoo). */
  enjoo(d) { const h = diaDoToque(d); if (!h) return; const r = arrumarDia(dia(h)); r.enjoo = !r.enjoo; gravarDia(h, r); render(); },
});

/* Toque numa das quatro opções. Marcar grava a fração e a foto da porção do plano; tocar na que já está marcada desfaz.
   A foto é reaproveitada quando já havia uma (corrigir "tudo" para "metade" dias depois não muda o prato de referência). */
MUD.refeicao = function (c) {
  const h = diaDoToque(c.dataset); if (!h) return;
  const r = arrumarDia(dia(h)), i = Number(c.dataset.i), q = Number(c.dataset.q), campo = pnCampoDoDia(h, r);
  const lista = r[campo].slice(), antes = lista[i];
  let reg = null;
  if (c.checked) {
    const ref = pnPlanoDaData(h).refeicoes[i]; if (!ref) { render(); return; }
    // No plano da nutricionista a foto acompanha a opção: só é reaproveitada se a opção for a mesma.
    reg = { q, itens: antes && Array.isArray(antes.itens) && antes.op === ref.op ? antes.itens : fotoDosItens(ref.itens) };
    if (ref.op != null) reg.op = ref.op;
    if (antes && antes.outros) reg.outros = antes.outros;
  }
  lista[i] = reg;
  for (let n = 0; n < lista.length; n++) if (lista[n] === undefined) lista[n] = null;
  r[campo] = lista; gravarDia(h, r); render();
};
