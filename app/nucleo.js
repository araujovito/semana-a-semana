"use strict";
/* Núcleo: constantes, estado guardado no aparelho, utilidades e os registros de ações (AC), formulários (FORM) e campos (MUD).
   Carregado antes de todos os outros arquivos. Só toca na página dentro de funções, para poder rodar em Node nos testes de unidade. */

const A = window.ALIMENTOS, C = window.CARDAPIO, T = window.TREINO, G = window.GUIA;
const CHAVE = "semana-a-semana.v1";
const NUTRI = [["ca","Cálcio","mg"],["fe","Ferro","mg"],["mg","Magnésio","mg"],["zn","Zinco","mg"],["k","Potássio","mg"],
  ["vita","Vitamina A","µg"],["b1","Vitamina B1","mg"],["b12","Vitamina B12","µg"],["folato","Folato","µg"],
  ["vitc","Vitamina C","mg"],["vitd","Vitamina D","µg"],["vite","Vitamina E","mg"],["vitk","Vitamina K","µg"]];
const CAMPOS = ["kcal","prot","gord","carb","fibra"].concat(NUTRI.map(n => n[0]));
const DOSES = [2.5, 5, 7.5, 10, 12.5, 15];
const LOCAIS = ["Abdômen esquerdo","Abdômen direito","Coxa esquerda","Coxa direita","Braço esquerdo","Braço direito"];
const SEMANA = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];

/* ---------- estado ---------- */
/* Formato dos dados, versão 2 (a chave do localStorage continua "semana-a-semana.v1" para quem já usa não perder nada).
   perfil     { nome, sexo, nascimento, altura, peso, atividade, metaKcal, metaProt, metaAgua,
                gestante (grávida ou amamentando), diabetes, insulinaSulf, pilula: null (não respondeu) | true | false,
                vesicula (tem pedra na vesícula), figado (tem gordura no fígado, esteatose),
                aguardaCirurgia (aguarda cirurgia da vesícula; só vale com vesicula true): null (não respondeu ou prefere não responder) | true | false,
                discreto: true = não mostrar calorias nem peso em destaque,
                naoCome: [ids de RESTRICOES], naoGosta: [chaves de alimento] }
   diaDose    dia habitual da aplicação, 0-6 = segunda a domingo; null = o dia da semana da primeira aplicação
   diaDoseHist [{ desde: "AAAA-MM-DD", dia: 0-6 }] em ordem de data: cada troca em "Mudei o dia da aplicação" (MUD.diaDose).
              Vale o dia da última entrada com desde <= a data da aplicação; antes da primeira entrada vale o dia dela.
              Lista vazia (dado antigo ou quem nunca trocou) = vale E.diaDose para todas. Serve à visão semanal (auditoria 3, I2).
   doses      [{ id, data, mg, local, obs }]
   pesos      [{ id, data, kg, cintura }]
   sintomas   [{ id, data, enjoo 0-3, intestino, vomito, refluxo, tontura, cansaco, dor, nota, glicemia (mg/dL, opcional) }]
   treinos    [{ id, data, tipo "A"|"B", local, exercicios: [{ nome, carga, reps: [n por série] }] (opcional) }]
   dias       { "AAAA-MM-DD": { enjoo, agua (ml), protExtra (g), caminhada (min),
                comido: [por refeição: null | { q: 1 | 0.5 | 0.25 | 0, itens: [[chave, gramas]] (porção inteira do plano na hora em que marcou; ausente em registro antigo), outros: [[chave, gramas]] (comeu outra coisa) }] } }
   trocas     { "dia.refeicao.item": chave do alimento escolhido }   dia 0-6 = segunda a domingo, 7 = dia de enjoo
   caneta     null | objeto (doses restantes, validade, saída da geladeira)
   suplementos, exames   listas
   lembretes  { } horários dos lembretes do aparelho
   ui         preferências de tela (aba aberta, local de treino). Também: planoNutri (planonutri.js); puPerguntas true = ela já
              respondeu (no primeiro uso ou no Perfil) vesícula, fígado e plano da nutricionista, mesmo com "Não sei";
              puAviso "AAAA-MM-DD" = dia em que a faixa "perguntas novas" foi respondida ou dispensada (perfil.js, auditoria 3, I7) */
