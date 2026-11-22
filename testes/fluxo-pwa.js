// Versao web instalavel (PWA): servida por HTTP local, registra o service worker, guarda o app e abre sem internet.
const http = require("http"), fs = require("fs"), path = require("path");
const { ok, achar, estadoBase, CHAVE } = require("./apoio");
const RAIZ = path.join(__dirname, "..", "app");
const TIPOS = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".png": "image/png", ".webmanifest": "application/manifest+json" };
(async () => {
  // troca: simula uma publicação nova. swVersao serve o sw.js com outra VERSAO_APP; falha faz um arquivo responder 503.
  const troca = { swVersao: null, falha: null };
  const V0 = /const VERSAO_APP = "([^"]+)"/.exec(fs.readFileSync(path.join(RAIZ, "sw.js"), "utf8"))[1], C0 = "semana-a-semana-" + V0;
  const srv = http.createServer((q, r) => {
    const nome = decodeURIComponent(q.url.split("?")[0].split("#")[0]).replace(/^\/+/, "") || "index.html", f = path.join(RAIZ, nome);
    if (troca.falha && nome === troca.falha) { r.writeHead(503); return r.end(); }
    if (nome === "sw.js" && troca.swVersao) { r.writeHead(200, { "Content-Type": "text/javascript" }); return r.end(fs.readFileSync(f, "utf8").replace('"' + V0 + '"', '"' + troca.swVersao + '"')); }
    if (!f.startsWith(RAIZ) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { "Content-Type": TIPOS[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(r);
  });
  await new Promise(ok2 => srv.listen(0, "127.0.0.1", ok2));
  const URL = "http://127.0.0.1:" + srv.address().port + "/";
  const a = achar(), { chromium } = require(a.pw);
  const b = await chromium.launch({ executablePath: a.exe }), ctx = await b.newContext({ viewport: { width: 390, height: 800 } }), p = await ctx.newPage();
  await ctx.addInitScript(() => { window.cifTesteSemPin = true; }); // o PIN tem teste próprio (fluxo-cifra.js)
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
    ok(await p.evaluate(() => isSecureContext && !!(window.crypto && crypto.subtle && crypto.subtle.wrapKey)), "por HTTP local, a cifra do navegador (crypto.subtle) existe para o PIN");
    const pronto = await p.evaluate(async () => { const r = await navigator.serviceWorker.ready; return !!r.active; });
    ok(pronto, "service worker registrado e ativo");
    ok(/^\d{4}\.\d{2}\.\d{2}-\d+$/.test(V0), "sw.js tem VERSAO_APP (" + V0 + ") e o cache leva esse nome");
    await p.waitForFunction(async c => (await (await caches.open(c)).keys()).length >= 30, C0, { timeout: 15000 });
    await ctx.setOffline(true);
    await p.reload(); await p.waitForSelector("text=Proteína hoje", { timeout: 10000 });
    ok(true, "sem internet, o app abre do que foi guardado e os dados continuam");
    await p.click("#abas a[data-aba=guia]"); await p.waitForSelector("text=Sinais de alerta");
    ok(true, "sem internet, as outras abas funcionam");
    await p.click("#abas a[data-aba=semana]"); await p.click("#subabas a[data-sub=diario]"); await p.click("[data-ac=diario][data-v=relatorio]"); await p.waitForSelector("text=Cópia de segurança");
    ok(/limpar os dados do navegador/.test(await p.locator("#tela").innerText()), "na versão web, a cópia de segurança avisa que limpar o navegador apaga os registros");
    await ctx.setOffline(false);

    // Auditoria 3, I5: versão nova com um arquivo respondendo 503 não instala, e a antiga continua inteira e servindo.
    await p.click("#abas a[data-aba=hoje]"); await p.waitForSelector("text=Proteína hoje");
    const atualizar = () => p.evaluate(async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      try { await reg.update(); } catch (e) { /* a falha da instalação aparece abaixo */ }
      const sw = reg.installing;
      if (sw) await new Promise(fim => { const f = () => { if (sw.state === "redundant" || sw.state === "installed" || sw.state === "activated") fim(); }; sw.addEventListener("statechange", f); f(); });
      return { esperando: !!reg.waiting, caches: await caches.keys() };
    });
    troca.swVersao = V0 + "-teste"; troca.falha = "hoje.js";
    const r1 = await atualizar();
    const guardado = await p.evaluate(async c => { const x = await (await caches.open(c)).match("hoje.js"); return x ? x.text() : ""; }, C0);
    ok(!r1.esperando && r1.caches.join() === C0 && guardado === fs.readFileSync(path.join(RAIZ, "hoje.js"), "utf8"), "um arquivo com 503: a versão nova não instala, o cache dela não fica pela metade e a antiga continua inteira (" + r1.caches.join() + ")");
    await ctx.setOffline(true);
    await p.reload(); await p.waitForSelector("text=Proteína hoje", { timeout: 10000 });
    ok(await p.locator("#seg-versao-nova:not([hidden])").count() === 0, "depois da falha, sem internet, o app abre na versão antiga, sem faixa de versão nova");
    await ctx.setOffline(false);
    // Sem a falha: a versão nova instala, espera, a faixa aparece e o toque recarrega já nela; o cache antigo é apagado.
    troca.falha = null;
    const r2 = await atualizar();
    ok(r2.esperando && r2.caches.length === 2, "sem a falha, a versão nova instala ao lado da antiga e espera");
    await p.waitForSelector("#seg-versao-nova button", { timeout: 10000 });
    await Promise.all([p.waitForEvent("load", { timeout: 15000 }), p.click("#seg-versao-nova button")]);
    await p.waitForSelector("text=Proteína hoje");
    await p.waitForFunction(async c => (await caches.keys()).join() === c, "semana-a-semana-" + V0 + "-teste", { timeout: 10000 });
    ok(true, "com o toque em \"Versão nova pronta\", a página recarrega na versão nova e o cache antigo some");
  } catch (e) { ok(false, "erro no teste: " + (e && e.stack || e)); }
  ok(erros.length === 0, "sem erros no console " + erros.join(" / "));
  await b.close(); srv.close();
})();
