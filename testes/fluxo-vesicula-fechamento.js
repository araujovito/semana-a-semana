// Vesícula marcada: aviso de ritmo de perda em Hoje e na Semana e sinais da vesícula ao registrar dor forte (teste Android da onda 2, I2);
// começo do relatório para a consulta com condições, datas de dor forte e marcas de 5, 7 e 10% (M6).
// Relógio fixo do apoio: sexta, 20/11/2026. Os pesos daqui são de teste, não os dela.
const { abrir, ok, d, estadoBase } = require("./apoio");
const texto = async (p, sel) => ((await p.locator(sel).count()) ? (await p.locator(sel).first().innerText()).replace(/\s+/g, " ") : "");
const comPerfil = (extra, resto) => estadoBase(Object.assign({ perfil: Object.assign({}, estadoBase().perfil, extra) }, resto || {}));
// 101 kg há 21 dias e 96,5 kg hoje: 1,5% do peso por semana, acima do limite de 1%.
const rapido = [{ id: "a", data: d(21), kg: 101, cintura: null }, { id: "b", data: d(0), kg: 96.5, cintura: null }];
const doses = [{ id: "d1", data: d(14), mg: 2.5, local: "Abdômen", obs: "" }, { id: "d2", data: d(7), mg: 2.5, local: "Coxa", obs: "" }, { id: "d3", data: d(0), mg: 2.5, local: "Abdômen", obs: "" }];
(async () => {
  /* ---------- ritmo de perda em Hoje e na Semana ---------- */
  for (const discreto of [false, true]) {
    const nome = discreto ? " (modo discreto)" : "";
    let t = await abrir({ estado: comPerfil({ vesicula: true, discreto }, { pesos: rapido, doses }) }), p = t.p;
    await p.waitForSelector("text=Proteína hoje");
    const linha = await texto(p, "[data-aviso=ritmo]");
    ok(discreto ? /Ritmo de perda: O peso caiu mais de 1% por semana nas últimas semanas\. ver/.test(linha) && !/1,5|kg/.test(linha)
      : /Ritmo de perda: Perda média de 1,5% do peso por semana, acima de 1%\. ver/.test(linha), "Hoje: uma linha com o ritmo e ver" + nome + ": " + linha);
    await t.alvosDeToque("hoje com ritmo" + nome); await t.semRolagem("hoje com ritmo" + nome); await t.foto("ritmo-hoje" + (discreto ? "-discreto" : ""));
    await p.click("[data-aviso=ritmo] [data-ac=verRitmo]");
    const folha = await texto(p, "#folha");
    ok(/Perda de peso rápida aumenta o risco de pedra na vesícula\. É um assunto para levar ao seu médico\. Se tiver dor na barriga, veja os sinais de alerta no Guia\./.test(folha) &&
      (discreto ? !/1,5|kg/.test(folha) : /Você perdeu em média 1,5% do peso por semana nos 21 dias/.test(folha)), "ver abre o aviso inteiro numa folha" + nome);
    await p.click("#folha [data-ac=ritmoPeso]");
    ok(await p.locator("#folha").isHidden() && await p.waitForSelector("#ritmo", { timeout: 3000 }).then(() => true, () => false), "da folha, Ver o peso fecha a folha e abre Diário > Peso com o aviso" + nome);
    await p.goto(p.url().replace(/#.*$/, "") + "#semana"); await p.waitForSelector(".semana-atual");
    const sem = await texto(p, ".semana-atual [data-semana-ritmo]");
    ok(discreto ? /Ritmo de perda: Nas últimas semanas, o peso caiu mais de 1% por semana/.test(sem) && !/1,5|kg/.test(sem) : /Ritmo de perda: Você perdeu em média 1,5% do peso por semana/.test(sem), "Semana: o aviso de ritmo na semana atual" + nome);
    await t.semRolagem("semana com ritmo" + nome); await t.foto("ritmo-semana" + (discreto ? "-discreto" : ""));
    await t.fechar();
  }
  // Sem vesícula: nada muda em Hoje e na Semana (o aviso continua só em Diário > Peso).
  let t = await abrir({ estado: comPerfil({ vesicula: false }, { pesos: rapido, doses }) }), p = t.p;
  await p.waitForSelector("text=Proteína hoje");
  ok(await p.locator("[data-aviso=ritmo]").count() === 0, "sem vesícula: Hoje sem linha de ritmo");
  await p.goto(p.url().replace(/#.*$/, "") + "#semana"); await p.waitForSelector(".semana-atual");
  ok(await p.locator("[data-semana-ritmo]").count() === 0, "sem vesícula: Semana sem aviso de ritmo");
  await t.fechar();

  /* ---------- dor forte em Diário > Sintomas, com vesícula: abre a folha "Dor na barriga" de Hoje, não o texto geral ---------- */
  t = await abrir({ estado: comPerfil({ vesicula: true }, { ui: { planoNutri: false, diario: "sintomas" } }), aba: "diario" }); p = t.p;
  await p.waitForSelector("form[data-form=sintoma]");
  await p.fill("form[data-form=sintoma] [name=data]", d(2)); await p.check("[name=dor]"); await p.click("form[data-form=sintoma] button:not([data-ac])");
  ok(await t.textoDialogo() === null && await p.locator("#folha").isVisible(), "vesícula: dor forte abre a folha da dor na barriga, sem o diálogo geral");
  const folhaDor = await texto(p, "#folha");
  ok(/Registrado em 18\/11\/2026: dor forte na barriga\./.test(folhaDor), "a folha diz a data do registro: " + folhaDor.slice(0, 80));
  ok(/Ligue 192 agora.*Pronto-socorro hoje.*dura mais de 1 ou 2 horas.*Febre, mesmo baixa.*Pele ou olhos amarelados, urina escura ou fezes claras.*Avise o médico no mesmo dia ou no seguinte/.test(folhaDor), "a folha traz os sinais da vesícula por urgência");
  ok(await p.locator("#folha [data-ac=registrarDor]").count() === 0, "a folha não oferece registrar de novo");
  ok((await t.ler()).sintomas.filter(x => x.dor && x.data === d(2)).length === 1, "o registro de dor forte foi salvo");
  await t.alvosDeToque("folha da dor a partir de Sintomas"); await t.foto("dor-sintomas-vesicula");
  await p.click("#folha [data-ac=fecharFolha]");
  await t.fechar();
  // Sem vesícula: continua o aviso geral no diálogo (conferido também em fluxo-peso-sintomas.js).
  t = await abrir({ estado: comPerfil({ vesicula: null }, { ui: { planoNutri: false, diario: "sintomas" } }), aba: "diario" }); p = t.p;
  await p.waitForSelector("form[data-form=sintoma]");
  await p.check("[name=dor]"); await p.click("form[data-form=sintoma] button:not([data-ac])");
  ok(/vá ao pronto-socorro hoje/.test(await t.textoDialogo() || "") && await p.locator("#folha").isHidden(), "sem vesícula: dor forte mostra o aviso geral, sem a folha");
  await t.fechar();

  /* ---------- relatório: o que o médico pergunta primeiro, logo abaixo do cabeçalho ---------- */
  const sDor = (id, n) => ({ id, data: d(n), enjoo: 0, intestino: "Normal", vomito: false, refluxo: false, tontura: false, cansaco: false, dor: true, nota: "" });
  for (const discreto of [false, true]) {
    const nome = discreto ? " (modo discreto)" : "";
    t = await abrir({ estado: comPerfil({ peso: 102, vesicula: true, aguardaCirurgia: true, figado: true, diabetes: false, discreto }, { pesos: rapido, sintomas: [sDor("s1", 3), sDor("s2", 12)], ui: { planoNutri: false, diario: "relatorio" } }), aba: "diario" }); p = t.p;
    await p.waitForSelector("#rel");
    const l = (await p.inputValue("#rel")).split("\n");
    ok(l[3] === "PARA COMEÇAR" && l[4] === "Condições informadas no perfil: pedra na vesícula: sim; aguardando cirurgia da vesícula: sim; gordura no fígado: sim; diabetes: não.", "relatório começa pelas condições do perfil" + nome + ": " + l[4]);
    ok(l[5] === "Dor forte na barriga registrada em: 08/11/2026, 17/11/2026.", "relatório traz as datas de dor forte" + nome + ": " + l[5]);
    ok(discreto ? l[6] === "Marcas de perda de peso da diretriz de fígado: perda de 5,4% do peso desde o início. 5% alcançada; 7% ainda não; 10% ainda não."
      : /^Marcas de perda de peso da diretriz de fígado: perda de 5,4% do peso desde o início \(102,0 kg -> 96,5 kg\)\. 5% \(96,9 kg\) alcançada; 7% \(94,9 kg\), faltam 1,6 kg; 10% \(91,8 kg\), faltam 4,7 kg\.$/.test(l[6]), "relatório traz as marcas de 5, 7 e 10%" + nome + ": " + l[6]);
    ok(l[7] === "" && /^TRATAMENTO|^APLICA/.test(l[8] || ""), "depois do começo vem o resto do relatório, como antes" + nome + ": " + l[8]);
    await t.fechar();
  }
})();
