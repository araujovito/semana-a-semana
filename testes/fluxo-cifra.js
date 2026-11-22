// PIN de 6 dígitos e dados cifrados (app/cifra.js), no navegador por file:// (o mesmo jeito da WebView do APK).
// PINs inventados para o teste.
const { abrir, ok, d, estadoBase, CHAVE } = require("./apoio");
const GUARDA = "semana-a-semana.cifrado", PIN = "246810", OUTRO = "135791";
const titulo = p => p.locator("#tela h2").first().textContent();
const esperarTitulo = (p, t) => p.waitForFunction(x => { const h = document.querySelector("#tela h2"); return h && h.textContent.indexOf(x) >= 0; }, t, { timeout: 20000 });
async function digitar(p, form, valor, campo) { await p.fill("form[data-form=" + form + "] [name=" + (campo || "pin") + "]", valor); await p.click("form[data-form=" + form + "] button[type=submit]"); }
// Cria o PIN pela tela; devolve o código de recuperação mostrado.
async function criarPin(t, nome) {
  const p = t.p;
  await esperarTitulo(p, "Crie um PIN");
  await t.foto(nome + "-1-criar"); await t.semRolagem("criar PIN"); await t.alvosDeToque("criar PIN");
  ok(await p.locator("[name=pin]").getAttribute("inputmode") === "numeric" && await p.locator("[name=pin]").getAttribute("type") === "password", "campo do PIN: teclado numérico e dígitos escondidos");
  await digitar(p, "cifCriar", PIN);
  await esperarTitulo(p, "Digite o PIN de novo");
  await digitar(p, "cifRepetir", "999999");
  await esperarTitulo(p, "Crie um PIN");
  ok(/não são iguais/.test(await p.locator(".cif-msg").textContent()), "PINs diferentes: pede para criar de novo");
  await digitar(p, "cifCriar", PIN); await esperarTitulo(p, "Digite o PIN de novo"); await digitar(p, "cifRepetir", PIN);
  await esperarTitulo(p, "Código de recuperação");
  const cod = (await p.locator("#cif-codigo").textContent()).replace(/\s+/g, "-");
  ok(/^[2-9A-HJ-NP-Z]{5}(-[2-9A-HJ-NP-Z]{5}){3}$/.test(cod), "código de recuperação com 4 grupos de 5, sem caracteres ambíguos");
  ok(/Anote em papel e guarde fora do celular\. Sem o PIN e sem este código, os dados não podem ser recuperados\./.test(await p.locator("#tela").innerText()), "aviso de anotar o código em papel");
  await t.foto(nome + "-2-codigo"); await t.semRolagem("código"); await t.alvosDeToque("código");
  await p.click("[data-ac=cifAnotei]"); await esperarTitulo(p, "Confira o que anotou");
  const n = Number((await titulo(p), await p.locator("form[data-form=cifConfirmar] .sub").textContent()).match(/grupo (\d)/)[1]);
  await digitar(p, "cifConfirmar", "ZZZZZ", "grupo");
  ok(/Não confere/.test(await p.locator(".cif-msg").textContent()), "grupo errado: não confere");
  ok(await p.evaluate(k => localStorage.getItem(k), GUARDA) === null, "antes de confirmar o código, nada cifrado foi gravado");
  await p.click("[data-ac=cifVerCodigo]"); await esperarTitulo(p, "Código de recuperação");
  ok((await p.locator("#cif-codigo").textContent()).replace(/\s+/g, "-") === cod, "ver o código de novo mostra o mesmo código");
  await p.click("[data-ac=cifAnotei]"); await esperarTitulo(p, "Confira o que anotou");
  await digitar(p, "cifConfirmar", cod.split("-")[n - 1].toLowerCase(), "grupo");
  await p.waitForFunction(() => !document.querySelector(".cif-portao"), null, { timeout: 20000 });
  return cod;
}
const armazenamento = p => p.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });
const estado = p => p.evaluate(() => JSON.stringify(E));
async function entrar(p, pin) { await esperarTitulo(p, "Digite o seu PIN"); await digitar(p, "cifEntrar", pin); }
async function esperarApp(p) { await p.waitForFunction(() => !document.querySelector(".cif-portao") && !!document.querySelector("#tela .cartao"), null, { timeout: 20000 }); }

