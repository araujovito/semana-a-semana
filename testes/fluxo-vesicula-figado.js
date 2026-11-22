// Perguntas de vesícula, fígado e cirurgia no Perfil, e os cartões que dependem delas (Hoje, Plano, Perfil, Peso).
// Relógio fixo do apoio: sexta, 20/11/2026. Os pesos daqui são de teste, não os dela.
const { abrir, ok, d, estadoBase } = require("./apoio");
const texto = async (p, sel) => ((await p.locator(sel).count()) ? (await p.locator(sel).first().innerText()).replace(/\s+/g, " ") : "");
const tela = p => texto(p, "#tela");
const comPerfil = (extra, resto) => estadoBase(Object.assign({ perfil: Object.assign({}, estadoBase().perfil, extra) }, resto || {}));
(async () => {
  /* ---------- perguntas no Perfil ---------- */
  let t = await abrir({ estado: estadoBase(), aba: "perfil" }), p = t.p;
  await p.waitForSelector("form[data-form=perfil]");
  ok(!(await p.locator("#p-cirurgia").isVisible()), "pergunta da cirurgia escondida enquanto a vesícula não está marcada");
  await p.click("form[data-form=perfil] summary >> text=Saúde");
  ok(await p.locator("[name=vesicula]").isVisible() && await p.locator("[name=figado]").isVisible(), "bloco Saúde traz as perguntas de vesícula e fígado");
  await p.selectOption("[name=vesicula]", "sim");
  ok(await p.locator("#p-cirurgia").isVisible(), "com pedra na vesícula marcada, aparece a pergunta da cirurgia");
  await p.selectOption("[name=aguardaCirurgia]", "sim"); await p.selectOption("[name=figado]", "sim");
  await p.click("form[data-form=perfil] button:has-text('Salvar')");
  let e = await t.ler();
  ok(e.perfil.vesicula === true && e.perfil.figado === true && e.perfil.aguardaCirurgia === true, "respostas sim gravadas no perfil");
  ok(/2 de 5 respondidas/.test(await tela(p)), "contador do bloco Saúde conta as perguntas novas");
  await p.click("form[data-form=perfil] summary >> text=Saúde");
  await p.selectOption("[name=vesicula]", "");
  ok(!(await p.locator("#p-cirurgia").isVisible()), "prefiro não responder: a pergunta da cirurgia some");
  await p.selectOption("[name=figado]", "nao");
  await p.click("form[data-form=perfil] button:has-text('Salvar')");
  e = await t.ler();
  ok(e.perfil.vesicula === null && e.perfil.aguardaCirurgia === null && e.perfil.figado === false, "prefiro não responder vira null e leva junto a cirurgia; não vira false");
  await t.fechar();

  /* ---------- cartão de vesícula: sem resposta não aparece; marcada aparece em Hoje, Plano e Perfil ---------- */
  t = await abrir({ estado: estadoBase() }); p = t.p;
  await p.waitForSelector("text=Proteína hoje");
  ok(await p.locator("[data-aviso=vesicula]").count() === 0, "sem resposta: nenhum cartão de vesícula na tela Hoje");
  await p.click("#btn-perfil"); await p.waitForSelector("form[data-form=perfil]");
  ok(await p.locator("[data-aviso=vesicula]").count() === 0, "sem resposta: nenhum cartão de vesícula no Perfil");
  await t.fechar();
  for (const discreto of [false, true]) {
    const nome = discreto ? " (sem calorias)" : "";
    t = await abrir({ estado: comPerfil({ vesicula: true, discreto }) }); p = t.p;
    await p.waitForSelector("text=Proteína hoje");
    // Em Hoje o cartão é curto (2 linhas e um botão); o completo (bula, sinais, cirurgia) fica no Plano e no Perfil, conferido abaixo.
    const curto = await texto(p, "[data-aviso=vesicula]");
    ok(/Pedra na vesícula/.test(curto) && curto.split(" ").length <= 25 && await p.locator("[data-aviso=vesicula] button").count() === 1, "em Hoje o cartão da vesícula fica curto: 2 linhas e um botão" + nome);
    ok(await p.locator("#tela [data-v=kcal]").count() === 0, "Hoje sem calorias, com ou sem o modo discreto" + nome);
    await t.foto("vesicula-hoje" + (discreto ? "-discreto" : "")); await t.alvosDeToque("hoje com vesícula" + nome); await t.semRolagem("hoje com vesícula" + nome);
    // O botão abre os sinais divididos em 192, pronto-socorro hoje e avisar o médico, sem registrar nada; dali, o Guia.
    await p.click("[data-aviso=vesicula] [data-ac=sinaisDor]");
    const folha = (await p.locator("#folha").innerText()).replace(/\s+/g, " ");
    ok(/Ligue 192 agora.*Pronto-socorro hoje.*dura mais de 1 ou 2 horas.*Avise o médico no mesmo dia ou no seguinte.*passou sozinha/.test(folha) && (await t.ler()).sintomas.length === 0, "botão do cartão abre os sinais por urgência, sem registrar dor" + nome);
    await p.click("#folha [data-ac=sinaisGuia]");
    ok(await p.waitForSelector("#tela summary:has-text('Sinais de alerta')", { timeout: 3000 }).then(() => true, () => false) &&
      /dura mais de 1 ou 2 horas.*passou sozinha/.test(await tela(p)), "dos sinais, um toque abre o Guia com os sinais de alerta" + nome);
    await p.click("#btn-perfil"); await p.waitForSelector("form[data-form=perfil]");
    ok(/Pedra na vesícula.*bula da tirzepatida.*conte ao seu médico que você tem pedra.*Pronto-socorro hoje se a dor durar mais de 1 ou 2 horas.*Ligue 192.*Avise o médico/.test(await texto(p, "[data-aviso=vesicula]")), "cartão completo da vesícula no Perfil" + nome);
    await p.click("#abas [data-aba=comer]");
    await p.waitForSelector("text=Metas diárias");
    ok(await p.locator("[data-aviso=vesicula]").count() === 1, "vesícula marcada: cartão no Plano" + nome);
    await p.click("#btn-perfil"); await p.waitForSelector("form[data-form=perfil]");
    ok(await p.locator("[data-aviso=vesicula]").count() === 1, "vesícula marcada: cartão no Perfil" + nome);
    await t.fechar();
  }

  /* ---------- ritmo de perda com pedra na vesícula (Diário > Peso): limite de 1%, encaminha aos sinais de alerta ---------- */
  // 100 -> 95,5 kg em 21 dias: 1,5% por semana. 100 -> 98,5 kg: 0,5% por semana, sem aviso mesmo com vesícula.
  const P = (n, kg) => ({ id: "p" + n, data: d(n), kg, cintura: null });
  const rapido = { pesos: [P(21, 100), P(14, 98.5), P(7, 97), P(0, 95.5)], ui: { diario: "peso" } };
  t = await abrir({ estado: comPerfil({ peso: 100, vesicula: true }, { pesos: [P(21, 100), P(0, 98.5)], ui: { diario: "peso" } }), aba: "diario" }); p = t.p;
  await p.waitForSelector("form[data-form=peso]");
  ok(await p.locator("#ritmo").count() === 0, "com vesícula, 0,5% por semana não gera aviso");
  await t.fechar();
  t = await abrir({ estado: comPerfil({ peso: 100 }, rapido), aba: "diario" }); p = t.p;
  await p.waitForSelector("form[data-form=peso]");
  ok(!/sinais de alerta/.test(await texto(p, "#ritmo")), "sem vesícula: aviso de ritmo como antes, sem o encaminhamento novo");
  await t.fechar();
  t = await abrir({ estado: comPerfil({ peso: 100, vesicula: true }, rapido), aba: "diario" }); p = t.p;
  await p.waitForSelector("form[data-form=peso]");
  const rit = await texto(p, "#ritmo");
  ok(/Você perdeu em média 1,5% do peso por semana nos 21 dias entre .*levar ao seu médico\. Se tiver dor na barriga, veja os sinais de alerta no Guia\./.test(rit), "com vesícula: aviso de ritmo encaminha aos sinais de alerta: " + rit);
  ok(!(await p.locator("#ritmo").evaluate(el => el.classList.contains("alerta"))), "aviso de ritmo continua neutro, sem cor de alarme");
  await t.foto("vesicula-ritmo");
  await t.fechar();
  t = await abrir({ estado: comPerfil({ peso: 100, vesicula: true, discreto: true }, rapido), aba: "diario" }); p = t.p;
  await p.waitForSelector("form[data-form=peso]");
  const ritD = await texto(p, "#ritmo");
  ok(/caiu mais de 1% por semana/.test(ritD) && !/kg|\d+,\d/.test(ritD), "modo sem peso em destaque: com vesícula o aviso aparece, sem o número do peso");
  ok(await p.locator("#semanas").count() === 0 && !/Variação|Inicial/.test(await tela(p)), "modo sem peso em destaque continua sem variação nem peso inicial");
  await t.fechar();
  t = await abrir({ estado: comPerfil({ peso: 100, discreto: true }, rapido), aba: "diario" }); p = t.p;
  await p.waitForSelector("form[data-form=peso]");
  ok(await p.locator("#ritmo").count() === 0, "modo sem peso em destaque sem vesícula: continua sem aviso de ritmo");
  await t.fechar();

  /* ---------- cartão do fígado no Plano, com as marcas de 5, 7 e 10% calculadas do peso inicial do Perfil ---------- */
  const Pf = (n, kg) => ({ id: "f" + n, data: d(n), kg, cintura: null });
  t = await abrir({ estado: comPerfil({ peso: 130, figado: false }), aba: "plano" }); p = t.p;
  await p.waitForSelector("text=Metas diárias");
  ok(await p.locator("[data-aviso=figado]").count() === 0, "fígado respondido não: sem cartão no Plano");
  await t.fechar();
  for (const discreto of [false, true]) {
    const nome = discreto ? " (sem calorias)" : "";
    t = await abrir({ estado: comPerfil({ peso: 130, figado: true, discreto }, { pesos: [Pf(7, 125)] }), aba: "plano" }); p = t.p;
    await p.waitForSelector("text=Metas diárias");
    const fg = await texto(p, "[data-aviso=figado]");
    ok(/Gordura no fígado.*5% do peso já reduz a gordura.*bebida açucarada.*não beber álcool.*150 minutos/.test(fg), "fígado marcado: cartão no Plano" + nome);
    if (discreto) ok(!/kg/.test(fg) && /Marcas: 5%, 7%, 10%\./.test(fg), "sem calorias e peso em destaque: progresso só em percentuais");
    else ok(/Peso no início: 130,0 kg\. Peso dos 5%: 123,5 kg, faltam 1,5 kg\. Peso dos 7%: 120,9 kg, faltam 4,1 kg\. Peso dos 10%: 117,0 kg, faltam 8,0 kg\./.test(fg), "marcas de peso calculadas do peso inicial e do atual: " + fg);
    ok(await p.locator("[data-v=kcal]").count() === 0 && (/Energia/.test(await texto(p, ".cartao:has-text('Metas diárias')")) === !discreto), "modo sem calorias continua valendo no Plano" + nome);
    await t.foto("figado-plano" + (discreto ? "-discreto" : "")); await t.semRolagem("plano com fígado" + nome); await t.alvosDeToque("plano com fígado" + nome);
    await p.click("#btn-perfil"); await p.waitForSelector("form[data-form=perfil]");
    ok(await p.locator("[data-aviso=figado]").count() === 0, "cartão do fígado não aparece no Perfil" + nome);
    await p.click("#abas [data-aba=hoje]"); await p.waitForSelector("text=Proteína hoje");
    ok(await p.locator("[data-aviso=figado]").count() === 0, "cartão do fígado não aparece em Hoje" + nome);
    await t.fechar();
  }

  /* ---------- aguardando cirurgia: frase e progresso no cartão da vesícula ---------- */
  for (const discreto of [false, true]) {
    const nome = discreto ? " (sem calorias)" : "";
    t = await abrir({ estado: comPerfil({ peso: 120, vesicula: true, aguardaCirurgia: true, discreto }, { pesos: [{ id: "c", data: d(3), kg: 114 }] }) }); p = t.p;
    await p.waitForSelector("text=Proteína hoje");
    ok(await p.locator("#tela [data-progresso]").count() === 0 && !/faltam [\d,]+ kg|cirurgi/.test(await tela(p)), "aguardando cirurgia: Hoje sem placar de quilos nem a frase da cirurgia (ficam no Perfil e no Plano)" + nome);
    await p.click("#btn-perfil"); await p.waitForSelector("form[data-form=perfil]");
    const v = await texto(p, "[data-aviso=vesicula]");
    ok(/Se o seu cirurgião disse que a cirurgia depende de o fígado diminuir.*Quem decide a data é o cirurgião/.test(v) && await p.locator("[data-aviso=vesicula] [data-progresso]").count() === 1, "aguardando cirurgia: frase e progresso no cartão da vesícula (Perfil)" + nome);
    if (discreto) ok(!/kg/.test(v) && /Marcas: 5% \(alcançada\), 7%, 10%\./.test(v), "progresso da cirurgia sem quilos no modo sem peso em destaque");
    else ok(/Peso dos 5%: 114,0 kg \(alcançado\)\. Peso dos 7%: 111,6 kg, faltam 2,4 kg/.test(v), "progresso da cirurgia em kg: " + v);
    await t.foto("vesicula-cirurgia" + (discreto ? "-discreto" : "")); await t.semRolagem("perfil com cirurgia" + nome); await t.alvosDeToque("perfil com cirurgia" + nome);
    await t.fechar();
  }
  t = await abrir({ estado: comPerfil({ vesicula: true, aguardaCirurgia: false }), aba: "perfil" }); p = t.p;
  await p.waitForSelector("form[data-form=perfil]");
  ok(!/cirurgi/.test(await texto(p, "[data-aviso=vesicula]")), "sem cirurgia marcada: cartão da vesícula sem a frase da cirurgia");
  await t.fechar();
})();
