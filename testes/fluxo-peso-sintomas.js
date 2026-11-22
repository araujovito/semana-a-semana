// Diario > Peso e Sintomas: grafico no tempo com trocas de dose, variacao por semana, aviso de ritmo, corrigir registros, modo discreto e datas.
const { abrir, ok, d, estadoBase } = require("./apoio");
const P = (n, kg, cintura) => ({ id: "p" + n, data: d(n), kg, cintura: cintura || null });
const D = (n, mg) => ({ id: "d" + n, data: d(n), mg, local: "Coxa esquerda", obs: "" });
const noPeso = extra => Object.assign({ ui: { diario: "peso" } }, extra);
(async () => {
  // 1. Perda de 1,5% por semana em 3 semanas, com troca de dose e uma semana sem pesagem.
  const doses = [D(35, 2.5), D(28, 2.5), D(21, 2.5), D(14, 2.5), D(7, 5), D(0, 5)];
  const rapido = estadoBase(noPeso({ doses, pesos: [P(28, 101, 100), P(21, 100, 99), P(7, 97), P(0, 95.5, 96)] }));
  let t = await abrir({ estado: rapido, aba: "diario" }), p = t.p;
  await p.waitForSelector("form[data-form=peso]");
  ok(await p.locator("svg.graf circle").count() === 5, "gráfico: 4 pesagens e o ponto de início");
  ok(await p.locator("svg.graf line.marca").count() === 2, "gráfico: uma marca para cada troca de dose");
  const rotulos = await p.locator("svg.graf text.dose").allTextContents();
  ok(rotulos.join("|") === "2,5 mg|5,0 mg", "gráfico: marcas com o rótulo da dose (" + rotulos.join("|") + ")");
  const cx = await p.$$eval("svg.graf circle", cs => cs.map(c => Number(c.getAttribute("cx"))));
  ok(Math.abs((cx[2] - cx[1]) * 2 - (cx[3] - cx[2])) < 0.5, "gráfico: 14 dias ocupam o dobro de 7 dias no eixo");
  const xm = await p.$$eval("svg.graf line.marca", ls => ls.map(l => Number(l.getAttribute("x1"))));
  ok(Math.abs(xm[0] - cx[0]) < 0.5 && xm[1] > cx[2] && Math.abs(xm[1] - cx[3]) < 0.5, "gráfico: as marcas caem na data da primeira aplicação de cada dose");
  const ritmo = await p.locator("#ritmo").innerText();
  ok(/Você perdeu em média 1,5% do peso por semana nos 21 dias entre/.test(ritmo) && /Perda rápida aumenta a perda de músculo\. É um assunto para levar ao seu médico\./.test(ritmo), "aviso de ritmo aparece com 1,5% por semana: " + ritmo.replace(/\n/g, " "));
  ok(!(await p.locator("#ritmo").evaluate(el => el.classList.contains("alerta"))), "aviso de ritmo sem cor de alarme");
  const sem = await p.locator("#semanas table tr").allInnerTexts();
  ok(sem.length === 6 && /95,5 kg/.test(sem[1]) && /-1,5 kg \(-1,5%\)/.test(sem[1]) && /sem registro/.test(sem[3]) && /em 2 semanas/.test(sem[2]), "variação por semana, com semana sem registro: " + sem.slice(1, 4).join(" / ").replace(/\s+/g, " "));
  await t.semRolagem("peso"); await t.alvosDeToque("peso"); await t.foto("peso-1-rapido");

  // Corrigir uma pesagem: o formulário é preenchido, o id fica e nada duplica.
  await p.click("#hist-peso .reg:nth-of-type(2) [data-ac=editarPeso]"); // a de 7 dias atrás
  ok(await p.locator("form[data-form=peso] h2").innerText() === "Corrigir peso", "corrigir: o título vira Corrigir peso");
  ok(await p.inputValue("[name=kg]") === "97" && await p.inputValue("[name=data]") === d(7), "corrigir: formulário preenchido com o registro");
  ok(await p.locator("form[data-form=peso] button:not([data-ac])").innerText() === "Salvar alteração" && await p.locator("[data-ac=cancelarPeso]").count() === 1, "corrigir: botões Salvar alteração e Cancelar");
  const topoForm = await p.evaluate(() => document.querySelector("form[data-form=peso]").getBoundingClientRect().top), altTopo = await p.evaluate(() => document.getElementById("topo").offsetHeight);
  ok(topoForm >= altTopo && topoForm < 400, "corrigir: a tela rola até o formulário (" + Math.round(topoForm) + " px)");
  await t.foto("peso-2-corrigindo");
  await p.click("[data-ac=cancelarPeso]");
  ok(await p.locator("form[data-form=peso] h2").innerText() === "Registrar peso" && await p.inputValue("[name=kg]") === "", "cancelar volta ao formulário vazio");
  await p.click("#hist-peso .reg:nth-of-type(2) [data-ac=editarPeso]");
  await p.fill("[name=kg]", "97,4"); await p.fill("[name=cintura]", "98"); await p.click("form[data-form=peso] button:not([data-ac])");
  let e = await t.ler(), reg = e.pesos.find(x => x.id === "p7");
  ok(e.pesos.length === 4 && reg && reg.kg === 97.4 && reg.cintura === 98 && reg.data === d(7), "corrigir peso mantém o id e não duplica");
  ok(await p.locator("form[data-form=peso] h2").innerText() === "Registrar peso", "depois de salvar a correção, o formulário volta ao normal");
  // Corrigir mudando a data
  await p.click("#hist-peso .reg:nth-of-type(2) [data-ac=editarPeso]"); await p.fill("[name=data]", d(8)); await p.click("form[data-form=peso] button:not([data-ac])");
  e = await t.ler(); ok(e.pesos.length === 4 && e.pesos.find(x => x.id === "p7").data === d(8), "corrigir a data mantém o id");
  // Apagar o registro que está em correção não deixa o formulário preso
  // (apagar pede confirmação no diálogo da página; Cancelar não apaga nem tira da correção)
  await p.click("#hist-peso .reg:nth-of-type(1) [data-ac=editarPeso]"); await p.click("#hist-peso .reg:nth-of-type(1) [data-ac=apagar]");
  ok(await t.textoDialogo() === "Apagar este registro?", "apagar pesagem pergunta antes, no diálogo da página");
  await t.nao();
  ok(await p.locator("form[data-form=peso] h2").innerText() === "Corrigir peso" && (await t.ler()).pesos.length === 4, "cancelar o apagar mantém o registro e a correção");
  await p.click("#hist-peso .reg:nth-of-type(1) [data-ac=apagar]"); await t.sim();
  ok(await p.locator("form[data-form=peso] h2").innerText() === "Registrar peso" && (await t.ler()).pesos.length === 3, "apagar o registro em correção devolve o formulário ao normal");
  // Datas: ano absurdo e mais de 1 ano atrás são recusados com mensagem
  for (const [data, nome] of [["0026-11-20", "ano 0026"], [d(400), "mais de 1 ano atrás"]]) {
    await p.evaluate(v => { const c = document.querySelector("form[data-form=peso]"); c.noValidate = true; c.querySelector("[name=data]").value = v; }, data);
    await p.fill("[name=kg]", "90"); await p.click("form[data-form=peso] button:not([data-ac])");
    ok((await t.ler()).pesos.length === 3 && /Confira a data/.test(await p.locator("#aviso").innerText()), "peso com data errada (" + nome + ") é recusado com mensagem");
  }
  await p.evaluate(() => { const c = document.querySelector("form[data-form=peso]"); c.noValidate = true; c.querySelector("[name=data]").value = ""; }); await p.click("form[data-form=peso] button:not([data-ac])");
  // A checagem de campo obrigatório da página (campoFaltando, em inicio.js) pega a data vazia antes de FORM.peso
  ok(/Preencha o campo: Data\.|Informe a data/.test(await p.locator("#aviso").innerText()), "peso sem data avisa em vez de não fazer nada");
  ok(await p.getAttribute("[name=data]", "min") === d(365) && await p.getAttribute("[name=data]", "max") === d(0), "campo de data limitado de 1 ano atrás até hoje");
  await t.fechar();

  // 2. Relatório do mesmo caso: ritmo e semanas como linhas factuais.
  t = await abrir({ estado: Object.assign({}, rapido, { ui: { diario: "relatorio" } }), aba: "diario" }); p = t.p;
  let rel = await p.inputValue("#rel"); console.log("-----\n" + rel.split("\n\n").filter(x => /^PESO|^SINTOMAS/.test(x)).join("\n\n") + "\n-----");
  ok(/Ritmo entre \d\d\/\d\d\/\d{4} e \d\d\/\d\d\/\d{4} \(21 dias\): perda média de 1,5% do peso por semana, acima de 1% por semana\./.test(rel), "relatório traz o ritmo de perda");
  ok(/Semana de \d\d\/\d\d: sem registro/.test(rel) && /Semana de \d\d\/\d\d: 95,5 kg, -1,5 kg \(-1,5%\)/.test(rel), "relatório traz a variação por semana");
  await t.fechar();

  // 3. Perda de 0,5% por semana: sem aviso. Uma pesagem só, muito abaixo do peso do perfil: sem aviso.
  t = await abrir({ estado: estadoBase(noPeso({ pesos: [P(21, 95), P(14, 94.5), P(7, 94), P(0, 93.575)] })), aba: "diario" }); p = t.p;
  await p.waitForSelector("#semanas");
  ok(await p.locator("#ritmo").count() === 0, "sem aviso com perda de 0,5% por semana");
  ok(await p.locator("svg.graf circle").count() === 4 && await p.locator("svg.graf line.marca").count() === 0, "sem aplicações: só as pesagens no gráfico, sem marcas");
  await p.click("[data-ac=diario][data-v=relatorio]"); rel = await p.inputValue("#rel");
  ok(/perda média de 0,5% do peso por semana\./.test(rel) && !/acima de 1%/.test(rel), "relatório mostra o ritmo de 0,5% sem a marca de acima de 1%");
  await t.fechar();
  t = await abrir({ estado: estadoBase(noPeso({ pesos: [P(0, 80)] })), aba: "diario" }); p = t.p;
  await p.waitForSelector("#hist-peso");
  ok(await p.locator("#ritmo").count() === 0, "uma pesagem só (15 kg abaixo do peso do perfil) não dispara o aviso");
  ok(await p.locator("svg.graf circle").count() === 1 && await p.locator("#semanas").count() === 0, "uma pesagem: gráfico com 1 ponto e sem tabela de semanas");
  await t.foto("peso-3-um-ponto");
  // duas pesagens em 6 dias com queda grande: ainda sem aviso
  await t.semear(estadoBase(noPeso({ pesos: [P(6, 95), P(0, 90)] }))); await p.waitForSelector("#semanas");
  ok(await p.locator("#ritmo").count() === 0 && await p.locator("svg.graf circle").count() === 2, "duas pesagens em 6 dias não disparam o aviso; gráfico com 2 pontos");
  await t.foto("peso-4-dois-pontos");
  await t.fechar();

  // 4. Modo discreto: nada de variação em destaque; gráfico recolhido; relatório completo.
  t = await abrir({ estado: Object.assign({}, rapido, { perfil: Object.assign({}, rapido.perfil, { discreto: true }) }), aba: "diario" }); p = t.p;
  await p.waitForSelector("#hist-peso");
  const tela = await p.locator("#tela").innerText();
  ok(await p.locator("#ritmo").count() === 0 && await p.locator("#semanas").count() === 0 && !/Variação|Inicial|%|[+-]\d+,\d kg/.test(tela), "modo discreto: sem Inicial/Atual/Variação, sem semanas, sem aviso, sem diferenças nem percentuais");
  ok(await p.locator("#hist-peso .reg").count() === 4 && /95,5 kg/.test(tela), "modo discreto: a lista de pesagens continua");
  ok(await p.locator("svg.graf").count() === 1 && !(await p.locator("svg.graf").isVisible()), "modo discreto: gráfico recolhido");
  await t.foto("peso-5-discreto");
  await p.click("#graf-discreto summary"); ok(await p.locator("svg.graf").isVisible(), "modo discreto: Ver gráfico abre o gráfico");
  await t.semRolagem("peso discreto"); await t.alvosDeToque("peso discreto");
  await p.click("[data-ac=diario][data-v=relatorio]"); rel = await p.inputValue("#rel");
  ok(/acima de 1% por semana/.test(rel) && /Semana de/.test(rel) && /Inicial: /.test(rel), "modo discreto: o relatório continua completo");
  await t.fechar();

  // 5. 320 px e modo escuro, com 30 pesagens e todas as doses; e com 1 e 2 pontos.
  const muitos = estadoBase(noPeso({ pesos: Array.from({ length: 30 }, (x, i) => P(7 * (29 - i), Math.round((110 - i * 0.7) * 10) / 10, 100)), doses: [D(210, 2.5), D(182, 5), D(154, 7.5), D(140, 10), D(112, 12.5), D(84, 15)] }));
  for (const [nome, estado] of [["30 pontos", muitos], ["1 ponto", estadoBase(noPeso({ pesos: [P(3, 94)], doses: [D(3, 2.5)] }))], ["2 pontos", estadoBase(noPeso({ pesos: [P(10, 94), P(3, 93.5)], doses: [D(12, 2.5), D(5, 2.5)] }))]]) {
    t = await abrir({ estado, aba: "diario", largura: 320, escuro: true }); p = t.p;
    await p.waitForSelector("#hist-peso");
    const caixa = await p.evaluate(() => { const s = document.querySelector("svg.graf").getBoundingClientRect(), c = document.querySelector("svg.graf").closest(".cartao").getBoundingClientRect(); return s.left >= c.left && s.right <= c.right && s.height > 100; });
    ok(caixa, "320 px, escuro, " + nome + ": gráfico dentro do cartão");
    const fora = await p.$$eval("svg.graf text", ts => ts.filter(x => { const b = x.getBBox(); return b.x < 0 || b.x + b.width > 320 || b.y < 0; }).map(x => x.textContent));
    ok(fora.length === 0, "320 px, " + nome + ": nenhum rótulo cortado na borda do gráfico " + fora.join(","));
    await t.semRolagem("peso em 320 px, " + nome); await t.alvosDeToque("peso em 320 px, " + nome); await t.foto("peso-320-escuro-" + nome.replace(" ", "-"));
    if (nome === "30 pontos") {
      const sobre = await p.$$eval("svg.graf text.dose", ts => { const b = ts.map(x => x.getBBox()); let n = 0; for (let i = 0; i < b.length; i++) for (let j = i + 1; j < b.length; j++) if (b[i].x < b[j].x + b[j].width && b[j].x < b[i].x + b[i].width && b[i].y < b[j].y + b[j].height && b[j].y < b[i].y + b[i].height) n++; return n; });
      ok(await p.locator("svg.graf line.marca").count() === 6 && sobre === 0, "30 pontos: 6 marcas de dose sem rótulo em cima de rótulo");
      ok(await p.locator("#semanas > table tr").count() === 9 && /Semanas anteriores \(22\)/.test(await p.locator("#semanas summary").innerText()), "30 semanas: 8 na tela e as outras 22 recolhidas");
      await p.click("#hist-peso .reg:nth-of-type(3) [data-ac=editarPeso]"); await t.semRolagem("corrigindo peso em 320 px"); await t.alvosDeToque("corrigindo peso em 320 px");
    }
    await t.fechar();
  }

  // 6. Sintomas: texto em segunda pessoa, corrigir, datas.
  t = await abrir({ estado: estadoBase({ ui: { diario: "sintomas" }, sintomas: [{ id: "s1", data: d(2), enjoo: 1, intestino: "Preso", vomito: false, refluxo: true, tontura: false, cansaco: false, dor: false, nota: "depois do almoço" }, { id: "s2", data: d(1), enjoo: 0, intestino: "Normal", vomito: false, refluxo: false, tontura: false, cansaco: true, dor: false, nota: "" }] }), aba: "diario" }); p = t.p;
  await p.waitForSelector("form[data-form=sintoma]");
  ok(await p.locator("form[data-form=sintoma] h2").innerText() === "Como você está hoje" && !/\bela\b/i.test(await p.locator("#tela").innerText()), "sintomas fala com você, não de \"ela\"");
  await p.click("#hist-sintomas .reg:nth-of-type(2) [data-ac=editarSintoma]"); // s1
  ok(await p.locator("form[data-form=sintoma] h2").innerText() === "Corrigir registro" && await p.inputValue("[name=enjoo]") === "1" && await p.inputValue("[name=intestino]") === "Preso" && await p.isChecked("[name=refluxo]") && !(await p.isChecked("[name=vomito]")) && await p.inputValue("[name=nota]") === "depois do almoço" && await p.inputValue("[name=data]") === d(2), "corrigir sintoma: formulário preenchido com o registro");
  await t.foto("sintomas-1-corrigindo");
  await p.selectOption("[name=enjoo]", "2"); await p.uncheck("[name=refluxo]"); await p.check("[name=tontura]"); await p.fill("[name=nota]", "à noite"); await p.click("form[data-form=sintoma] button:not([data-ac])");
  e = await t.ler(); reg = e.sintomas.find(x => x.id === "s1");
  ok(e.sintomas.length === 2 && reg.enjoo === 2 && reg.refluxo === false && reg.tontura === true && reg.nota === "à noite" && reg.intestino === "Preso" && reg.data === d(2), "corrigir sintoma mantém o id e não duplica");
  ok(/Enjoo moderado, intestino preso, tontura/.test(await p.locator("#hist-sintomas .reg:nth-of-type(2)").innerText()) && await p.locator("form[data-form=sintoma] h2").innerText() === "Como você está hoje", "histórico mostra o registro corrigido e o formulário volta ao normal");
  await p.click("#hist-sintomas .reg:nth-of-type(1) [data-ac=editarSintoma]"); await p.click("[data-ac=cancelarSintoma]");
  ok(await p.locator("form[data-form=sintoma] h2").innerText() === "Como você está hoje" && (await t.ler()).sintomas.length === 2, "cancelar a correção de sintoma não muda nada");
  await p.evaluate(() => { const c = document.querySelector("form[data-form=sintoma]"); c.noValidate = true; c.querySelector("[name=data]").value = "0026-11-20"; }); await p.click("form[data-form=sintoma] button:not([data-ac])");
  ok((await t.ler()).sintomas.length === 2 && /Confira a data/.test(await p.locator("#aviso").innerText()), "sintoma com ano absurdo é recusado com mensagem");
  await p.reload(); await p.waitForSelector("form[data-form=sintoma]");
  await p.selectOption("[name=enjoo]", "3"); await p.click("form[data-form=sintoma] button:not([data-ac])");
  ok((await t.ler()).sintomas.length === 3, "registro novo de sintoma continua funcionando");
  // Dor forte: o aviso de sinal de alerta aparece no diálogo da página (não no alert do navegador), e o registro já está salvo
  await p.check("[name=dor]"); await p.click("form[data-form=sintoma] button:not([data-ac])");
  ok(/vá ao pronto-socorro hoje\..*ligue 192\./.test(await t.textoDialogo() || "") && (await t.ler()).sintomas.filter(x => x.dor).length === 1, "dor forte: aviso de sinal de alerta no diálogo da página, registro salvo");
  await t.nao();
  ok(await t.textoDialogo() === null && await p.locator("form[data-form=sintoma] h2").innerText() === "Como você está hoje", "tocar em Entendi fecha o aviso e volta ao formulário");
  await t.semRolagem("sintomas"); await t.alvosDeToque("sintomas"); await t.foto("sintomas-2");
  await t.fechar();
  t = await abrir({ estado: estadoBase({ ui: { diario: "sintomas" }, sintomas: [{ id: "s1", data: d(2), enjoo: 3, intestino: "Solto", vomito: true, refluxo: true, tontura: true, cansaco: true, dor: true, nota: "anotação comprida para ver a quebra de linha em tela estreita, semespaçonenhumnofinaldafraseparatestar" }] }), aba: "diario", largura: 320, escuro: true }); p = t.p;
  await p.waitForSelector("#hist-sintomas .reg"); await p.click("[data-ac=editarSintoma]");
  await t.semRolagem("sintomas em 320 px, corrigindo"); await t.alvosDeToque("sintomas em 320 px, corrigindo"); await t.foto("sintomas-320-escuro");
  await t.fechar();
})();