const VERSAO = 2;
function vazio() { return { v: VERSAO, perfil: null, diaDose: null, diaDoseHist: [], doses: [], pesos: [], sintomas: [], treinos: [], dias: {}, trocas: {}, caneta: null, suplementos: [], exames: [], lembretes: {}, ui: {} }; }
const PERFIL_NOVO = { gestante: null, diabetes: null, insulinaSulf: null, pilula: null, vesicula: null, figado: null, aguardaCirurgia: null, discreto: false, naoCome: [], naoGosta: [] };
/* Perguntas de sim/não do perfil: qualquer valor que não seja true ou false vira null (sem resposta). */
const PERGUNTAS_SIM_NAO = ["gestante", "diabetes", "insulinaSulf", "pilula", "vesicula", "figado", "aguardaCirurgia"];
/* Recebe dados de qualquer versão (do aparelho ou de uma cópia de segurança) e devolve na versão atual, sem perder nada.
   Devolve null se não for um dado do app. Também confere os tipos: registro sem data válida sai, lista que não é lista vira lista vazia,
   perfil sem altura, peso e nascimento válidos volta a ser pedido. Assim uma cópia estragada não deixa telas em branco nem "NaN". */
function migrar(j) {
  if (!j || typeof j !== "object" || Array.isArray(j) || (j.v !== 1 && j.v !== 2)) return null;
  const e = Object.assign(vazio(), j);
  const dataOk = s => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && iso(deIso(s)) === s;
  const numero = (x, min, max) => typeof x === "number" && isFinite(x) && x >= min && x <= max;
  const objeto = x => (x && typeof x === "object" && !Array.isArray(x) ? x : {});
  const registros = x => (Array.isArray(x) ? x : []).filter(r => r && typeof r === "object" && dataOk(r.data)).map(r => {
    const id = String(r.id == null ? "" : r.id).replace(/[^A-Za-z0-9_-]/g, "");
    return Object.assign({}, r, { id: id || novoId() });
  });
  const p = e.perfil;
  if (p && typeof p === "object" && numero(p.nascimento, 1900, 2100) && numero(p.altura, 100, 250) && numero(p.peso, 30, 400)) {
    e.perfil = Object.assign({}, PERFIL_NOVO, p, { sexo: p.sexo === "M" ? "M" : "F", nome: String(p.nome == null ? "" : p.nome).slice(0, 40) });
    if (!Array.isArray(e.perfil.naoCome)) e.perfil.naoCome = [];
    if (!Array.isArray(e.perfil.naoGosta)) e.perfil.naoGosta = [];
    // Quem já tinha perfil antes das perguntas de vesícula e fígado fica com elas sem resposta (null).
    PERGUNTAS_SIM_NAO.forEach(k => { if (e.perfil[k] !== true && e.perfil[k] !== false) e.perfil[k] = null; });
    if (e.perfil.vesicula !== true) e.perfil.aguardaCirurgia = null;
  } else e.perfil = null;
  e.doses = registros(e.doses).filter(d => numero(d.mg, 0.1, 50));
  e.pesos = registros(e.pesos).filter(x => numero(x.kg, 30, 400));
  e.sintomas = registros(e.sintomas);
  e.treinos = registros(e.treinos);
  const dias = objeto(e.dias); e.dias = {};
  Object.keys(dias).forEach(d => {
    if (!dataOk(d) || !dias[d] || typeof dias[d] !== "object") return;
    const r = Object.assign({}, dias[d]);
    // v1 guardava só "feita ou não" por refeição; vira "comi tudo"
    if (r.feitas) { if (!r.comido && Array.isArray(r.feitas)) r.comido = r.feitas.map(x => (x ? { q: 1 } : null)); delete r.feitas; }
    if (!Array.isArray(r.comido)) r.comido = [];
    ["agua", "protExtra", "caminhada"].forEach(c => { r[c] = numero(r[c], 0, 100000) ? r[c] : 0; });
    r.enjoo = !!r.enjoo;
    e.dias[d] = r;
  });
  e.trocas = objeto(e.trocas); e.lembretes = objeto(e.lembretes); e.ui = objeto(e.ui);
  if (!(Number.isInteger(e.ui.diaPlano) && e.ui.diaPlano >= 0 && e.ui.diaPlano <= 7)) delete e.ui.diaPlano;
  if (!Array.isArray(e.suplementos)) e.suplementos = [];
  if (!Array.isArray(e.exames)) e.exames = [];
  if (!(Number.isInteger(e.diaDose) && e.diaDose >= 0 && e.diaDose <= 6)) e.diaDose = null;
  /* Histórico do dia habitual: entrada sem data válida ou com dia fora de 0-6 sai; fica em ordem de data. */
  e.diaDoseHist = (Array.isArray(e.diaDoseHist) ? e.diaDoseHist : [])
    .filter(x => x && typeof x === "object" && dataOk(x.desde) && Number.isInteger(x.dia) && x.dia >= 0 && x.dia <= 6)
    .map(x => ({ desde: x.desde, dia: x.dia })).sort((a, b) => (a.desde < b.desde ? -1 : a.desde > b.desde ? 1 : 0));
  e.v = VERSAO;
  return e;
}
/* ILEGIVEL guarda o texto que estava no aparelho quando o app não conseguiu entender (versão mais nova, arquivo danificado).
   Enquanto ele existir, salvar() não grava nada: dado que não foi lido nunca é sobrescrito. A tela de início oferece as saídas. */
