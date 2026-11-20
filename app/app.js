(function () {
"use strict";
const A = window.ALIMENTOS, C = window.CARDAPIO, T = window.TREINO, G = window.GUIA;
const CHAVE = "semana-a-semana.v1";
const NUTRI = [["ca","Cálcio","mg"],["fe","Ferro","mg"],["mg","Magnésio","mg"],["zn","Zinco","mg"],["k","Potássio","mg"],
  ["vita","Vitamina A","µg"],["b1","Vitamina B1","mg"],["b12","Vitamina B12","µg"],["folato","Folato","µg"],
  ["vitc","Vitamina C","mg"],["vitd","Vitamina D","µg"],["vite","Vitamina E","mg"],["vitk","Vitamina K","µg"]];
const CAMPOS = ["kcal","prot","gord","carb","fibra"].concat(NUTRI.map(n => n[0]));
const DOSES = [2.5, 5, 7.5, 10, 12.5, 15];
const LOCAIS = ["Abdômen esquerdo","Abdômen direito","Coxa esquerda","Coxa direita","Braço esquerdo","Braço direito"];
const SEMANA = ["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"];
const tela = document.getElementById("tela");

/* ---------- estado ---------- */
function vazio() { return { v: 1, perfil: null, doses: [], pesos: [], sintomas: [], treinos: [], dias: {}, ui: {} }; }
function carregar() {
  try { const j = JSON.parse(localStorage.getItem(CHAVE)); if (j && j.v === 1) return Object.assign(vazio(), j); } catch (e) {}
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

/* ---------- nutricao ---------- */
function gramas(g, f) { const v = g * f; return v < 20 ? Math.max(1, Math.round(v)) : Math.round(v / 5) * 5; }
function medida(k, g) {
  const a = A[k], r = Math.round((g / a.gMedida) * 2) / 2;
  if (r < 0.5) return "";
  const n = r === 0.5 ? "½" : Number.isInteger(r) ? String(r) : Math.floor(r) + "½";
  return n + " × " + a.medida;
}
function somar(itens, f) {
  const t = {}; CAMPOS.forEach(c => { t[c] = 0; });
  itens.forEach(it => { const a = A[it[0]], g = gramas(it[1], f); CAMPOS.forEach(c => { t[c] += a[c] * g / 100; }); });
  return t;
}
function somarDia(dia, f, quais) {
  let itens = [];
  dia.refeicoes.forEach((r, i) => { if (!quais || quais[i]) itens = itens.concat(r.itens); });
  return somar(itens, f);
}
function mediaSemana(f) {
  const m = {}; CAMPOS.forEach(c => { m[c] = 0; });
  C.dias.forEach(d => { const t = somarDia(d, f); CAMPOS.forEach(c => { m[c] += t[c] / 7; }); });
  return m;
}
const BASE = mediaSemana(1);
function fatorDe(kcal) { return Math.min(1.5, Math.max(0.85, Math.round(kcal / BASE.kcal / 0.05) * 0.05)); }

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
  const kcalCalc = Math.max(piso, Math.round((gasto - 500) / 50) * 50);
  const kcal = p.metaKcal || kcalCalc;
  const peso25 = 25 * alt * alt;
  const pesoRef = imc >= 30 ? peso25 + 0.25 * (peso - peso25) : peso;
  const protCalc = Math.round(1.4 * pesoRef);
  const prot = p.metaProt || protCalc;
  const gord = Math.round(kcal * 0.3 / 9);
  const carb = Math.max(0, Math.round((kcal - prot * 4 - gord * 9) / 4));
  return {
    peso, idade, imc, tmb, gasto, piso, kcalCalc, kcal, pesoRef, protCalc, prot,
    protMin: Math.round(1.2 * pesoRef), protMax: Math.round(1.6 * pesoRef), gord, carb,
    fibra: masc ? (idade > 50 ? 30 : 38) : (idade > 50 ? 21 : 25),
    agua: p.metaAgua || 2000, fator: fatorDe(kcal),
    micro: {
      ca: ((!masc && idade > 50) || idade > 70) ? 1200 : 1000, fe: (!masc && idade <= 50) ? 18 : 8,
      mg: masc ? (idade <= 30 ? 400 : 420) : (idade <= 30 ? 310 : 320), zn: masc ? 11 : 8, k: masc ? 3400 : 2600,
      vita: masc ? 900 : 700, b1: masc ? 1.2 : 1.1, b12: 2.4, folato: 400, vitc: masc ? 90 : 75,
      vitd: idade > 70 ? 20 : 15, vite: 15, vitk: masc ? 120 : 90,
    },
  };
}
function barra(rotulo, valor, meta, un, casas, neutra) {
  const pct = meta ? 100 * valor / meta : 0;
  const cls = neutra ? "" : pct >= 100 ? "ok" : pct < 70 ? "falta" : "";
  return '<div class="nutri"><div class="linha"><span>' + esc(rotulo) + "</span><span>" + fmt(valor, casas) + " / " + fmt(meta, casas) + " " + un +
    " · " + fmt(pct) + '%</span></div><div class="barra ' + cls + '"><i style="width:' + Math.min(100, pct).toFixed(0) + '%"></i></div></div>';
}
function barrasMicro(t, m) {
  return NUTRI.map(n => barra(n[1], t[n[0]], m.micro[n[0]], n[2], m.micro[n[0]] < 20 ? 1 : 0)).join("");
}

/* ---------- registro do dia ---------- */
function dia(d) { return Object.assign({ enjoo: false, feitas: [], agua: 0, protExtra: 0, caminhada: 0 }, E.dias[d] || {}); }
function gravarDia(d, r) { E.dias[d] = r; salvar(); }
function cardapioDe(d) { return dia(d).enjoo ? C.nausea : C.dias[diaSemana(d)]; }

/* ---------- tratamento ---------- */
function situacaoDose() {
  const ds = E.doses.slice().sort(porData);
  if (!ds.length) return null;
  const ult = ds[ds.length - 1], h = hoje();
  let naDose = 0;
  for (let i = ds.length - 1; i >= 0 && ds[i].mg === ult.mg; i--) naDose++;
  const prox = mais(ult.data, 7), falta = entre(h, prox);
  const usados = ds.slice(-3).map(d => d.local);
  const sugerido = LOCAIS.find(l => usados.indexOf(l) < 0) || LOCAIS[(LOCAIS.indexOf(ult.local) + 1) % LOCAIS.length];
  return { ult, naDose, total: ds.length, semana: Math.floor(entre(ds[0].data, h) / 7) + 1, prox, falta, sugerido };
}
function treinosDaSemana() { const i = inicioSemana(hoje()); return E.treinos.filter(t => t.data >= i && t.data <= mais(i, 6)); }
function proximoTreino() { const t = E.treinos.slice().sort(porData); return t.length && t[t.length - 1].tipo === "A" ? "B" : "A"; }
function faseTreino() {
  const t = E.treinos.slice().sort(porData);
  const sem = t.length ? Math.floor(entre(t[0].data, hoje()) / 7) + 1 : 1;
  return { sem, fase: T.fases[sem <= 2 ? 0 : sem <= 6 ? 1 : 2] };
}

/* ---------- telas ---------- */
function telaHoje() {
  const h = hoje(), m = metas(), r = dia(h), card = cardapioDe(h), s = situacaoDose();
  const feito = somarDia(card, m.fator, card.refeicoes.map((x, i) => !!r.feitas[i]));
  const prot = feito.prot + r.protExtra;
  let out = "";

  if (!s) {
    out += '<div class="cartao destaque"><h2>Tratamento</h2><p class="sub">Quando ela fizer a primeira aplicação, registre aqui. O app passa a contar as semanas e avisar a data da próxima.</p><div class="botoes"><button data-ac="ir" data-para="diario" data-sub="doses">Registrar aplicação</button></div></div>';
  } else {
    let quando;
    if (s.falta > 0) quando = "em " + s.falta + (s.falta === 1 ? " dia" : " dias") + " (" + SEMANA[diaSemana(s.prox)] + ", " + br(s.prox) + ")";
    else if (s.falta === 0) quando = "hoje";
    else if (s.falta >= -4) quando = "atrasada " + (-s.falta) + (s.falta === -1 ? " dia" : " dias") + ". Dentro de 4 dias ainda dá para aplicar.";
    else quando = "atrasada " + (-s.falta) + " dias. Passou de 4 dias: a orientação da bula é pular essa dose e aplicar a próxima no dia habitual (" + br(mais(s.prox, 7 * Math.ceil(-s.falta / 7))) + ").";
    out += '<div class="cartao destaque"><div class="linha"><div><div class="sub">Semana ' + s.semana + " do tratamento</div><div class=\"grande\">" + fmt(s.ult.mg, 1) + ' mg</div></div><div style="text-align:right"><div class="sub">Nesta dose</div><div><strong>' + s.naDose + (s.naDose === 1 ? " aplicação" : " aplicações") + "</strong></div></div></div>" +
      '<p style="margin:10px 0 0"><strong>Próxima aplicação:</strong> ' + quando + '</p><p class="sub" style="margin:4px 0 0">Local sugerido: ' + esc(s.sugerido) + "." +
      (s.naDose >= 4 && s.ult.mg < 15 ? " Já são 4 semanas nesta dose: subir ou manter é assunto para a consulta." : "") + "</p>" +
      (s.falta <= 0 ? '<div class="botoes"><button data-ac="ir" data-para="diario" data-sub="doses">Registrar aplicação</button></div>' : "") + "</div>";
  }

  out += '<div class="cartao"><div class="duas"><div><div class="sub">Proteína hoje</div><div class="grande">' + fmt(prot) + ' g</div><div class="sub">meta ' + m.prot + ' g</div><div class="barra ' + (prot >= m.prot ? "ok" : "") + '"><i style="width:' + Math.min(100, 100 * prot / m.prot).toFixed(0) + '%"></i></div></div>' +
    '<div><div class="sub">Água hoje</div><div class="grande">' + fmt(r.agua / 1000, 1) + ' L</div><div class="sub">meta ' + fmt(m.agua / 1000, 1) + ' L</div><div class="barra ' + (r.agua >= m.agua ? "ok" : "") + '"><i style="width:' + Math.min(100, 100 * r.agua / m.agua).toFixed(0) + '%"></i></div></div></div>' +
    '<div class="botoes"><button class="mini" data-ac="agua" data-ml="200">+ 1 copo (200 ml)</button><button class="mini" data-ac="agua" data-ml="500">+ 500 ml</button><button class="mini sec" data-ac="agua" data-ml="-200">− 200 ml</button></div>' +
    '<div class="botoes"><button class="mini sec" data-ac="prot" data-g="10">+ 10 g de proteína fora do plano</button>' + (r.protExtra > 0 ? '<button class="mini sec" data-ac="prot" data-g="-10">− 10 g</button>' : "") + "</div>" +
    '<p class="sub" style="margin:8px 0 0">A proteína soma sozinha quando uma refeição é marcada. Energia das refeições marcadas: ' + fmt(feito.kcal) + " de " + m.kcal + " kcal.</p></div>";

  out += '<div class="cartao"><div class="linha"><h2 style="margin:0">Refeições de ' + (r.enjoo ? "hoje (dia de enjoo)" : esc(C.dias[diaSemana(h)].nome.toLowerCase())) + '</h2><button class="mini sec" data-ac="enjoo">' + (r.enjoo ? "Voltar ao normal" : "Dia de enjoo") + "</button></div>";
  card.refeicoes.forEach((ref, i) => {
    const p = somar(ref.itens, m.fator);
    out += '<label class="refeicao' + (r.feitas[i] ? " feita" : "") + '" style="margin:0;color:inherit;font-size:inherit"><input type="checkbox" data-mud="refeicao" data-i="' + i + '"' + (r.feitas[i] ? " checked" : "") + '><div class="txt"><div class="tipo">' + esc(ref.tipo) + '</div><div class="tit">' + esc(ref.titulo) + '</div><div class="sub">' + fmt(p.prot) + " g de proteína · " + fmt(p.kcal) + " kcal</div></div></label>";
  });
  out += '<div class="botoes"><button class="mini sec" data-ac="ir" data-para="plano">Ver porções e nutrientes</button></div></div>';

  const ts = treinosDaSemana(), fezHoje = E.treinos.some(t => t.data === h), px = proximoTreino();
  out += '<div class="cartao"><h2>Movimento</h2><div class="duas"><div><div class="sub">Treinos de força na semana</div><div class="grande">' + ts.length + ' / 3</div></div><div><div class="sub">Caminhada hoje</div><div class="grande">' + r.caminhada + " min</div></div></div>" +
    '<div class="botoes">' + (fezHoje ? '<button class="mini sec" disabled>Treino de hoje registrado</button>' : '<button class="mini" data-ac="treino" data-tipo="' + px + '">Concluí o treino ' + px + "</button>") +
    '<button class="mini sec" data-ac="caminhada" data-min="10">+ 10 min de caminhada</button>' + (r.caminhada ? '<button class="mini sec" data-ac="caminhada" data-min="-10">− 10</button>' : "") + "</div></div>";

  out += '<div class="cartao"><h2>Registrar</h2><div class="botoes" style="margin-top:0"><button class="sec" data-ac="ir" data-para="diario" data-sub="peso">Peso</button><button class="sec" data-ac="ir" data-para="diario" data-sub="sintomas">Sintomas</button><button class="sec" data-ac="ir" data-para="diario" data-sub="doses">Aplicação</button></div></div>';
  return out;
}

function telaPlano() {
  const m = metas(), h = hoje();
  let sel = E.ui.diaPlano; if (sel == null) sel = diaSemana(h);
  const d = sel === 7 ? C.nausea : C.dias[sel], t = somarDia(d, m.fator), med = mediaSemana(m.fator);
  let out = '<div class="cartao"><h2>Metas diárias</h2><div class="tres"><div><div class="sub">Energia</div><strong>' + m.kcal + ' kcal</strong></div><div><div class="sub">Proteína</div><strong>' + m.prot + ' g</strong></div><div><div class="sub">Água</div><strong>' + fmt(m.agua / 1000, 1) + ' L</strong></div><div><div class="sub">Carboidrato</div><strong>' + m.carb + ' g</strong></div><div><div class="sub">Gordura</div><strong>' + m.gord + ' g</strong></div><div><div class="sub">Fibra</div><strong>' + m.fibra + " g</strong></div></div>" +
    '<p class="sub" style="margin:10px 0 0">Faixa de proteína: ' + m.protMin + " a " + m.protMax + " g. Porções do cardápio multiplicadas por " + fmt(m.fator, 2) + " para chegar perto da sua energia. As metas mudam na aba Perfil.</p></div>";

  out += '<div class="chips">' + SEMANA.map((n, i) => '<button data-ac="diaPlano" data-i="' + i + '" class="' + (sel === i ? "ativa" : "") + '">' + n + (i === diaSemana(h) ? " ·" : "") + "</button>").join("") + '<button data-ac="diaPlano" data-i="7" class="' + (sel === 7 ? "ativa" : "") + '">Enjoo</button></div>';

  out += '<div class="cartao"><h2>' + esc(d.nome) + "</h2>";
  d.refeicoes.forEach(ref => {
    const p = somar(ref.itens, m.fator);
    out += '<div class="refeicao"><div class="txt"><div class="tipo">' + esc(ref.tipo) + " · " + fmt(p.prot) + " g prot · " + fmt(p.kcal) + ' kcal</div><div class="tit">' + esc(ref.titulo) + "</div><ul>" +
      ref.itens.map(it => { const g = gramas(it[1], m.fator), md = medida(it[0], g); return "<li>" + esc(A[it[0]].nome) + ": <strong>" + g + " g</strong>" + (md ? ' <span class="sub">(' + esc(md) + ")</span>" : "") + "</li>"; }).join("") +
      "</ul>" + (ref.preparo ? '<div class="prep">' + esc(ref.preparo) + "</div>" : "") + "</div></div>";
  });
  out += "</div>";

  out += '<div class="cartao"><h2>Macronutrientes do dia</h2>' + barra("Energia", t.kcal, m.kcal, "kcal") + barra("Proteína", t.prot, m.prot, "g") + barra("Carboidrato", t.carb, m.carb, "g", 0, true) + barra("Gordura", t.gord, m.gord, "g", 0, true) + barra("Fibra", t.fibra, m.fibra, "g") +
    '<p class="sub" style="margin:10px 0 0">Energia e proteína são as metas que contam. Carboidrato e gordura são só uma divisão de referência do que sobra; o cardápio usa um pouco mais de gordura (ovo, peixe, azeite, castanhas) e menos carboidrato.</p>' +
    (sel === 7 ? '<p class="sub" style="margin:10px 0 0">O dia de enjoo é leve de propósito e fica abaixo das metas. Serve para um ou dois dias, não como rotina.</p>' : "") + "</div>";
  out += '<div class="cartao"><h2>Vitaminas e minerais do dia</h2>' + barrasMicro(t, m) + "</div>";

  const baixos = NUTRI.filter(n => med[n[0]] < 0.8 * m.micro[n[0]]).map(n => n[1].toLowerCase());
  out += '<div class="cartao"><h2>Média da semana</h2><p class="sub" style="margin:0">Vitaminas e minerais variam de um dia para o outro; o que conta é a média.</p>' + barra("Proteína", med.prot, m.prot, "g") + barrasMicro(med, m) +
    (baixos.length ? '<p style="margin:12px 0 0"><strong>Abaixo de 80% da meta só com comida:</strong> ' + esc(baixos.join(", ")) + '.</p><p class="sub" style="margin:4px 0 0">Com esta quantidade de calorias isso é esperado para alguns nutrientes. É o ponto para levar ao médico ou nutricionista, que decide sobre exame e suplemento.</p>' : "") + "</div>";

  out += '<div class="cartao"><h2>Trocas</h2><p class="sub" style="margin:0">Quantidades equivalentes para trocar um alimento por outro do mesmo grupo.</p>' +
    trocas("Proteínas (cada linha dá cerca de 25 g de proteína)", ["proteina"], "prot", 25) +
    trocas("Laticínios (cerca de 250 mg de cálcio)", ["laticinio"], "ca", 250) +
    trocas("Arroz, pães, raízes e feijões (cerca de 100 kcal)", ["carboidrato", "leguminosa"], "kcal", 100) +
    trocas("Frutas (cerca de 60 kcal)", ["fruta"], "kcal", 60) + "</div>";

  out += '<div class="cartao"><h2>Onde está cada nutriente</h2><p class="sub" style="margin:0">Os cinco alimentos da lista que mais entregam, por porção usada no cardápio.</p>' +
    NUTRI.map(n => "<details><summary>" + n[1] + ' <span class="sub">meta ' + fmt(m.micro[n[0]], m.micro[n[0]] < 20 ? 1 : 0) + " " + n[2] + "</span></summary><table>" +
      fontes(n[0]).map(f => "<tr><td>" + esc(A[f.k].nome) + ' <span class="sub">' + f.g + ' g</span></td><td class="num">' + fmt(f.v, f.v < 20 ? 1 : 0) + " " + n[2] + "</td></tr>").join("") + "</table></details>").join("") +
    '<p class="sub" style="margin:10px 0 0">Valores da TACO (Unicamp); B12, D, E, K e folato do USDA. São médias: marca, preparo e safra mudam o número real.</p></div>';
  return out;
}
function trocas(titulo, grupos, campo, alvo) {
  const linhas = Object.keys(A).filter(k => grupos.indexOf(A[k].grupo) >= 0 && A[k][campo] > 0).map(k => {
    const g = gramas(100 * alvo / A[k][campo], 1);
    return { k, g };
  }).filter(l => l.g <= 400);
  return "<details><summary>" + esc(titulo) + "</summary><table>" + linhas.map(l => { const md = medida(l.k, l.g); return "<tr><td>" + esc(A[l.k].nome) + (md ? ' <span class="sub">' + esc(md) + "</span>" : "") + '</td><td class="num">' + l.g + " g</td></tr>"; }).join("") + "</table></details>";
}
let PORCOES;
function fontes(campo) {
  if (!PORCOES) {
    PORCOES = {};
    C.dias.concat([C.nausea]).forEach(d => d.refeicoes.forEach(r => r.itens.forEach(it => { PORCOES[it[0]] = Math.max(PORCOES[it[0]] || 0, it[1]); })));
  }
  return Object.keys(A).filter(k => k !== "whey").map(k => { const g = PORCOES[k] || A[k].gMedida; return { k, g, v: A[k][campo] * g / 100 }; })
    .sort((a, b) => b.v - a.v).slice(0, 5);
}

function telaTreino() {
  const local = E.ui.local || "casa", f = faseTreino(), px = proximoTreino(), h = hoje(), fezHoje = E.treinos.some(t => t.data === h);
  let out = '<div class="chips"><button data-ac="local" data-v="casa" class="' + (local === "casa" ? "ativa" : "") + '">Em casa</button><button data-ac="local" data-v="academia" class="' + (local === "academia" ? "ativa" : "") + '">Na academia</button></div>';
  out += '<div class="cartao destaque"><div class="sub">Semana ' + f.sem + " de treino · " + esc(f.fase.semanas) + '</div><p style="margin:6px 0 0">' + esc(f.fase.texto) + '</p><p class="sub" style="margin:8px 0 0">Nesta semana: ' + treinosDaSemana().length + " de 3 treinos. Próximo: treino " + px + ".</p></div>";
  ["A", "B"].forEach(tipo => {
    out += '<div class="cartao"><div class="linha"><h2 style="margin:0">Treino ' + tipo + "</h2>" + (fezHoje ? "" : '<button class="mini' + (tipo === px ? "" : " sec") + '" data-ac="treino" data-tipo="' + tipo + '">Concluí hoje</button>') + "</div>" +
      T[local][tipo].map(ex => "<details><summary>" + esc(ex.nome) + ' <span class="sub">' + f.fase.series + " × " + esc(ex.reps) + '</span></summary><p class="como">' + esc(ex.como) + "</p></details>").join("") + "</div>";
  });
  out += '<div class="cartao"><h2>Como funciona</h2><ul class="lista">' + T.regras.map(r => "<li>" + esc(r) + "</li>").join("") + "</ul>" +
    '<h3>Progressão em 12 semanas</h3><ul class="lista">' + T.fases.map(x => "<li><strong>" + esc(x.semanas) + ":</strong> " + esc(x.texto) + "</li>").join("") + "</ul>" +
    '<p class="sub">Quem tem problema no coração, nas articulações ou na coluna combina o treino com o médico antes de começar.</p></div>';
  const hist = E.treinos.slice().sort(porData).reverse().slice(0, 12);
  out += '<div class="cartao"><h2>Treinos registrados</h2>' + (hist.length ? "<table>" + hist.map(t => "<tr><td>" + brAno(t.data) + "</td><td>Treino " + esc(t.tipo) + " · " + (t.local === "academia" ? "academia" : "casa") + '</td><td class="num"><button class="x" data-ac="apagar" data-lista="treinos" data-id="' + t.id + '">apagar</button></td></tr>').join("") + "</table>" : '<p class="sub" style="margin:0">Nenhum treino registrado ainda.</p>') + "</div>";
  return out;
}

function telaDiario() {
  const sub = E.ui.diario || "doses", h = hoje();
  const abas = [["doses", "Aplicações"], ["peso", "Peso"], ["sintomas", "Sintomas"], ["relatorio", "Relatório"]];
  let out = '<div class="chips">' + abas.map(a => '<button data-ac="diario" data-v="' + a[0] + '" class="' + (sub === a[0] ? "ativa" : "") + '">' + a[1] + "</button>").join("") + "</div>";

  if (sub === "doses") {
    const s = situacaoDose(), mgPadrao = s ? s.ult.mg : 2.5, localPadrao = s ? s.sugerido : LOCAIS[0];
    out += '<form class="cartao" data-form="dose"><h2>Registrar aplicação</h2><label>Data<input type="date" name="data" value="' + h + '" max="' + h + '" required></label>' +
      "<label>Dose<select name=\"mg\">" + DOSES.map(d => '<option value="' + d + '"' + (d === mgPadrao ? " selected" : "") + ">" + fmt(d, 1) + " mg</option>").join("") + "</select></label>" +
      '<label>Local<select name="local">' + LOCAIS.map(l => "<option" + (l === localPadrao ? " selected" : "") + ">" + l + "</option>").join("") + "</select></label>" +
      '<label>Observação (opcional)<input name="obs" maxlength="120"></label><div class="botoes"><button>Salvar aplicação</button></div></form>';
    const ds = E.doses.slice().sort(porData).reverse();
    out += '<div class="cartao"><h2>Histórico</h2>' + (ds.length ? "<table><tr><th>Data</th><th>Dose</th><th>Local</th><th></th></tr>" + ds.map(d => "<tr><td>" + brAno(d.data) + "</td><td>" + fmt(d.mg, 1) + " mg</td><td>" + esc(d.local) + (d.obs ? '<div class="sub">' + esc(d.obs) + "</div>" : "") + '</td><td class="num"><button class="x" data-ac="apagar" data-lista="doses" data-id="' + d.id + '">apagar</button></td></tr>').join("") + "</table>" : '<p class="sub" style="margin:0">Nenhuma aplicação registrada.</p>') + "</div>";
  }

  if (sub === "peso") {
    out += '<form class="cartao" data-form="peso"><h2>Registrar peso</h2><p class="sub" style="margin:0">Uma vez por semana, no mesmo dia e horário, é suficiente.</p><label>Data<input type="date" name="data" value="' + h + '" max="' + h + '" required></label>' +
      '<div class="duas"><label>Peso (kg)<input name="kg" inputmode="decimal" required></label><label>Cintura (cm, opcional)<input name="cintura" inputmode="decimal"></label></div><div class="botoes"><button>Salvar peso</button></div></form>';
    const ps = E.pesos.slice().sort(porData);
    if (ps.length) {
      const ini = E.perfil.peso, at = ps[ps.length - 1].kg, dif = at - ini;
      out += '<div class="cartao"><div class="tres"><div><div class="sub">Inicial</div><strong>' + fmt(ini, 1) + ' kg</strong></div><div><div class="sub">Atual</div><strong>' + fmt(at, 1) + ' kg</strong></div><div><div class="sub">Variação</div><strong>' + (dif > 0 ? "+" : "") + fmt(dif, 1) + " kg (" + fmt(100 * dif / ini, 1) + "%)</strong></div></div>" + grafico([{ data: null, kg: ini }].concat(ps)) + "</div>";
      out += '<div class="cartao"><h2>Histórico</h2><table><tr><th>Data</th><th>Peso</th><th>Cintura</th><th></th></tr>' + ps.slice().reverse().map(p => "<tr><td>" + brAno(p.data) + "</td><td>" + fmt(p.kg, 1) + " kg</td><td>" + (p.cintura ? fmt(p.cintura, 1) + " cm" : "") + '</td><td class="num"><button class="x" data-ac="apagar" data-lista="pesos" data-id="' + p.id + '">apagar</button></td></tr>').join("") + "</table></div>";
    }
  }

  if (sub === "sintomas") {
    out += '<form class="cartao" data-form="sintoma"><h2>Como ela está</h2><label>Data<input type="date" name="data" value="' + h + '" max="' + h + '" required></label>' +
      '<div class="duas"><label>Enjoo<select name="enjoo"><option value="0">Nenhum</option><option value="1">Leve</option><option value="2">Moderado</option><option value="3">Forte</option></select></label>' +
      '<label>Intestino<select name="intestino"><option>Normal</option><option>Preso</option><option>Solto</option></select></label></div>' +
      '<div class="marcas"><label><input type="checkbox" name="vomito">Vômito</label><label><input type="checkbox" name="refluxo">Refluxo</label><label><input type="checkbox" name="tontura">Tontura</label><label><input type="checkbox" name="cansaco">Cansaço</label><label><input type="checkbox" name="dor">Dor forte na barriga</label></div>' +
      '<label>Anotação (opcional)<input name="nota" maxlength="200"></label><div class="botoes"><button>Salvar</button></div></form>';
    const ss = E.sintomas.slice().sort(porData).reverse();
    out += '<div class="cartao"><h2>Histórico</h2>' + (ss.length ? "<table>" + ss.map(s => "<tr><td>" + brAno(s.data) + "</td><td>" + esc(resumoSintoma(s)) + (s.nota ? '<div class="sub">' + esc(s.nota) + "</div>" : "") + '</td><td class="num"><button class="x" data-ac="apagar" data-lista="sintomas" data-id="' + s.id + '">apagar</button></td></tr>').join("") + "</table>" : '<p class="sub" style="margin:0">Nada registrado.</p>') + "</div>";
  }

  if (sub === "relatorio") {
    out += '<div class="cartao"><h2>Relatório para a consulta</h2><p class="sub" style="margin:0">Resumo dos últimos 30 dias, em texto, para mandar por WhatsApp ou mostrar ao médico.</p><textarea id="rel" readonly style="min-height:260px;font-size:13px">' + esc(relatorio()) + '</textarea><div class="botoes"><button data-ac="compartilhar" data-de="rel">Compartilhar</button><button class="sec" data-ac="copiar" data-de="rel">Copiar</button></div></div>';
    out += '<div class="cartao"><h2>Cópia de segurança</h2><p class="sub" style="margin:0">Os registros ficam só neste celular. Se o app for desinstalado, eles se perdem. Exporte de vez em quando e guarde o texto (por exemplo, mandando para você mesma).</p><div class="botoes"><button class="sec" data-ac="exportar">Exportar tudo</button></div>' +
      '<label>Restaurar: cole aqui o texto exportado<textarea id="imp"></textarea></label><div class="botoes"><button class="sec" data-ac="importar">Restaurar</button><button class="perigo" data-ac="zerar">Apagar todos os dados</button></div></div>';
  }
  return out;
}
function resumoSintoma(s) {
  const p = [];
  p.push("Enjoo " + ["nenhum", "leve", "moderado", "forte"][s.enjoo || 0]);
  p.push("intestino " + String(s.intestino || "Normal").toLowerCase());
  [["vomito", "vômito"], ["refluxo", "refluxo"], ["tontura", "tontura"], ["cansaco", "cansaço"], ["dor", "dor forte na barriga"]].forEach(x => { if (s[x[0]]) p.push(x[1]); });
  return p.join(", ");
}
function grafico(ps) {
  const W = 320, H = 150, e = 28, kgs = ps.map(p => p.kg), mn = Math.min.apply(null, kgs), mx = Math.max.apply(null, kgs), amp = (mx - mn) || 1;
  const x = i => e + (ps.length === 1 ? 0 : i * (W - 2 * e) / (ps.length - 1)), y = k => 18 + (mx - k) * (H - 46) / amp;
  return '<svg class="graf" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Gráfico de peso"><line x1="' + e + '" y1="' + (H - 22) + '" x2="' + (W - e) + '" y2="' + (H - 22) + '"/><polyline points="' + ps.map((p, i) => x(i).toFixed(1) + "," + y(p.kg).toFixed(1)).join(" ") + '"/>' +
    ps.map((p, i) => '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(p.kg).toFixed(1) + '" r="3"/>').join("") +
    '<text x="' + x(0) + '" y="' + (y(ps[0].kg) - 7) + '" text-anchor="middle">' + fmt(ps[0].kg, 1) + '</text><text x="' + x(ps.length - 1) + '" y="' + (y(ps[ps.length - 1].kg) - 7) + '" text-anchor="middle">' + fmt(ps[ps.length - 1].kg, 1) + "</text>" +
    '<text x="' + e + '" y="' + (H - 6) + '" text-anchor="middle">início</text><text x="' + (W - e) + '" y="' + (H - 6) + '" text-anchor="middle">' + (ps[ps.length - 1].data ? br(ps[ps.length - 1].data) : "") + "</text></svg>";
}
function relatorio() {
  const p = E.perfil, m = metas(), h = hoje(), de = mais(h, -29), L = [];
  L.push("RELATÓRIO DE ACOMPANHAMENTO" + (p.nome ? " - " + p.nome : ""));
  L.push("Período: " + brAno(de) + " a " + brAno(h));
  L.push("");
  const s = situacaoDose();
  L.push("TRATAMENTO");
  if (s) {
    L.push("Semana " + s.semana + ", " + s.total + " aplicações no total. Dose atual: " + fmt(s.ult.mg, 1) + " mg (" + s.naDose + " aplicações nesta dose).");
    E.doses.slice().sort(porData).filter(d => d.data >= de).forEach(d => L.push("  " + brAno(d.data) + ": " + fmt(d.mg, 1) + " mg, " + d.local + (d.obs ? " (" + d.obs + ")" : "")));
  } else L.push("Nenhuma aplicação registrada.");
  L.push("");
  L.push("PESO");
  const ps = E.pesos.slice().sort(porData);
  if (ps.length) {
    const at = ps[ps.length - 1], dif = at.kg - p.peso;
    L.push("Inicial: " + fmt(p.peso, 1) + " kg. Atual: " + fmt(at.kg, 1) + " kg em " + brAno(at.data) + " (" + (dif > 0 ? "+" : "") + fmt(dif, 1) + " kg, " + fmt(100 * dif / p.peso, 1) + "%). IMC atual: " + fmt(m.imc, 1) + ".");
    const noP = ps.filter(x => x.data >= de);
    if (noP.length > 1) L.push("No período: " + fmt(noP[0].kg, 1) + " kg -> " + fmt(noP[noP.length - 1].kg, 1) + " kg.");
    const c = ps.filter(x => x.cintura);
    if (c.length) L.push("Cintura: " + fmt(c[0].cintura, 1) + " cm -> " + fmt(c[c.length - 1].cintura, 1) + " cm.");
  } else L.push("Inicial: " + fmt(p.peso, 1) + " kg. Sem pesagens registradas.");
  L.push("");
  L.push("SINTOMAS (no período)");
  const ss = E.sintomas.filter(x => x.data >= de).sort(porData);
  if (ss.length) {
    const c = k => ss.filter(x => x[k]).length;
    L.push(ss.length + (ss.length === 1 ? " registro" : " registros") + ". Enjoo moderado ou forte: " + ss.filter(x => x.enjoo >= 2).length + ". Vômito: " + c("vomito") + ". Intestino preso: " + ss.filter(x => x.intestino === "Preso").length + ". Intestino solto: " + ss.filter(x => x.intestino === "Solto").length + ". Refluxo: " + c("refluxo") + ". Tontura: " + c("tontura") + ". Cansaço: " + c("cansaco") + ". Dor forte na barriga: " + c("dor") + ".");
    ss.filter(x => x.nota).forEach(x => L.push("  " + brAno(x.data) + ": " + x.nota));
  } else L.push("Nenhum registro.");
  L.push("");
  L.push("ALIMENTAÇÃO E ÁGUA (dias com registro no período)");
  const ds = Object.keys(E.dias).filter(d => d >= de && d <= h).sort();
  let n = 0, sp = 0, sk = 0, sa = 0, enj = 0, cam = 0;
  ds.forEach(d => {
    const r = dia(d), card = cardapioDe(d), marc = card.refeicoes.map((x, i) => !!r.feitas[i]);
    cam += r.caminhada || 0;
    if (!marc.some(Boolean) && !r.agua && !r.protExtra) return;
    const t = somarDia(card, m.fator, marc);
    n++; sp += t.prot + r.protExtra; sk += t.kcal; sa += r.agua; if (r.enjoo) enj++;
  });
  if (n) L.push(n + (n === 1 ? " dia" : " dias") + ". Média de proteína: " + fmt(sp / n) + " g (meta " + m.prot + " g). Energia das refeições marcadas: " + fmt(sk / n) + " kcal (referência " + m.kcal + " kcal). Água: " + fmt(sa / n / 1000, 1) + " L (meta " + fmt(m.agua / 1000, 1) + " L). Dias de enjoo: " + enj + ".");
  else L.push("Nenhum dia registrado.");
  const med = mediaSemana(m.fator), baixos = NUTRI.filter(x => med[x[0]] < 0.8 * m.micro[x[0]]).map(x => x[1] + " " + fmt(100 * med[x[0]] / m.micro[x[0]]) + "%");
  if (baixos.length) L.push("Cardápio planejado abaixo de 80% da meta (só com comida): " + baixos.join(", ") + ".");
  L.push("");
  L.push("EXERCÍCIO (no período)");
  L.push("Treinos de força: " + E.treinos.filter(t => t.data >= de).length + ". Caminhada: " + cam + " minutos.");
  return L.join("\n");
}

function telaGuia() {
  return G.map(a => '<div class="cartao' + (a.alerta ? " alerta" : "") + '"><details' + (a.alerta ? " open" : "") + '><summary>' + esc(a.titulo) + "</summary>" + a.corpo.map(p => "<p>" + esc(p) + "</p>").join("") + "</details></div>").join("");
}

function telaPerfil() {
  const p = E.perfil || {}, m = metas();
  const v = k => (p[k] == null ? "" : esc(p[k]));
  const at = [[1.2, "Sedentária (trabalho sentada, sem exercício)"], [1.375, "Leve (caminhadas, 1 a 3 treinos por semana)"], [1.55, "Moderada (3 a 5 treinos por semana)"]];
  let out = "";
  if (!E.perfil) out += '<div class="cartao destaque"><h2>Bem-vinda</h2><p style="margin:0">Preencha os dados abaixo para o app calcular as metas de proteína, energia, água, vitaminas e minerais. Tudo fica guardado só neste celular.</p></div>';
  out += '<form class="cartao" data-form="perfil"><h2>Dados</h2><label>Nome (opcional)<input name="nome" value="' + v("nome") + '" maxlength="40"></label>' +
    '<div class="duas"><label>Sexo<select name="sexo"><option value="F"' + (p.sexo !== "M" ? " selected" : "") + '>Feminino</option><option value="M"' + (p.sexo === "M" ? " selected" : "") + ">Masculino</option></select></label>" +
    '<label>Ano de nascimento<input name="nascimento" inputmode="numeric" value="' + v("nascimento") + '" required></label></div>' +
    '<div class="duas"><label>Altura (cm)<input name="altura" inputmode="decimal" value="' + v("altura") + '" required></label><label>Peso inicial (kg)<input name="peso" inputmode="decimal" value="' + v("peso") + '" required></label></div>' +
    '<label>Atividade física hoje<select name="atividade">' + at.map(a => '<option value="' + a[0] + '"' + ((p.atividade || 1.2) === a[0] ? " selected" : "") + ">" + a[1] + "</option>").join("") + "</select></label>" +
    '<h3>Metas passadas pelo médico ou nutricionista (opcional)</h3><p class="sub" style="margin:0">Se preencher, elas substituem o cálculo do app.</p>' +
    '<div class="tres"><label>Energia (kcal)<input name="metaKcal" inputmode="numeric" value="' + v("metaKcal") + '"></label><label>Proteína (g)<input name="metaProt" inputmode="numeric" value="' + v("metaProt") + '"></label><label>Água (ml)<input name="metaAgua" inputmode="numeric" value="' + v("metaAgua") + '"></label></div>' +
    '<div class="botoes"><button>Salvar</button></div></form>';
  if (m) {
    out += '<div class="cartao"><h2>Como as metas são calculadas</h2><ul class="lista">' +
      "<li>Peso atual " + fmt(m.peso, 1) + " kg, IMC " + fmt(m.imc, 1) + ", " + m.idade + " anos.</li>" +
      "<li>Gasto em repouso (fórmula de Mifflin-St Jeor): " + fmt(m.tmb) + " kcal. Gasto diário estimado: " + fmt(m.gasto) + " kcal.</li>" +
      "<li>Energia: gasto diário menos 500 kcal, nunca abaixo de " + m.piso + " kcal. Cálculo do app: " + m.kcalCalc + " kcal." + (E.perfil.metaKcal ? " Em uso: " + m.kcal + " kcal (informada)." : "") + "</li>" +
      "<li>Proteína: 1,2 a 1,6 g por kg" + (m.imc >= 30 ? " de peso ajustado (" + fmt(m.pesoRef, 1) + " kg, porque com IMC a partir de 30 o peso real superestima a necessidade)" : "") + ", ou " + m.protMin + " a " + m.protMax + " g. Cálculo do app: " + m.protCalc + " g." + (E.perfil.metaProt ? " Em uso: " + m.prot + " g (informada)." : "") + "</li>" +
      "<li>Gordura: 30% da energia. Carboidrato: o restante.</li><li>Fibra, vitaminas e minerais: valores de referência (DRIs) para o sexo e a idade.</li></ul>" +
      '<p class="sub">As metas se atualizam sozinhas a cada peso registrado. São estimativas de população; o médico ou o nutricionista podem definir outras.</p></div>';
  }
  return out;
}

/* ---------- acoes ---------- */
const TELAS = { hoje: telaHoje, plano: telaPlano, treino: telaTreino, diario: telaDiario, guia: telaGuia, perfil: telaPerfil };
function atual() { let h = (location.hash || "#hoje").slice(1); if (!E.perfil) h = "perfil"; return TELAS[h] ? h : "hoje"; }
function render(topo) {
  const h = atual();
  tela.innerHTML = TELAS[h]();
  document.querySelectorAll("#abas a").forEach(a => a.classList.toggle("ativa", a.dataset.aba === h));
  document.getElementById("abas").hidden = !E.perfil;
  if (topo) window.scrollTo(0, 0);
}
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

const AC = {
  ir(d) { if (d.sub) E.ui.diario = d.sub; if (location.hash === "#" + d.para) render(true); else location.hash = d.para; },
  agua(d) { const h = hoje(), r = dia(h); r.agua = Math.max(0, r.agua + Number(d.ml)); gravarDia(h, r); render(); },
  prot(d) { const h = hoje(), r = dia(h); r.protExtra = Math.max(0, r.protExtra + Number(d.g)); gravarDia(h, r); render(); },
  caminhada(d) { const h = hoje(), r = dia(h); r.caminhada = Math.max(0, r.caminhada + Number(d.min)); gravarDia(h, r); render(); },
  enjoo() { const h = hoje(), r = dia(h); r.enjoo = !r.enjoo; r.feitas = []; gravarDia(h, r); render(); },
  treino(d) { E.treinos.push({ id: novoId(), data: hoje(), tipo: d.tipo, local: E.ui.local || "casa" }); salvar(); aviso("Treino " + d.tipo + " registrado."); render(); },
  diaPlano(d) { E.ui.diaPlano = Number(d.i); salvar(); render(); },
  local(d) { E.ui.local = d.v; salvar(); render(); },
  diario(d) { E.ui.diario = d.v; salvar(); render(); },
  apagar(d) { if (!confirm("Apagar este registro?")) return; E[d.lista] = E[d.lista].filter(x => x.id !== d.id); salvar(); render(); },
  compartilhar(d) { compartilhar(texto(d.de)); },
  copiar(d) { copiar(texto(d.de)); },
  exportar() { compartilhar(JSON.stringify(E)); },
  importar() {
    let j; try { j = JSON.parse(texto("imp")); } catch (e) { j = null; }
    if (!j || j.v !== 1 || !j.perfil) { aviso("Texto inválido. Cole o conteúdo exportado inteiro."); return; }
    if (!confirm("Substituir os dados deste celular pelos do texto colado?")) return;
    E = Object.assign(vazio(), j); salvar(); aviso("Dados restaurados."); location.hash = "hoje"; render(true);
  },
  zerar() { if (!confirm("Apagar TODOS os dados deste celular? Não dá para desfazer.")) return; E = vazio(); salvar(); render(true); },
};
const FORM = {
  perfil(f) {
    const nasc = num(f.nascimento), alt = num(f.altura), peso = num(f.peso), ano = new Date().getFullYear();
    if (!nasc || nasc < ano - 100 || nasc > ano - 16) return aviso("Confira o ano de nascimento (4 dígitos).");
    if (!alt || alt < 120 || alt > 220) return aviso("Altura em centímetros, por exemplo 165.");
    if (!peso || peso < 35 || peso > 300) return aviso("Confira o peso em kg.");
    const kcal = num(f.metaKcal), prot = num(f.metaProt), agua = num(f.metaAgua);
    if (kcal && (kcal < 800 || kcal > 4000)) return aviso("Meta de energia fora do intervalo esperado (800 a 4000 kcal).");
    if (prot && (prot < 30 || prot > 250)) return aviso("Meta de proteína fora do intervalo esperado (30 a 250 g).");
    if (agua && (agua < 500 || agua > 6000)) return aviso("Meta de água em ml, por exemplo 2000.");
    const primeiro = !E.perfil;
    E.perfil = { nome: (f.nome || "").trim(), sexo: f.sexo === "M" ? "M" : "F", nascimento: Math.round(nasc), altura: alt, peso: peso, atividade: num(f.atividade) || 1.2, metaKcal: kcal, metaProt: prot, metaAgua: agua };
    salvar(); aviso("Perfil salvo.");
    if (primeiro) { location.hash = "hoje"; render(true); } else render();
  },
  dose(f) {
    if (!f.data) return;
    const outra = E.doses.find(d => Math.abs(entre(d.data, f.data)) < 3);
    if (outra && !confirm("Já existe uma aplicação em " + brAno(outra.data) + ", a menos de 3 dias desta data. O intervalo mínimo entre doses é de 72 horas. Salvar mesmo assim?")) return;
    E.doses.push({ id: novoId(), data: f.data, mg: num(f.mg), local: f.local, obs: (f.obs || "").trim() });
    salvar(); aviso("Aplicação registrada."); render();
  },
  peso(f) {
    const kg = num(f.kg), c = num(f.cintura);
    if (!kg || kg < 35 || kg > 300) return aviso("Confira o peso em kg.");
    E.pesos = E.pesos.filter(p => p.data !== f.data);
    E.pesos.push({ id: novoId(), data: f.data, kg: kg, cintura: c });
    salvar(); aviso("Peso registrado."); render();
  },
  sintoma(f) {
    const s = { id: novoId(), data: f.data, enjoo: Number(f.enjoo) || 0, intestino: f.intestino, vomito: !!f.vomito, refluxo: !!f.refluxo, tontura: !!f.tontura, cansaco: !!f.cansaco, dor: !!f.dor, nota: (f.nota || "").trim() };
    E.sintomas.push(s); salvar(); render();
    if (s.dor || (s.vomito && s.enjoo >= 3)) alert("Dor forte e contínua na barriga, ou vômito que não para, estão na lista de sinais de alerta do Guia. A orientação é procurar atendimento médico sem esperar a consulta.");
    else aviso("Registrado.");
  },
};

document.addEventListener("click", e => {
  const b = e.target.closest("[data-ac]"); if (!b || b.disabled) return;
  e.preventDefault(); AC[b.dataset.ac](b.dataset);
});
document.addEventListener("change", e => {
  const c = e.target;
  if (c.dataset && c.dataset.mud === "refeicao") { const h = hoje(), r = dia(h); r.feitas[Number(c.dataset.i)] = c.checked; gravarDia(h, r); render(); }
});
document.addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target, dados = {};
  new FormData(f).forEach((v, k) => { dados[k] = v; });
  FORM[f.dataset.form](dados);
});
window.addEventListener("hashchange", () => render(true));
render(true);
})();
