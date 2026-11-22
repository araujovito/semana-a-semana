// Aplicacoes: proxima aplicacao, dia habitual, datas e saltos de dose. Relogio fixo no navegador: hoje = sexta, 20/11/2026.
const { abrir, ok, estadoBase } = require("./apoio");
const HOJE = "2026-11-20";
let n = 0;
const dose = (data, mg, local) => ({ id: "d" + (++n), data, mg: mg || 2.5, local: local || "Coxa esquerda", obs: "" });
const perfil = extra => Object.assign({}, estadoBase().perfil, extra);
// Abre o app com o relogio parado ao meio-dia de `data`.
async function abrirEm(data, opcoes) {
  const t = await abrir(Object.assign({}, opcoes, { estado: undefined, agora: data + "T12:00:00" }));
  await t.semear(opcoes.estado);
  return t;
}
const texto = async (p, sel) => (await p.locator(sel).innerText()).replace(/\s+/g, " ");
(async () => {
  /* ---------- cartão da tela Hoje: uma linha por caso da auditoria ---------- */
  let t = await abrirEm(HOJE, { estado: estadoBase() }), p = t.p;
  await p.waitForSelector("text=Proteína hoje");
  ok(await p.evaluate(() => new Date().getDay() === 5 && new Date().getDate() === 20), "relógio do navegador parado na sexta, 20/11/2026");
  ok(/Quando você fizer a primeira aplicação, registre aqui/.test(await texto(p, "[data-dose]")), "sem aplicação: convite para registrar, em segunda pessoa");
  const casos = [
    ["em dia (segundas 02, 09 e 16/11)", [dose("2026-11-02"), dose("2026-11-09"), dose("2026-11-16")], "emDia", /Próxima aplicação: em 3 dias \(Seg, 23\/11\)/, false],
    ["prevista para hoje (sextas 06 e 13/11)", [dose("2026-11-06"), dose("2026-11-13")], "hoje", /Próxima aplicação: hoje/, true],
    ["última em 06/11, 14 dias: a prevista é hoje", [dose("2026-11-06")], "hoje", /Próxima aplicação: hoje/, true],
    ["atrasada 1 dia (quintas 05 e 12/11)", [dose("2026-11-05"), dose("2026-11-12")], "atrasada", /estava prevista para Qui, 19\/11, há 1 dia\. Até 4 dias depois do dia previsto, a orientação da bula é aplicar assim que lembrar e seguir o dia habitual na semana seguinte \(Qui, 26\/11\)\./, true],
    ["atrasada 4 dias (segundas 02 e 09/11)", [dose("2026-11-02"), dose("2026-11-09")], "atrasada", /estava prevista para Seg, 16\/11, há 4 dias\. Até 4 dias/, true],
    ["atrasada 5 dias (domingos 01 e 08/11)", [dose("2026-11-01"), dose("2026-11-08")], "pular", /Próxima aplicação: Dom, 22\/11\. A que estava prevista para Dom, 15\/11 passou de 4 dias: a orientação da bula é pular essa dose e aplicar a próxima no dia habitual\. Não aplicar duas doses para compensar\./, true],
    ["habitual segunda, aplicou atrasada na quinta 19/11", [dose("2026-11-02"), dose("2026-11-09"), dose("2026-11-19")], "emDia", /Próxima aplicação: em 3 dias \(Seg, 23\/11\)/, false],
    ["15 dias sem registro (última em 05/11)", [dose("2026-11-05")], "medico", /A última aplicação registrada foi em 05\/11\/2026, há 15 dias\. Depois de várias semanas sem aplicar, fale com o médico antes de retomar: pode ser preciso recomeçar numa dose menor\./, true],
    ["18 dias sem registro (última em 02/11)", [dose("2026-11-02")], "medico", /há 18 dias\. Depois de várias semanas sem aplicar, fale com o médico/, true],
    ["97 dias sem registro, 10 mg (última em 15/08)", [dose("2026-08-15", 10)], "medico", /há 97 dias\. Depois de várias semanas sem aplicar, fale com o médico antes de retomar/, true],
    ["4 registros em 10 dias", [dose("2026-11-08"), dose("2026-11-11"), dose("2026-11-14"), dose("2026-11-17")], "emDia", /Nesta dose 2ª semana/, false],
    ["registro faltando no meio (23/10, 30/10, 13/11)", [dose("2026-10-23"), dose("2026-10-30"), dose("2026-11-13")], "hoje", /Nesta dose 5ª semana .*Já são 4 semanas nesta dose: subir ou manter é assunto para a consulta\./, true],
    ["dose futura vinda de restauração, junto de uma de 13/11", [dose("2026-11-13"), dose("2026-12-25", 5)], "hoje", /Semana 2 do tratamento 2,5 mg/, true],
  ];
  for (const [nome, doses, estado, re, botao] of casos) {
    await t.semear(estadoBase({ doses })); await p.waitForSelector("[data-dose]");
    const c = await texto(p, "[data-dose]"), est = await p.locator("[data-dose]").getAttribute("data-dose");
    ok(est === estado && re.test(c), "Hoje, " + nome + ": " + c.slice(0, 150));
    ok((await p.locator("[data-dose] button").count() === 1) === botao, "Hoje, " + nome + ": botão de registrar " + (botao ? "presente" : "ausente"));
    if (estado === "medico") ok(!/mg|Próxima aplicação|Local sugerido|pular|\(\w{3}, \d\d\/\d\d\)/.test(c), "Hoje, " + nome + ": sem dose, sem data de próxima e sem local");
    if (/4 registros/.test(nome)) ok(!/4 semanas nesta dose/.test(c), "Hoje, 4 registros em 10 dias não mostram a frase das 4 semanas");
    if (/atrasada 5|15 dias|atrasada 1 dia|prevista para hoje/.test(nome)) await t.foto("tratamento-1-hoje-" + estado);
  }
  await t.semear(estadoBase({ doses: [dose("2026-12-25", 5)] })); await p.waitForSelector("[data-dose]");
  ok(await p.locator("[data-dose]").getAttribute("data-dose") === "sem", "Hoje, só com dose futura: trata como sem aplicação (antes: 'Semana -4')");
  await t.fechar();

  /* ---------- registrar: datas, salto de dose e dia habitual ---------- */
  t = await abrirEm(HOJE, { estado: estadoBase({ doses: [dose("2026-11-02"), dose("2026-11-09")] }), aba: "diario" }); p = t.p;
  await p.waitForSelector("form[data-form=dose]");
  const gravadas = async () => (await t.ler()).doses.length;
  for (const [data, nome] of [["", "vazia"], ["0026-11-20", "com ano 0026"], ["2025-11-13", "de mais de 1 ano atrás"], ["2027-01-05", "no futuro"]]) {
    await p.fill("form[data-form=dose] [name=data]", data); await p.click("form[data-form=dose] button");
    const av = await p.locator("#aviso").innerText();
    ok(await gravadas() === 2 && (data ? av === "Confira a data, inclusive o ano: o app aceita aplicações de 20/11/2025 até hoje." : /Preencha o campo: Data/.test(av)), "registrar: data " + nome + " é recusada com mensagem: " + av);
  }
  ok(!(await t.textoDialogo()), "registrar: data recusada não abre pergunta");
  // aplica atrasada 4 dias (sexta, com habitual segunda), pulando de 2,5 para 10 mg: pergunta antes de gravar
  await p.fill("form[data-form=dose] [name=data]", HOJE); await p.selectOption("form[data-form=dose] [name=mg]", "10"); await p.click("form[data-form=dose] button");
  let perg = await t.textoDialogo();
  ok(perg === "A aplicação anterior foi de 2,5 mg e esta é de 10,0 mg. As doses costumam subir de 2,5 em 2,5 mg. Salvar 10,0 mg mesmo assim?" && await gravadas() === 2, "registrar: salto de 2,5 para 10 mg pergunta antes de gravar: " + perg);
  await t.nao(); ok(await gravadas() === 2, "registrar: cancelar o salto não grava");
  await p.click("form[data-form=dose] button"); await t.sim(); ok(await gravadas() === 3, "registrar: confirmar o salto grava");
  // redução não pergunta do salto (a pergunta que aparece é a das 72 horas, por ser no mesmo dia)
  await p.selectOption("form[data-form=dose] [name=mg]", "2.5"); await p.click("form[data-form=dose] button");
  perg = await t.textoDialogo(); await t.sim();
  ok(/72 horas/.test(perg || "") && !(await t.textoDialogo()) && await gravadas() === 4, "registrar: redução de dose pergunta só das 72 horas, não do salto");
  await p.click("[data-ac=apagar] >> nth=0"); await t.sim();
  // dia habitual: o da primeira aplicação (segunda), gravado ao abrir porque o dado veio sem ele; não muda por ela ter aplicado na sexta
  ok(await p.inputValue("[data-mud=diaDose]") === "0" && (await t.ler()).diaDose === 0, "dia habitual: começa no dia da primeira aplicação (segunda) e fica gravado");
  ok(/Dá para mudar o dia da semana, desde que haja pelo menos 3 dias \(72 horas\) entre duas aplicações\./.test(await texto(p, "[data-cartao=dia-habitual]")), "dia habitual: cartão lembra a regra das 72 horas");
  await t.foto("tratamento-2-aplicacoes"); await t.semRolagem("aplicações"); await t.alvosDeToque("aplicações");
  await p.click("#abas a[data-aba=hoje]"); await p.waitForSelector("[data-dose]");
  ok(/Próxima aplicação: em 3 dias \(Seg, 23\/11\)/.test(await texto(p, "[data-dose]")), "dia habitual: aplicou atrasada na sexta e a próxima continua na segunda");
  // ela diz que mudou para quarta
  await p.click("#abas a[data-aba=diario]"); await p.waitForSelector("[data-mud=diaDose]");
  await p.selectOption("[data-mud=diaDose]", "2");
  ok((await t.ler()).diaDose === 2 && await p.inputValue("[data-mud=diaDose]") === "2" && await p.locator("#aviso").innerText() === "Dia habitual: quarta-feira.", "dia habitual: mudança gravada em E.diaDose");
  await p.click("#abas a[data-aba=hoje]"); await p.waitForSelector("[data-dose]");
  ok(/Próxima aplicação: em 5 dias \(Qua, 25\/11\)/.test(await texto(p, "[data-dose]")), "dia habitual: depois da mudança, a próxima é na quarta");
  await p.reload(); await p.waitForSelector("[data-dose]");
  ok(/Qua, 25\/11/.test(await texto(p, "[data-dose]")), "dia habitual: continua depois de fechar e abrir");
  await p.click("#abas a[data-aba=diario]"); await p.click("[data-ac=diario][data-v=relatorio]");
  ok(/Semana 3, 3 aplicações no total\. Dose atual: 10,0 mg \(1ª semana nesta dose, 1 aplicação\)\. Dia habitual: quarta-feira\./.test(await p.inputValue("#rel")), "relatório: semanas na dose, plural e dia habitual");
  await t.fechar();

  /* ---------- 320 px e modo escuro ---------- */
  for (const escuro of [false, true]) {
    const s = escuro ? "-escuro" : "";
    for (const [nome, doses] of [["atrasada", [dose("2026-11-02"), dose("2026-11-09", 2.5, "Abdômen direito")]], ["medico", [dose("2026-08-15", 10)]], ["pular", [dose("2026-11-01"), dose("2026-11-08")]]]) {
      t = await abrirEm(HOJE, { estado: estadoBase({ doses }), largura: 320, escuro }); p = t.p;
      await p.waitForSelector("[data-dose]");
      await t.semRolagem("hoje (" + nome + ") em 320 px" + s); await t.alvosDeToque("hoje (" + nome + ") em 320 px" + s); await t.foto("tratamento-3-hoje-320-" + nome + s);
      if (nome === "atrasada") {
        await p.click("#abas a[data-aba=diario]"); await p.waitForSelector("[data-cartao=dia-habitual]");
        await t.semRolagem("aplicações em 320 px" + s); await t.alvosDeToque("aplicações em 320 px" + s); await t.foto("tratamento-4-aplicacoes-320" + s);
      }
      await t.fechar();
    }
  }
})().catch(e => { console.log("FALHOU: erro no teste: " + (e && e.stack || e)); process.exit(1); });
