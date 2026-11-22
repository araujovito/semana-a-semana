// Primeira abertura, perfil, persistencia e migracao dos dados da versao 1.
const { abrir, ok, d, CHAVE } = require("./apoio");
(async () => {
  const t = await abrir(), p = t.p;
  // Achado 2: primeiro a tela de entrada (para quem o app serve e quem deve falar com o médico antes), depois o perfil.
  ok(/Converse com o seu médico antes de seguir o plano do app se você/.test(await p.locator("#tela").innerText()) && await p.locator("form[data-form=perfil]").count() === 0, "primeira abertura mostra a tela de entrada");
  ok(!(await p.locator("#abas").isVisible()), "barra de abas escondida na tela de entrada"); await t.foto("0-entrada");
  await p.click("[data-ac=entradaContinuar]");
  ok(await p.locator("form[data-form=perfil]").count() === 1, "continuar leva ao perfil");
  // Achado 2: menos de 18 anos é recusado.
  await p.fill("[name=nascimento]", String(new Date().getFullYear() - 16)); await p.fill("[name=altura]", "163"); await p.fill("[name=peso]", "60");
  await p.click("form[data-form=perfil] button");
  ok(/18 anos ou mais/.test(await p.locator("#aviso").innerText()) && (await t.ler()).perfil === null, "menos de 18 anos: perfil recusado");
  ok(!(await p.locator("#abas").isVisible()), "barra de abas escondida enquanto não há perfil");
  await p.fill("[name=nome]", "Teste"); await p.fill("[name=nascimento]", "1990"); await p.fill("[name=altura]", "163"); await p.fill("[name=peso]", "95,4");
  await p.click("form[data-form=perfil] button");
  await p.waitForSelector("text=Proteína hoje");
  // A barra volta 100 ms depois de o campo perder o foco (teclado em inicio.js): espera até 2 s em vez de olhar no mesmo instante.
  ok(await p.locator("#abas").waitFor({ state: "visible", timeout: 2000 }).then(() => true, () => false), "barra de abas aparece depois do perfil");
  ok(true, "perfil salvo leva para Hoje"); await t.foto("1-hoje-vazio");
  ok((await t.ler()).perfil.peso === 95.4, "peso com vírgula é lido como 95,4");
  await p.click("#btn-perfil"); await p.waitForSelector("text=Como as metas são calculadas"); await t.foto("8-perfil");
  await t.semRolagem("perfil"); await t.alvosDeToque("perfil");
  await p.reload(); ok(await p.locator("form[data-form=perfil] [name=altura]").inputValue() === "163", "dados persistem depois de recarregar");
  // Auditoria 1, achado 12: depois do primeiro preenchimento, salvar o Perfil não regrava o peso inicial; ele tem bloco próprio.
  ok(await p.locator("form[data-form=perfil] [name=peso]").count() === 0 && await p.locator("[data-cartao=peso-inicial] details:not([open])").count() === 1, "perfil salvo: sem campo de peso no formulário; peso do começo num bloco fechado");
  await p.fill("form[data-form=perfil] [name=altura]", "165"); await p.click("form[data-form=perfil] button:has-text('Salvar')");
  let pf = (await t.ler()).perfil;
  ok(pf.altura === 165 && pf.peso === 95.4, "salvar o perfil muda a altura e mantém o peso do começo");
  await p.click("[data-cartao=peso-inicial] summary"); await p.fill("[name=pesoInicial]", "96"); await p.click("[data-cartao=peso-inicial] button:has-text('Salvar peso do começo')");
  ok(/Trocar o peso do começo do tratamento de 95,4 kg para 96,0 kg\?/.test(await t.textoDialogo() || ""), "corrigir o peso do começo pede confirmação");
  await t.sim(); ok((await t.ler()).perfil.peso === 96, "confirmado: peso do começo trocado");
  await t.foto("8b-perfil-peso-inicial");

  // Quem ja usava a versao 1 abre a versao nova sem perder nada.
  const v1 = { v: 1, perfil: { nome: "Antiga", sexo: "F", nascimento: 1985, altura: 170, peso: 88, atividade: 1.2, metaKcal: 1500, metaProt: null, metaAgua: null },
    doses: [{ id: "a", data: d(7), mg: 2.5, local: "Coxa esquerda", obs: "" }], pesos: [{ id: "b", data: d(1), kg: 87, cintura: null }],
    sintomas: [], treinos: [{ id: "c", data: d(2), tipo: "A", local: "casa" }], dias: { [d(0)]: { enjoo: false, feitas: [true, null, true], agua: 400, protExtra: 10, caminhada: 20 } }, ui: {} };
  await t.semear(v1);
  await p.waitForSelector("text=Proteína hoje");
  ok(await p.locator("[data-mud=refeicao]:checked").count() === 2, "versão 1: as duas refeições marcadas continuam marcadas");
  await p.click("[data-ac=agua][data-ml='200']");
  const e = await t.ler();
  ok(e.v === 2 && e.perfil.metaKcal === 1500 && e.perfil.nome === "Antiga" && e.doses.length === 1 && e.pesos.length === 1 && e.treinos.length === 1, "versão 1: perfil, aplicação, peso e treino preservados na versão 2");
  ok(e.dias[d(0)].agua === 600 && e.dias[d(0)].protExtra === 10 && e.dias[d(0)].caminhada === 20 && e.dias[d(0)].comido[0].q === 1 && e.dias[d(0)].comido[1] === null, "versão 1: registro do dia preservado");
  ok(Array.isArray(e.perfil.naoCome) && e.perfil.pilula === null, "versão 1: perguntas novas do perfil começam sem resposta");
  await t.fechar();
})();
