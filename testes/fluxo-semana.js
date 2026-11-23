// Visão semanal (#semana): 6 semanas de tratamento semeadas, semana atual aberta, anteriores resumidas que abrem ao toque,
// padrões tirados dos registros, modo discreto (sem kg nem kcal em destaque), claro e escuro, 320 a 430 px.
const { abrir, ok, d, estadoBase } = require("./apoio");
const D = (n, mg, local) => ({ id: "d" + n, data: d(n), mg, local: local || "Abdômen esquerdo", obs: "" });
const S = (n, enjoo, extra) => Object.assign({ id: "s" + n, data: d(n), enjoo, intestino: "Normal" }, extra || {});
const P = (n, kg) => ({ id: "p" + n, data: d(n), kg, cintura: null });
const comeu = prot => ({ enjoo: false, comido: [], agua: 0, protExtra: prot, caminhada: 0 });
// Relógio do teste: sexta, 20/11/2026. Primeira aplicação 39 dias antes (segunda, 12/10): hoje é a semana 6.
function seisSemanas(discreto) {
  const e = estadoBase({
    doses: [D(39, 2.5), D(32, 2.5, "Abdômen direito"), D(25, 2.5, "Coxa esquerda"), D(18, 5, "Coxa direita"), D(9, 5, "Braço esquerdo"), D(4, 5, "Braço direito")],
    pesos: [P(39, 120), P(32, 119.2), P(25, 118.5), P(18, 117.6), P(11, 117), P(4, 116.4)],
    // enjoo maior nos 2 dias depois da aplicação nas semanas 2, 4 e 6; nos outros dias, nenhum
    sintomas: [S(31, 1), S(30, 2), S(28, 0), S(27, 0), S(17, 3, { vomito: true }), S(16, 2), S(14, 0, { intestino: "Preso" }), S(13, 0), S(3, 2, { refluxo: true }), S(2, 2), S(1, 0), S(0, 0)],
    dias: { [d(17)]: Object.assign(comeu(40), { enjoo: true }), [d(16)]: comeu(60), [d(3)]: Object.assign(comeu(50), { enjoo: true }), [d(2)]: comeu(70), [d(1)]: comeu(80) },
  });
  e.perfil.discreto = !!discreto;
  return e;
}
(async () => {
  let t = await abrir({ estado: seisSemanas(), aba: "semana" }), p = t.p;
  await p.waitForSelector(".semana-atual");
  const atual = await p.locator(".semana-atual").innerText();
  ok(/Semana 6/.test(atual) && /16\/11 a 20\/11 \(até hoje\)/.test(atual), "semana atual aberta: semana 6, de 16/11 até hoje");
  ok(/5,0 mg em Seg, 16\/11, Braço direito, no dia previsto/.test(atual), "semana atual: dose, data, local e no dia previsto");
  ok(/116,4 kg \(-0,6 kg na semana\)/.test(atual), "semana atual: peso e variação na semana");
  ok(/enjoo em 2 dias/.test(atual) && /refluxo em 1 dia/.test(atual), "semana atual: sintomas contados por dia");
  ok(/nenhuma dor forte registrada/.test(atual) && !/sem sinal de alerta/.test(atual) && await p.locator(".semana-atual [data-para=guia]").count() === 0, "sem dor marcada: diz só que nenhuma dor forte foi registrada");
  ok(/1 dia com o cardápio de enjoo/.test(atual), "semana atual: dias de enjoo marcados na tela Hoje");
  ok(/proteína média de 67 g por dia/.test(atual) && /em 3 dias com registro/.test(atual) && !/kcal/.test(atual), "semana atual: proteína média e dias com registro; dias só com proteína avulsa não inventam energia");
  ok(/o enjoo foi maior nos 2 dias depois da aplicação/.test(atual), "semana atual: padrão de enjoo depois da aplicação");
  ok(await p.locator("#abas a.ativa[data-aba=semana]").count() === 1 && await p.locator("#subabas a.ativa[data-sub=semana]").count() === 1, "aba Semana acesa, com a sub-aba Semana");

  const ant = p.locator("#semana-anteriores details");
  ok(await ant.count() === 5, "5 semanas anteriores resumidas");
  ok(await p.locator("#semana-anteriores details[open]").count() === 0, "as anteriores começam fechadas");
  const s5 = p.locator("#semana-anteriores details[data-semana='5']");
  ok(/Semana 5 · 5,0 mg/.test(await s5.locator("summary").innerText()), "resumo da semana 5 com a dose");
  await s5.locator("summary").click();
  ok(await s5.evaluate(el => el.open), "tocar no resumo abre a semana");
  ok(/2 dias depois do previsto/.test(await s5.innerText()) && /aplicação atrasada/.test(await s5.innerText()), "semana 5: aplicação atrasada 2 dias");
  const s4 = p.locator("#semana-anteriores details[data-semana='4']");
  ok(/troca de dose/.test(await s4.locator("summary").innerText()), "semana 4 marcada com troca de dose no resumo");
  await s4.locator("summary").click();
  ok(/semana com troca de dose/.test(await s4.innerText()) && /vômito em 1 dia/.test(await s4.innerText()) && /intestino preso em 1 dia/.test(await s4.innerText()), "semana 4: troca de dose, vômito e intestino");

  const padroes = await p.locator("#semana-padroes").innerText();
  ok(/Nas 3 semanas com registro de sintomas, o enjoo foi maior nos 2 dias depois da aplicação/.test(padroes), "padrão geral de enjoo: " + padroes.replace(/\n/g, " "));
  ok(/Troca de dose na semana 4\./.test(padroes) && /fora do dia habitual na semana 5\./.test(padroes), "padrões de troca de dose e de atraso");
  ok(!/(você deve|o correto|parabéns|ótimo)/i.test(await p.locator("#tela").innerText()), "sem sermão nem elogio");
  await t.semRolagem("semana 390"); await t.alvosDeToque("semana"); await t.foto("semana-1-claro");
  for (const w of [320, 430]) { await p.setViewportSize({ width: w, height: 800 }); await t.semRolagem("semana " + w); }
  await p.setViewportSize({ width: 320, height: 800 }); await t.alvosDeToque("semana 320"); await t.foto("semana-2-320");
  await t.fechar();

  // Modo discreto: sem kg nem kcal à vista; o peso fica atrás de "Ver peso".
  t = await abrir({ estado: seisSemanas(true), aba: "semana", escuro: true }); p = t.p;
  await p.waitForSelector(".semana-atual");
  const vis = await p.locator(".semana-atual").innerText();
  ok(!/kg/.test(vis.replace(/Ver peso[\s\S]*/, "")) && !/kcal/.test(vis) && /1 pesagem/.test(vis), "discreto: a linha do peso não mostra kg e a comida não mostra kcal");
  ok(!(await p.locator(".semana-atual details.semana-peso p").isVisible()), "discreto: o peso fica escondido");
  await p.click(".semana-atual details.semana-peso summary");
  ok(/116,4 kg/.test(await p.locator(".semana-atual details.semana-peso").innerText()), "discreto: um toque em Ver peso mostra o número");
  const fundo = await p.evaluate(() => { const x = document.createElement("i"); x.style.color = "var(--fundo)"; document.body.appendChild(x); const c = getComputedStyle(x).color; x.remove();
    return [getComputedStyle(document.body).backgroundColor, c, matchMedia("(prefers-color-scheme: dark)").matches, getComputedStyle(document.body).backgroundColor !== "rgb(246, 245, 251)"]; });
  ok(fundo[2] && fundo[0] === fundo[1] && fundo[3], "modo escuro usa as cores do app (" + fundo[0] + ")");
  await t.semRolagem("semana escuro"); await t.alvosDeToque("semana escuro"); await t.foto("semana-3-escuro-discreto");
  await t.fechar();

  // Dor forte na barriga marcada na semana: botão discreto para os sinais de alerta do Guia.
  const comDor = seisSemanas(); comDor.sintomas.push(S(1, 0, { id: "dor1", dor: true }));
  t = await abrir({ estado: comDor, aba: "semana", largura: 320 }); p = t.p;
  await p.waitForSelector(".semana-atual");
  ok(/dor forte na barriga em 1 dia/.test(await p.locator(".semana-atual").innerText()), "semana com dor: o sintoma aparece na lista");
  ok(await p.locator("#semana-anteriores [data-para=guia]").count() === 0, "semanas sem dor não ganham o botão do Guia");
  await t.alvosDeToque("semana com dor 320");
  await p.click(".semana-atual [data-ac=ir][data-para=guia]");
  await p.waitForSelector("#abas a.ativa[href='#guia']");
  ok(true, "o botão leva ao Guia, onde estão os sinais de alerta");
  await t.fechar();

  // Sem aplicação: convite para registrar, que leva ao diário.
  t = await abrir({ estado: estadoBase(), aba: "semana" }); p = t.p;
  await p.waitForSelector("[data-semana=vazia]");
  await t.alvosDeToque("semana vazia");
  await p.click("[data-semana=vazia] button");
  await p.waitForSelector("form[data-form=dose]");
  ok(true, "sem aplicação, o botão leva ao registro de aplicação");
  await t.fechar();

  // Navegar para #semana com o app já aberto (como o diretor vai ligar depois).
  t = await abrir({ estado: seisSemanas() }); p = t.p;
  await p.waitForSelector("text=Proteína hoje");
  await p.evaluate(() => { location.hash = "#semana"; });
  await p.waitForSelector(".semana-atual");
  ok(true, "com o app aberto, #semana mostra a visão semanal");
  await t.fechar();
})();
