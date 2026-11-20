// Tela Plano: cardapio do dia, dia de enjoo e trocas.
const { abrir, ok, estadoBase } = require("./apoio");
(async () => {
  const t = await abrir({ estado: estadoBase(), aba: "plano" }), p = t.p;
  await p.waitForSelector("text=Metas diárias"); await t.foto("2-plano");
  ok(await p.locator(".refeicao").count() === 5, "plano mostra 5 refeições");
  await p.click("[data-ac=diaPlano][data-i='7']"); ok(await p.locator("text=Canja").count() > 0, "dia de enjoo abre");
  await p.locator("summary", { hasText: "Proteínas" }).click(); await t.foto("3-plano-enjoo");
  await t.semRolagem("plano"); await t.alvosDeToque("plano");
  await t.fechar();
})();