(async () => {
  // 1. Primeiro uso sem dados.
  {
    const t = await abrir({ comPin: true, largura: 440 }), p = t.p;
    ok(await p.evaluate(() => !!(window.crypto && crypto.subtle && crypto.subtle.wrapKey)), "por file://, a cifra do navegador (crypto.subtle) existe");
    ok(!(await p.locator("#abas").isVisible()), "portão do PIN: barra de abas escondida");
    await criarPin(t, "cifra-a");
    ok(/Converse com o seu médico/.test(await p.locator("#tela").innerText()), "sem dados: depois do PIN, a tela de entrada de sempre");
    const g = await armazenamento(p);
    ok(!(CHAVE in g) && GUARDA in g, "sem dados: guarda só a versão cifrada");
    ok(JSON.stringify(Object.keys(JSON.parse(g[GUARDA])).sort()) === JSON.stringify(["chaveEmbrulhadaPin", "chaveEmbrulhadaRec", "dadosCifrados", "iter", "iv", "sal", "salRec", "v"]), "o registro guardado tem só sal, iterações, chaves embrulhadas, iv e dados cifrados");
    ok(JSON.stringify(g).indexOf(PIN) < 0, "o PIN não aparece no armazenamento");
    await t.fechar();
  }
  // 2. Primeiro uso com dados em texto: migração sem perda, bloqueio, desbloqueio, PIN errado, inatividade, segundo plano.
  {
    const base = estadoBase({ pesos: [{ id: "p1", data: d(10), kg: 96.2 }, { id: "p2", data: d(3), kg: 95.1 }], doses: [{ id: "d1", data: d(4), mg: 2.5, local: "Coxa esquerda", obs: "" }],
      sintomas: [{ id: "s1", data: d(2), enjoo: 2, nota: "nota secreta do teste" }] });
    base.perfil.nome = "Zuleica";
    const t = await abrir({ comPin: true, estado: base, largura: 440 }), p = t.p;
    await esperarTitulo(p, "Crie um PIN");
    ok(await p.locator("text=Proteína hoje").count() === 0, "com dados: o portão aparece antes de qualquer registro");
    const antes = await estado(p);
    const cod = await criarPin(t, "cifra-b");
    await p.waitForSelector("text=Proteína hoje");
    ok(await estado(p) === antes, "migração: estado depois de criar o PIN igual ao de antes");
    let g = await armazenamento(p);
    ok(!(CHAVE in g), "migração: o texto puro foi apagado depois de conferir");
    ok(["Zuleica", "nota secreta do teste", "96.2"].every(x => JSON.stringify(g).indexOf(x) < 0), "nenhum dado legível no armazenamento");
    // registrar algo grava cifrado
    await p.evaluate(() => { E.pesos.push({ id: "p3", data: hoje(), kg: 94.8 }); salvar(); });
    await p.waitForFunction(() => !!localStorage.getItem("semana-a-semana.cifrado"));
    await p.evaluate(() => cifEsperarGravacoes());
    const depoisDoPeso = await estado(p);
    g = await armazenamento(p);
    ok(!(CHAVE in g) && g[GUARDA].indexOf("94.8") < 0, "registrar depois do PIN grava só cifrado");
    // reabrir: pede o PIN
    await p.reload(); await entrar(p, OUTRO);
    await esperarTitulo(p, "Digite o seu PIN");
    ok(/PIN errado/.test(await p.locator(".cif-msg").textContent()), "PIN errado: avisa");
    await t.foto("cifra-c-pin"); await t.semRolagem("PIN"); await t.alvosDeToque("PIN");
    await entrar(p, PIN); await esperarApp(p);
    ok(await estado(p) === depoisDoPeso, "reabrir com o PIN: tudo como estava");
    // 5 minutos sem uso: o próximo toque bloqueia
    await t.relogio("2026-11-20T10:06:00");
    await p.click("#abas a[data-aba=plano]");
    await esperarTitulo(p, "Digite o seu PIN");
    ok(await p.evaluate(() => E.perfil === null && cifChave === null), "inatividade: bloqueia e tira chave e dados da memória");
    ok(await p.locator("text=Proteína hoje").count() === 0 && !(await p.locator("#abas").isVisible()), "bloqueado: nada dos registros na tela");
    await entrar(p, PIN); await esperarApp(p);
    // segundo plano
    await p.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => true }); document.dispatchEvent(new Event("visibilitychange")); });
    await esperarTitulo(p, "Digite o seu PIN");
    ok(await p.evaluate(() => cifChave === null && E.perfil === null), "segundo plano: bloqueia");
    await p.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, get: () => false }); document.dispatchEvent(new Event("visibilitychange")); });
    // 5 erros: espera de 30 s, sem apagar
    const guardado = (await armazenamento(p))[GUARDA];
    for (let i = 0; i < 5; i++) await entrar(p, OUTRO);
    await esperarTitulo(p, "Digite o seu PIN");
    ok(/Espere 30 segundos/.test(await p.locator("#tela").innerText()), "5 erros: pede para esperar 30 segundos");
    await t.foto("cifra-d-espera");
    await entrar(p, PIN); await esperarTitulo(p, "Digite o seu PIN");
    ok(await p.evaluate(() => cifChave === null), "durante a espera nem o PIN certo abre");
    ok((await armazenamento(p))[GUARDA] === guardado, "erros de PIN não apagam nem mudam os dados");
    await t.relogio("2026-11-20T10:07:00");
    await entrar(p, PIN); await esperarApp(p);
    ok(await estado(p) === depoisDoPeso, "depois da espera, o PIN certo abre");
    // Trocar PIN no Perfil
    await p.click("#btn-perfil"); await p.waitForSelector("#cartao-pin");
    await p.click("[data-ac=cifAbrirTroca]");
    await p.fill("[name=atual]", OUTRO); await p.fill("[name=novo]", OUTRO); await p.fill("[name=repetir]", OUTRO);
    await p.click("form[data-form=cifTrocar] button[type=submit]");
    await p.waitForFunction(() => /PIN atual errado/.test(document.querySelector("#folha .cif-msg").textContent), null, { timeout: 20000 });
    ok(true, "trocar PIN: PIN atual errado é recusado");
    await t.foto("cifra-e-trocar"); await t.alvosDeToque("trocar PIN");
    await p.fill("[name=atual]", PIN); await p.click("form[data-form=cifTrocar] button[type=submit]");
    await p.waitForSelector("#folha", { state: "hidden", timeout: 20000 });
    await p.reload(); await entrar(p, PIN); await esperarTitulo(p, "Digite o seu PIN");
    ok(/PIN errado/.test(await p.locator(".cif-msg").textContent()), "depois de trocar, o PIN antigo não abre");
    await entrar(p, OUTRO); await esperarApp(p);
    ok(await estado(p) === depoisDoPeso, "depois de trocar, o PIN novo abre os mesmos dados");
    // Esqueci o PIN
    await p.reload(); await esperarTitulo(p, "Digite o seu PIN");
    await p.click("[data-ac=cifEsqueci]"); await esperarTitulo(p, "Esqueci o PIN");
    await t.alvosDeToque("recuperar");
    await digitar(p, "cifRecuperar", "ABCDE-FGHJK-LMNPQ-RSTUV", "codigo");
    await esperarTitulo(p, "Esqueci o PIN");
    ok(/não confere/.test(await p.locator(".cif-msg").textContent()), "código de recuperação errado é recusado");
    await digitar(p, "cifRecuperar", cod.toLowerCase().replace(/-/g, " "), "codigo");
    await esperarTitulo(p, "Crie um PIN novo"); await digitar(p, "cifNovoPin", PIN);
    await esperarTitulo(p, "Digite o PIN novo de novo"); await digitar(p, "cifNovoPinRepetir", PIN);
    await esperarApp(p);
    ok(await estado(p) === depoisDoPeso, "recuperação: código abre e PIN novo criado, dados iguais");
    await p.reload(); await entrar(p, PIN); await esperarApp(p);
    ok(true, "depois da recuperação, o PIN novo abre");
    // Restaurar uma exportação: cifra de novo
    const exportado = await estado(p);
    await p.evaluate(() => { E.pesos.push({ id: "p9", data: hoje(), kg: 90 }); salvar(); return cifEsperarGravacoes(); });
    await irRelatorio(p);
    await p.fill("#imp", exportado); await p.click("[data-ac=importar]"); await t.sim();
    await p.waitForSelector("text=Proteína hoje"); await p.evaluate(() => cifEsperarGravacoes());
    g = await armazenamento(p);
    ok(!(CHAVE in g) && g[GUARDA].indexOf("Zuleica") < 0, "restaurar grava só cifrado");
    await p.reload(); await entrar(p, PIN); await esperarApp(p);
    ok(await estado(p) === exportado, "restaurar: depois de reabrir, os dados restaurados voltam");
    // Dados danificados: avisa, não apaga
    await p.evaluate(k => { const r = JSON.parse(localStorage.getItem(k)); const c = r.dadosCifrados; r.dadosCifrados = c.slice(0, 8) + (c[8] === "A" ? "B" : "A") + c.slice(9); localStorage.setItem(k, JSON.stringify(r)); }, GUARDA);
    const ruim = (await armazenamento(p))[GUARDA];
    await p.reload(); await entrar(p, PIN);
    await esperarTitulo(p, "Não consegui abrir os dados guardados");
    ok(/Nada foi apagado/.test(await p.locator("#tela").innerText()), "dados danificados: avisa que nada foi apagado");
    ok((await armazenamento(p))[GUARDA] === ruim, "dados danificados: nada foi apagado nem regravado");
    await t.foto("cifra-f-danificado"); await t.alvosDeToque("danificado");
    await p.evaluate(k => localStorage.setItem(k, "{ lixo"), GUARDA);
    await p.reload(); await esperarTitulo(p, "Não consegui abrir os dados guardados");
    ok((await armazenamento(p))[GUARDA] === "{ lixo", "registro ilegível: avisa na abertura e não apaga");
    await t.fechar();
  }
})();
async function irRelatorio(p) {
  await p.click("#abas a[data-aba=diario]"); await p.click("[data-ac=diario][data-v=relatorio]"); await p.waitForSelector("#imp");
}
