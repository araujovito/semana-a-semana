// Versao web instalavel (PWA): servida por HTTP local, registra o service worker, guarda o app e abre sem internet.
const http = require("http"), fs = require("fs"), path = require("path");
const { ok, achar, estadoBase, CHAVE } = require("./apoio");
const RAIZ = path.join(__dirname, "..", "app");
const TIPOS = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webmanifest": "application/manifest+json" };
(async () => {
  const srv = http.createServer((q, r) => {
    const nome = decodeURIComponent(q.url.split("?")[0].split("#")[0]).replace(/^\/+/, "") || "index.html", f = path.join(RAIZ, nome);
    if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { "Content-Type": TIPOS[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(r);
  });
  await new Promise(ok2 => srv.listen(0, "127.0.0.1", ok2));
  const URL = "http://127.0.0.1:" + srv.address().port + "/";
  const a = achar(), { chromium } = require(a.pw);
  const b = await chromium.launch({ executablePath: a.exe }), ctx = await b.newContext({ viewport: { width: 390, height: 800 } }), p = await ctx.newPage();
  const erros = []; p.on("pageerror", e => erros.push(String(e)));
  try {
    // sw.js lista tudo o que index.html carrega
    const html = fs.readFileSync(path.join(RAIZ, "index.html"), "utf8"), sw = fs.readFileSync(path.join(RAIZ, "sw.js"), "utf8");
    const usados = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(m => m[1]).filter(x => !/^https?:/.test(x));
    const faltam = usados.filter(x => sw.indexOf('"' + x + '"') < 0);
    ok(faltam.length === 0, "sw.js guarda todos os arquivos de index.html" + (faltam.length ? ": faltam " + faltam.join(", ") : ""));
    const man = JSON.parse(fs.readFileSync(path.join(RAIZ, "manifest.webmanifest"), "utf8"));
    ok(man.display === "standalone" && man.icons.some(i => i.sizes === "512x512" && i.purpose === "maskable") && man.icons.every(i => fs.existsSync(path.join(RAIZ, i.src))), "manifesto instalável: tela cheia, ícones 192/512 e máscara existentes");

    await p.goto(URL + "index.html");
    await p.evaluate(x => localStorage.setItem(x[0], JSON.stringify(x[1])), [CHAVE, estadoBase()]);
    await p.reload(); await p.waitForSelector("text=Proteína hoje");
    ok(await p.evaluate(() => window.EH_PWA === true), "por HTTP, o app se reconhece como versão web");
    const pronto = await p.evaluate(async () => { const r = await navigator.serviceWorker.ready; return !!r.active; });
    ok(pronto, "service worker registrado e ativo");
    await p.waitForFunction(async () => (await (await caches.open("semana-a-semana-v1")).keys()).length >= 30, null, { timeout: 15000 });
    await ctx.setOffline(true);
    await p.reload(); await p.waitForSelector("text=Proteína hoje", { timeout: 10000 });
    ok(true, "sem internet, o app abre do que foi guardado e os dados continuam");
    await p.click("#abas a[data-aba=guia]"); await p.waitForSelector("text=Sinais de alerta");
    ok(true, "sem internet, as outras abas funcionam");
    await p.click("#abas a[data-aba=semana]"); await p.click("#subabas a[data-sub=diario]"); await p.click("[data-ac=diario][data-v=relatorio]"); await p.waitForSelector("text=Cópia de segurança");
    ok(/limpar os dados do navegador/.test(await p.locator("#tela").innerText()), "na versão web, a cópia de segurança avisa que limpar o navegador apaga os registros");
    await ctx.setOffline(false);
  } catch (e) { ok(false, "erro no teste: " + (e && e.stack || e)); }
  ok(erros.length === 0, "sem erros no console " + erros.join(" / "));
  await b.close(); srv.close();
})();
