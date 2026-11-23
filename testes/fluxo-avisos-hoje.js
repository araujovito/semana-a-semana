// Avisos de segurança do Perfil em Hoje (auditoria 2, pendência 4): gravidez/amamentação e peso abaixo da faixa (IMC < 18,5)
// aparecem em Hoje como uma linha e "ver"; quem não está nessas condições não vê nada.
// Relógio fixo do apoio: sexta, 20/11/2026. Pesos e alturas daqui são de teste, não os dela.
const { abrir, ok, estadoBase } = require("./apoio");
const texto = async (p, sel) => ((await p.locator(sel).count()) ? (await p.locator(sel).first().innerText()).replace(/\s+/g, " ") : "");
const comPerfil = (extra, resto) => estadoBase(Object.assign({ perfil: Object.assign({}, estadoBase().perfil, extra) }, resto || {}));
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

})();
