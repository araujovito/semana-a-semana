// Tela Plano: cardapio do dia, dia de enjoo e trocas.
const { abrir, ok, estadoBase } = require("./apoio");
(async () => {
  const t = await abrir({ estado: estadoBase(), aba: "plano" }), p = t.p;
  await p.waitForSelector("text=Metas diárias"); await t.foto("2-plano");
  ok(await p.locator(".refeicao").count() === 5, "plano mostra 5 refeições");
  // teste final M4: receita de ovos mexidos ou omelete não lista "Ovo cozido"
  const listaDoCafe = () => p.locator(".refeicao").first().locator("li").allInnerTexts();
  await p.click("[data-ac=diaPlano][data-i='0']"); let l = await listaDoCafe();
  ok(l.some(x => /^Ovo mexido: \d+ g/.test(x)) && !l.some(x => /Ovo cozido/.test(x)), "segunda, ovos mexidos: a lista diz 'Ovo mexido': " + l.join(" | "));
  await p.click("[data-ac=diaPlano][data-i='4']"); l = await listaDoCafe();
  ok(l.some(x => /^Ovo batido, para a omelete: \d+ g/.test(x)), "sexta, omelete: a lista diz o ovo da omelete: " + l.join(" | "));
  await p.click("[data-ac=diaPlano][data-i='7']"); ok(await p.locator("text=Canja").count() > 0, "dia de enjoo abre");
  l = await p.locator(".refeicao", { hasText: "Ovos mexidos com purê" }).locator("li").allInnerTexts();
  ok(l.some(x => /^Ovo mexido: \d+ g/.test(x)), "dia de enjoo, jantar: a lista diz 'Ovo mexido': " + l.join(" | "));
  await p.locator("summary", { hasText: "Proteínas" }).click(); await t.foto("3-plano-enjoo");
  await t.semRolagem("plano"); await t.alvosDeToque("plano");
  await t.fechar();
})();
