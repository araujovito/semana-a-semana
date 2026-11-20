// Primeira abertura, perfil, persistencia e migracao dos dados da versao 1.
const { abrir, ok, d, CHAVE } = require("./apoio");
(async () => {
  const t = await abrir(), p = t.p;
  ok(await p.locator("form[data-form=perfil]").count() === 1, "primeira abertura cai no perfil");
  await p.fill("[name=nome]", "Teste"); await p.fill("[name=nascimento]", "1990"); await p.fill("[name=altura]", "163"); await p.fill("[name=peso]", "95,4");
  await p.click("form[data-form=perfil] button");
  await p.waitForSelector("text=Proteína hoje");
  ok(true, "perfil salvo leva para Hoje"); await t.foto("1-hoje-vazio");
  ok((await t.ler()).perfil.peso === 95.4, "peso com vírgula é lido como 95,4");
  await p.click("#btn-perfil"); await p.waitForSelector("text=Como as metas são calculadas"); await t.foto("8-perfil");
  await t.semRolagem("perfil");
  await p.reload(); ok(await p.locator("form[data-form=perfil] [name=altura]").inputValue() === "163", "dados persistem depois de recarregar");

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
