// Primeira abertura, perfil, persistencia e migracao dos dados da versao 1.
const { abrir, ok, d, CHAVE } = require("./apoio");
(async () => {
  const t = await abrir(), p = t.p;
  // Achado 2: primeiro a tela de entrada (para quem o app serve e quem deve falar com o médico antes), depois o perfil.
  ok(/Converse com o seu médico antes de seguir o plano do app se você/.test(await p.locator("#tela").innerText()) && await p.locator("form[data-form=perfil]").count() === 0, "primeira abertura mostra a tela de entrada");
  ok(!(await p.locator("#abas").isVisible()), "barra de abas escondida na tela de entrada"); await t.foto("0-entrada");
  // Usabilidade onda 2, mudança 1: primeiro uso numa tela só. Cada toque conta: campo tocado, botão de resposta, botão final.
  let toques = 0;
  const toca = async sel => { toques++; await p.click(sel); }, digita = async (sel, x) => { toques++; await p.fill(sel, x); };
  const resp = (nome, v) => "form[data-form=perfil] [data-pu=" + nome + "] label.opcao:has(input[value=" + v + "])";
  await toca("[data-ac=entradaContinuar]");
  ok(await p.locator("form[data-form=perfil]").count() === 1, "continuar leva ao formulário do primeiro uso");
  ok(await p.locator("form[data-form=perfil] details").count() === 0 && await p.locator("form[data-form=perfil] [name=sexo], form[data-form=perfil] [name=atividade], form[data-form=perfil] [name=metaKcal]").count() === 0,
    "primeiro uso: sem sanfonas; sexo, atividade e metas ficam para depois");
  for (const n of ["vesicula", "figado", "planoNutri"]) ok(await p.locator(resp(n, "naosei")).isVisible() && await p.locator(resp(n, "sim")).isVisible(), "primeiro uso: pergunta " + n + " à vista, com Sim, Não e Não sei");
  ok(!(await p.locator("#p-cirurgia").isVisible()), "primeiro uso: pergunta da cirurgia escondida até a vesícula ser Sim");
  ok(await p.locator("#imp").count() === 1, "primeiro uso: continua oferecendo restaurar uma cópia");
  await t.foto("0b-primeiro-uso"); await t.semRolagem("primeiro uso"); await t.alvosDeToque("primeiro uso");
  // Achado 2: menos de 18 anos é recusado.
  await p.fill("[name=nascimento]", String(new Date().getFullYear() - 16)); await p.fill("[name=altura]", "163"); await p.fill("[name=peso]", "60");
  await p.click("form[data-form=perfil] button");
  ok(/18 anos ou mais/.test(await p.locator("#aviso").innerText()) && (await t.ler()).perfil === null, "menos de 18 anos: perfil recusado");
  ok(!(await p.locator("#abas").isVisible()), "barra de abas escondida enquanto não há perfil");
  await p.fill("[name=nascimento]", "1990");
  await p.click("form[data-form=perfil] button");
  ok(/Responda: Tem pedra na vesícula\?/.test(await p.locator("#aviso").innerText()) && (await t.ler()).perfil === null, "primeiro uso: sem responder a vesícula, não salva e diz o que falta");
  // percurso contado do zero, como ela faria: entrada, três campos, quatro respostas, Começar
  toques = 1;
  await digita("[name=nascimento]", "1990"); await digita("[name=altura]", "163"); await digita("[name=peso]", "95,4");
  await toca(resp("vesicula", "sim"));
  ok(await p.locator("#p-cirurgia").isVisible() && await p.locator(resp("vesicula", "sim") + ".ativa").count() === 1, "vesícula Sim: a pergunta da cirurgia aparece logo abaixo e o botão fica marcado");
  await p.click("form[data-form=perfil] button");
  ok(/Responda: Está aguardando cirurgia/.test(await p.locator("#aviso").innerText()), "vesícula Sim: a pergunta da cirurgia também precisa de resposta");
  await toca(resp("aguardaCirurgia", "sim")); await toca(resp("figado", "naosei")); await toca(resp("planoNutri", "sim"));
  await toca("form[data-form=perfil] button");
  await p.waitForSelector("text=Proteína hoje");
  ok(toques <= 9, "primeiro uso até a Hoje em " + toques + " toques (meta: 9 ou menos)");
  ok(await p.locator("[data-aviso=vesicula]").count() === 1, "primeiro uso com vesícula Sim: a Hoje já mostra o cartão da vesícula");
  ok(await p.locator("[data-cartao=pu-novas]").count() === 0, "primeiro uso: a faixa de perguntas novas não aparece para quem acabou de responder");
  const e0 = await t.ler();
  ok(e0.perfil.vesicula === true && e0.perfil.aguardaCirurgia === true && e0.perfil.figado === null && e0.ui.planoNutri === true && e0.ui.puPerguntas === true,
    "primeiro uso: Sim grava true, Não sei grava sem resposta, plano da nutricionista ligado e perguntas marcadas como respondidas");
  ok(e0.perfil.sexo === "F" && e0.perfil.atividade === 1.2 && e0.perfil.metaKcal === null && e0.perfil.gestante === null && e0.perfil.diabetes === null && e0.perfil.pilula === null && e0.perfil.naoCome.length === 0,
    "primeiro uso: o resto do perfil começa com valores neutros");
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

  // Auditoria 3, I7: quem já tinha perfil e nunca respondeu vesícula, fígado e plano da nutricionista vê uma faixa em Hoje.
  ok(await p.locator("[data-cartao=pu-novas]").count() === 1 && /três perguntas/.test(await p.locator("[data-cartao=pu-novas]").innerText()), "perfil antigo: faixa das perguntas novas em Hoje");
  await t.alvosDeToque("hoje com a faixa das perguntas novas");
  ok(await p.evaluate(() => { const f = document.querySelector("[data-cartao=pu-novas]"), topo = document.querySelector(".hoje-topo"); return !!f && (!topo || !!(topo.compareDocumentPosition(f) & Node.DOCUMENT_POSITION_FOLLOWING)); }),
    "a faixa fica depois do topo da Hoje, sem quebrá-lo");
  await p.click("[data-ac=puResponder]"); await p.waitForSelector("form[data-form=perfil]");
  ok(await p.locator("[data-pu=pendente]").count() === 1 && await p.locator(resp("vesicula", "sim")).isVisible(), "responder agora: abre o Perfil com as perguntas no topo");
  ok(typeof (await t.ler()).ui.puAviso === "string", "responder agora: a faixa não volta mais");
  await p.click(resp("vesicula", "nao")); await p.click(resp("figado", "sim")); await p.click(resp("planoNutri", "nao"));
  await p.click("form[data-form=perfil] button:has-text('Salvar')");
  const e2 = await t.ler();
  ok(e2.perfil.vesicula === false && e2.perfil.figado === true && e2.ui.planoNutri === false && e2.ui.puPerguntas === true && e2.perfil.metaKcal === 1500 && e2.perfil.nome === "Antiga",
    "perfil antigo: respostas gravadas, plano da nutricionista desligado, o resto do perfil intacto");
  ok(await p.locator("[data-pu=pendente]").count() === 0, "respondidas: o Perfil não chama mais de perguntas novas");
  await p.click("#abas a[data-aba=hoje]"); await p.waitForSelector("text=Proteína hoje");
  ok(await p.locator("[data-cartao=pu-novas]").count() === 0, "respondidas: sem faixa em Hoje");
  // "Agora não" também tira a faixa, e as perguntas continuam no Perfil.
  await t.semear(v1); await p.waitForSelector("[data-cartao=pu-novas]");
  await p.click("[data-ac=puDepois]");
  ok(await p.locator("[data-cartao=pu-novas]").count() === 0, "agora não: a faixa some");
  await p.reload(); await p.waitForSelector("text=Proteína hoje");
  ok(await p.locator("[data-cartao=pu-novas]").count() === 0, "agora não: a faixa não volta ao abrir de novo");
  await p.click("#btn-perfil"); await p.waitForSelector("form[data-form=perfil]");
  ok(await p.locator("[data-pu=pendente]").count() === 1, "agora não: o Perfil continua mostrando as perguntas como novas");
  await t.fechar();
})();