let ILEGIVEL = null;
let FALHA_SALVAR = false;
/* PIN e cifra (app/cifra.js). Com dados cifrados em CIF_GUARDA, carregar() não lê nada: o estado só entra depois do PIN.
   CIF_TRANCADO: há dados cifrados e a chave não está em memória; salvar() não grava nada (nem em texto puro).
   CIF_GRAVAR: função de cifra.js que grava o estado cifrado; existe só enquanto o app está desbloqueado. */
const CIF_GUARDA = "semana-a-semana.cifrado";
let CIF_TRANCADO = false, CIF_GRAVAR = null;
function carregar() {
  let bruto = null;
  try { if (localStorage.getItem(CIF_GUARDA) != null) { CIF_TRANCADO = true; return vazio(); } bruto = localStorage.getItem(CHAVE); } catch (x) { return vazio(); }
  if (bruto == null) return vazio();
  try { const e = migrar(JSON.parse(bruto)); if (e) return e; } catch (x) {}
  ILEGIVEL = bruto;
  return vazio();
}
/* Devolve true se gravou. Se não gravou, a faixa de erro fica na tela e as mensagens de sucesso ("registrado") não aparecem. */
function salvar() {
  let certo = false;
  if (CIF_TRANCADO) return false;
  if (ILEGIVEL == null && CIF_GRAVAR) certo = CIF_GRAVAR(JSON.stringify(E));
  else if (ILEGIVEL == null) { try { localStorage.setItem(CHAVE, JSON.stringify(E)); certo = true; } catch (x) {} }
  FALHA_SALVAR = !certo;
  const f = document.getElementById("erro-salvar"); if (f) f.hidden = certo;
  return certo;
}

