// Captura cada página do protótipo em 390 px, claro e escuro, na pasta prototipo/capturas/.
// Usa o mesmo playwright-core e chromium dos testes (testes/apoio.js). A janela cresce até a altura da página,
// para a barra de abas aparecer no pé da captura e não no meio.
// Uso: node prototipo/fonte/capturar.js
const path = require("path"), os = require("os"), fs = require("fs");
const pw = process.env.PLAYWRIGHT || path.join(os.homedir(), "Documents/hub-integracoes/backend/node_modules/playwright-core");
const base = path.join(os.homedir(), ".cache/ms-playwright/chromium_headless_shell-1254");
const exe = process.env.CHROMIUM || path.join(base, fs.readdirSync(base).find(n => fs.existsSync(path.join(base, n, "chrome-headless-shell"))), "chrome-headless-shell");
const PROTO = path.join(__dirname, ".."), SAI = path.join(PROTO, "capturas");
const paginas = process.argv.slice(2).length ? process.argv.slice(2) : ["hoje", "painel", "semana", "caminhos"];
(async () => {
  const { chromium } = require(pw);
  const b = await chromium.launch({ executablePath: exe });
  let falhou = false;
  for (const nome of paginas) for (const tema of ["claro", "escuro"]) {
    const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: tema === "escuro" ? "dark" : "light" });
    const erros = []; p.on("pageerror", e => erros.push(String(e))); p.on("requestfailed", r => erros.push("falhou: " + r.url()));
    p.on("request", r => { if (!r.url().startsWith("file:") && !r.url().startsWith("data:")) erros.push("pedido de fora: " + r.url()); });
    await p.goto("file://" + path.join(PROTO, nome + ".html"));
    const larg = await p.evaluate(() => document.documentElement.scrollWidth);
    const alt = await p.evaluate(() => document.documentElement.scrollHeight);
    const pequenos = await p.evaluate(() => [...document.querySelectorAll("a, button")].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.height < 44 || r.width < 44); }).map(e => e.textContent.trim().slice(0, 25)));
    await p.setViewportSize({ width: 390, height: Math.max(844, alt) });
    await p.screenshot({ path: path.join(SAI, nome + "-" + tema + ".png") });
    const prob = [...erros, larg > 390 ? "rolagem horizontal: " + larg + " px" : "", pequenos.length ? "alvos < 44 px: " + pequenos.join(" | ") : ""].filter(Boolean);
    console.log((prob.length ? "PROBLEMA " : "ok ") + nome + "-" + tema + " (" + alt + " px)" + (prob.length ? ": " + prob.join("; ") : ""));
    if (prob.length) falhou = true;
    await p.close();
  }
  await b.close(); process.exit(falhou ? 1 : 0);
})();
