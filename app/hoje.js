"use strict";
/* Tela Hoje: navegação por dias, proteína, energia e água do que foi comido, registro de cada refeição
   (tudo, metade, um pouco, nada), movimento. Trecho de alimentação do relatório.
   As contas e o formato do registro estão em consumo.js. */

/* Estado só da tela, nunca gravado: ao reabrir o app volta para hoje.
   diaSel é null (= hoje, calculado na hora a cada desenho e a cada toque) ou uma data PASSADA explícita. Nunca guarda a data de hoje:
   assim, à meia-noite, quem estava em "hoje" passa a ver o novo dia. */
let diaSel = null;
let microAberto = false;  // bloco de vitaminas e minerais aberto
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
function linhaProtKcal(t) { return fmt(t.prot) + " g de proteína" + (semCalorias() ? "" : " · " + fmt(t.kcal) + " kcal"); }

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

function telaHoje() {
  const h = hoje(), d = dataSel(), eHoje = d === h, m = metas(), r = dia(d), card = planoDaData(d), c = consumoDoDia(d), regs = registrosDoDia(r);
  const quando = eHoje ? "hoje" : "no dia", atras = entre(d, h), discreto = semCalorias(), marca = ' data-dia="' + d + '"';
  let out = "";

  out += '<div class="dias-nav"><button class="sec" data-ac="diaVer" data-n="-1" aria-label="Dia anterior"' + (atras >= VOLTA_MAX ? " disabled" : "") + '>‹ Anterior</button>' +
    '<div class="dia-rotulo"><strong>' + rotuloDia(d) + "</strong>" + (atras <= 1 ? '<div class="sub">' + diaLongoHoje(d) + "</div>" : "") + "</div>" +
    '<button class="sec" data-ac="diaVer" data-n="1" aria-label="Dia seguinte"' + (eHoje ? " disabled" : "") + ">Seguinte ›</button></div>";
  if (!eHoje) out += '<div class="cartao destaque faixa-dia"><div>Você está vendo <strong>' + diaLongoHoje(d) + '</strong>. O que marcar aqui vale para esse dia.</div><button data-ac="diaVer" data-n="0">Voltar para hoje</button></div>';

  if (eHoje) {
    out += cartaoTratamentoHoje();
    out += avisoVesicula("hoje");
    if (riscoHipoHoje(h, new Date().getHours())) out += avisoHipoglicemia("hoje");
    const motivo = avisoComerPoucoHoje(h);
    if (motivo) out += cartaoComerPouco(motivo);
  }

  out += '<div class="cartao"><div class="' + (discreto ? "" : "duas") + '">' +
    '<div><div class="sub">Proteína ' + quando + '</div><div class="grande" data-v="prot">' + fmt(c.total.prot) + ' <small>g</small></div><div class="sub">meta ' + m.prot + ' g</div><div class="barra ' + (c.total.prot >= m.prot ? "ok" : "") + '"><i style="width:' + pctBarra(c.total.prot, m.prot) + '%"></i></div></div>' +
    (discreto ? "" : '<div><div class="sub">Energia ' + quando + '</div><div class="grande" data-v="kcal">' + fmt(c.total.kcal) + ' <small>kcal</small></div><div class="sub">meta ' + fmt(m.kcal) + ' kcal</div><div class="barra"><i style="width:' + pctBarra(c.total.kcal, m.kcal) + '%"></i></div></div>') + "</div>" +
    '<p class="sub" style="margin:8px 0 0">Soma do que você marcou nas refeições abaixo' + (c.protExtra > 0 ? ", mais " + fmt(c.protExtra) + " g de proteína fora do plano" : "") + ".</p>" +
    '<div class="botoes"><button class="mini sec" data-ac="prot" data-g="10"' + marca + ">+ 10 g de proteína fora do plano</button>" + (c.protExtra > 0 ? '<button class="mini sec" data-ac="prot" data-g="-10"' + marca + ">− 10 g</button>" : "") + "</div>" +
    '<div class="agua-dia"><div class="linha"><span class="sub">Água ' + quando + '</span><span><strong data-v="agua">' + fmt(r.agua / 1000, 1) + ' L</strong> <span class="sub">de ' + fmt(m.agua / 1000, 1) + ' L</span></span></div>' +
    '<div class="barra ' + (r.agua >= m.agua ? "ok" : "") + '"><i style="width:' + pctBarra(r.agua, m.agua) + '%"></i></div>' +
    '<div class="botoes"><button class="mini" data-ac="agua" data-ml="200"' + marca + '>+ 1 copo (200 ml)</button><button class="mini" data-ac="agua" data-ml="500"' + marca + '>+ 500 ml</button><button class="mini sec" data-ac="agua" data-ml="-200"' + marca + ">− 200 ml</button></div></div>" +
    '<button class="sec abre-micro" data-ac="microDia" aria-expanded="' + (microAberto ? "true" : "false") + '">Vitaminas e minerais do dia <span aria-hidden="true">' + (microAberto ? "▴" : "▾") + "</span></button>";
  if (microAberto) {
    out += '<div class="micro-dia">' + (c.registrou || c.temExtras
      ? barrasMicro(c.total, m) + '<p class="sub" style="margin:10px 0 0">Estimativa a partir do que você marcou' + (c.temExtras ? "; inclui suplementos" : "") + ". Vitaminas e minerais variam de um dia para o outro; o que conta é a média da semana.</p>"
      : '<p class="sub" style="margin:8px 0 0">Aparece quando você marcar o que comeu.</p>') + "</div>";
  }
  out += "</div>";

  out += '<div class="cartao"><div class="linha"><h2 style="margin:0">Refeições de ' + (r.enjoo ? (eHoje ? "hoje" : "um dia") + " de enjoo" : esc(String(card.nome).toLowerCase())) + '</h2><button class="mini sec" data-ac="enjoo"' + marca + ">" + (r.enjoo ? "Voltar ao normal" : "Dia de enjoo") + "</button></div>";
  card.refeicoes.forEach((ref, i) => { out += blocoRefeicao(ref, i, regs[i], d); });
  out += '<div class="botoes"><button class="mini sec" data-ac="ir" data-para="plano">Ver porções e nutrientes</button></div></div>';

  out += '<div class="cartao"><h2>Movimento</h2>';
  if (eHoje) {
    const ts = treinosDaSemana(), fezHoje = E.treinos.some(t => t.data === h), px = proximoTreino();
    out += '<div class="duas"><div><div class="sub">Treinos de força na semana</div><div class="grande">' + ts.length + ' / 3</div></div><div><div class="sub">Caminhada hoje</div><div class="grande">' + r.caminhada + " min</div></div></div>" +
      '<div class="botoes">' + (fezHoje ? '<button class="mini sec" disabled>Treino de hoje registrado</button>' : '<button class="mini" data-ac="treino" data-tipo="' + px + '">Concluí o treino ' + px + "</button>");
  } else {
    out += '<div class="sub">Caminhada no dia</div><div class="grande">' + r.caminhada + ' min</div><div class="botoes">';
  }
  out += '<button class="mini sec" data-ac="caminhada" data-min="10"' + marca + ">+ 10 min de caminhada</button>" + (r.caminhada ? '<button class="mini sec" data-ac="caminhada" data-min="-10"' + marca + ">− 10</button>" : "") + "</div></div>";

  if (eHoje) out += '<div class="cartao"><h2>Registrar</h2><div class="botoes" style="margin-top:0"><button class="sec" data-ac="ir" data-para="diario" data-sub="peso">Peso</button><button class="sec" data-ac="ir" data-para="diario" data-sub="sintomas">Sintomas</button><button class="sec" data-ac="ir" data-para="diario" data-sub="doses">Aplicação</button></div></div>';
  return out;
}

