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
                diabetes, insulinaSulf, pilula: null (não respondeu) | true | false,
                naoCome: [ids de RESTRICOES], naoGosta: [chaves de alimento] }
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
   ui         preferências de tela (aba aberta, local de treino) */
const VERSAO = 2;
function vazio() { return { v: VERSAO, perfil: null, doses: [], pesos: [], sintomas: [], treinos: [], dias: {}, trocas: {}, caneta: null, suplementos: [], exames: [], lembretes: {}, ui: {} }; }
const PERFIL_NOVO = { diabetes: null, insulinaSulf: null, pilula: null, naoCome: [], naoGosta: [] };
/* Recebe dados de qualquer versão (do aparelho ou de uma cópia de segurança) e devolve na versão atual, sem perder nada. Devolve null se não for um dado do app. */
function migrar(j) {
  if (!j || typeof j !== "object" || (j.v !== 1 && j.v !== 2)) return null;
  const e = Object.assign(vazio(), j);
  if (e.perfil) e.perfil = Object.assign({}, PERFIL_NOVO, e.perfil);
  Object.keys(e.dias).forEach(d => {
    const r = e.dias[d];
    // v1 guardava só "feita ou não" por refeição; vira "comi tudo"
    if (r.feitas) { if (!r.comido) r.comido = r.feitas.map(x => (x ? { q: 1 } : null)); delete r.feitas; }
  });
  e.v = VERSAO;
  return e;
}
function carregar() {
  try { const e = migrar(JSON.parse(localStorage.getItem(CHAVE))); if (e) return e; } catch (e) {}
  return vazio();
}
let E = carregar();
function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(E)); } catch (e) { aviso("Não foi possível salvar neste aparelho."); } }

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
function aviso(t) { const el = document.getElementById("aviso"); el.textContent = t; el.hidden = false; clearTimeout(tAviso); tAviso = setTimeout(() => { el.hidden = true; }, 2600); }

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
function compartilhar(t) {
  if (window.Android && window.Android.compartilhar) { window.Android.compartilhar(t); return; }
  if (navigator.share) { navigator.share({ text: t }).catch(() => {}); return; }
  copiar(t);
}
function copiar(t) {
  if (window.Android && window.Android.copiar) { window.Android.copiar(t); aviso("Copiado."); return; }
  if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(t).then(() => aviso("Copiado."), () => aviso("Selecione o texto e copie manualmente.")); return; }
  aviso("Selecione o texto e copie manualmente.");
}

/* Cada arquivo de tela acrescenta aqui as suas ações (clique em data-ac), formulários (data-form) e campos (data-mud). */
const AC = {}, FORM = {}, MUD = {};
