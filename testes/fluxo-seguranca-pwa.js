// Versão web instalável (PWA) servida por HTTP local: a Content-Security-Policy vale e não atrapalha o service worker,
// o manifesto, os ícones e as fontes da própria origem. Depois, atualização com duas versões do sw: o servidor passa a
// entregar a "versão 2" (VERSAO_APP nova em sw.js e uma marca em index.html), a faixa aparece e o toque recarrega na versão nova.
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
// App aberto com os dados dela: tela desenhada e barra de abas visível (sem perfil, o app mostra só a tela inicial, sem abas).
// Não depende do texto de nenhuma tela (hoje.js está sendo reorganizado).
const telaPronta = (p, ms) => p.waitForFunction(() => { const t = document.getElementById("tela"), a = document.getElementById("abas"); return t && t.children.length > 0 && a && !a.hidden; }, null, { timeout: ms || 30000 });
const ouvirViolacoes = () => { window.__violacoes = []; document.addEventListener("securitypolicyviolation", e => window.__violacoes.push(e.violatedDirective + " " + e.blockedURI)); };

(async () => {
  let versao = 1;
  const srv = servidor((nome, corpo) => {
    if (versao === 1) return corpo;
    if (nome === "sw.js") return String(corpo).replace(/const VERSAO_APP = "([^"]+)"/, 'const VERSAO_APP = "$1-v2"');   // o cache leva a versão
    if (nome === "index.html") return String(corpo).replace('<html lang="pt-BR">', '<html lang="pt-BR" data-versao-teste="2">');
    return corpo;
  });
  await new Promise(x => srv.listen(0, "127.0.0.1", x));
  const URL = "http://127.0.0.1:" + srv.address().port + "/";
  const a = achar(), { chromium } = require(a.pw);
  const b = await chromium.launch({ executablePath: a.exe }), ctx = await b.newContext({ viewport: { width: 390, height: 800 } }), p = await ctx.newPage();
  const erros = []; p.on("pageerror", e => erros.push(String(e))); p.on("console", m => { if (m.type() === "error") erros.push(m.text()); });
  await p.addInitScript(ouvirViolacoes);
  await p.addInitScript(() => { window.cifTesteSemPin = true; }); // o PIN é conferido no fim, em outra janela, sem este atalho
  try {
    await p.goto(URL + "index.html");
    await p.evaluate(x => localStorage.setItem(x[0], JSON.stringify(x[1])), [CHAVE, estadoBase()]);
    await p.reload(); await telaPronta(p);
    ok(await p.evaluate(async () => !!(await navigator.serviceWorker.ready).active), "PWA: service worker registrado com a política ligada");
    for (const aba of ["comer", "mover", "semana", "guia", "hoje"]) { await p.click("#abas a[data-aba=" + aba + "]"); await p.waitForTimeout(100); }
    await p.click("#abas a[data-aba=semana]"); await p.click("#subabas a[data-sub=diario]"); await p.waitForTimeout(100);
    await p.click("#subabas a[data-sub=painel]"); await p.waitForTimeout(100);
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
    // Recarrega onde ela estava (Semana > Painel): abrir pelo service worker devolve a mesma tela, com os dados.
    await p.reload(); await telaPronta(p);
    ok(await p.evaluate(() => location.hash) === "#painel", "PWA: recarregar pelo service worker reabre a tela em que ela estava");
    const resto = await p.evaluate(() => window.__violacoes);
    ok(resto.length === 0, "PWA: nenhuma violação da política ao abrir pelo service worker" + (resto.length ? ": " + resto.join(" / ") : ""));

    // Atualização. Na primeira instalação não há faixa.
    ok(await p.locator("#seg-versao-nova:not([hidden])").count() === 0, "primeira instalação: sem faixa de versão nova");
    const dados = await p.evaluate(k => localStorage.getItem(k), CHAVE);
    versao = 2;
    await p.evaluate(async () => (await navigator.serviceWorker.getRegistration()).update());
    await p.waitForSelector("#seg-versao-nova button", { timeout: 15000 });
    ok(/Versão nova pronta\. Toque para atualizar/.test(await p.locator("#seg-versao-nova").innerText()), "sw novo instalado: aparece a faixa \"Versão nova pronta. Toque para atualizar\"");
    ok(await p.evaluate(() => !document.documentElement.dataset.versaoTeste && !!navigator.serviceWorker.controller), "antes do toque, a tela continua na versão em uso");
    ok(await p.evaluate(async () => !!(await navigator.serviceWorker.getRegistration()).waiting), "antes do toque, a versão nova espera, sem assumir sozinha");
    const r = await p.evaluate(() => { const b = document.querySelector("#seg-versao-nova button").getBoundingClientRect(); return [b.width, b.height]; });
    ok(r[0] >= 44 && r[1] >= 44, "faixa com alvo de toque de 44 px ou mais (" + r.map(Math.round).join("x") + ")");
    await Promise.all([p.waitForNavigation(), p.click("#seg-versao-nova button")]);
    await telaPronta(p);
    ok(await p.evaluate(() => document.documentElement.dataset.versaoTeste) === "2", "o toque ativa o sw novo e recarrega já na versão nova");
    const v2 = "semana-a-semana-" + /const VERSAO_APP = "([^"]+)"/.exec(fs.readFileSync(path.join(RAIZ, "sw.js"), "utf8"))[1] + "-v2";
    await p.waitForFunction(c => caches.keys().then(k => k.join() === c), v2, { timeout: 5000 }).catch(() => {});
    ok(JSON.stringify(await p.evaluate(() => caches.keys())) === JSON.stringify([v2]), "a versão nova apaga os arquivos guardados da anterior");
    ok(await p.locator("#seg-versao-nova:not([hidden])").count() === 0, "depois de atualizar, a faixa some");
    ok(await p.evaluate(k => localStorage.getItem(k), CHAVE) === dados, "atualizar não mexe nos dados");
    await ctx.setOffline(true);
    await p.reload(); await telaPronta(p, 10000);
    ok(await p.evaluate(() => document.documentElement.dataset.versaoTeste) === "2", "sem internet, abre a versão nova guardada");
    await ctx.setOffline(false);

    // PIN (app/cifra.js) por HTTP, com a política ligada: criar, bloquear ao recarregar e desbloquear sem nenhuma violação. PIN inventado.
    const ctx2 = await b.newContext({ viewport: { width: 390, height: 800 } }), q = await ctx2.newPage();
    q.on("pageerror", e => erros.push(String(e))); q.on("console", m => { if (m.type() === "error") erros.push(m.text()); });
    await q.addInitScript(ouvirViolacoes);
    await q.goto(URL + "index.html");
    await q.evaluate(x => localStorage.setItem(x[0], JSON.stringify(x[1])), [CHAVE, estadoBase()]);
    await q.reload();
    const titulo = t => q.waitForFunction(x => { const h = document.querySelector("#tela h2"); return h && h.textContent.indexOf(x) >= 0; }, t, { timeout: 20000 });
    const enviar = async (form, campo, v) => { await q.fill("form[data-form=" + form + "] [name=" + campo + "]", v); await q.click("form[data-form=" + form + "] button[type=submit]"); };
    await titulo("Crie um PIN");
    ok(await q.locator("#abas").isHidden(), "PWA com PIN: o portão aparece antes dos dados");
    await enviar("cifCriar", "pin", "246810"); await titulo("Digite o PIN de novo"); await enviar("cifRepetir", "pin", "246810");
    await titulo("Código de recuperação");
    const cod = (await q.locator("#cif-codigo").textContent()).trim().split(/\s+/);
    await q.click("[data-ac=cifAnotei]"); await titulo("Confira");
    const n = Number((await q.locator("form[data-form=cifConfirmar] .sub").textContent()).match(/grupo (\d)/)[1]);
    await enviar("cifConfirmar", "grupo", cod[n - 1]);
    await telaPronta(q);
    ok(await q.evaluate(k => localStorage.getItem(k) === null && !!localStorage.getItem("semana-a-semana.cifrado"), CHAVE), "PWA com PIN: dados cifrados, texto puro apagado");
    await q.reload(); await titulo("Digite o seu PIN"); await enviar("cifEntrar", "pin", "246810"); await telaPronta(q);
    ok(true, "PWA com PIN: recarregar pede o PIN e o PIN abre");
    const vp = await q.evaluate(() => window.__violacoes);
    ok(vp.length === 0, "PWA com PIN: portão sem violação da política" + (vp.length ? ": " + vp.join(" / ") : ""));
    await ctx2.close();
  } catch (e) { ok(false, "erro no teste: " + (e && e.stack || e)); }
  ok(erros.length === 0, "PWA: sem erros no console " + erros.join(" / "));
  await b.close(); srv.close();
})();