/* Uma refeição do plano: o que é, quanto tem de proteína e energia, e as quatro opções de um toque.
   Cada opção é uma caixa de marcar escondida dentro de um rótulo grande: a marcada é [data-mud=refeicao]:checked. */
function blocoRefeicao(ref, i, reg, d) {
  const q = reg ? Number(reg.q) || 0 : null, inteira = somarItens(porcaoDoRegistro(q > 0 ? reg : null, ref.itens));
  let out = '<div class="refeicao comida" data-i="' + i + '"' + (q != null ? ' data-q="' + q + '"' : "") + '><div class="txt">' +
    '<div class="tipo">' + esc(ref.tipo) + (ref.trocada ? ' <span class="marca">· com trocas</span>' : "") + '</div><div class="tit">' + esc(ref.titulo) + '</div><div class="sub">' + linhaProtKcal(inteira) + "</div>" +
    '<div class="opcoes" role="group" aria-label="Quanto comeu de ' + esc(ref.tipo) + '">' +
    FRACOES.map(f => '<label class="opcao' + (q === f[0] ? " ativa" : "") + '"><input type="checkbox" data-mud="refeicao" data-dia="' + d + '" data-i="' + i + '" data-q="' + f[0] + '"' + (q === f[0] ? " checked" : "") + ">" + f[1] + "</label>").join("") + "</div>";
  if (q === 0.5 || q === 0.25) out += '<div class="sub contou">Contou: ' + linhaProtKcal(consumoDaRefeicao(reg, ref.itens)) + "</div>";
  return out + "</div></div>";
}

