// Caminhos de alimentação (#caminhos): plano da nutricionista no topo como caminho em uso; A a E como referência para
// conversar com ela; D com destaque de "só com a equipe"; marcar "quero conversar" guarda e entra no relatório.
// Claro e escuro, 320 a 430 px, alvos de 44 px e letra grande (130%).
const { abrir, ok, estadoBase } = require("./apoio");
(async () => {
  let t = await abrir({ estado: estadoBase(), aba: "caminhos" }), p = t.p;
  await p.waitForSelector(".cam-plano");
  const plano = await p.locator(".cam-plano").innerText();
  ok(/Em uso/.test(plano) && /Plano da sua nutricionista/.test(plano) && /prescreveu/.test(plano) && /converse com ela/i.test(plano), "topo: plano da nutricionista em uso, o app ajuda, dúvidas com ela");
  ok(await p.locator(".cam-plano ~ .cam-caminho").count() === 5, "plano vem antes dos 5 caminhos");
  ok(/Não substituem o plano/.test(await p.locator(".cam-intro").innerText()), "caminhos apresentados como referência, não substitutos");
  const ids = await p.locator(".cam-caminho").evaluateAll(els => els.map(e => e.dataset.caminho));
  ok(ids.join("") === "ABCDE", "caminhos A a E em ordem");
  for (const id of ids) {
    const c = await p.locator(".cam-caminho[data-caminho=" + id + "]").innerText();
    ok(/Para quem:/.test(c) && /Como funciona/.test(c) && /Cuidados com a vesícula/.test(c) && /Fonte: /.test(c) && /Converse com sua nutricionista/.test(c), id + ": para quem, como funciona, vesícula, fonte e conversa");
    ok(await p.locator(".cam-caminho[data-caminho=" + id + "] li.cam-a").count() > 0 && await p.locator(".cam-caminho[data-caminho=" + id + "] li.cam-t").count() > 0, id + ": prós e contras");
  }
  const dTxt = await p.locator(".cam-caminho[data-caminho=D]").innerText();
  ok(/Só com a equipe/.test(dTxt) && /O app não monta essa dieta/.test(dTxt), "D: destaque de só com a equipe e o app não monta a dieta");
  ok(await p.locator(".cam-caminho[data-caminho=A] .cam-aviso-equipe").count() === 0, "o destaque de equipe é só do D");
  ok(await p.locator("#abas a[data-aba=caminhos]").count() === 0 && await p.locator("#abas a.ativa").count() === 0, "sem botão novo na barra de abas");
  ok(!/(você deve|o correto|parabéns|ótimo)/i.test(await p.locator("#tela").innerText()), "sem sermão nem elogio");
  await t.semRolagem("caminhos 390"); await t.alvosDeToque("caminhos"); await t.foto("caminhos-1-claro");

  // marcar e desmarcar
  await p.click(".cam-caminho[data-caminho=C] [data-ac=camConversar]");
  await p.click(".cam-caminho[data-caminho=D] [data-ac=camConversar]");
  ok(JSON.stringify((await t.ler()).ui.camConversar) === '["C","D"]', "marcados ficam em E.ui.camConversar");
  ok(await p.locator(".cam-caminho[data-caminho=C]").evaluate(e => e.classList.contains("cam-marcado")) &&
    await p.locator(".cam-caminho[data-caminho=C] [data-ac=camConversar]").getAttribute("aria-pressed") === "true", "C aparece marcado");
  ok(/Para conversar na consulta: C\. .*; D\. /.test(await p.locator("#cam-resumo").innerText()), "resumo no fim lista os marcados");
  await p.reload(); await p.waitForSelector(".cam-plano");
  ok(await p.locator(".cam-marcado").count() === 2, "marcação continua depois de reabrir");
  await p.click(".cam-caminho[data-caminho=C] [data-ac=camConversar]");
  ok(JSON.stringify((await t.ler()).ui.camConversar) === '["D"]', "tocar de novo desmarca");
  await t.foto("caminhos-2-marcado");

  // relatório da consulta
  await p.click("#cam-resumo [data-ac=ir]");
  await p.waitForSelector("#rel");
  const rel = await p.locator("#rel").inputValue();
  ok(/CAMINHOS DE ALIMENTAÇÃO PARA CONVERSAR/.test(rel) && /D\. Redução do fígado antes da cirurgia\./.test(rel) && !/C\. Menos açúcar/.test(rel), "relatório traz só o marcado (D)");
  await t.fechar();

  // escuro e larguras
  for (const largura of [320, 430]) {
    t = await abrir({ estado: estadoBase({ ui: { camConversar: ["B"] } }), aba: "caminhos", largura, escuro: largura === 320 }); p = t.p;
    await p.waitForSelector(".cam-plano");
    await t.semRolagem("caminhos " + largura); await t.alvosDeToque("caminhos " + largura);
    if (largura === 320) {
      const cores = await p.evaluate(() => [getComputedStyle(document.body).backgroundColor, getComputedStyle(document.querySelector(".cam-capa")).color]);
      ok(cores[0] === "rgb(16, 21, 20)" && cores[1] !== "rgb(23, 32, 30)", "escuro: fundo e capa seguem as variáveis do tema");
      await t.foto("caminhos-3-escuro-320");
    }
    await t.fechar();
  }

  // letra grande (130%): o texto cresce e nada sai da tela
  t = await abrir({ estado: estadoBase(), aba: "caminhos", largura: 390 }); p = t.p;
  await p.waitForSelector(".cam-plano");
  await p.evaluate(() => { document.documentElement.style.zoom = "1.3"; });
  await t.semRolagem("caminhos letra grande 130%"); await t.alvosDeToque("caminhos letra grande"); await t.foto("caminhos-4-letra-grande");
  await t.fechar();
})();
