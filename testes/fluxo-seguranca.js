// Segurança no app aberto do arquivo (file://, como no WebView do Android): a Content-Security-Policy está ativa,
// bloqueia script de fora e script embutido, e nenhuma tela do app provoca violação (inclui fontes da própria pasta).
const fs = require("fs"), path = require("path");
const { abrir, ok, d, estadoBase } = require("./apoio");
const RAIZ = path.join(__dirname, "..", "app");

// Cada violação da política vira um item em window.__violacoes (o navegador também escreve no console, que apoio.js já confere).
// App aberto com os dados dela: tela desenhada e barra de abas visível (sem perfil, o app mostra só a tela inicial, sem abas).
// Não depende do texto de nenhuma tela (hoje.js está sendo reorganizado).
const telaPronta = (p, ms) => p.waitForFunction(() => { const t = document.getElementById("tela"), a = document.getElementById("abas"); return t && t.children.length > 0 && a && !a.hidden; }, null, { timeout: ms || 30000 });
const ouvirViolacoes = () => { window.__violacoes = []; document.addEventListener("securitypolicyviolation", e => window.__violacoes.push(e.violatedDirective + " " + e.blockedURI)); };
const ponte = () => { window.__enviados = []; window.Android = { compartilhar: x => window.__enviados.push(x), copiar() {} }; };
const violacoes = p => p.evaluate(() => window.__violacoes.splice(0));

// Casca Android com menor privilégio (conferência do código, porque o APK não roda aqui).
const JAVA = fs.readFileSync(path.join(__dirname, "..", "android/java/br/semanaasemana/MainActivity.java"), "utf8");
const MANIFESTO = fs.readFileSync(path.join(__dirname, "..", "android/AndroidManifest.xml"), "utf8");
ok(/WebView\.setWebContentsDebuggingEnabled\(false\)/.test(JAVA), "Android: depuração remota da WebView desligada");
ok(["setAllowFileAccess", "setAllowContentAccess", "setAllowFileAccessFromFileURLs", "setAllowUniversalAccessFromFileURLs", "setGeolocationEnabled", "setSaveFormData"]
  .every(m => new RegExp("s\\." + m + "\\(false\\)").test(JAVA)), "Android: acesso a arquivos, content://, localização e dados de formulário desligados");
