// Tela Hoje: agua, refeicoes, treino e caminhada.
const { abrir, ok, estadoBase } = require("./apoio");
(async () => {
  const t = await abrir({ estado: estadoBase() }), p = t.p;
  await p.waitForSelector("text=Proteína hoje");
  await p.click("[data-ac=agua][data-ml='200']"); await p.click("[data-ac=agua][data-ml='500']");
  await p.locator("[data-mud=refeicao]").nth(0).check(); await p.locator("[data-mud=refeicao]").nth(2).check();
  const prot = await p.evaluate(() => document.querySelector(".grande").textContent);
  ok(/\d+ g/.test(prot) && parseInt(prot) > 30, "proteína soma com refeições marcadas: " + prot);
  await p.click("[data-ac=treino]"); await p.click("[data-ac=caminhada][data-min='10']");
  const e = await t.ler(), dia = Object.values(e.dias)[0];
  ok(dia.agua === 700 && dia.caminhada === 10 && e.treinos.length === 1, "água, caminhada e treino gravados");
  await t.semRolagem("hoje"); await t.alvosDeToque("hoje"); await t.foto("5-hoje");
  await t.fechar();
})();
