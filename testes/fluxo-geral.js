// Guia e o que vale para todas as telas.
const { abrir, ok, estadoBase } = require("./apoio");
(async () => {
  const t = await abrir({ estado: estadoBase(), aba: "guia" }), p = t.p;
  await p.waitForSelector("text=Como o remédio age"); ok(await p.locator("details").count() >= 15, "guia com os artigos"); await t.foto("7-guia");
  await t.semRolagem("guia"); await t.alvosDeToque("guia");
  await t.fechar();
})();
