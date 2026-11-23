// Dia de enjoo com o plano da nutricionista ligado: ligar no meio do dia, depois de marcar refeições do plano dela, e desligar
// de novo. Nada se perde, o total do dia junta as duas listas, e Hoje, Painel, Semana e relatório contam o mesmo número.
const { abrir, ok, d, estadoBase } = require("./apoio");
const perto = (a, b) => Math.abs(a - b) < 0.01;
const opcao = (i, nome) => ".refeicao[data-i='" + i + "'] label.opcao:has-text('" + nome + "')";
(async () => {
  const est = estadoBase({ ui: {}, doses: [{ id: "x", data: d(3), mg: 2.5, local: "Coxa esquerda", obs: "" }],
    // ontem: só o enjoo ligado e +10 g avulsos, sem refeição marcada (calorias desconhecidas, não zero)
    dias: { [d(1)]: { enjoo: true, comido: [], comidoEnjoo: [], comidoNutri: [], agua: 0, protExtra: 10, caminhada: 0 } } });
  est.perfil.vesicula = true; est.perfil.figado = true;
  const t = await abrir({ estado: est, largura: 440 }), p = t.p;
  const total = () => p.evaluate(x => consumoDoDia(x).total.prot, d(0));
  const ir = async (hash, sel) => { await p.evaluate(h => { location.hash = h; }, hash); await p.waitForSelector(sel); };
  const rel = () => p.evaluate(() => relAlimentacao(mais(hoje(), -29)).join("\n"));
  const topo = async () => parseInt(await p.locator(".hoje-topo [data-v=prot]").textContent(), 10);

  await p.waitForSelector("text=Plano da sua nutricionista");
  await p.click(opcao(0, "comi tudo")); await p.click(opcao(1, "metade"));
  await p.click("[data-ac=prot][data-g='10']"); await p.click(".agua-dia [data-ac=agua][data-ml='500']");
  const p0 = await total();
  ok(p0 > 10, "plano dela marcado: café inteiro, metade do almoço e +10 g (" + Math.round(p0) + " g)");

  // ligar o enjoo depois de comer
  await p.click("[data-ac=enjoo]"); await p.waitForSelector("text=Refeições leves de hoje");
  ok(perto(await total(), p0) && await topo() === Math.round(p0), "ligar o enjoo não tira do total o que já foi comido");
  ok(/Também conta no total do dia: 2 refeições marcadas no plano da nutricionista/.test(await p.locator(".hoje-marcar [data-outro]").innerText()), "Hoje avisa que as 2 refeições do plano dela continuam no total");
  ok(await p.locator("[data-mud=refeicao]:checked").count() === 0 && await p.locator(".hoje-marcar .hoje-porque").count() === 0, "refeições leves aparecem sem marca");
  ok(/Dia leve/.test(await p.locator(".hoje-topo .hoje-falta").innerText()), "Hoje não cobra a falta no dia de enjoo");
  await p.click(opcao(4, "comi tudo"));
  const leve = await p.evaluate(() => somarItens(planoDoDia(7).refeicoes[4].itens).prot), p1 = await total();
  ok(perto(p1, p0 + leve), "a refeição leve soma ao que veio do plano dela");
  await t.semRolagem("Hoje com o enjoo ligado depois do plano dela"); await t.foto("enjoo-nutri-1-hoje");

  // Painel, Semana e relatório contam o mesmo
  await ir("#painel", ".painel-anel");
  ok(parseInt(await p.locator("[data-painel=prot] [data-v=prot]").textContent(), 10) === Math.round(p1), "Painel: a mesma proteína de Hoje");
  ok(/Dia leve/.test(await p.locator("[data-painel=falta]").innerText()) && !/Faltam/.test(await p.locator("[data-painel=falta]").innerText()), "Painel: no dia de enjoo não cobra a falta, como Hoje");
  await t.foto("enjoo-nutri-2-painel");
  await ir("#semana", ".semana-itens");
  const semana = await p.locator("[data-item=comida]").first().innerText();
  ok(/1 dia com o cardápio de enjoo|2 dias com o cardápio de enjoo/.test(await p.locator("[data-item=enjoo]").first().innerText()), "Semana: dias de enjoo contados");
  ok(!/energia média de 0 kcal/.test(semana) && /kcal \(em 1 dia com refeição marcada\), em 2 dias com registro/.test(semana), "Semana: dia só com proteína avulsa não vira 0 kcal (" + semana.replace(/\n/g, " ") + ")");
  const r = await rel();
  ok(/Dias de enjoo: 2\./.test(r), "relatório: 2 dias de enjoo");
  const kcalHoje = await p.evaluate(x => consumoDoDia(x).total.kcal, d(0));
  ok(new RegExp("Média de energia: " + Math.round(kcalHoje).toLocaleString("pt-BR") + " kcal").test(r), "relatório: energia só dos dias com refeição marcada, sem o dia de 0 kcal");
  ok(new RegExp("Média de proteína: " + Math.round((p1 + 10) / 2) + " g").test(r), "relatório: proteína média dos 2 dias, com o dia só de avulsa");

  // desligar: as marcas do plano dela voltam à tela e a refeição leve continua no total
  await ir("#hoje", ".hoje-marcar");
  await p.click("[data-ac=enjoo]"); await p.waitForSelector("text=Plano da sua nutricionista");
  ok(await p.locator("[data-mud=refeicao]:checked").count() === 2 && perto(await total(), p1), "desligar traz as marcas do plano dela e mantém o total");
  ok(/1 refeição marcada nas refeições leves/.test(await p.locator(".hoje-marcar [data-outro]").innerText()), "Hoje avisa que a refeição leve continua no total");
  const s = (await t.ler()).dias[d(0)];
  ok(s.comidoNutri[0].q === 1 && s.comidoNutri[1].q === 0.5 && s.comidoEnjoo[4].q === 1 && s.agua === 500 && s.protExtra === 10 && s.enjoo === false, "nada se perdeu no registro do dia");
  await t.foto("enjoo-nutri-3-desligado");
  await t.fechar();
})();