function relAlimentacao(de) {
  const L = [], m = metas(), h = hoje(), s = resumoConsumo(de, h), periodo = entre(de, h) + 1, discreto = semCalorias();
  L.push("ALIMENTAÇÃO E ÁGUA (estimativa a partir do que foi marcado no app)");
  if (s.dias) {
    L.push("Dias com registro do que foi comido: " + s.dias + " de " + periodo + ". Média de proteína: " + fmt(s.media.prot) + " g (meta " + m.prot + " g)." +
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
  microDia() { microAberto = !microAberto; render(); },
  entendiPouco() { E.ui.avisoPouco = hoje(); salvar(); render(); },
  agua(d) { const h = diaDoToque(d); if (!h) return; const r = dia(h); r.agua = Math.max(0, r.agua + Number(d.ml)); gravarDia(h, r); render(); },
  prot(d) { const h = diaDoToque(d); if (!h) return; const r = dia(h); r.protExtra = Math.max(0, r.protExtra + Number(d.g)); gravarDia(h, r); render(); },
  caminhada(d) { const h = diaDoToque(d); if (!h) return; const r = dia(h); r.caminhada = Math.max(0, r.caminhada + Number(d.min)); gravarDia(h, r); render(); },
  /* Troca o cardápio do dia selecionado (normal ou de enjoo). Nada é apagado: cada cardápio tem as suas marcas (comido e comidoEnjoo). */
  enjoo(d) { const h = diaDoToque(d); if (!h) return; const r = arrumarDia(dia(h)); r.enjoo = !r.enjoo; gravarDia(h, r); render(); },
});

/* Toque numa das quatro opções. Marcar grava a fração e a foto da porção do plano; tocar na que já está marcada desfaz.
   A foto é reaproveitada quando já havia uma (corrigir "tudo" para "metade" dias depois não muda o prato de referência). */
MUD.refeicao = function (c) {
  const h = diaDoToque(c.dataset); if (!h) return;
  const r = arrumarDia(dia(h)), i = Number(c.dataset.i), q = Number(c.dataset.q), campo = r.enjoo ? "comidoEnjoo" : "comido";
  const lista = r[campo].slice(), antes = lista[i];
  let reg = null;
  if (c.checked) {
    const ref = planoDaData(h).refeicoes[i]; if (!ref) { render(); return; }
    reg = { q, itens: antes && Array.isArray(antes.itens) ? antes.itens : fotoDosItens(ref.itens) };
    if (antes && antes.outros) reg.outros = antes.outros;
  }
  lista[i] = reg;
  for (let n = 0; n < lista.length; n++) if (lista[n] === undefined) lista[n] = null;
  r[campo] = lista; gravarDia(h, r); render();
};