ok(/shouldOverrideUrlLoading[\s\S]*?startsWith\(PASTA\)\) return false;[\s\S]*?return true;/.test(JAVA) && /shouldInterceptRequest[\s\S]*?403/.test(JAVA), "Android: navegação e arquivos fora de file:///android_asset/ são recusados");
const ponteJava = [...JAVA.matchAll(/@JavascriptInterface\s+public\s+\w+\s+(\w+)\(/g)].map(m => m[1]);
ok(JSON.stringify(ponteJava) === '["compartilhar","copiar","calendario"]' && (JAVA.match(/@JavascriptInterface/g) || []).length === 4, "Android: a ponte expõe só compartilhar, copiar e calendario (" + ponteJava.join(", ") + ")");
ok(/compartilhar\(String texto\) \{\s+if \(!textoAceito\(texto\)\) return false;/.test(JAVA) && /copiar\(String texto\) \{\s+if \(!textoAceito\(texto\)\) return false;/.test(JAVA) && /data\.matches\("\\\\d\{4\}-\\\\d\{2\}-\\\\d\{2\}"\)/.test(JAVA),
  "Android: a ponte confere tamanho do texto e formato da data");
ok(!/uses-permission/.test(MANIFESTO) && /usesCleartextTraffic="false"/.test(MANIFESTO) && (MANIFESTO.match(/<activity/g) || []).length === 1, "Android: sem permissões, sem tráfego sem criptografia, uma activity só");
const regras = ["regras_backup.xml", "backup_antigo.xml"].map(n => fs.readFileSync(path.join(__dirname, "..", "android/res/xml", n), "utf8"));
ok(/dataExtractionRules="@xml\/regras_backup"/.test(MANIFESTO) && /fullBackupContent="@xml\/backup_antigo"/.test(MANIFESTO) &&
  regras.every(r => [...r.matchAll(/<(include|exclude)[^>]*path="([^"]+)"/g)].every(m => m[1] === "include" && /Local Storage\/$/.test(m[2]))), "Android: a cópia do Google leva só o localStorage da WebView");

(async () => {
  const html = fs.readFileSync(path.join(RAIZ, "index.html"), "utf8");
  const csp = (html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/) || [])[1] || "";
  const dir = {}; csp.split(";").map(x => x.trim().split(/\s+/)).forEach(x => { if (x[0]) dir[x[0]] = x.slice(1); });
  ok((dir["default-src"] || []).join(" ") === "'self'" && !/https?:|\*|data:|blob:/.test(csp), "index.html declara a política: só a própria origem, nada de fora");
  ok(dir["script-src"] && dir["script-src"].indexOf("'unsafe-inline'") < 0 && dir["style-src"].join(" ") === "'self'", "script embutido e bloco <style> não são liberados (só o atributo style e um evento por hash)");
  ok(/font-src 'self'/.test(csp), "a política permite fontes da própria pasta do app");
  ok(!/<script>|<style>|\son[a-z]+="/.test(html), "index.html não tem script, estilo nem evento embutido");

  let t = await abrir({ estado: estadoBase({ doses: [{ id: "a1", data: d(3), mg: 2.5, local: "Coxa esquerda", obs: "" }] }), aba: "hoje" }), p = t.p;
  await p.addInitScript(ouvirViolacoes); await p.reload(); await telaPronta(p);

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
  for (const aba of ["hoje", "comer", "mover", "semana", "guia", "perfil"]) {
    await p.click(aba === "perfil" ? "#btn-perfil" : "#abas a[data-aba=" + aba + "]"); await p.waitForTimeout(150);
  }
  for (const sub of ["doses", "peso", "sintomas", "relatorio"]) { await p.click("#abas a[data-aba=semana]"); await p.click("#subabas a[data-sub=diario]"); await p.click("[data-ac=diario][data-v=" + sub + "]"); }
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
  ok((await p.evaluate(() => window.__enviados)).length === 0 && !(await t.ler()).ui.ultimaExportacao && await p.locator("#seg-ultima-copia").count() === 0, "cancelar o aviso não exporta nada (e não aparece linha de cópia conferida)");
  await p.click("[data-ac=exportar]"); await t.sim(); await p.waitForFunction(() => window.__enviados.length === 1);
  let enviados = await p.evaluate(() => window.__enviados);
  const copia1 = JSON.parse(enviados[0] || "{}");
  ok(enviados.length === 1 && copia1.formato === "semana-a-semana/copia" && copia1.versao === 1 && /^[0-9a-f]{64}$/.test(copia1.sha256) && copia1.dados.doses.length === 1, "seguir exporta o texto completo, com versão e código de verificação");
  ok(/Cópia pronta e conferida/.test(await p.locator("#aviso").innerText()), "o app relê a cópia gerada e só então diz \"Cópia pronta e conferida\"");
  ok(await p.evaluate(h => segSha256Js(JSON.stringify(JSON.parse(h).dados)), enviados[0]) === copia1.sha256 && await p.evaluate(() => isSecureContext && !!crypto.subtle),
    "no arquivo (file://) o código vem do WebCrypto e bate com o cálculo em JavaScript puro");
  ok((await t.ler()).ui.ultimaExportacao === d(0) && copia1.dados.ui.ultimaExportacao === d(0), "a data da exportação fica guardada (e vai junto na cópia)");
  // M6 do teste final do APK: no Android a folha de compartilhar cobre o aviso; a confirmação precisa ficar fixa no cartão de cópia.
  await p.evaluate(() => { document.getElementById("aviso").hidden = true; });
  const linhaCopia = await p.locator("#seg-ultima-copia").innerText().catch(() => "");
  const horaCopia = (await t.ler()).ui.copiaConferidaHora;
  ok(/^\d{2}:\d{2}$/.test(horaCopia || "") && linhaCopia.includes("Última cópia conferida: hoje às " + horaCopia) && copia1.dados.ui.copiaConferidaHora === horaCopia,
    "depois de exportar, o cartão de cópia mostra fixa a linha \"Última cópia conferida: hoje às HH:MM\", mesmo com o aviso já escondido");
  await p.click("[data-ac=compartilhar][data-de=rel]");
  ok(/relatório tem dados de saúde/.test(await t.textoDialogo() || ""), "Compartilhar o relatório avisa, antes, que o texto tem dados de saúde");
  await t.nao(); ok((await p.evaluate(() => window.__enviados)).length === 1, "cancelar não compartilha o relatório");
  await p.click("[data-ac=compartilhar][data-de=rel]"); await t.sim();
  enviados = await p.evaluate(() => window.__enviados);
  ok(enviados.length === 2 && /RELATÓRIO DE ACOMPANHAMENTO/.test(enviados[1]), "seguir compartilha o relatório");
  ok(await p.locator("#seg-lembrete-copia").count() === 0, "cópia exportada hoje: sem lembrete");
  await p.reload(); // a ponte falsa recomeça __enviados vazio, por isso vem depois das contagens acima await p.waitForSelector("[data-ac=exportar]");
  ok((await p.locator("#seg-ultima-copia").innerText().catch(() => "")).includes("hoje às " + horaCopia), "a linha da última cópia conferida continua depois de reabrir o app");
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
  await t.sim(); await p.waitForFunction(() => window.__enviados.length === 1);
  ok((await p.evaluate(() => window.__enviados)).length === 1 && await p.locator("#seg-lembrete-copia").count() === 0, "depois de exportar, o lembrete some");
  await t.semear(estadoBase(Object.assign({ ui: { diario: "relatorio", ultimaExportacao: d(16) } }, antigo))); await p.waitForSelector("#seg-lembrete-copia");
  ok(/há 16 dias/.test(await p.locator("#seg-lembrete-copia").innerText()), "com exportação antiga, o lembrete diz há quantos dias foi");
  await p.click("[data-ac=segAdiarCopia]");
  ok(await p.locator("#seg-lembrete-copia").count() === 0 && (await t.ler()).ui.lembreteCopia === d(0), "\"Agora não\" esconde o lembrete e guarda a data");
  await t.semear(estadoBase(Object.assign({ ui: { diario: "relatorio", ultimaExportacao: d(10) } }, antigo))); await p.waitForSelector("[data-ac=zerar]");
  ok(await p.locator("#seg-lembrete-copia").count() === 0, "exportação há 10 dias: sem lembrete");
  const dez = d(10).split("-").reverse().join("/");
  ok((await p.locator("#seg-ultima-copia").innerText().catch(() => "")).includes("Última cópia conferida: em " + dez + "."), "cópia antiga, sem hora guardada: a linha mostra só a data");
  await t.fechar();

  // Cópia maior que o limite da ponte do Android (MAX_TEXTO em MainActivity.java, o mesmo SEG_MAX_TEXTO): avisa e não envia.
  const max = Number((JAVA.match(/MAX_TEXTO = (\d+);/) || [])[1]);
  ok(max > 0 && max === Number((fs.readFileSync(path.join(RAIZ, "seguranca.js"), "utf8").match(/SEG_MAX_TEXTO = (\d+);/) || [])[1]), "limite de tamanho igual no Java e no JavaScript (" + max + ")");
  t = await abrir({ estado: estadoBase({ sintomas: [{ id: "s1", data: d(1), enjoo: 0, nota: "x".repeat(max) }], ui: { diario: "relatorio" } }), aba: "diario" }); p = t.p;
  await p.addInitScript(ponte); await p.reload(); await p.waitForSelector("[data-ac=exportar]");
  await p.click("[data-ac=exportar]"); await t.sim(); await p.waitForSelector("#dialogo:not([hidden])");
  ok(/grande demais/.test(await t.textoDialogo()) && (await p.evaluate(() => window.__enviados)).length === 0 && !(await t.ler()).ui.ultimaExportacao, "cópia grande demais para o Android: avisa, não envia e não marca como exportada");
  await t.nao(); await t.fechar();

  // Restaurar de ponta a ponta: exporta um estado com tudo preenchido (inclui os campos de vesícula e fígado da onda 2 e um campo
  // que ainda não existe, para provar que campo novo não se perde), apaga tudo e restaura num navegador limpo, pela primeira tela.
  const cheio = estadoBase({
    perfil: Object.assign(estadoBase().perfil, { gestante: false, diabetes: false, insulinaSulf: null, pilula: true, vesicula: true, figado: true, aguardaCirurgia: true,
      discreto: true, naoCome: ["lactose"], naoGosta: ["sardinha"], metaKcal: 1500, metaProt: 110, metaAgua: 2500, campoFuturo: { x: [1, 2] } }),
    diaDose: 1,
    doses: [{ id: "a1", data: d(14), mg: 2.5, local: "Coxa esquerda", obs: "primeira" }, { id: "a2", data: d(7), mg: 2.5, local: "Abdômen direito", obs: "" }],
    pesos: [{ id: "p1", data: d(14), kg: 120.2, cintura: 128 }, { id: "p2", data: d(0), kg: 118.4, cintura: null }],
    sintomas: [{ id: "s1", data: d(6), enjoo: 2, intestino: "Preso", vomito: false, refluxo: true, tontura: false, cansaco: true, dor: false, nota: "depois do almoço", glicemia: 98 }],
    treinos: [{ id: "t1", data: d(2), tipo: "A", local: "casa", exercicios: [{ nome: "Agachamento", carga: "", reps: [10, 10] }] }],
    dias: { [d(1)]: { enjoo: true, agua: 1500, protExtra: 20, caminhada: 15, comido: [{ q: 1, itens: [["ovo", 100]] }, null, { q: 0.5, outros: [["arroz", 80]] }] } },
    trocas: { "0.1.2": "frango" }, caneta: { restantes: 3, validade: "2027-01-01" }, suplementos: [{ id: "x", nome: "Vitamina D" }], exames: [{ id: "e", data: d(30) }],
    lembretes: { agua: "10:00" }, ui: { diario: "relatorio", diaPlano: 3, local: "casa", entradaVista: true, avisoPouco: d(1) }, novoTopo: "fica",
  });
  t = await abrir({ estado: cheio, aba: "diario" }); p = t.p;
  await p.addInitScript(ponte); await p.reload(); await p.waitForSelector("[data-ac=exportar]");
  await p.click("[data-ac=exportar]"); await t.sim(); await p.waitForFunction(() => window.__enviados.length === 1);
  const copiaTexto = (await p.evaluate(() => window.__enviados))[0], antes = await t.ler();
  // Texto editado à mão (um peso trocado) não restaura e não muda nada.
  await p.fill("#imp", copiaTexto.replace("118.4", "98.4")); await p.click("[data-ac=importar]");
  await p.waitForSelector("#dialogo:not([hidden])");
  ok(/não confere com o código de verificação/.test(await t.textoDialogo()), "cópia alterada: o app recusa e explica");
  await t.nao();
  ok(JSON.stringify(await t.ler()) === JSON.stringify(antes), "cópia alterada: nada foi mudado");
  await p.click("[data-ac=zerar]"); await t.sim();
  ok(!(await t.ler()).perfil, "restaurar: dados apagados antes de restaurar");
  await t.fechar();

  t = await abrir({ aba: "hoje" }); p = t.p; // navegador novo, sem nada guardado
  await p.waitForSelector("[data-ac=entradaContinuar]"); await p.click("[data-ac=entradaContinuar]");
  ok(await p.locator("#imp").count() === 1, "celular novo: a primeira tela oferece restaurar sem pedir perfil antes");
  if (await p.locator("#imp").count()) {
    await t.foto("seguranca-restaurar-inicio");
    await p.fill("#imp", copiaTexto); await p.click("[data-ac=importar]");
    if (await t.textoDialogo()) await t.sim();
    await telaPronta(p);
    const depois = await t.ler();
    let igual = true, dif = "";
    try { require("assert").deepStrictEqual(depois, antes); } catch (e) { igual = false; dif = e.message.slice(0, 600); }
    ok(igual, "restaurar num navegador limpo traz tudo de volta, campo por campo" + (igual ? "" : ": " + dif));
    ok(depois.perfil.vesicula === true && depois.perfil.figado === true && depois.perfil.aguardaCirurgia === true && depois.perfil.discreto === true && depois.perfil.campoFuturo.x[1] === 2 && depois.novoTopo === "fica",
      "restaurar mantém vesícula, fígado, aguarda cirurgia, modo discreto e campos que ainda não existem");
    await p.click("#abas a[data-aba=semana]"); await p.click("#subabas a[data-sub=diario]"); await p.click("[data-ac=diario][data-v=peso]");
    ok(/118,4/.test(await p.locator("#tela").innerText()), "depois de restaurar, o diário mostra os registros");
  }
  await t.fechar();
})().catch(e => { console.log("FALHOU: " + e.message); process.exit(1); });
