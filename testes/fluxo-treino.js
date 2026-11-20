// Tela Treino.
const { abrir, ok, estadoBase } = require("./apoio");
(async () => {
  const t = await abrir({ estado: estadoBase(), aba: "treino" }), p = t.p;
  await p.waitForSelector("text=Treino A"); await p.click("[data-ac=local][data-v=academia]");
  ok(await p.locator("text=Leg press").count() > 0, "treino de academia abre"); await t.foto("6-treino");
  await t.semRolagem("treino");
  await t.fechar();
})();
