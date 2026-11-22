// Tela Hoje: agua, registro do que comeu (tudo, metade, um pouco, nada), dia de enjoo, dias anteriores, avisos, treino e caminhada.
const { abrir, ok, d, estadoBase } = require("./apoio");
const perto = (a, b) => Math.abs(a - b) < 0.01;
const opcao = (i, nome) => ".refeicao[data-i='" + i + "'] label.opcao:has-text('" + nome + "')";
const diaVazio = extra => Object.assign({ enjoo: false, comido: [], agua: 0, protExtra: 0, caminhada: 0 }, extra || {});
(async () => {
  let t = await abrir({ estado: estadoBase() }), p = t.p;
  const consumo = data => p.evaluate(x => { const c = consumoDoDia(x); return { prot: c.comida.prot, kcal: c.comida.kcal, refeicoes: c.refeicoes, nada: c.nada }; }, data);
  const plano = () => p.evaluate(() => planoDaData(dataSel()).refeicoes.map(r => { const s = somarItens(r.itens); return { prot: s.prot, kcal: s.kcal }; }));
  const topo = async v => parseInt((await p.locator("[data-v=" + v + "]").textContent()).replace(/\./g, ""), 10);
  await p.waitForSelector("text=Proteína hoje");
  ok(await p.locator(".refeicao label.opcao").count() === 20, "cada uma das 5 refeições tem as quatro opções");
  await t.foto("hoje-1-vazio");

  // agua
  await p.click("[data-ac=agua][data-ml='200']"); await p.click("[data-ac=agua][data-ml='500']");

  // tudo, metade, um pouco e nada mudam proteina e energia na proporcao
  const pl = await plano();
  await p.click(opcao(0, "comi tudo"));
  let c = await consumo(d(0));
  ok(perto(c.prot, pl[0].prot) && perto(c.kcal, pl[0].kcal), "comi tudo conta a refeição inteira");
  ok(await topo("prot") === Math.round(pl[0].prot) && await topo("kcal") === Math.round(pl[0].kcal), "o cartão do topo mostra proteína e energia do que foi comido");
  await p.click(opcao(2, "metade"));
  c = await consumo(d(0));
  ok(perto(c.prot, pl[0].prot + pl[2].prot / 2) && perto(c.kcal, pl[0].kcal + pl[2].kcal / 2), "metade conta 50%");
  ok(/Contou: /.test(await p.locator(".refeicao[data-i='2'] .contou").textContent()), "a refeição pela metade mostra quanto contou");
  await p.click(opcao(2, "um pouco"));
  c = await consumo(d(0));
  ok(perto(c.prot, pl[0].prot + pl[2].prot / 4), "um pouco conta 25% e substitui a metade");
  await p.click(opcao(3, "nada"));
  c = await consumo(d(0));
  ok(perto(c.prot, pl[0].prot + pl[2].prot / 4) && c.refeicoes === 3 && c.nada === 1, "nada é registro e não soma");
  const cores = await p.evaluate(() => [...document.querySelectorAll("label.opcao.ativa")].map(el => getComputedStyle(el).backgroundColor));
  ok(cores.length === 3 && new Set(cores).size === 1, "nada tem a mesma cor das outras opções marcadas");
  ok(await p.locator("[data-mud=refeicao]:checked").count() === 3, "uma opção marcada por refeição registrada");
  await p.click(opcao(3, "nada"));
  ok((await t.ler()).dias[d(0)].comido[3] === null && await p.locator("[data-mud=refeicao]:checked").count() === 2, "tocar de novo na opção marcada desfaz");
  ok(Array.isArray((await t.ler()).dias[d(0)].comido[0].itens), "a porção do plano fica gravada junto com a marca");

  // proteina avulsa
  await p.click("[data-ac=prot][data-g='10']");
  ok(perto((await consumo(d(0))).prot, pl[0].prot + pl[2].prot / 4 + 10), "+10 g de proteína fora do plano soma");
  await p.click("[data-ac=prot][data-g='-10']");
  ok((await t.ler()).dias[d(0)].protExtra === 0 && await p.locator("[data-ac=prot][data-g='-10']").count() === 0, "− 10 g desfaz e some");

  // vitaminas e minerais do dia
  ok(await p.locator(".micro-dia").count() === 0, "vitaminas e minerais começam fechados");
  await p.click("[data-ac=microDia]");
  ok(await p.locator(".micro-dia .nutri").count() === 13, "o bloco abre com os 13 micronutrientes do que foi comido");
  await p.click(opcao(1, "comi tudo"));
  ok(await p.locator(".micro-dia .nutri").count() === 13, "o bloco continua aberto depois de marcar uma refeição");
  await t.foto("hoje-2-marcado-micro");
  await p.click("[data-ac=microDia]");

  // dia de enjoo: liga e desliga sem perder marcas
  const antes = await consumo(d(0));
  await p.click("[data-ac=enjoo]");
  await p.waitForSelector("text=Voltar ao normal");
  ok(await p.locator("[data-mud=refeicao]:checked").count() === 0 && (await consumo(d(0))).refeicoes === 0, "dia de enjoo mostra o outro cardápio, sem marcas");
  await p.click(opcao(0, "metade"));
  await p.click("[data-ac=enjoo]");
  await p.waitForSelector("text=Dia de enjoo");
  c = await consumo(d(0));
  ok(perto(c.prot, antes.prot) && c.refeicoes === 3 && await p.locator("[data-mud=refeicao]:checked").count() === 3, "desligar o enjoo traz de volta tudo o que estava marcado");
  await p.click("[data-ac=enjoo]");
  ok(await p.locator(".refeicao[data-i='0'][data-q='0.5']").count() === 1, "ligar de novo traz a marca feita no dia de enjoo");
  await p.click("[data-ac=enjoo]");

  // treino e caminhada
  await p.click("[data-ac=treino]"); await p.click("[data-ac=caminhada][data-min='10']");
  let e = await t.ler();
  ok(e.dias[d(0)].agua === 700 && e.dias[d(0)].caminhada === 10 && e.treinos.length === 1, "água, caminhada e treino gravados");
  ok(await p.locator("[data-ac=ir][data-para=plano]").count() === 1, "botão Ver porções e nutrientes continua");
  await t.semRolagem("hoje"); await t.alvosDeToque("hoje");

  // dias anteriores
  ok(await p.locator("[data-ac=diaVer][data-n='1']").isDisabled(), "em hoje, dia seguinte está desativado");
  ok(await p.locator(".faixa-dia").count() === 0 && (await p.locator(".dia-rotulo strong").textContent()) === "Hoje", "a barra de dias mostra Hoje");
  await p.click("[data-ac=diaVer][data-n='-1']");
  ok((await p.locator(".dia-rotulo strong").textContent()) === "Ontem" && /Você está vendo/.test(await p.locator(".faixa-dia").textContent()), "dia anterior mostra Ontem e a faixa de que não é hoje");
  ok(await p.locator("[data-ac=treino]").count() === 0 && await p.locator("text=Registrar >> visible=true").count() === 0 && await p.locator("[data-ac=ir][data-sub]").count() === 0, "em dia passado não há tratamento, treino nem atalhos de registrar");
  ok(await p.locator("[data-mud=refeicao]:checked").count() === 0, "ontem começa sem marcas");
  await p.click(opcao(4, "comi tudo")); await p.click("[data-ac=agua][data-ml='500']"); await p.click("[data-ac=caminhada][data-min='10']"); await p.click("[data-ac=caminhada][data-min='10']");
  e = await t.ler();
  ok(e.dias[d(1)].comido[4].q === 1 && e.dias[d(1)].agua === 500 && e.dias[d(1)].caminhada === 20, "refeição, água e caminhada gravadas em ontem");
  ok(e.dias[d(1)].comido.slice(0, 4).every(x => x === null), "as refeições não marcadas ficam como não registradas");
  ok(e.dias[d(0)].agua === 700 && e.dias[d(0)].caminhada === 10 && !e.dias[d(0)].comido[4], "o registro de hoje não mudou");
  await p.click("[data-ac=enjoo]");
  e = await t.ler();
  ok(e.dias[d(1)].enjoo === true && !e.dias[d(0)].enjoo, "dia de enjoo vale para o dia selecionado");
  await p.click("[data-ac=enjoo]");
  await t.semRolagem("ontem"); await t.alvosDeToque("ontem"); await t.foto("hoje-3-ontem");
  await p.click("[data-ac=diaVer][data-n='-1']");
  ok(/^(seg|ter|qua|qui|sex|sáb|dom), \d\d\/\d\d$/.test(await p.locator(".dia-rotulo strong").textContent()), "anteontem aparece como dia da semana e data");
  await p.click("[data-ac=diaVer][data-n='1']");
  ok((await p.locator(".dia-rotulo strong").textContent()) === "Ontem", "dia seguinte avança um dia");
  await p.click("[data-ac=diaVer][data-n='-1']");
  await p.click("[data-ac=diaVer][data-n='0']");
  ok((await p.locator(".dia-rotulo strong").textContent()) === "Hoje" && await p.locator(".faixa-dia").count() === 0, "Voltar para hoje volta de qualquer dia");
  await p.click("[data-ac=diaVer][data-n='-1']");
  await p.reload(); await p.waitForSelector("text=Proteína hoje");
  ok((await p.locator(".dia-rotulo strong").textContent()) === "Hoje", "ao reabrir o app, a tela volta para hoje");
  for (let i = 0; i < 62; i++) if (!(await p.locator("[data-ac=diaVer][data-n='-1']").isDisabled())) await p.click("[data-ac=diaVer][data-n='-1']");
  ok(await p.evaluate(() => entre(dataSel(), hoje())) === 60 && await p.locator("[data-ac=diaVer][data-n='-1']").isDisabled(), "dá para voltar até 60 dias");

  // relatorio usa o que foi comido
  await p.evaluate(() => { E.ui.diario = "relatorio"; location.hash = "diario"; });
  await p.waitForSelector("#rel");
  const rel = await p.locator("#rel").inputValue();
  ok(/Dias com registro do que foi comido: 2 de 30\. Média de proteína: \d+ g \(meta \d+ g\)\. Média de energia: [\d.]+ kcal/.test(rel), "relatório traz a média do que foi comido");
  ok(/Refeições marcadas como "nada": 0 de 4 registradas/.test(rel) && /Água: média de 0,6 L em 2 dias/.test(rel) && /Média do que foi comido/.test(rel) && /estimativa/.test(rel), "relatório traz nada, água e micronutrientes como estimativa");
  await t.fechar();

  // aviso neutro de comer pouco: os tres gatilhos, e no maximo uma vez por dia
  const enjoo3 = { [d(2)]: diaVazio({ enjoo: true }), [d(1)]: diaVazio({ enjoo: true }), [d(0)]: diaVazio({ enjoo: true }) };
  // (com uma aplicacao registrada, para o cartao de tratamento, que e de outra area, nao trazer o texto de boas-vindas)
  t = await abrir({ estado: estadoBase({ dias: enjoo3, doses: [{ id: "x", data: d(1), mg: 2.5, local: "Coxa esquerda", obs: "" }] }) }); p = t.p;
  await p.waitForSelector("text=Proteína hoje");
  ok(/3º dia seguido com o dia de enjoo ligado/.test(await p.locator(".aviso-pouco").textContent()), "3º dia seguido de enjoo mostra o aviso para falar com o médico");
  ok(!/\bela\b/i.test(await p.locator("#tela").textContent()), "a tela Hoje não fala em terceira pessoa");
  await t.foto("hoje-4-aviso-enjoo");
  await p.click("[data-ac=diaVer][data-n='-1']");
  ok(await p.locator(".aviso-pouco").count() === 0, "o aviso só aparece no dia de hoje");
  await p.click("[data-ac=diaVer][data-n='0']");
  await p.click("[data-ac=entendiPouco]");
  ok(await p.locator(".aviso-pouco").count() === 0 && (await t.ler()).ui.avisoPouco === d(0), "Entendi esconde o aviso e guarda a data");
  await p.reload(); await p.waitForSelector("text=Proteína hoje");
  ok(await p.locator(".aviso-pouco").count() === 0, "o aviso não volta no mesmo dia");
  await t.semear(estadoBase({ dias: enjoo3, ui: { avisoPouco: d(1) } })); await p.waitForSelector("text=Proteína hoje");
  ok(await p.locator(".aviso-pouco").count() === 1, "no dia seguinte o aviso volta se o motivo continua");
  await t.semear(estadoBase({ sintomas: [{ id: "a", data: d(1), enjoo: 2, vomito: true }, { id: "b", data: d(0), enjoo: 2, vomito: true }] })); await p.waitForSelector("text=Proteína hoje");
  ok(/vômito em 2 dias seguidos/.test(await p.locator(".aviso-pouco").textContent()), "vômito em 2 dias seguidos mostra o aviso");
  const umaPorDia = { [d(3)]: diaVazio({ comido: [{ q: 1 }] }), [d(2)]: diaVazio({ comido: [{ q: 0.5 }] }), [d(1)]: diaVazio({ comido: [null, { q: 1 }] }) };
  await t.semear(estadoBase({ dias: umaPorDia })); await p.waitForSelector("text=Proteína hoje");
  ok(/você marcou pouca comida/.test(await p.locator(".aviso-pouco").textContent()), "3 dias com pouca energia marcada mostram o aviso");
  await t.semear(estadoBase()); await p.waitForSelector("text=Proteína hoje");
  ok(await p.locator(".aviso-pouco").count() === 0, "sem motivo, sem aviso");
  await t.fechar();

  // perfil discreto: sem kcal na tela Hoje nem no trecho de alimentacao do relatorio
  const base = estadoBase({ dias: { [d(1)]: diaVazio({ comido: [{ q: 1 }, { q: 0.5 }, { q: 1 }] }) } }); base.perfil.discreto = true;
  t = await abrir({ estado: base }); p = t.p;
  await p.waitForSelector("text=Proteína hoje");
  await p.click(opcao(0, "metade")); await p.click("[data-ac=microDia]");
  const txt = await p.locator("#tela").textContent();
  ok(!/kcal|energia/i.test(txt) && /g de proteína/.test(txt) && /Água hoje/.test(txt), "modo discreto: tela Hoje sem kcal, com proteína e água");
  ok(await p.locator(".micro-dia .nutri").count() === 13, "modo discreto: micronutrientes continuam");
  ok(!/kcal|energia/i.test(await p.evaluate(() => relAlimentacao(mais(hoje(), -29)).join("\n"))), "modo discreto: relatório de alimentação sem kcal");
  await t.foto("hoje-5-discreto");
  await t.fechar();

  // 320 px
  const marcado = estadoBase({ dias: Object.assign({ [d(0)]: diaVazio() }, enjoo3) }); marcado.dias[d(0)] = diaVazio({ enjoo: true, protExtra: 10 });
  t = await abrir({ estado: marcado, largura: 320 }); p = t.p;
  await p.waitForSelector("text=Proteína hoje");
  await p.click(opcao(0, "comi tudo")); await p.click(opcao(1, "um pouco")); await p.click(opcao(2, "nada")); await p.click("[data-ac=microDia]");
  const baixos = await p.evaluate(() => [...document.querySelectorAll("label.opcao")].filter(el => { const r = el.getBoundingClientRect(); return r.height < 44 || r.width < 44; }).length);
  ok(baixos === 0, "as quatro opções têm 44 px ou mais em 320 px");
  await t.semRolagem("hoje em 320 px"); await t.alvosDeToque("hoje em 320 px"); await t.foto("hoje-6-320");
  await p.click("[data-ac=diaVer][data-n='-1']"); await p.click("[data-ac=diaVer][data-n='-1']"); await p.click("[data-ac=diaVer][data-n='-1']");
  await t.semRolagem("dia passado em 320 px"); await t.alvosDeToque("dia passado em 320 px"); await t.foto("hoje-7-320-dia-passado");
  await t.fechar();

  // modo escuro
  t = await abrir({ estado: estadoBase({ dias: enjoo3 }), escuro: true }); p = t.p;
  await p.waitForSelector("text=Proteína hoje");
  await p.click(opcao(0, "comi tudo")); await p.click(opcao(1, "metade")); await p.click(opcao(2, "nada")); await p.click("[data-ac=microDia]");
  ok(await p.locator("label.opcao.ativa").count() === 3, "modo escuro abre e marca sem erro");
  await t.foto("hoje-8-escuro");
  await p.click("[data-ac=diaVer][data-n='-1']"); await t.foto("hoje-9-escuro-ontem");
  await t.fechar();
})();
