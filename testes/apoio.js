// Apoio dos testes de ponta a ponta (navegador sem janela). Cada testes/fluxo-*.js usa isto e roda sozinho:
//   node testes/fluxo-hoje.js [caminho do playwright-core] [executavel do chromium] [pasta de capturas]
// Sem argumentos, usa as variaveis PLAYWRIGHT e CHROMIUM ou os caminhos do briefing.
const path = require("path"), os = require("os"), fs = require("fs");
const CHAVE = "semana-a-semana.v1";
function achar() {
  const pw = process.argv[2] || process.env.PLAYWRIGHT || path.join(os.homedir(), "Documents/hub-integracoes/backend/node_modules/playwright-core");
  let exe = process.argv[3] || process.env.CHROMIUM;
  if (!exe) {
    const base = path.join(os.homedir(), ".cache/ms-playwright/chromium_headless_shell-1254");
    const pasta = fs.readdirSync(base).find(n => fs.existsSync(path.join(base, n, "chrome-headless-shell")));
    exe = path.join(base, pasta, "chrome-headless-shell");
  }
  return { pw, exe, capturas: process.argv[4] || process.env.CAPTURAS };
}
const ok = (c, m) => { if (!c) { console.log("FALHOU: " + m); process.exitCode = 1; } else console.log("ok: " + m); };
// data de n dias atras, no formato AAAA-MM-DD
const d = n => { const x = new Date(); x.setDate(x.getDate() - n); return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0"); };
const URL_APP = "file://" + path.join(__dirname, "..", "app", "index.html");
// Perfil pronto para os testes que nao sao sobre o perfil. Formato v2 (ver app/nucleo.js).
function estadoBase(extra) {
  return Object.assign({ v: 2, perfil: { nome: "Teste", sexo: "F", nascimento: 1990, altura: 163, peso: 95.4, atividade: 1.2, metaKcal: null, metaProt: null, metaAgua: null,
    diabetes: null, insulinaSulf: null, pilula: null, naoCome: [], naoGosta: [] },
    doses: [], pesos: [], sintomas: [], treinos: [], dias: {}, trocas: {}, caneta: null, suplementos: [], exames: [], lembretes: {}, ui: {} }, extra || {});
}
// Abre o app. opcoes: { estado: objeto gravado antes de abrir, largura, altura, escuro: true, aba: "plano" }
// Devolve { p (pagina), erros, foto(nome), ler() (estado salvo), semear(estado), fechar() }. fechar() confere que nao houve erro no console.
async function abrir(opcoes) {
  const o = opcoes || {}, a = achar();
  const { chromium } = require(a.pw);
  const b = await chromium.launch({ executablePath: a.exe });
  const p = await b.newPage({ viewport: { width: o.largura || 390, height: o.altura || 800 }, deviceScaleFactor: 2, colorScheme: o.escuro ? "dark" : "light" });
  const erros = []; p.on("pageerror", e => erros.push(String(e))); p.on("console", m => { if (m.type() === "error") erros.push(m.text()); });
  p.on("dialog", x => x.accept());
  const semear = async estado => { await p.goto(URL_APP); await p.evaluate(x => localStorage.setItem(x[0], JSON.stringify(x[1])), [CHAVE, estado]); await p.goto(URL_APP + "#" + (o.aba || "hoje")); await p.reload(); };
  if (o.estado) await semear(o.estado); else await p.goto(URL_APP + (o.aba ? "#" + o.aba : ""));
  return {
    p, erros, semear,
    foto: async n => { if (a.capturas) await p.screenshot({ path: path.join(a.capturas, n + ".png"), fullPage: true }); },
    ler: () => p.evaluate(k => JSON.parse(localStorage.getItem(k)), CHAVE),
    semRolagem: async nome => { const w = await p.evaluate(() => document.documentElement.scrollWidth), v = p.viewportSize().width; ok(w <= v, "sem rolagem horizontal em " + nome + " (" + w + " de " + v + " px)"); },
    fechar: async () => { ok(erros.length === 0, "sem erros no console " + erros.join(" / ")); await b.close(); },
  };
}
module.exports = { abrir, ok, d, estadoBase, CHAVE, URL_APP };
