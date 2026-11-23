// Plano da nutricionista: ligado por padrão, escolher a opção em Hoje, marcar quanto comeu, o painel reflete,
// a tela Plano mostra a faixa dela como referência, e o interruptor desliga sem apagar o que já foi marcado.
const { abrir, ok, d, estadoBase } = require("./apoio");
const perto = (a, b) => Math.abs(a - b) < 0.01;
const opcao = (i, nome) => ".refeicao[data-i='" + i + "'] label.opcao:has-text('" + nome + "')";
(async () => {
  // estado sem ui.planoNutri, com puPerguntas: é o padrão de quem instala e responde o primeiro uso com "Não sei" (perfil antigo sem resposta: M1, em fluxo-perfil.js)
  const t = await abrir({ estado: estadoBase({ ui: { puPerguntas: true } }), largura: 320 }), p = t.p;
  const consumo = () => p.evaluate(x => { const c = consumoDoDia(x); return { prot: c.comida.prot, kcal: c.comida.kcal, refeicoes: c.refeicoes }; }, d(0));
  const opc = (i, o) => p.evaluate(x => { const s = pnTotalDaOpcao(PN_REFEICOES[x[0]].opcoes[x[1]]); return { prot: s.prot, kcal: s.kcal }; }, [i, o]);
  const topo = async v => parseInt((await p.locator("#tela [data-v=" + v + "]").first().textContent()).replace(/\./g, ""), 10);

  await p.waitForSelector("text=Plano da sua nutricionista");
  ok(await p.locator(".refeicao").count() === 5 && await p.locator("select[data-mud=pnOpcao]").count() === 5, "Hoje mostra as 5 refeições do plano dela, cada uma com a escolha de opção");
  ok(/Café da manhã · 7h30/.test(await p.locator(".refeicao[data-i='0'] .tipo").textContent()), "a refeição mostra o horário do plano");
  ok(/plano da nutricionista: /.test(await p.locator(".hoje-topo .hoje-prot").textContent()) &&
    !/meta \d/.test(await p.locator(".hoje-topo .hoje-prot").textContent()), "a proteína de Hoje usa o alvo do plano da nutricionista, não a meta do app");

  // escolher a opção 2 do café e marcar tudo
  await p.selectOption("select[data-mud=pnOpcao][data-i='0']", "1");
  ok(/iogurte natural proteico/.test(await p.locator(".refeicao[data-i='0'] .tit").textContent()), "escolher a opção troca o que aparece no cartão");
  await p.click(opcao(0, "comi tudo"));
  const cafe = await opc(0, 1);
  let c = await consumo();
  ok(perto(c.prot, cafe.prot) && perto(c.kcal, cafe.kcal), "comi tudo conta a opção escolhida");
  ok(await topo("prot") === Math.round(cafe.prot), "o topo de Hoje mostra a proteína marcada");
  // almoço com peixe, metade
  await p.selectOption("select[data-mud=pnOpcao][data-i='1']", "1");
  await p.click(opcao(1, "metade"));
  const almoco = await opc(1, 1);
  c = await consumo();
  ok(perto(c.prot, cafe.prot + almoco.prot / 2), "metade do almoço com peixe conta 50%");
  const salvo = (await t.ler()).dias[d(0)];
  ok(salvo.comidoNutri[1].op === 1 && Array.isArray(salvo.comidoNutri[1].itens) && salvo.comido.length === 0, "o registro guarda a opção e a foto da porção, separado do cardápio do app");
  await t.semRolagem("hoje com o plano da nutricionista em 320 px"); await t.alvosDeToque("hoje com o plano da nutricionista em 320 px");
  await t.foto("planonutri-1-hoje");

  // o painel reflete
  await p.evaluate(() => { location.hash = "#painel"; });
  await p.waitForSelector(".painel-anel");
  ok(parseInt(await p.locator("[data-painel=prot] [data-v=prot]").textContent(), 10) === Math.round(cafe.prot + almoco.prot / 2), "o painel mostra a proteína marcada no plano dela");
  // Alvo único de proteína: o mesmo em Hoje, no Painel e no relatório (alvoProteina), aqui o começo da faixa do plano dela.
  const alvo = await p.evaluate(() => { const a = alvoProteina(), f = pnFaixaDia(); return { g: a.g, min: Math.round(f.min.prot), max: Math.round(f.max.prot), nutri: a.nutri }; });
  const falta = Math.max(0, Math.round(alvo.g - (cafe.prot + almoco.prot / 2)));
  ok(alvo.nutri && alvo.g === alvo.min && (await p.locator("[data-painel=falta]").textContent()).indexOf("Faltam " + falta + " g") === 0, "Painel: falta medida contra o alvo do plano dela (" + alvo.g + " g)");
  ok(new RegExp("plano da sua nutricionista: " + alvo.min + " a " + alvo.max + " g").test(await p.locator(".painel-hoje").textContent()), "Painel: faixa do plano dela");
  ok(/alvo do plano da nutricionista: \d+ g/.test(await p.evaluate(() => relAlimentacao(mais(hoje(), -29)).join("\n"))) &&
    new RegExp("alvo do plano da nutricionista: " + alvo.g + " g").test(await p.evaluate(() => relAlimentacao(mais(hoje(), -29)).join("\n"))), "relatório: o mesmo alvo do plano dela");
  await p.evaluate(() => { location.hash = "#hoje"; }); await p.waitForSelector(".hoje-topo");
  ok((await p.locator(".hoje-topo .hoje-falta").innerText()).trim() === "Faltam " + falta + " g", "Hoje: a mesma falta do Painel");
  await p.evaluate(() => { location.hash = "#painel"; }); await p.waitForSelector(".painel-anel");

  // tela Plano: faixa dela como referência, sem as metas do app
  await p.evaluate(() => { location.hash = "#plano"; });
  await p.waitForSelector("text=Metas diárias: plano da sua nutricionista");
  const cartao = await p.locator(".pn-plano").textContent();
  ok(/As metas são as da sua nutricionista/.test(cartao) && /04\/11\/2026/.test(cartao) && /kcal/.test(cartao), "Plano mostra a faixa de energia e proteína do plano dela e a frase das metas");
  ok(await p.locator("h2", { hasText: /^Metas diárias$/ }).count() === 0, "as metas calculadas pelo app não aparecem");
  ok(await p.locator("[data-mud=pnUsar]").isChecked(), "o interruptor vem ligado");
  await t.semRolagem("plano com o plano da nutricionista"); await t.alvosDeToque("plano com o plano da nutricionista");
  await t.foto("planonutri-2-plano");

  // desligar: metas do app voltam; o dia que já tem marca continua contando o que foi marcado
  await p.click("[data-mud=pnUsar]");
  await p.waitForSelector("h2:text-is('Metas diárias')");
  ok((await t.ler()).ui.planoNutri === false, "desligar fica gravado");
  c = await consumo();
  ok(perto(c.prot, cafe.prot + almoco.prot / 2), "desligar não apaga o que já foi marcado hoje");
  await p.evaluate(() => { location.hash = "#hoje"; });
  await p.waitForSelector("text=Proteína hoje");
  ok(/meta \d/.test(await p.locator(".hoje-topo .hoje-prot").textContent()), "desligado, o topo de Hoje volta à meta do app");
  await p.click("[data-ac=diaVer][data-n='-1']");
  ok(await p.locator("select[data-mud=pnOpcao]").count() === 0 && /Refeições de/.test(await p.locator("#tela").textContent()), "desligado, um dia sem marca mostra o cardápio do app");
  await t.fechar();
})();
