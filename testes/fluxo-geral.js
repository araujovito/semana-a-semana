// O que vale para todas as telas: guia, virada do dia, falha ao salvar, dado ilegivel, dialogos da pagina, campo obrigatorio, botao voltar.
const { abrir, ok, d, estadoBase, CHAVE } = require("./apoio");
(async () => {
  let t = await abrir({ estado: estadoBase(), aba: "guia" }), p = t.p;
  await p.waitForSelector("text=Como o remédio age"); ok(await p.locator("details").count() >= 15, "guia com os artigos"); await t.foto("7-guia");
  ok(!/\bela\b/i.test(await p.locator("#tela").innerText()), "guia fala com você, sem \"ela\"");
  await t.semRolagem("guia"); await t.alvosDeToque("guia");

  // Troca de aba nao empilha historico; o botao voltar do aparelho vai para Hoje e, de Hoje, sai (achado 22).
  const antes = await p.evaluate(() => history.length);
  await p.click("#abas a[data-aba=comer]"); await p.waitForSelector("text=Metas diárias");
  await p.click("#abas a[data-aba=semana]"); await p.click("#subabas a[data-sub=diario]"); await p.waitForSelector("form[data-form=dose]");
  ok(await p.evaluate(() => history.length) === antes, "trocar de aba não empilha histórico");
  ok(await p.evaluate(() => window.aoVoltar()) === "ficar" && await p.locator("text=Proteína hoje").count() === 1, "voltar em outra aba leva para Hoje");
  ok(await p.evaluate(() => window.aoVoltar()) === "sair", "voltar na aba Hoje sai do app");

  // Barra de abas nova: Hoje, Semana, Comer, Mover, Guia. Semana leva à visão semanal, ao Diário e ao Painel por toque; Comer, ao Plano.
  ok((await p.locator("#abas a").allInnerTexts()).map(x => x.trim()).join(",") === "Hoje,Semana,Comer,Mover,Guia", "abas: Hoje, Semana, Comer, Mover, Guia");
  ok(await p.locator("#abas a svg use").count() === 5 && !/[\u2600-\u27bf]|\ud83c|\ud83d/.test(await p.locator("#abas").innerText()), "abas com ícones SVG, sem emoji");
  await p.click("#abas a[data-aba=semana]"); await p.waitForSelector("#subabas a.ativa[data-sub=semana]");
  ok(await p.evaluate(() => location.hash) === "#semana", "aba Semana abre a visão semanal");
  await p.click("#subabas a[data-sub=painel]"); await p.waitForSelector(".painel-hoje");
  ok(await p.locator("#abas a.ativa[data-aba=semana]").count() === 1, "no painel, a aba Semana continua acesa");
  await p.click("#subabas a[data-sub=diario]"); await p.waitForSelector("form[data-form=dose]");
  ok(await p.locator("#subabas a.ativa[data-sub=diario]").count() === 1, "Diário (aplicações, peso, sintomas, relatório) por toque na sub-aba");
  await p.click("#abas a[data-aba=mover]"); await p.waitForSelector("#abas a.ativa[data-aba=mover]");
  ok(await p.evaluate(() => location.hash) === "#treino" && await p.locator("#subabas").count() === 0, "aba Mover abre o treino, sem sub-abas");
  await p.click("#abas a[data-aba=comer]"); await p.waitForSelector("#abas a.ativa[data-aba=comer]");
  ok(await p.evaluate(() => location.hash) === "#plano", "aba Comer abre o plano");
  await p.click("#abas a[data-aba=hoje]"); await p.waitForSelector("#abas a.ativa[data-aba=hoje]"); ok(await p.locator("#subabas").count() === 0, "Hoje sem sub-abas");
  ok(await p.evaluate(() => history.length) === antes, "sub-abas também não empilham histórico");

  // Dialogo da pagina no lugar de confirm(): cancelar nao apaga, confirmar apaga; voltar fecha o dialogo (achado 17).
  await t.semear(estadoBase({ doses: [{ id: "a1", data: d(7), mg: 2.5, local: "Coxa esquerda", obs: "" }], ui: { diario: "doses" } }));
  await p.click("#abas a[data-aba=semana]"); await p.click("#subabas a[data-sub=diario]"); await p.click("[data-ac=apagar]");
  ok(/Apagar este registro/.test(await t.textoDialogo()), "apagar pergunta num diálogo da página"); await t.foto("9-dialogo");
  await t.nao(); ok((await t.ler()).doses.length === 1, "cancelar não apaga");
  await p.click("[data-ac=apagar]"); ok(await p.evaluate(() => window.aoVoltar()) === "ficar" && (await t.textoDialogo()) === null, "voltar fecha o diálogo sem apagar");
  await p.click("[data-ac=apagar]"); await t.sim(); ok((await t.ler()).doses.length === 0, "confirmar apaga");

  // Campo obrigatorio vazio mostra mensagem (achado 16).
  await p.fill("form[data-form=dose] [name=data]", ""); await p.click("form[data-form=dose] button");
  ok(/Preencha o campo: Data/.test(await p.locator("#aviso").textContent()) && (await t.ler()).doses.length === 0, "data vazia mostra mensagem e não salva");

  // Teclado: com um campo de texto em foco a barra de abas some (achado 15).
  await p.click("[data-ac=diario][data-v=peso]"); await p.focus("[name=kg]");
  ok(!(await p.locator("#abas").isVisible()), "barra de abas some com campo de texto em foco");
  await p.evaluate(() => document.activeElement.blur()); await p.waitForTimeout(250);
  ok(await p.locator("#abas").isVisible(), "barra de abas volta ao sair do campo");
  await t.fechar();

  // Virada do dia (achado 4): segunda 23:58, marca agua; 8 horas depois, o primeiro toque so atualiza a tela; nada e gravado no dia errado.
  t = await abrir({ estado: estadoBase(), agora: "2026-11-23T23:58:00" }); p = t.p;
  await p.waitForSelector("text=Proteína hoje"); await p.click("[data-ac=agua][data-ml='200']");
  await t.relogio("2026-11-24T08:00:00");
  await p.click("[data-ac=agua][data-ml='500']");
  let e = await t.ler();
  ok(e.dias["2026-11-23"].agua === 200 && !e.dias["2026-11-24"], "toque depois da meia-noite não grava em dia nenhum: só atualiza a tela");
  ok(/Mudou o dia/.test(await p.locator("#aviso").textContent()), "avisa que o dia mudou");
  await p.click("[data-ac=agua][data-ml='500']"); e = await t.ler();
  ok(e.dias["2026-11-23"].agua === 200 && e.dias["2026-11-24"].agua === 500, "o toque seguinte grava no dia novo");
  await t.relogio("2026-11-25T07:00:00"); await p.evaluate(() => window.dispatchEvent(new Event("focus")));
  ok(/0,0 L/.test(await p.locator("#tela").innerText()), "ao voltar para a frente em outro dia a tela é refeita");
  await t.fechar();

  // Falha ao salvar (achado 8): faixa de erro visivel e nenhuma mensagem de sucesso por cima.
  t = await abrir({ estado: estadoBase(), aba: "diario" }); p = t.p;
  await p.waitForSelector("form[data-form=dose]");
  await p.evaluate(() => { Storage.prototype.setItem = () => { throw new Error("sem espaço"); }; });
  await p.click("form[data-form=dose] button");
  ok(await p.locator("#erro-salvar").isVisible(), "falha ao salvar mostra a faixa de erro");
  ok(!(await p.locator("#aviso").isVisible()) || !/registrad/i.test(await p.locator("#aviso").textContent()), "sem \"registrada\" por cima do erro");
  await t.semRolagem("erro ao salvar"); await t.alvosDeToque("erro ao salvar"); await t.foto("9-erro-salvar");
  await t.fechar();

  // Dado de versao desconhecida (achado 21): o app avisa e nao grava por cima.
  t = await abrir(); p = t.p;
  const futuro = JSON.stringify({ v: 9, perfil: { nome: "do futuro" } });
  await p.evaluate(x => localStorage.setItem(x[0], x[1]), [CHAVE, futuro]); await p.reload();
  ok(await p.locator("text=Não consegui ler os dados guardados").count() === 1 && !(await p.locator("#abas").isVisible()), "dado ilegível: o app avisa em vez de abrir vazio");
  ok(await p.evaluate(k => localStorage.getItem(k), CHAVE) === futuro, "dado ilegível continua intacto");
  await t.semRolagem("dado ilegível"); await t.alvosDeToque("dado ilegível");
  await p.click("[data-ac=ilegivelRecomecar]"); await t.sim();
  ok(await p.locator("form[data-form=perfil]").count() === 1 || await p.locator("text=Continuar").count() > 0, "depois de guardar à parte, começa do zero");
  ok(await p.evaluate(k => Object.keys(localStorage).some(x => x.indexOf(k + ".guardado.") === 0 && localStorage.getItem(x).indexOf("do futuro") > 0), CHAVE), "os dados antigos ficam guardados à parte");
  await t.fechar();

  // Modo escuro e 320 px abrem sem erro.
  t = await abrir({ estado: estadoBase(), escuro: true, largura: 320 }); p = t.p;
  for (const aba of ["hoje", "semana", "comer", "mover", "guia"]) { await p.click("#abas a[data-aba=" + aba + "]"); await p.waitForTimeout(50); await t.semRolagem(aba + " em 320 px, escuro"); }
  for (const sub of ["diario", "painel"]) { await p.click("#abas a[data-aba=semana]"); await p.click("#subabas a[data-sub=" + sub + "]"); await p.waitForTimeout(50); await t.semRolagem(sub + " em 320 px, escuro"); }
  await t.alvosDeToque("barra de abas e sub-abas em 320 px");
  await t.fechar();
})();
