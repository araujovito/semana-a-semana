// Carrega os arquivos do app em Node, sem navegador, para testar as contas. Uso:
//   const app = require("../carregar-app")(estado);   // estado opcional, no formato de app/nucleo.js
//   app.v("metas().prot")            -> avalia uma expressao dentro do app
//   app.v("E.pesos.push({data:'2026-01-01',kg:90})")
// inicio.js (que desenha a tela) nao e carregado; todo o resto so toca na pagina dentro de funcoes.
const fs = require("fs"), path = require("path"), vm = require("vm");
module.exports = function (estado, opcoes) {
  const o = opcoes || {}, dir = path.join(__dirname, "..", "app");
  const html = fs.readFileSync(path.join(dir, "index.html"), "utf8");
  const arquivos = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]).filter(n => n !== "inicio.js");
  // opcoes: { Date: classe de relogio falso, guardado: objeto que faz as vezes do localStorage, falhaAoGravar: true }
  const guardado = o.guardado || {}; if (estado) guardado["semana-a-semana.v1"] = JSON.stringify(estado);
  const avisos = [];
  const ctx = { console, Date: o.Date || Date, Math, JSON, Intl, setTimeout, clearTimeout,
    localStorage: { getItem: k => (k in guardado ? guardado[k] : null), setItem: (k, v) => { if (o.falhaAoGravar) throw new Error("sem espaço"); guardado[k] = String(v); }, removeItem: k => { delete guardado[k]; } },
    document: { getElementById: () => ({ set textContent(t) { avisos.push(t); }, hidden: true, value: "" }), querySelectorAll: () => [], addEventListener() {} },
    navigator: {}, location: { hash: "" }, confirm: () => true, alert: () => {}, render: () => {},
    confirmar: (t, f) => { if (f) f(); }, alerta: () => {}, irPara: () => {}, abrirFolha: () => {}, fecharFolha: () => {}, folhaAberta: () => false };
  ctx.window = ctx; vm.createContext(ctx);
  for (const a of arquivos) vm.runInContext(fs.readFileSync(path.join(dir, a), "utf8"), ctx, { filename: a });
  return { v: codigo => vm.runInContext(codigo, ctx), guardado, avisos, arquivos };
};
