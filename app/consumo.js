"use strict";
/* Consumo: o que foi comido de fato em cada dia e a soma de nutrientes. Sem acesso à página.

   Como o registro do dia (E.dias[data], formato no topo de nucleo.js) é usado aqui:
   - comido[i]       registro da refeição i do plano NORMAL daquele dia da semana.
   - comidoEnjoo[i]  registro da refeição i do plano do DIA DE ENJOO. Campo novo: os dois planos têm registros separados
                     para que ligar e desligar o "Dia de enjoo" não apague nada. A soma do dia usa só o do plano em vigor
                     (enjoo ligado: comidoEnjoo; desligado: comido).
   - comidoNutri[i]  registro da refeição i do PLANO DA NUTRICIONISTA (app/planonutri.js), com op = opção escolhida.
                     opNutri[i] guarda a opção escolhida antes de marcar. Qual plano normal vale no dia: pnDiaUsaNutri().
     Dado antigo não tem comidoEnjoo. Nele, um dia com enjoo ligado guardava em `comido` as marcas do plano de enjoo:
     registrosDoDia() lê assim, e arrumarDia() passa essas marcas para comidoEnjoo na primeira gravação.
   - Cada registro é null (não registrou) ou { q, itens }:
     q      quanto comeu do prato: 1 (tudo), 0.5 (metade), 0.25 (um pouco), 0 (nada).
     itens  [[chave, gramas]]: foto da porção INTEIRA do plano na hora em que marcou. A conta usa a foto, e não o plano de agora,
            para que mudança de peso, de meta ou de troca não altere o que foi comido em dias passados.
            Registro antigo (vindo da versão 1) tem só { q: 1 }: aí a conta usa o plano atual daquela data.
     outros [[chave, gramas]]: previsto no formato; nenhuma tela grava, mas, se existir, entra inteiro na soma.
   - protExtra (g): proteína avulsa fora do plano (botão "+10 g"); entra na proteína do dia. */

const FRACOES = [[1, "comi tudo"], [0.5, "metade"], [0.25, "um pouco"], [0, "nada"]];
const KCAL_POUCO = 800;   // abaixo disso, em 3 dias com registro, a tela Hoje sugere conversar com o médico (decisão do chefe de engenharia)

/* [[chave, gramas]] -> [{ k, g }], sem o que não existe mais na base de alimentos. */
function paraItens(pares) { return (pares || []).filter(p => p && A[p[0]] && Number(p[1]) > 0).map(p => ({ k: p[0], g: Number(p[1]) })); }
function fotoDosItens(itens) { return itens.map(it => [it.k, it.g]); }
/* Registros do plano em vigor no dia (r = dia(data)). Não altera nada. Sem a data, vale o interruptor do plano da nutricionista. */
function registrosDoDia(r, data) {
  if (r.enjoo) return r.comidoEnjoo || r.comido || [];
  return (pnDiaUsaNutri(data, r) ? r.comidoNutri : r.comido) || [];
}
/* Deixa o registro do dia com os dois campos, cada um com as marcas do seu plano. Chamar antes de gravar. */
function arrumarDia(r) {
  if (!Array.isArray(r.comido)) r.comido = [];
  if (!Array.isArray(r.comidoEnjoo)) { if (r.enjoo) { r.comidoEnjoo = r.comido; r.comido = []; } else r.comidoEnjoo = []; }
  if (!Array.isArray(r.comidoNutri)) r.comidoNutri = [];
  return r;
}
/* Porção inteira a que o registro se refere: a foto, se houver; senão os itens do plano recebidos. */
function porcaoDoRegistro(c, itensPlano) {
  return c && Array.isArray(c.itens) ? paraItens(c.itens) : (itensPlano || []).filter(it => A[it.k]);
}
/* Nutrientes de um registro: fração do prato (mais `outros`, se houver). */
function consumoDaRefeicao(c, itensPlano) {
  const t = zeros(); if (!c) return t;
  const q = Number(c.q) || 0;
  if (q > 0) { const p = somarItens(porcaoDoRegistro(c, itensPlano)); CAMPOS.forEach(k => { t[k] += p[k] * q; }); }
  if (c.outros && c.outros.length) { const o = somarItens(paraItens(c.outros)); CAMPOS.forEach(k => { t[k] += o[k]; }); }
  return t;
}
/* O que foi comido no dia.
   comida     nutrientes do que foi marcado nas refeições do plano em vigor, mais a proteína avulsa (protExtra)
   extras     nutrientes que não vêm da comida (suplementos), de somarExtras(data)
   total      comida + extras
   registrou  true se há refeição registrada ou proteína avulsa
   refeicoes  quantas refeições têm registro; comidas: com tudo, metade ou um pouco; pouco: com "um pouco"; nada: com "nada"
   temExtras  true se algum valor de extras é maior que zero */
