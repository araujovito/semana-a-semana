// Tela Painel: hoje (anéis e quanto falta), barras de 7 e 30 dias com lacunas, toque mostra o valor, resumo, modo discreto,
// claro e escuro, 320 a 430 px. Estado semeado com 30 dias de registros (alguns dias sem nada).
const { abrir, ok, d, estadoBase } = require("./apoio");
const SEM = [2, 5, 6, 13, 20, 27];   // dias atrás sem registro (lacunas)
function semear() {
  const dias = {};
  for (let n = 0; n < 30; n++) {
    if (SEM.indexOf(n) >= 0) continue;
    const q = n % 4 === 0 ? 0.5 : 1;
    dias[d(n)] = { enjoo: false, comido: n === 0 ? [{ q: 1 }] : [{ q: 1 }, { q: q }, { q: 1 }, n % 3 ? { q: 1 } : { q: 0 }, n % 7 ? { q: 1 } : null], agua: 0, protExtra: n % 5 === 0 ? 20 : 0, caminhada: 0 };
  }
  return estadoBase({ dias });
}
(async () => {
  let t = await abrir({ estado: semear(), aba: "painel" }), p = t.p;
  await p.waitForSelector(".painel-hoje");
  ok(await p.locator("#abas a[data-aba=painel]").count() === 0, "a barra de abas não ganhou botão (navegação fica para o redesenho)");
  const conta = await p.evaluate(() => { const c = consumoDoDia(hoje()), m = metas(); return { prot: Math.round(c.total.prot), kcal: Math.round(c.total.kcal), falta: painelFaltaProt(c.total.prot, m.prot) }; });
  ok(parseInt((await p.locator("[data-v=prot]").textContent()).replace(/\./g, ""), 10) === conta.prot, "anel de proteína mostra o consumido hoje");
  ok(parseInt((await p.locator("[data-v=kcal]").textContent()).replace(/\./g, ""), 10) === conta.kcal, "anel de calorias mostra o consumido hoje");
  ok((await p.locator("[data-painel=falta]").textContent()).indexOf("Faltam " + conta.falta.toLocaleString("pt-BR") + " g") === 0, "diz quanto falta de proteína");

  // 7 dias: 7 colunas por gráfico, lacunas onde não houve registro
  ok(await p.locator("svg[data-graf=prot] g.dia").count() === 7 && await p.locator("svg[data-graf=kcal] g.dia").count() === 7, "7 dias nos dois gráficos");
  ok(await p.locator("svg[data-graf=prot] g.dia.lacuna").count() === SEM.filter(n => n < 7).length, "dias sem registro aparecem como lacuna");
  ok(await p.locator("svg[data-graf=prot] g.lacuna rect.coluna").count() === 0, "lacuna não vira barra de zero");
  ok(await p.locator("svg[data-graf=prot] line.meta").count() === 1 && await p.locator("svg[data-graf=prot] rect.faixa").count() === 1, "proteína tem linha de meta e faixa");
  const r7 = await p.evaluate(() => painelResumo(painelSerie(mais(hoje(), -1), 7), metas()));
  ok(r7.dias === 7 - SEM.filter(n => n >= 1 && n <= 7).length, "resumo de 7 dias conta só dias com registro (" + r7.dias + ")");
  ok((await p.locator("[data-v=diasRegistro]").textContent()).indexOf("Dias com registro: " + r7.dias + " de 7") === 0, "a tela mostra os dias com registro");
  ok(parseInt((await p.locator("[data-v=mediaProt]").textContent()).replace(/\./g, ""), 10) === Math.round(r7.mediaProt), "média de proteína na tela");
  ok((await p.locator("[data-v=naFaixa]").textContent()).trim() === r7.naFaixa + " de " + r7.dias, "dias na faixa na tela");
  ok((await p.locator("[data-v=abaixoKcal]").textContent()).trim() === r7.abaixoKcal + " de " + r7.dias, "dias abaixo de 1.200 kcal na tela");
  const alturas = await p.evaluate(() => [...document.querySelectorAll("svg[data-graf=prot] rect.coluna")].map(r => r.getBoundingClientRect().height));
  ok(Math.max.apply(null, alturas) > 40, "as barras têm a altura do valor (nenhum estilo global achata o SVG)");
  await t.foto("painel-1-7dias");

  // toque numa barra mostra o valor; numa lacuna diz "sem registro"
  await p.locator("svg[data-graf=prot] g.dia").nth(6 - 1).click();   // ontem
  const ontem = await p.evaluate(() => Math.round(consumoDoDia(mais(hoje(), -1)).total.prot));
  ok(/Ontem|, \d\d\/\d\d: /.test(await p.locator("[data-painel=leitura]").textContent()) && (await p.locator("[data-painel=leitura]").textContent()).indexOf(ontem.toLocaleString("pt-BR") + " g") > 0, "toque na barra mostra o valor do dia");
  await p.locator("svg[data-graf=prot] g.dia").nth(6 - 2).click();   // 2 dias atrás: lacuna
  ok(/sem registro/.test(await p.locator("[data-painel=leitura]").textContent()), "toque na lacuna diz sem registro");
  await p.locator("svg[data-graf=kcal] g.dia").nth(6 - 3).hover();
  ok(/kcal/.test(await p.locator("[data-painel=leitura]").textContent()), "passar o ponteiro também mostra o valor");

  // 30 dias
  await p.click("[data-ac=painelPeriodo][data-n='30']");
  ok(await p.locator("svg[data-graf=prot] g.dia").count() === 30, "30 dias no gráfico");
  ok(await p.locator("svg[data-graf=prot] g.dia.lacuna").count() === SEM.length, "todas as lacunas dos 30 dias");
  ok(/Nos 30 dias antes de hoje/.test(await p.locator(".painel-resumo h2").textContent()), "resumo passa para 30 dias");
  ok((await t.ler()).ui.painelPeriodo === 30, "a escolha de 30 dias fica gravada em E.ui");
  await p.reload(); await p.waitForSelector(".painel-hoje");
  ok(await p.locator("svg[data-graf=prot] g.dia").count() === 30 && await p.locator("[data-ac=painelPeriodo][data-n='30'][aria-pressed=true]").count() === 1, "ao abrir de novo, o painel volta em 30 dias");
  const textos = await p.locator("#tela").textContent();
  ok(!/parab|falhou|fracass|deveria/i.test(textos), "texto sem elogio nem cobrança");
  // 30 dias num celular de 320 px: barra fina, mas o alvo de cada dia é a coluna inteira e alto
  await p.setViewportSize({ width: 320, height: 800 });
  const alvos = await p.evaluate(() => { const svg = document.querySelector("svg[data-graf=prot]").getBoundingClientRect();
    const rs = [...document.querySelectorAll("svg[data-graf=prot] rect.alvo")].map(r => r.getBoundingClientRect());
    const barras = [...document.querySelectorAll("svg[data-graf=prot] rect.coluna")].map(r => r.getBoundingClientRect().width);
    return { svg: [svg.left, svg.right], min: Math.min.apply(null, rs.map(r => r.height)), larg: rs.map(r => r.width), x: rs.map(r => [r.left, r.right]), barra: Math.max.apply(null, barras) }; });
  const emenda = alvos.x.every((r, i) => i === 0 || Math.abs(r[0] - alvos.x[i - 1][1]) < 0.6);
  ok(alvos.min >= 44, "30 dias em 320 px: alvo de cada dia com " + Math.round(alvos.min) + " px de altura (pelo menos 44)");
  ok(emenda && alvos.x[0][0] - alvos.svg[0] < 8 && alvos.svg[1] - alvos.x[29][1] < 8 && Math.min.apply(null, alvos.larg) > alvos.barra,
    "os alvos cobrem a coluna inteira de cada dia, emendados, mais largos que a barra (" + alvos.larg[0].toFixed(1) + " contra " + alvos.barra.toFixed(1) + " px)");
  // arrastar o dedo troca o dia
  const caixa = await p.locator("svg[data-graf=prot]").boundingBox();
  const meio = i => caixa.x + alvos.x[i][0] - alvos.svg[0] + alvos.larg[i] / 2;
  await p.evaluate(([x, y]) => { const svg = document.querySelector("svg[data-graf=prot]"); const el = document.elementFromPoint(x, y);
    el.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, clientX: x, clientY: y, pointerType: "touch" })); }, [meio(3), caixa.y + 20]);
  const l1 = await p.locator("[data-painel=leitura]").textContent();
  await p.evaluate(([x, y]) => { document.elementFromPoint(x, y).dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: x, clientY: y, pointerType: "touch" })); }, [meio(10), caixa.y + 20]);
  const l2 = await p.locator("[data-painel=leitura]").textContent(), esp = await p.evaluate(() => [3, 10].map(i => document.querySelectorAll("svg[data-graf=prot] g.dia")[i].dataset.ler));
  ok(l1 === esp[0] && l2 === esp[1], "arrastar o dedo pelo gráfico vai mostrando o dia debaixo dele");
  // teclado: o gráfico recebe foco; setas, Home e End percorrem os dias e a leitura é falada (aria-live)
  await p.focus("svg[data-graf=prot]");
  await p.keyboard.press("End");
  ok(/^Hoje \(em andamento\)/.test(await p.locator("[data-painel=leitura]").textContent()), "End vai a hoje");
  await p.keyboard.press("ArrowLeft");
  ok((await p.locator("[data-painel=leitura]").textContent()) === await p.evaluate(() => document.querySelectorAll("svg[data-graf=prot] g.dia")[28].dataset.ler), "seta para a esquerda vai ao dia anterior");
  await p.keyboard.press("Home");
  ok((await p.locator("[data-painel=leitura]").textContent()) === await p.evaluate(() => document.querySelector("svg[data-graf=prot] g.dia").dataset.ler) &&
    await p.locator("svg[data-graf=prot] g.dia.sel").count() === 1, "Home vai ao dia mais antigo e só ele fica destacado");
  ok(await p.locator("[data-painel=leitura][aria-live=polite]").count() === 1, "a linha de leitura é aria-live");
  const tab = await p.evaluate(() => [...document.querySelectorAll("svg.painel-graf")].map(s => s.getAttribute("tabindex") + "|" + s.getAttribute("role") + "|" + s.getAttribute("aria-label")));
  ok(tab.length === 2 && tab.every(x => /^0\|img\|Gráfico de (proteína|calorias) por dia, 30 dias, meta de .*Setas/.test(x)), "os gráficos têm foco, papel de imagem e descrição: " + tab[0]);
  ok((await p.locator(".painel-anel svg[role=img]").evaluateAll(xs => xs.map(x => x.getAttribute("aria-label")))).every(x => /^\d+% da meta de (proteína|calorias)$/.test(x)), "os anéis dizem o percentual ao leitor de tela");
  // tabela equivalente a cada gráfico
  for (const k of ["prot", "kcal"]) {
    const linhas = await p.locator("details[data-tabela=" + k + "] tbody tr").count();
    const lacunas = await p.locator("details[data-tabela=" + k + "] tbody td", { hasText: "sem registro" }).count();
    ok(linhas === 30 && lacunas === SEM.length, "tabela de " + k + ": 30 dias e as mesmas " + SEM.length + " lacunas do gráfico");
  }
  await p.click("details[data-tabela=prot] summary");
  const primeira = await p.locator("details[data-tabela=prot] tbody tr").first().innerText();
  ok(/^Hoje \(em andamento\)\s+\d/.test(primeira) && primeira.indexOf(String(conta.prot)) > 0, "tabela começa por hoje com o mesmo valor do anel");
  ok(await p.locator("details[data-tabela=prot] th[scope=col]").count() === 2 && await p.locator("details[data-tabela=prot] caption").count() === 1, "tabela com legenda e cabeçalho de coluna");
  await t.foto("painel-2b-tabela");
  await p.click("details[data-tabela=prot] summary");
  for (const w of [320, 430]) { await p.setViewportSize({ width: w, height: 800 }); await t.semRolagem("painel 30 dias " + w + " px"); await t.alvosDeToque("painel " + w + " px"); }
  await t.foto("painel-2-30dias");
  await t.fechar();

  // modo discreto: some tudo de calorias
  const disc = semear(); disc.perfil.discreto = true;
  t = await abrir({ estado: disc, aba: "painel", largura: 320 }); p = t.p;
  await p.waitForSelector(".painel-hoje");
  ok(await p.locator("svg[data-graf=kcal]").count() === 0 && await p.locator("[data-v=kcal]").count() === 0 && await p.locator("[data-v=mediaKcal]").count() === 0, "discreto esconde gráfico, anel e média de calorias");
  ok(!/kcal|[Cc]alorias/.test(await p.locator("#tela").textContent()), "discreto: nenhuma menção a calorias");
  ok(await p.locator("svg[data-graf=prot]").count() === 1, "discreto mantém a proteína");
  await t.semRolagem("painel discreto 320 px");
  await t.fechar();

  // escuro: usa as cores do tema
  t = await abrir({ estado: semear(), aba: "painel", escuro: true, largura: 360 }); p = t.p;
  await p.waitForSelector(".painel-hoje");
  // Compara com as variáveis do bloco de cores de estilo.css (escuro), sem fixar o valor: a paleta pode mudar só ali.
  const cor = await p.evaluate(() => {
    const tok = v => { const x = document.createElement("i"); x.style.color = "var(" + v + ")"; document.body.appendChild(x); const c = getComputedStyle(x).color; x.remove(); return c; };
    return [getComputedStyle(document.querySelector(".painel-hoje")).backgroundColor, getComputedStyle(document.querySelector("svg[data-graf=prot] rect.coluna")).fill, tok("--cartao"), tok("--cor"), matchMedia("(prefers-color-scheme: dark)").matches];
  });
  ok(cor[4] && cor[0] === cor[2] && cor[1] === cor[3], "tema escuro nas cores de estilo.css (" + cor.slice(0, 2).join(", ") + ")");
  await t.semRolagem("painel escuro 360 px");
  await t.foto("painel-3-escuro");
  await t.fechar();
})();
