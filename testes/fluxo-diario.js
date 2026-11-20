// Diario: aplicacoes, peso, sintomas e relatorio.
const { abrir, ok, d, estadoBase } = require("./apoio");
(async () => {
  const hoje = d(0);
  const t = await abrir({ estado: estadoBase({ treinos: [{ id: "t1", data: hoje, tipo: "A", local: "casa" }], dias: { [hoje]: { enjoo: false, comido: [{ q: 1 }, null, { q: 1 }], agua: 700, protExtra: 0, caminhada: 10 } } }), aba: "diario" }), p = t.p;
  await p.waitForSelector("form[data-form=dose]");
  for (const n of [28, 21, 14, 7]) { await p.fill("form[data-form=dose] [name=data]", d(n)); await p.click("form[data-form=dose] button"); }
  ok(await p.locator("table tr").count() === 5, "4 aplicações no histórico");
  const locais = (await t.ler()).doses.map(x => x.local);
  ok(new Set(locais).size === 4, "local sugerido roda a cada aplicação: " + locais.join(" | "));
  await p.click("[data-ac=diario][data-v=peso]");
  for (const [n, kg] of [[21, "94"], [14, "93,1"], [7, "92,2"], [0, "91,5"]]) { await p.fill("[name=data]", d(n)); await p.fill("[name=kg]", kg); await p.fill("[name=cintura]", "100"); await p.click("form[data-form=peso] button"); }
  ok(await p.locator("svg.graf circle").count() === 5, "gráfico de peso com 5 pontos"); await t.foto("4-peso");
  await p.click("[data-ac=diario][data-v=sintomas]"); await p.selectOption("[name=enjoo]", "2"); await p.check("[name=refluxo]"); await p.fill("[name=nota]", "pior no dia seguinte"); await p.click("form[data-form=sintoma] button");
  await p.click("[data-ac=diario][data-v=relatorio]"); const rel = await p.inputValue("#rel"); console.log("-----\n" + rel + "\n-----");
  ok(/Semana 5/.test(rel) && /91,5 kg/.test(rel) && /Treinos de força: 1/.test(rel), "relatório traz dose, peso e treino");
  ok(/Média de proteína: \d+ g/.test(rel) && /Caminhada: 10 minutos/.test(rel), "relatório traz proteína e caminhada");
  await t.semRolagem("diário"); await t.alvosDeToque("diário");
  await p.click("#abas a[data-aba=hoje]"); await p.waitForSelector("text=Próxima aplicação");
  ok(await p.locator("text=Próxima aplicação").count() === 1, "Hoje mostra a próxima aplicação");
  await t.fechar();
})();
