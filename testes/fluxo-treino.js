// Tela Treino.
const { abrir, ok, estadoBase } = require("./apoio");
(async () => {
  const t = await abrir({ estado: estadoBase(), aba: "treino" }), p = t.p;
  await p.waitForSelector("text=Treino A"); await p.click("[data-ac=local][data-v=academia]");
  ok(await p.locator("text=Leg press").count() > 0, "treino de academia abre"); await t.foto("6-treino");
  await t.semRolagem("treino"); await t.alvosDeToque("treino");
  const txt = await p.evaluate(() => document.getElementById("tela").textContent);
  ok(/Se você tem problema no coração/.test(txt) && /Nesta semana você fez 0 de 3 treinos/.test(txt), "tela Treino fala com ela em segunda pessoa");
  ok(!/\b[Ee]la\b|Quem tem problema/.test(txt), "nenhum texto da tela Treino fala dela em terceira pessoa");
  await p.click("[data-ac=treino][data-tipo=A]");
  ok((await t.ler()).treinos.length === 1 && await p.locator("[data-ac=treino]").count() === 0, "concluir o treino continua com um toque e não deixa registrar dois no dia");
  await t.fechar();
})();
