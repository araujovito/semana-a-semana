// Avisos de segurança do Perfil em Hoje (auditoria 2, pendência 4): gravidez/amamentação, peso abaixo da faixa (IMC < 18,5) e
// pílula nas semanas de dose nova aparecem em Hoje como uma linha e "ver"; quem não está nessas condições não vê nada.
// Relógio fixo do apoio: sexta, 20/11/2026. Pesos e alturas daqui são de teste, não os dela.
const { abrir, ok, d, estadoBase } = require("./apoio");
const texto = async (p, sel) => ((await p.locator(sel).count()) ? (await p.locator(sel).first().innerText()).replace(/\s+/g, " ") : "");
const comPerfil = (extra, resto) => estadoBase(Object.assign({ perfil: Object.assign({}, estadoBase().perfil, extra) }, resto || {}));
const dose = (n, mg) => ({ id: "d" + n, data: d(n), mg, local: "Abdômen", obs: "" });
const semanal = (de, mgDe) => { const l = []; for (let n = de; n >= 0; n -= 7) l.push(dose(n, mgDe(n))); return l; };
const AVISOS = "[data-aviso=gestante], [data-aviso=pesoBaixo], [data-aviso=pilula]";
async function hoje(estado, largura) { const t = await abrir({ estado, largura }); await t.p.waitForSelector("text=Proteína hoje"); return t; }

(async () => {
  /* ---------- sem nenhuma condição: Hoje igual a antes ---------- */
  for (const [nome, extra] of [["perfil sem respostas", {}], ["pílula não, gravidez não", { pilula: false, gestante: false }]]) {
    const t = await hoje(comPerfil(extra)), tela = await texto(t.p, "#tela");
    ok(await t.p.locator(AVISOS).count() === 0 && !/Gravidez e amamentação|faixa de referência|Pílula anticoncepcional/.test(tela), "Hoje sem avisos curtos: " + nome);
    await t.fechar();
  }

  /* ---------- gravidez ou amamentação ---------- */
  let t = await hoje(comPerfil({ gestante: true, pilula: true }), 440), p = t.p;
  let linha = await texto(p, "[data-aviso=gestante]");
  ok(/^Gravidez e amamentação: fale com o seu médico\. ver$/.test(linha), "gravidez: uma linha e ver em Hoje: " + linha);
  ok(await p.locator("[data-aviso=pilula]").count() === 0, "gravidez marcada: sem a linha da pílula (o cartão de gravidez leva ao mesmo artigo)");
  ok(!/Enquanto esta resposta estiver marcada/.test(await texto(p, "#tela")), "gravidez: o cartão inteiro não ocupa a Hoje");
  await t.alvosDeToque("hoje com aviso de gravidez"); await t.semRolagem("hoje com aviso de gravidez"); await t.foto("aviso-gravidez-hoje");
  await p.click("[data-aviso=gestante] [data-ac=verAviso]");
  let folha = await texto(p, "#folha");
  ok(/O remédio não é usado na gravidez; na amamentação, quem decide é o médico\. Fale com o seu médico\. Enquanto esta resposta estiver marcada no Perfil, o app não calcula redução de calorias\./.test(folha),
    "gravidez: ver abre o texto do cartão do Perfil numa folha");
  await p.click("#folha [data-ac=avisoGuia]");
  ok(await p.locator("#folha").isHidden() && await p.waitForSelector("text=Anticoncepcional e gravidez", { timeout: 3000 }).then(() => true, () => false), "gravidez: Abrir o Guia fecha a folha e mostra o Guia");
  await p.goto(p.url().replace(/#.*$/, "") + "#plano"); await p.waitForSelector("text=Gravidez e amamentação");
  ok(/Enquanto esta resposta estiver marcada no Perfil/.test(await texto(p, "#tela")), "gravidez: o cartão inteiro continua no Plano");
  await t.fechar();

  /* ---------- peso abaixo da faixa, com e sem modo discreto ---------- */
  for (const discreto of [false, true]) {
    const nome = discreto ? " (modo discreto)" : "";
    t = await hoje(comPerfil({ altura: 163, peso: 45, discreto }), 440); p = t.p;
    linha = await texto(p, "[data-aviso=pesoBaixo]");
    ok(/^Peso abaixo da faixa de referência: fale com o seu médico sobre a dose e o peso\. ver$/.test(linha) && !/\d/.test(linha), "peso baixo: uma linha sem número e ver" + nome + ": " + linha);
    await t.alvosDeToque("hoje com peso baixo" + nome); await t.semRolagem("hoje com peso baixo" + nome); await t.foto("aviso-peso-baixo-hoje" + (discreto ? "-discreto" : ""));
    await p.click("[data-aviso=pesoBaixo] [data-ac=verAviso]");
    folha = await texto(p, "#folha");
    ok(/você está abaixo da faixa de referência \(IMC menor que 18,5\)\. Fale com o seu médico sobre a dose e o peso\./.test(folha) && !/kg|45|16,9/.test(folha), "peso baixo: ver abre o texto do Perfil, sem o peso dela" + nome);
    await t.fechar();
  }

  /* ---------- pílula: antes da 1ª aplicação e nos 28 dias depois da 1ª dose ou de uma dose maior ---------- */
  const casos = [
    ["sem aplicação registrada", [], true],
    ["primeira dose há 14 dias", semanal(14, () => 2.5), true],
    ["mesma dose há 35 dias", semanal(35, () => 2.5), false],
    ["dose subiu há 7 dias", semanal(35, n => (n <= 7 ? 5 : 2.5)), true],
    ["dose desceu há 7 dias", semanal(35, n => (n <= 7 ? 2.5 : 5)), false],
  ];
  for (const [nome, doses, aparece] of casos) {
    t = await hoje(comPerfil({ pilula: true, gestante: false }, { doses })); p = t.p;
    ok(await p.locator("[data-aviso=pilula]").count() === (aparece ? 1 : 0), "pílula, " + nome + ": " + (aparece ? "linha em Hoje" : "sem linha em Hoje"));
    if (nome === "dose subiu há 7 dias") {
      linha = await texto(p, "[data-aviso=pilula]");
      ok(/^Pílula anticoncepcional: o remédio pode reduzir o efeito dela\. Veja o que fazer nestas semanas\. ver$/.test(linha), "pílula: texto da linha: " + linha);
      await p.click("[data-aviso=pilula] [data-ac=verAviso]");
      folha = await texto(p, "#folha");
      ok(/A tirzepatida pode reduzir o efeito da pílula anticoncepcional/.test(folha) && /método de barreira \(camisinha\) por 4 semanas depois da primeira dose e por 4 semanas depois de cada aumento de dose/.test(folha),
        "pílula: ver abre os parágrafos do artigo do Guia");
      await t.alvosDeToque("folha da pílula");
    }
    await t.fechar();
  }
  t = await hoje(comPerfil({ pilula: true, sexo: "M" })); ok(await t.p.locator(AVISOS).count() === 0, "perfil masculino: sem linha da pílula"); await t.fechar();
})();
