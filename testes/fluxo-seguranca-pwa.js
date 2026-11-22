// Versão web instalável (PWA) servida por HTTP local: a Content-Security-Policy vale e não atrapalha o service worker,
// o manifesto, os ícones e as fontes da própria origem.
const http = require("http"), fs = require("fs"), path = require("path");
const { ok, achar, estadoBase, CHAVE } = require("./apoio");
const RAIZ = path.join(__dirname, "..", "app");
const TIPOS = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webmanifest": "application/manifest+json", ".woff2": "font/woff2", ".ttf": "font/ttf" };
// Fonte do sistema servida como se fosse do app, para provar que font-src aceita a própria origem antes de app/fontes/ existir.
const FONTE_TESTE = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf";

function servidor(mudar) {
  return http.createServer((q, r) => {
    const nome = decodeURIComponent(q.url.split("?")[0].split("#")[0]).replace(/^\/+/, "") || "index.html";
    const f = nome === "fonte-teste.ttf" ? FONTE_TESTE : path.join(RAIZ, nome);
    if ((f !== FONTE_TESTE && !f.startsWith(RAIZ)) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    const tipo = TIPOS[path.extname(f)] || "application/octet-stream", corpo = fs.readFileSync(f);
    r.writeHead(200, { "Content-Type": tipo, "Cache-Control": "no-cache" });
    r.end(mudar ? mudar(nome, corpo) : corpo);
  });
}
const ouvirViolacoes = () => { window.__violacoes = []; document.addEventListener("securitypolicyviolation", e => window.__violacoes.push(e.violatedDirective + " " + e.blockedURI)); };

(async () => {
  const srv = servidor();
  await new Promise(x => srv.listen(0, "127.0.0.1", x));
  const URL = "http://127.0.0.1:" + srv.address().port + "/";
  const a = achar(), { chromium } = require(a.pw);
  const b = await chromium.launch({ executablePath: a.exe }), ctx = await b.newContext({ viewport: { width: 390, height: 800 } }), p = await ctx.newPage();
  const erros = []; p.on("pageerror", e => erros.push(String(e))); p.on("console", m => { if (m.type() === "error") erros.push(m.text()); });
  await p.addInitScript(ouvirViolacoes);
  try {
    await p.goto(URL + "index.html");
    await p.evaluate(x => localStorage.setItem(x[0], JSON.stringify(x[1])), [CHAVE, estadoBase()]);
    await p.reload(); await p.waitForSelector("text=Proteína hoje");
    ok(await p.evaluate(async () => !!(await navigator.serviceWorker.ready).active), "PWA: service worker registrado com a política ligada");
    for (const aba of ["plano", "treino", "diario", "guia", "hoje"]) { await p.click("#abas a[data-aba=" + aba + "]"); await p.waitForTimeout(100); }
    const fontes = await p.evaluate(async lista => {
      const r = [];
      for (const u of lista) { const f = new FontFace("teste", "url(" + u + ")"); try { await f.load(); } catch (e) {} r.push(u + ":" + f.status); }
      for (const f of document.fonts) { try { await f.load(); } catch (e) {} r.push(f.family + ":" + f.status); }
      return r;
    }, fs.existsSync(FONTE_TESTE) ? ["fonte-teste.ttf"] : []);
    ok(fontes.every(f => /:loaded$/.test(f)), "PWA: fontes da própria origem carregam (" + fontes.join(", ") + ")");
    const manifesto = await p.evaluate(async () => (await fetch("manifest.webmanifest")).ok);
    ok(manifesto, "PWA: manifesto e arquivos da própria origem continuam acessíveis");
    await p.evaluate(() => { const s = document.createElement("script"); s.src = "https://exemplo.invalid/x.js"; document.body.appendChild(s); });
    await p.waitForTimeout(300);
    const bloqueio = await p.evaluate(() => window.__violacoes.splice(0));
    ok(bloqueio.length === 1 && /exemplo\.invalid/.test(bloqueio[0]), "PWA: script de outro endereço é recusado pela política");
    erros.splice(0); // a recusa acima foi provocada pelo teste
    await p.reload(); await p.waitForSelector("text=Proteína hoje");
    const resto = await p.evaluate(() => window.__violacoes);
    ok(resto.length === 0, "PWA: nenhuma violação da política ao abrir pelo service worker" + (resto.length ? ": " + resto.join(" / ") : ""));
  } catch (e) { ok(false, "erro no teste: " + (e && e.stack || e)); }
  ok(erros.length === 0, "PWA: sem erros no console " + erros.join(" / "));
  await b.close(); srv.close();
})();