/* ---------- utilidades ---------- */
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const z2 = n => String(n).padStart(2, "0");
const iso = d => d.getFullYear() + "-" + z2(d.getMonth() + 1) + "-" + z2(d.getDate());
const hoje = () => iso(new Date());
const deIso = s => { const p = s.split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]); };
const entre = (a, b) => Math.round((deIso(b) - deIso(a)) / 864e5);
const mais = (s, n) => { const d = deIso(s); d.setDate(d.getDate() + n); return iso(d); };
const br = s => { const p = s.split("-"); return p[2] + "/" + p[1]; };
const brAno = s => { const p = s.split("-"); return p[2] + "/" + p[1] + "/" + p[0]; };
const num = v => { const n = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(n) ? n : null; };
const fmt = (n, d) => Number(n).toLocaleString("pt-BR", { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
const diaSemana = s => (deIso(s).getDay() + 6) % 7;
const inicioSemana = s => mais(s, -diaSemana(s));
const porData = (a, b) => (a.data < b.data ? -1 : a.data > b.data ? 1 : 0);
let tAviso;
/* Mensagem curta no rodapé. Se a última gravação falhou, não mostra nada: a faixa de erro não pode ser coberta por um "registrado". */
function aviso(t) { if (FALHA_SALVAR) return; const el = document.getElementById("aviso"); el.textContent = t; el.hidden = false; clearTimeout(tAviso); tAviso = setTimeout(() => { el.hidden = true; }, 2600); }

/* ---------- registro do dia ---------- */
function dia(d) { return Object.assign({ enjoo: false, comido: [], agua: 0, protExtra: 0, caminhada: 0 }, E.dias[d] || {}); }
function gravarDia(d, r) { E.dias[d] = r; salvar(); }

/* ---------- barras de progresso ---------- */
function barra(rotulo, valor, meta, un, casas, neutra) {
  const pct = meta ? 100 * valor / meta : 0;
  const cls = neutra ? "" : pct >= 100 ? "ok" : pct < 70 ? "falta" : "";
  return '<div class="nutri"><div class="linha"><span>' + esc(rotulo) + "</span><span>" + fmt(valor, casas) + " / " + fmt(meta, casas) + " " + un +
    " · " + fmt(pct) + '%</span></div><div class="barra ' + cls + '"><i style="width:' + Math.min(100, pct).toFixed(0) + '%"></i></div></div>';
}
function barrasMicro(t, m) {
  return NUTRI.map(n => barra(n[1], t[n[0]], m.micro[n[0]], n[2], m.micro[n[0]] < 20 ? 1 : 0)).join("");
}

/* ---------- compartilhar e copiar ---------- */
function novoId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function texto(id) { const el = document.getElementById(id); return el ? el.value : ""; }
/* A ponte do Android (MainActivity.java) devolve true quando passou o texto adiante e false quando recusou: texto acima de
   MAX_TEXTO (250 mil caracteres, o mesmo SEG_MAX_TEXTO de seguranca.js) ou erro do sistema. Antes o retorno era ignorado:
   copiar dizia "Copiado." e compartilhar não dizia nada, mesmo sem nada ter saído do app. */
function ponteAndroid(funcao, t) { try { return window.Android[funcao](t) === true; } catch (e) { return false; } }
function textoGrandeDemais(t) { return typeof t === "string" && t.length > SEG_MAX_TEXTO ? " O texto tem " + Math.round(t.length / 1000) + " mil caracteres e o limite do Android é " + SEG_MAX_TEXTO / 1000 + " mil." : ""; }
/* Devolve false só quando a ponte do Android recusou (ela já viu o aviso); nos outros caminhos, undefined. */
function compartilhar(t) {
  if (window.Android && window.Android.compartilhar) {
    if (ponteAndroid("compartilhar", t)) return true;
    alerta("Não foi possível compartilhar. Nada foi enviado." + textoGrandeDemais(t));
    return false;
  }
  if (navigator.share) { navigator.share({ text: t }).catch(() => {}); return; }
  copiar(t);
}
function copiar(t) {
  if (window.Android && window.Android.copiar) {
    if (ponteAndroid("copiar", t)) aviso("Copiado.");
    else alerta("Não foi possível copiar." + textoGrandeDemais(t) + " Se o texto estiver na tela, selecione e copie manualmente.");
    return;
  }
  if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(t).then(() => aviso("Copiado."), () => aviso("Selecione o texto e copie manualmente.")); return; }
  aviso("Selecione o texto e copie manualmente.");
}

/* Cada arquivo de tela acrescenta aqui as suas ações (clique em data-ac), formulários (data-form) e campos (data-mud). */
const AC = {}, FORM = {}, MUD = {};
/* Nutrientes que não vêm da comida (suplementos prescritos). Cada função recebe a data e devolve { campo: valor do dia }. */
const EXTRAS_NUTRI = [];
function somarExtras(data) { const t = {}; CAMPOS.forEach(c => { t[c] = 0; }); EXTRAS_NUTRI.forEach(f => { const x = f(data) || {}; Object.keys(x).forEach(c => { if (c in t) t[c] += x[c] || 0; }); }); return t; }

let E = carregar();