function consumoDoDia(data) {
  const r = dia(data), comida = zeros();
  let plano = null, refeicoes = 0, comidas = 0, pouco = 0, nada = 0;
  registrosDoDia(r, data).forEach((c, i) => {
    if (!c) return;
    const q = Number(c.q) || 0;
    let itensPlano = null;
    if (q > 0 && !Array.isArray(c.itens)) { plano = plano || planoDaData(data); itensPlano = plano.refeicoes[i] ? plano.refeicoes[i].itens : []; }
    const t = consumoDaRefeicao(c, itensPlano);
    CAMPOS.forEach(k => { comida[k] += t[k]; });
    refeicoes++;
    if (q > 0) comidas++;
    if (q === 0.25) pouco++;
    if (q === 0) nada++;
  });
  const protExtra = Number(r.protExtra) || 0;
  comida.prot += protExtra;
  const extras = somarExtras(data), total = zeros();
  CAMPOS.forEach(k => { total[k] = comida[k] + (extras[k] || 0); });
  return { total, comida, extras, registrou: refeicoes > 0 || protExtra > 0, refeicoes, comidas, pouco, nada, protExtra, temExtras: CAMPOS.some(k => extras[k] > 0) };
}
/* Resumo de um período (datas inclusive), para o relatório.
   dias: dias com registro de comida; media: média do total desses dias; refeicoes e nada: somas no período;
   diasAgua e agua (ml): dias com água anotada e a média neles; enjoo: dias marcados como dia de enjoo. */
function resumoConsumo(de, ate) {
  const s = { dias: 0, refeicoes: 0, nada: 0, enjoo: 0, diasAgua: 0, agua: 0, media: zeros(), temExtras: false };
  Object.keys(E.dias).filter(d => d >= de && d <= ate).forEach(d => {
    const r = dia(d), c = consumoDoDia(d);
    if (r.enjoo) s.enjoo++;
    if (r.agua > 0) { s.diasAgua++; s.agua += r.agua; }
    if (!c.registrou) return;
    s.dias++; s.refeicoes += c.refeicoes; s.nada += c.nada; if (c.temExtras) s.temExtras = true;
    CAMPOS.forEach(k => { s.media[k] += c.total[k]; });
  });
  if (s.dias) CAMPOS.forEach(k => { s.media[k] /= s.dias; });
  if (s.diasAgua) s.agua /= s.diasAgua;
  return s;
}

/* ---------- comer pouco ---------- */
/* Motivo para a tela Hoje sugerir conversa com o médico, ou null. h = data de hoje. Em ordem:
   "enjoo"    o dia de enjoo está ligado hoje e nos dois dias anteriores (3º dia seguido);
   "vomito"   há vômito registrado em 2 dias seguidos (hoje e ontem, ou ontem e anteontem);
   "energia"  nos 3 dias mais recentes com pelo menos uma refeição registrada, entre os 7 dias antes de hoje (hoje não entra,
              porque ainda não acabou), a energia marcada ficou abaixo de KCAL_POUCO em todos. */
function motivoComerPouco(h) {
  if ([0, -1, -2].every(n => dia(mais(h, n)).enjoo)) return "enjoo";
  const vom = n => E.sintomas.some(s => s.vomito && s.data === mais(h, n));
  if (vom(-1) && (vom(0) || vom(-2))) return "vomito";
  const ult = [];
  for (let n = 1; n <= 7 && ult.length < 3; n++) { const c = consumoDoDia(mais(h, -n)); if (c.refeicoes > 0) ult.push(c.comida.kcal); }
  if (ult.length === 3 && ult.every(k => k < KCAL_POUCO)) return "energia";
  return null;
}
/* O aviso aparece no máximo uma vez por dia: "Entendi" grava a data em E.ui.avisoPouco. */
function avisoComerPoucoHoje(h) { return (E.ui || {}).avisoPouco === h ? null : motivoComerPouco(h); }

/* Dia com pouca comida marcada: alguma refeição com "nada" ou "um pouco", ou, das 14h em diante, menos de 2 refeições comidas. */
function poucaComidaMarcada(data, hora) {
  const c = consumoDoDia(data);
  return c.nada > 0 || c.pouco > 0 || (hora >= 14 && c.comidas < 2);
}
/* Quando a tela Hoje mostra o destaque de hipoglicemia (texto de avisoHipoglicemia, em tratamento.js):
   diabetes com insulina ou sulfonilureia, e dia de enjoo ligado ou pouca comida marcada. */
function riscoHipoHoje(data, hora) {
  const p = E.perfil;
  if (!p || p.diabetes !== true || p.insulinaSulf !== true) return false;
  return !!dia(data).enjoo || poucaComidaMarcada(data, hora);
}
