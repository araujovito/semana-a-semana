// PIN (app/cifra.js): os três caminhos que o teste do APK não cobriu (empresa/relatorios/teste-final-apk.md):
// esperas depois de PINs errados, bloqueio depois de 5 minutos parado e troca de PIN pelo Perfil.
// Relógio controlado (testes/apoio.js). PINs inventados para o teste.
const { abrir, ok, d, estadoBase, CHAVE } = require("./apoio");
const GUARDA = "semana-a-semana.cifrado", TENT = "semana-a-semana.cifra.tentativas";
const PIN1 = "582046", PIN2 = "903817", PIN3 = "461275", ERRADO = "111222";
const esperarTitulo = (p, t) => p.waitForFunction(x => { const h = document.querySelector("#tela h2"); return h && h.textContent.indexOf(x) >= 0; }, t, { timeout: 20000 });
async function digitar(p, form, valor, campo) { await p.fill("form[data-form=" + form + "] [name=" + (campo || "pin") + "]", valor); await p.click("form[data-form=" + form + "] button[type=submit]"); }
const estado = p => p.evaluate(() => JSON.stringify(E));
const guardado = p => p.evaluate(k => localStorage.getItem(k), GUARDA);
const tentativas = p => p.evaluate(k => JSON.parse(localStorage.getItem(k)), TENT);
const textoTela = p => p.locator("#tela").innerText();
const agora = p => p.evaluate(() => Date.now());
const trancado = p => p.evaluate(() => cifChave === null && E.perfil === null && !!document.querySelector(".cif-portao"));
async function esperarApp(p) { await p.waitForFunction(() => !document.querySelector(".cif-portao") && !!document.querySelector("#tela .cartao"), null, { timeout: 20000 }); }
// Tenta um PIN na tela de entrada e espera a resposta (a tela volta ao PIN ou o app abre).
async function entrar(p, pin) {
  await esperarTitulo(p, "Digite o seu PIN");
  await digitar(p, "cifEntrar", pin);
  await p.waitForFunction(() => cifPasso !== "abrindo", null, { timeout: 20000 });
}
// Fechar e reabrir a página (sai para outra página e volta; o localStorage fica, a memória não).
async function fecharEReabrir(p) { const u = p.url().replace(/#.*$/, ""); await p.goto("about:blank"); await p.goto(u); await esperarTitulo(p, "Digite o seu PIN"); }
async function criarPin(p, pin) {
  await esperarTitulo(p, "Crie um PIN");
  await digitar(p, "cifCriar", pin); await esperarTitulo(p, "Digite o PIN de novo"); await digitar(p, "cifRepetir", pin);
  await esperarTitulo(p, "Código de recuperação");
  const cod = (await p.locator("#cif-codigo").textContent()).replace(/\s+/g, "-");
  await p.click("[data-ac=cifAnotei]"); await esperarTitulo(p, "Confira o que anotou");
  const n = Number((await p.locator("form[data-form=cifConfirmar] .sub").textContent()).match(/grupo (\d)/)[1]);
  await digitar(p, "cifConfirmar", cod.split("-")[n - 1], "grupo");
  await esperarApp(p);
  return cod;
}
async function abrirTroca(p) {
  await p.click("#btn-perfil"); await p.waitForSelector("#cartao-pin");
  await p.click("[data-ac=cifAbrirTroca]"); await p.waitForSelector("#folha form[data-form=cifTrocar]");
}
async function trocar(p, atual, novo, repetir) {
  await p.fill("#folha [name=atual]", atual); await p.fill("#folha [name=novo]", novo); await p.fill("#folha [name=repetir]", repetir == null ? novo : repetir);
  await p.click("#folha form[data-form=cifTrocar] button[type=submit]");
  await p.waitForFunction(() => { const f = document.getElementById("folha"); const m = f.querySelector(".cif-msg"); return f.hidden || (m && m.textContent !== "Conferindo…" && !f.querySelector("button[type=submit]").disabled); }, null, { timeout: 20000 });
  return p.evaluate(() => (document.getElementById("folha").hidden ? "fechou" : document.querySelector("#folha .cif-msg").textContent));
}

(async () => {
  const base = estadoBase({ pesos: [{ id: "p1", data: d(7), kg: 96.2 }], sintomas: [{ id: "s1", data: d(1), enjoo: 1, nota: "anotação de teste" }] });
  const t = await abrir({ comPin: true, estado: base, largura: 440, relogioSobrevive: true }), p = t.p;
  // A hora mudada precisa sobreviver a recarregar e a fechar/reabrir (é isso que se testa nas esperas): relogioSobrevive.
  await t.relogio("2026-11-20T10:00:00");
  const cod = await criarPin(p, PIN1);
  const dados = await estado(p);

  // ---------- 1. Esperas depois de PINs errados: 30 s, 1 min, 5 min ----------
  await p.reload();
  for (let i = 1; i <= 4; i++) {
    await entrar(p, ERRADO);
    const tx = await textoTela(p);
    ok(/PIN errado/.test(tx) && !/Espere/.test(tx), "erro " + i + " de 4: \"PIN errado\", sem espera");
  }
  ok(/Depois de 5 erros seguidos/.test(await textoTela(p)), "a partir do 2º erro, avisa que depois de 5 vem a espera");
  await entrar(p, ERRADO);
  ok(/Espere 30 segundos/.test(await textoTela(p)), "5º erro: espera de 30 segundos");
  let tt = await tentativas(p);
  ok(tt.n === 5 && Math.abs(tt.ate - await agora(p) - 30000) < 3000, "5º erro: o fim da espera fica guardado (daqui a 30 s)");
  ok(JSON.stringify(tt).indexOf(PIN1) < 0 && JSON.stringify(tt).indexOf(ERRADO) < 0, "o registro de tentativas não guarda PIN nenhum");
  await p.reload(); await esperarTitulo(p, "Digite o seu PIN");
  ok(/Espere \d+ segundos/.test(await textoTela(p)), "recarregar: a espera continua");
  await fecharEReabrir(p);
  ok(/Espere \d+ segundos/.test(await textoTela(p)), "fechar e reabrir a página: a espera continua");
  await entrar(p, PIN1);
  ok(await trancado(p), "durante a espera, o PIN certo não abre");
  ok((await tentativas(p)).n === 5, "tentar durante a espera não conta como erro");
  await t.relogio(tt.ate - 3000);
  await p.reload(); await esperarTitulo(p, "Digite o seu PIN");
  ok(/Espere [1-4] segundos?\b/.test(await textoTela(p)), "faltando 3 s, ainda pede para esperar " + JSON.stringify((await textoTela(p)).match(/Espere [^.]*/)));
  await t.relogio(tt.ate + 2000);
  await p.waitForFunction(() => !/Espere/.test(document.getElementById("tela").innerText), null, { timeout: 5000 });
  ok(true, "quando a espera acaba, o aviso some sozinho (sem tocar na tela)");
  await entrar(p, ERRADO);
  ok(/Espere 1 minuto\b/.test(await textoTela(p)), "6º erro: espera de 1 minuto");
  tt = await tentativas(p);
  ok(tt.n === 6 && Math.abs(tt.ate - await agora(p) - 60000) < 3000, "6º erro: 60 s guardados");
  await fecharEReabrir(p);
  ok(/Espere 1 minuto\b/.test(await textoTela(p)), "6º erro: fechar e reabrir mantém a espera");
  await t.relogio(tt.ate + 2000); await p.reload();
  await entrar(p, ERRADO);
  ok(/Espere 5 minutos/.test(await textoTela(p)), "7º erro: espera de 5 minutos");
  tt = await tentativas(p);
  ok(tt.n === 7 && Math.abs(tt.ate - await agora(p) - 300000) < 3000, "7º erro: 300 s guardados");
  await t.relogio(tt.ate - 90000); await fecharEReabrir(p);
  ok(/Espere 2 minutos/.test(await textoTela(p)), "faltando 1 min 30 s: \"Espere 2 minutos\" (plural certo) " + JSON.stringify((await textoTela(p)).match(/Espere [^.]*/)));
  await t.relogio(tt.ate - 30000); await p.reload(); await esperarTitulo(p, "Digite o seu PIN");
  ok(/Espere (2[5-9]|30) segundos/.test(await textoTela(p)), "faltando 30 s: conta em segundos");
  await t.relogio(tt.ate + 2000); await p.reload();
  await entrar(p, ERRADO);
  tt = await tentativas(p);
  ok(/Espere 5 minutos/.test(await textoTela(p)) && tt.n === 8 && Math.abs(tt.ate - await agora(p) - 300000) < 3000, "8º erro em diante: continua 5 minutos");
  // relógio do celular volta um dia (ajuste de hora): a espera não pode virar um dia inteiro
  const volta = tt.ate - 24 * 3600 * 1000;
  await t.relogio(volta); await p.reload(); await esperarTitulo(p, "Digite o seu PIN");
  const txVolta = await textoTela(p);
  ok(/Espere (5 minutos|[1-4] minutos?|\d+ segundos)/.test(txVolta), "relógio atrasado um dia: a espera continua de no máximo 5 minutos " + JSON.stringify(txVolta.match(/Espere [^.]*/)));
  await t.relogio(volta + 303000); await p.reload();
  await entrar(p, PIN1);
  await esperarApp(p);
  ok(await estado(p) === dados, "depois da espera, o PIN certo abre os mesmos dados");
  ok(await tentativas(p) === null, "acertar o PIN zera os erros");
  await p.reload(); await entrar(p, ERRADO);
  ok(/PIN errado/.test(await textoTela(p)) && !/Espere/.test(await textoTela(p)) && (await tentativas(p)).n === 1, "depois de acertar, a contagem recomeça do zero");
  await entrar(p, PIN1); await esperarApp(p);

  // ---------- 2. Bloqueio depois de 5 minutos parado ----------
  let ultimo = await p.evaluate(() => cifUltimoUso);
  await t.relogio(ultimo + 5 * 60000 - 1000);
  await p.click("#abas a[data-aba=comer]");
  await p.waitForFunction(() => location.hash === "#plano", null, { timeout: 5000 });
  ok(!(await p.locator(".cif-portao").count()) && await p.evaluate(() => !!cifChave), "4 min 59 s parado: o toque funciona e não bloqueia");
  ultimo = await p.evaluate(() => cifUltimoUso);
  ok(ultimo === await agora(p) || Math.abs(ultimo - await agora(p)) < 2000, "o toque marca uso");
  await t.relogio(ultimo + 4 * 60000); await p.keyboard.press("Shift");
  ultimo = await p.evaluate(() => cifUltimoUso);
  await t.relogio(ultimo + 4 * 60000);
  await p.click("#abas a[data-aba=semana]");
  await p.waitForFunction(() => location.hash === "#semana", null, { timeout: 5000 });
  ok(await p.evaluate(() => !!cifChave), "tecla conta como uso: 4 min + 4 min com uso no meio não bloqueia");
  // passou de 5 min: o toque bloqueia e não chega ao app
  ultimo = await p.evaluate(() => cifUltimoUso);
  await t.relogio(ultimo + 5 * 60000 + 1000);
  await p.click("#abas a[data-aba=guia]");
  await esperarTitulo(p, "Digite o seu PIN");
  ok(await trancado(p), "5 min e 1 s parado: o toque bloqueia e tira chave e dados da memória");
  ok(await p.evaluate(() => location.hash) === "#semana", "o toque que bloqueou não mudou de aba por trás");
  await entrar(p, PIN1); await esperarApp(p);
  // parado sem tocar: a conferência periódica bloqueia sozinha (a cada 15 s de relógio real)
  ultimo = await p.evaluate(() => cifUltimoUso);
  await t.relogio(ultimo + 6 * 60000);
  await p.waitForSelector(".cif-portao", { timeout: 20000 });
  ok(await trancado(p), "parado sem tocar: bloqueia sozinho, sem precisar de toque");
  await entrar(p, PIN1); await esperarApp(p);
  // gravação na fila na hora do bloqueio: não se perde
  await p.evaluate(() => { E.pesos.push({ id: "p2", data: hoje(), kg: 95.7 }); salvar(); window.__relogio(cifUltimoUso + 6 * 60000); window.cifConferirInatividade(); });
  await esperarTitulo(p, "Digite o seu PIN");
  await p.waitForTimeout(1500);
  await p.reload(); await entrar(p, PIN1); await esperarApp(p);
  ok(await p.evaluate(() => E.pesos.some(x => x.id === "p2" && x.kg === 95.7)), "registro salvo logo antes do bloqueio está lá depois de abrir");
  ok((await guardado(p)).indexOf("95.7") < 0, "e foi gravado cifrado");
  const dados2 = await estado(p);
  // folha aberta (Trocar PIN com o PIN atual digitado): o bloqueio fecha a folha e não deixa nada dela na página
  await abrirTroca(p);
  await p.fill("#folha [name=atual]", PIN1);
  ultimo = await p.evaluate(() => cifUltimoUso);
  await t.relogio(ultimo + 5 * 60000 + 1000);
  await p.click("#folha [name=novo]");
  await esperarTitulo(p, "Digite o seu PIN");
  ok(await p.locator("#folha").isHidden(), "bloqueio com a folha aberta: a folha fecha");
  ok(await p.evaluate(pin => [...document.querySelectorAll("input")].every(i => i.value !== pin) && !document.querySelector("#folha form"), PIN1), "bloqueio: o PIN digitado na folha não fica na página escondida");
  // O toque que bloqueou some junto com a folha, então o app engole o próximo clique por 0,8 s (cifEngolirClique). Ninguém digita
  // 6 números nesse tempo; o teste, sim: espera antes de digitar.
  await p.waitForTimeout(900);
  await entrar(p, PIN1); await esperarApp(p);
  ok(await p.locator("#folha").isHidden(), "depois de abrir de novo, a folha continua fechada");
  // diálogo aberto: também fecha e esvazia
  await p.evaluate(() => confirmar("Pergunta de teste com dado sensível", () => { window.__simDoDialogo = true; }));
  ultimo = await p.evaluate(() => cifUltimoUso);
  await t.relogio(ultimo + 5 * 60000 + 1000);
  await p.evaluate(() => window.cifConferirInatividade());
  await esperarTitulo(p, "Digite o seu PIN");
  ok(await p.locator("#dialogo").isHidden() && !(await p.evaluate(() => document.getElementById("dialogo").textContent.indexOf("dado sensível") >= 0)), "bloqueio com diálogo aberto: o diálogo fecha e o texto sai da página");
  await entrar(p, PIN1); await esperarApp(p);
  ok(await estado(p) === dados2, "depois dos bloqueios, os dados continuam iguais");

  // ---------- 3. Troca de PIN pelo Perfil ----------
  const regAntes = JSON.parse(await guardado(p));
  await abrirTroca(p);
  await t.alvosDeToque("trocar PIN");
  ok(/não são iguais/.test(await trocar(p, PIN1, PIN2, PIN3)), "trocar: PIN novo e repetição diferentes são recusados");
  ok(/6 números/.test(await trocar(p, PIN1, "12345")), "trocar: PIN novo com menos de 6 números é recusado");
  await trocar(p, "", PIN2); ok(/Preencha o campo: PIN atual/.test(await p.locator("#aviso").textContent()), "trocar: sem o PIN atual, pede para preencher o PIN atual");
  ok(await guardado(p) === JSON.stringify(regAntes), "recusas antes de conferir não mexem nos dados guardados");
  for (let i = 1; i <= 4; i++) ok(/PIN atual errado/.test(await trocar(p, ERRADO, PIN2)), "trocar: PIN atual errado (" + i + "ª vez) é recusado");
  ok(/Espere 30 segundos/.test(await trocar(p, ERRADO, PIN2)), "trocar: 5 erros do PIN atual também pedem espera de 30 s");
  ok(/Espere/.test(await trocar(p, PIN1, PIN2)), "trocar: durante a espera, nem o PIN atual certo troca");
  ok(await guardado(p) === JSON.stringify(regAntes), "erros na troca não mexem nos dados guardados");
  await p.reload(); await esperarTitulo(p, "Digite o seu PIN");
  ok(/Espere/.test(await textoTela(p)), "a espera vinda da troca vale também na tela de entrada");
  tt = await tentativas(p);
  await t.relogio(tt.ate + 2000); await p.reload();
  await entrar(p, PIN1); await esperarApp(p);
  await abrirTroca(p);
  ok(await trocar(p, PIN1, PIN2) === "fechou", "trocar com o PIN atual certo: a folha fecha");
  ok(/PIN trocado/.test(await p.locator("#aviso").textContent()), "avisa \"PIN trocado.\"");
  ok(await estado(p) === dados2, "logo depois da troca, os dados na tela continuam os mesmos");
  const regDepois = JSON.parse(await guardado(p));
  ok(regDepois.sal !== regAntes.sal && regDepois.chaveEmbrulhadaPin !== regAntes.chaveEmbrulhadaPin, "troca: sal e chave embrulhada pelo PIN mudaram");
  ok(regDepois.salRec === regAntes.salRec && regDepois.chaveEmbrulhadaRec === regAntes.chaveEmbrulhadaRec, "troca: a parte do código de recuperação ficou igual");
  ok([PIN1, PIN2, "96.2", "anotação de teste"].every(x => JSON.stringify(regDepois).indexOf(x) < 0), "troca: nada legível no armazenamento");
  // registrar depois da troca grava com a chave de sempre e o registro novo
  await p.evaluate(() => { E.pesos.push({ id: "p3", data: hoje(), kg: 95.3 }); salvar(); return cifEsperarGravacoes(); });
  const dados3 = await estado(p);
  await fecharEReabrir(p);
  await entrar(p, PIN1);
  ok(await trancado(p) && /PIN errado/.test(await textoTela(p)), "depois da troca, o PIN antigo não abre");
  await entrar(p, PIN2); await esperarApp(p);
  ok(await estado(p) === dados3, "o PIN novo abre os dados, incluindo o registro feito depois da troca");
  // o código de recuperação continua valendo
  await p.reload(); await esperarTitulo(p, "Digite o seu PIN");
  await p.click("[data-ac=cifEsqueci]"); await esperarTitulo(p, "Esqueci o PIN");
  await digitar(p, "cifRecuperar", cod, "codigo");
  await esperarTitulo(p, "Crie um PIN novo"); await digitar(p, "cifNovoPin", PIN3);
  await esperarTitulo(p, "Digite o PIN novo de novo"); await digitar(p, "cifNovoPinRepetir", PIN3);
  await esperarApp(p);
  ok(await estado(p) === dados3, "depois da troca, o código de recuperação de antes ainda abre os dados");
  await p.reload(); await entrar(p, PIN2);
  ok(await trancado(p), "depois da recuperação, o PIN trocado deixa de abrir");
  await entrar(p, PIN3); await esperarApp(p);
  ok(await estado(p) === dados3, "e o PIN criado na recuperação abre");
  ok(!(CHAVE in await p.evaluate(() => Object.assign({}, localStorage))), "em nenhum momento sobrou texto puro guardado");
  await t.fechar();
})();
