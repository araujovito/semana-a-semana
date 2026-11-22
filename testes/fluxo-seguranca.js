// Segurança no app aberto do arquivo (file://, como no WebView do Android): a Content-Security-Policy está ativa,
// bloqueia script de fora e script embutido, e nenhuma tela do app provoca violação (inclui fontes da própria pasta).
const fs = require("fs"), path = require("path");
const { abrir, ok, d, estadoBase } = require("./apoio");
const RAIZ = path.join(__dirname, "..", "app");

// Cada violação da política vira um item em window.__violacoes (o navegador também escreve no console, que apoio.js já confere).
const ouvirViolacoes = () => { window.__violacoes = []; document.addEventListener("securitypolicyviolation", e => window.__violacoes.push(e.violatedDirective + " " + e.blockedURI)); };
const ponte = () => { window.__enviados = []; window.Android = { compartilhar: x => window.__enviados.push(x), copiar() {} }; };
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
  // Fontes: as declaradas em CSS (Zilla Slab em app/fontes/, quando chegar) e, para provar que font-src aceita a própria pasta,
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

  // Aviso de dados de saúde antes de o texto sair do app (ponte falsa do Android guarda o que seria compartilhado).
  t = await abrir({ estado: estadoBase({ doses: [{ id: "a1", data: d(3), mg: 2.5, local: "Coxa esquerda", obs: "" }], ui: { diario: "relatorio" } }), aba: "diario" }); p = t.p;
  await p.addInitScript(ponte); await p.reload(); await p.waitForSelector("[data-ac=exportar]");
  await p.click("[data-ac=exportar]");
  ok(/dados de saúde/.test(await t.textoDialogo() || ""), "Exportar tudo avisa, antes, que o texto tem dados de saúde");
  await t.nao();
  ok((await p.evaluate(() => window.__enviados)).length === 0 && !(await t.ler()).ui.ultimaExportacao, "cancelar o aviso não exporta nada");
  await p.click("[data-ac=exportar]"); await t.sim();
  let enviados = await p.evaluate(() => window.__enviados);
  ok(enviados.length === 1 && JSON.parse(enviados[0]).doses.length === 1, "seguir exporta o texto completo");
  ok((await t.ler()).ui.ultimaExportacao === d(0) && JSON.parse(enviados[0]).ui.ultimaExportacao === d(0), "a data da exportação fica guardada (e vai junto na cópia)");
  await p.click("[data-ac=compartilhar][data-de=rel]");
  ok(/relatório tem dados de saúde/.test(await t.textoDialogo() || ""), "Compartilhar o relatório avisa, antes, que o texto tem dados de saúde");
  await t.nao(); ok((await p.evaluate(() => window.__enviados)).length === 1, "cancelar não compartilha o relatório");
  await p.click("[data-ac=compartilhar][data-de=rel]"); await t.sim();
  enviados = await p.evaluate(() => window.__enviados);
  ok(enviados.length === 2 && /RELATÓRIO DE ACOMPANHAMENTO/.test(enviados[1]), "seguir compartilha o relatório");
  ok(await p.locator("#seg-lembrete-copia").count() === 0, "cópia exportada hoje: sem lembrete");
  await t.fechar();

  // Lembrete discreto: nunca exportou e usa o app há 20 dias; aparece junto do cartão de cópia, oferece exportar e pode ser adiado.
  const antigo = { doses: [{ id: "a1", data: d(20), mg: 2.5, local: "Coxa esquerda", obs: "" }] };
  t = await abrir({ estado: estadoBase(Object.assign({ ui: { diario: "relatorio" } }, antigo)), aba: "diario" }); p = t.p;
  await p.addInitScript(ponte); await p.reload(); await p.waitForSelector("#seg-lembrete-copia");
  const lembrete = await p.locator("#seg-lembrete-copia").innerText();
  ok(/ainda não exportou/.test(lembrete) && !/precisa|deve|esqueceu/i.test(lembrete), "lembrete aparece em Diário > Relatório, sem cobrança: " + lembrete.replace(/\n/g, " "));
  ok(await p.evaluate(() => { const l = document.getElementById("seg-lembrete-copia"); return l.nextElementSibling && /Cópia de segurança/.test(l.nextElementSibling.textContent); }), "lembrete fica logo acima do cartão de cópia");
  await t.foto("seguranca-lembrete");
  await t.alvosDeToque("lembrete de cópia");
  await p.click("#seg-lembrete-copia [data-ac=exportar]");
  ok(/dados de saúde/.test(await t.textoDialogo() || ""), "exportar pelo lembrete também passa pelo aviso de dados de saúde");
  await t.sim();
  ok((await p.evaluate(() => window.__enviados)).length === 1 && await p.locator("#seg-lembrete-copia").count() === 0, "depois de exportar, o lembrete some");
  await t.semear(estadoBase(Object.assign({ ui: { diario: "relatorio", ultimaExportacao: d(16) } }, antigo))); await p.waitForSelector("#seg-lembrete-copia");
  ok(/há 16 dias/.test(await p.locator("#seg-lembrete-copia").innerText()), "com exportação antiga, o lembrete diz há quantos dias foi");
  await p.click("[data-ac=segAdiarCopia]");
  ok(await p.locator("#seg-lembrete-copia").count() === 0 && (await t.ler()).ui.lembreteCopia === d(0), "\"Agora não\" esconde o lembrete e guarda a data");
  await t.semear(estadoBase(Object.assign({ ui: { diario: "relatorio", ultimaExportacao: d(10) } }, antigo))); await p.waitForSelector("[data-ac=zerar]");
  ok(await p.locator("#seg-lembrete-copia").count() === 0, "exportação há 10 dias: sem lembrete");
  await t.fechar();
})().catch(e => { console.log("FALHOU: " + e.message); process.exit(1); });
