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
    ok(/Pedra na vesícula.*bula da tirzepatida.*Confirme com ele antes de começar.*pronto-socorro hoje/.test(await texto(p, "[data-aviso=vesicula]")), "vesícula marcada: cartão na tela Hoje" + nome);
    ok(await p.locator("[data-v=kcal]").count() === (discreto ? 0 : 1), "modo sem calorias continua valendo com o cartão" + nome);
    await t.foto("vesicula-hoje" + (discreto ? "-discreto" : "")); await t.alvosDeToque("hoje com vesícula" + nome); await t.semRolagem("hoje com vesícula" + nome);
    await p.click("[data-aviso=vesicula] [data-ac=ir]");
    ok(await p.waitForSelector("#tela summary:has-text('Sinais de alerta')", { timeout: 3000 }).then(() => true, () => false), "botão do cartão abre o Guia com os sinais de alerta" + nome);
    await p.click("#abas [data-aba=plano]");
    await p.waitForSelector("text=Metas diárias");
    ok(await p.locator("[data-aviso=vesicula]").count() === 1, "vesícula marcada: cartão no Plano" + nome);
    await p.click("#btn-perfil"); await p.waitForSelector("form[data-form=perfil]");
    ok(await p.locator("[data-aviso=vesicula]").count() === 1, "vesícula marcada: cartão no Perfil" + nome);
    await t.fechar();
  }
})();
