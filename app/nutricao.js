"use strict";
/* Contas de nutrição: porções, plano do dia, soma de nutrientes e metas. Sem acesso à página.
   Um item de plano é { k: chave do alimento, g: gramas já na porção final }. */

function gramas(g, f) { const v = g * f; return v < 20 ? Math.max(1, Math.round(v)) : Math.round(v / 5) * 5; }
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
/* Refeições do cardápio base com as porções multiplicadas por f. i: 0 a 6 = segunda a domingo, 7 = dia de enjoo. */
function planoComFator(i, f) {
  const d = i === 7 ? C.nausea : C.dias[i];
  return { indice: i, nome: d.nome, refeicoes: d.refeicoes.map(r => ({ tipo: r.tipo, titulo: r.titulo, preparo: r.preparo, itens: r.itens.map(it => ({ k: it[0], g: gramas(it[1], f) })) })) };
}
/* Soma o plano inteiro ou só as refeições em que quais[i] é verdadeiro. */
function somarPlano(plano, quais) {
  let itens = [];
  plano.refeicoes.forEach((r, i) => { if (!quais || quais[i]) itens = itens.concat(r.itens); });
  return somarItens(itens);
}
function mediaComFator(f) {
  const m = zeros();
  for (let i = 0; i < 7; i++) { const t = somarPlano(planoComFator(i, f)); CAMPOS.forEach(c => { m[c] += t[c] / 7; }); }
  return m;
}
const BASE = mediaComFator(1);
function fatorDe(kcal) { return Math.min(1.5, Math.max(0.85, Math.round(kcal / BASE.kcal / 0.05) * 0.05)); }
/* O que as telas usam: plano já na escala do perfil. */
function planoDoDia(i) { return planoComFator(i, metas().fator); }
function planoDaData(d) { return planoDoDia(dia(d).enjoo ? 7 : diaSemana(d)); }
function mediaSemana() { return mediaComFator(metas().fator); }

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
