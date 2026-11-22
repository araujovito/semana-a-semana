// Segurança no app aberto do arquivo (file://, como no WebView do Android): a Content-Security-Policy está ativa,
// bloqueia script de fora e script embutido, e nenhuma tela do app provoca violação (inclui fontes da própria pasta).
const fs = require("fs"), path = require("path");
const { abrir, ok, d, estadoBase } = require("./apoio");
const RAIZ = path.join(__dirname, "..", "app");

// Cada violação da política vira um item em window.__violacoes (o navegador também escreve no console, que apoio.js já confere).
const ouvirViolacoes = () => { window.__violacoes = []; document.addEventListener("securitypolicyviolation", e => window.__violacoes.push(e.violatedDirective + " " + e.blockedURI)); };
const violacoes = p => p.evaluate(() => window.__violacoes.splice(0));

(async () => {
  const html = fs.readFileSync(path.join(RAIZ, "index.html"), "utf8");
  const csp = (html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/) || [])[1] || "";
  const dir = {}; csp.split(";").map(x => x.trim().split(/\s+/)).forEach(x => { if (x[0]) dir[x[0]] = x.slice(1); });
  ok((dir["default-src"] || []).join(" ") === "'self'" && !/https?:|\*|data:|blob:/.test(csp), "index.html declara a política: só a própria origem, nada de fora");
  ok(dir["script-src"] && dir["script-src"].indexOf("'unsafe-inline'") < 0 && dir["style-src"].join(" ") === "'self'", "script embutido e bloco <style> não são liberados (só o atributo style e um evento por hash)");
  ok(/font-src 'self'/.test(csp), "a política permite fontes da própria pasta do app");
  ok(!/<script>|<style>|\son[a-z]+="/.test(html), "index.html não tem script, estilo nem evento embutido");

  let t = await abrir({ estado: estadoBase({ doses: [{ id: "a1", data: d(3), mg: 2.5, local: "Coxa esquerda", obs: "" }] }), aba: "hoje" }), p = t.p;
  await p.addInitScript(ouvirViolacoes); await p.reload(); await p.waitForSelector("text=Proteína hoje");

  // A política está valendo: script embutido e script de outro endereço são recusados.
  await p.evaluate(() => {
    const a = document.createElement("script"); a.textContent = "window.__embutido = 1"; document.body.appendChild(a);
    const b = document.createElement("script"); b.src = "https://exemplo.invalid/x.js"; document.body.appendChild(b);
  });
  await p.waitForTimeout(300);
  const bloqueios = await violacoes(p);
  ok(await p.evaluate(() => window.__embutido) === undefined && bloqueios.some(v => /script-src/.test(v) && /inline/.test(v)) && bloqueios.some(v => /exemplo\.invalid/.test(v)),
    "no arquivo (file://) a política bloqueia script embutido e script de fora: " + bloqueios.join(" / "));
  t.erros.splice(0); // as duas recusas acima foram provocadas pelo teste

  // Todas as telas, a folha com evento embutido (busca de "não gosto") e as fontes: nenhuma violação.
  for (const aba of ["hoje", "plano", "treino", "diario", "guia", "perfil"]) {
    await p.click(aba === "perfil" ? "#btn-perfil" : "#abas a[data-aba=" + aba + "]"); await p.waitForTimeout(150);
  }
  for (const sub of ["doses", "peso", "sintomas", "relatorio"]) { await p.click("#abas a[data-aba=diario]"); await p.click("[data-ac=diario][data-v=" + sub + "]"); }
  await p.click("#btn-perfil"); await p.click("[data-ac=abrirNaoGosta]");
  if (await p.locator("#busca-nao-gosta").count()) {
    await p.fill("#busca-nao-gosta", "frango");
    const visiveis = await p.evaluate(() => [...document.querySelectorAll("#folha [data-nome]")].filter(x => x.offsetParent).length);
    ok(visiveis > 0 && visiveis < await p.evaluate(() => document.querySelectorAll("#folha [data-nome]").length), "busca de \"não gosto\" filtra com a política ligada (evento embutido liberado por hash)");
  } else ok(false, "folha de \"não gosto\" não abriu no teste");
  // Fontes: as declaradas em CSS (Montserrat em app/fontes/, quando chegar) e, para provar que font-src aceita a própria pasta,
  // cada arquivo de app/fontes/ carregado direto. Sem a pasta ainda, usa uma fonte do sistema por file:// (mesma regra do WebView).
  const pastaFontes = path.join(RAIZ, "fontes");
  const arquivosFonte = fs.existsSync(pastaFontes) ? fs.readdirSync(pastaFontes).filter(n => /\.(woff2?|ttf|otf)$/.test(n)).map(n => "fontes/" + n)
    : ["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"].filter(f => fs.existsSync(f)).map(f => "file://" + f);
  const fontes = await p.evaluate(async lista => {
    const r = [];
    for (const u of lista) { const f = new FontFace("teste", "url(" + u + ")"); try { await f.load(); } catch (e) {} r.push(u + ":" + f.status); }
    for (const f of document.fonts) { try { await f.load(); } catch (e) {} r.push(f.family + ":" + f.status); }
    return r;
  }, arquivosFonte);
  ok(fontes.every(f => /:loaded$/.test(f)), "fontes da própria origem carregam com a política ligada (" + (fontes.join(", ") || "nenhuma") + ")");
  const resto = await violacoes(p);
  ok(resto.length === 0, "nenhuma violação da política nas telas do app" + (resto.length ? ": " + resto.join(" / ") : ""));
  await t.fechar();
})().catch(e => { console.log("FALHOU: " + e.message); process.exit(1); });
