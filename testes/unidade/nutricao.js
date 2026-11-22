// Metas (limites de seguranca), escala das porcoes, restricoes e trocas automaticas.
const test = require("node:test"), assert = require("node:assert");
const carregar = require("../carregar-app");
const ANO = new Date().getFullYear();
function app(perfil) {
  return carregar({ v: 2, perfil: Object.assign({ nome: "", sexo: "F", nascimento: ANO - 36, altura: 163, peso: 95, atividade: 1.2, metaKcal: null, metaProt: null, metaAgua: null,
    diabetes: null, insulinaSulf: null, pilula: null, naoCome: [], naoGosta: [] }, perfil), doses: [], pesos: [], sintomas: [], treinos: [], dias: {}, trocas: {}, caneta: null, suplementos: [], exames: [], lembretes: {}, ui: {} });
}
const j = (a, codigo) => JSON.parse(a.v("JSON.stringify(" + codigo + ")"));
const comImc = (imc, extra) => app(Object.assign({ altura: 160, peso: Math.round(imc * 1.6 * 1.6 * 100) / 100 }, extra));
// Perfis do briefing: 55 kg/1,55 m, 95 kg/1,63 m, 130 kg/1,70 m, sem e com metas informadas pelo medico.
const PERFIS = [
  { peso: 55, altura: 155 }, { peso: 95, altura: 163 }, { peso: 130, altura: 170 },
  { peso: 55, altura: 155, metaKcal: 1300, metaProt: 80 }, { peso: 95, altura: 163, metaKcal: 1600, metaProt: 110 }, { peso: 130, altura: 170, metaKcal: 1800, metaProt: 130 },
  { peso: 95, altura: 163, metaKcal: 1200, metaProt: 140 }, // proteina alta com energia baixa: nao cabe nos limites
];

test("metas: com IMC abaixo de 25 não há redução de calorias; de 25 para cima há", () => {
  for (const imc of [19.5, 24.9]) {
    const m = j(comImc(imc), "metas()");
    assert.strictEqual(m.semDeficit, true, "IMC " + imc);
    assert.strictEqual(m.abaixoDoPeso, false);
    assert.strictEqual(m.kcalCalc, Math.max(1200, Math.round(m.gasto / 50) * 50), "energia = gasto estimado no IMC " + imc);
  }
  for (const imc of [25.1, 29.9, 30.1]) {
    const m = j(comImc(imc), "metas()");
    assert.strictEqual(m.semDeficit, false, "IMC " + imc);
    assert.strictEqual(m.kcalCalc, Math.max(1200, Math.round((m.gasto - 500) / 50) * 50));
  }
});
test("metas: IMC 17 marca peso baixo, sem redução de calorias", () => {
  const m = j(comImc(17), "metas()");
  assert.strictEqual(m.abaixoDoPeso, true); assert.strictEqual(m.semDeficit, true);
  assert.strictEqual(j(comImc(18.6), "metas()").abaixoDoPeso, false);
});
test("metas: gestante ou amamentando não recebe redução de calorias, com qualquer IMC", () => {
  const m = j(comImc(33, { gestante: true }), "metas()"), n = j(comImc(33), "metas()");
  assert.strictEqual(m.gestante, true); assert.strictEqual(m.semDeficit, true);
  assert.strictEqual(m.kcalCalc, Math.round(m.gasto / 50) * 50);
  assert.strictEqual(n.gestante, false); assert.strictEqual(n.kcalCalc, m.kcalCalc - 500);
});
test("metas: a proteína não dá salto quando o IMC cruza 25 nem 30", () => {
  for (const [a, b] of [[24.9, 25.1], [29.9, 30.1]]) {
    const pa = j(comImc(a), "metas()").protCalc, pb = j(comImc(b), "metas()").protCalc;
    assert.ok(Math.abs(pa - pb) <= 2, "IMC " + a + " -> " + pa + " g; IMC " + b + " -> " + pb + " g");
  }
  const m = j(comImc(35), "metas()"), peso25 = 25 * 1.6 * 1.6;
  assert.ok(Math.abs(m.pesoRef - (peso25 + 0.25 * (m.peso - peso25))) < 0.01, "peso ajustado = peso no IMC 25 + 25% do excesso");
  const n = j(comImc(22), "metas()"); assert.strictEqual(n.pesoRef, n.peso);
});
test("perfil: idade abaixo de 18 é recusada; 18 é aceita", () => {
  const a = carregar();
  const f = ano => a.v("FORM.perfil({ nome: '', sexo: 'F', nascimento: '" + ano + "', altura: '165', peso: '80', atividade: '1.2' })");
  f(ANO - 17);
  assert.strictEqual(a.v("E.perfil"), null); assert.match(a.avisos[a.avisos.length - 1], /18 anos/);
  f(ANO - 16); assert.strictEqual(a.v("E.perfil"), null);
  f(ANO + 3); assert.strictEqual(a.v("E.perfil"), null);
  f("abc"); assert.strictEqual(a.v("E.perfil"), null);
  f(ANO - 18); assert.strictEqual(a.v("E.perfil.nascimento"), ANO - 18);
  assert.deepStrictEqual(j(a, "[E.perfil.gestante, E.perfil.discreto, E.perfil.naoCome]"), [null, false, []]);
});
test("perfil: números absurdos são recusados com mensagem", () => {
  const a = carregar();
  const f = extra => a.v("FORM.perfil(Object.assign({ nome: '', sexo: 'F', nascimento: '1985', altura: '165', peso: '80', atividade: '1.2' }, " + JSON.stringify(extra) + "))");
  for (const ruim of [{ altura: "16" }, { altura: "400" }, { peso: "8" }, { peso: "900" }, { metaKcal: "100" }, { metaKcal: "abc" }, { metaProt: "900" }, { metaAgua: "20" }]) {
    const n = a.avisos.length; f(ruim);
    assert.strictEqual(a.v("E.perfil"), null, JSON.stringify(ruim)); assert.strictEqual(a.avisos.length, n + 1);
  }
});

test("escala: média da semana a até 7% das metas de energia e proteína, ou no limite e avisando", () => {
  PERFIS.forEach((p, i) => {
    const a = app(p), m = j(a, "metas()"), med = j(a, "mediaSemana()");
    const eK = Math.abs(med.kcal / m.kcal - 1), eP = Math.abs(med.prot / m.prot - 1), txt = JSON.stringify(p) + ": " + Math.round(med.kcal) + " de " + m.kcal + " kcal, " + Math.round(med.prot) + " de " + m.prot + " g";
    // Proteína pode passar da meta até o teto de 1,6 g/kg (auditoria 2); abaixo da meta, até 7%.
    const teto = Math.max(m.prot * 1.03, m.protMax);
    assert.strictEqual(m.escalaNoLimite, eK > 0.07 || med.prot < m.prot * 0.93 || med.prot > teto * 1.07, txt + " (teto " + m.protMax + " g)");
    if (i < 6) assert.strictEqual(m.escalaNoLimite, false, txt);
    assert.ok(Math.abs(m.planoKcal - med.kcal) < 0.5 && Math.abs(m.planoProt - med.prot) < 0.05, "metas() informa a média real do plano");
    assert.ok(m.fatorProt >= 0.5 && m.fatorProt <= 1.75 && m.fatorEnergia >= 0.5 && m.fatorEnergia <= 2, "fatores dentro dos limites");
  });
  const lim = j(app(PERFIS[6]), "metas()");
  assert.strictEqual(lim.escalaNoLimite, true);
  assert.ok(Math.abs(lim.planoProt / lim.prot - 1) <= 0.07, "quando não cabe, a proteína tem prioridade");
});
test("auditoria 2: com IMC abaixo de 25 o cardápio chega perto da meta de energia, sem travar no fator mínimo", () => {
  for (const p of [{ altura: 170, peso: 52 }, { altura: 160, peso: 49.9 }, { altura: 155, peso: 55 }]) {
    const m = j(app(p), "metas()"), pct = m.planoKcal / m.kcal;
    assert.ok(pct >= 0.93 && pct <= 1.07 && !m.escalaNoLimite, JSON.stringify(p) + ": " + Math.round(m.planoKcal) + " de " + m.kcal + " kcal");
    assert.ok(m.planoProt >= m.prot * 0.97 && m.planoProt <= m.protMax * 1.07, "proteína entre a meta e 1,6 g/kg: " + Math.round(m.planoProt));
  }
});
test("escala: nenhum dia planejado abaixo de 1.200 kcal, fora o dia de enjoo", () => {
  PERFIS.concat([{ peso: 50, altura: 160 }, { peso: 62, altura: 150, nascimento: ANO - 58 }, { peso: 80, altura: 160, naoCome: ["lactose"] }, { peso: 80, altura: 160, naoCome: ["vegetariana"] }]).forEach(p => {
    const a = app(p);
    for (let i = 0; i < 7; i++) { const k = a.v("somarPlano(planoDoDia(" + i + ")).kcal"); assert.ok(k >= 1200, JSON.stringify(p) + " dia " + i + ": " + Math.round(k) + " kcal"); }
  });
  // meta informada pelo medico abaixo de 1.200: o piso do dia acompanha a meta dele
  assert.strictEqual(j(app({ metaKcal: 1000 }), "metas()").pisoDia, 1000);
});
test("escala: o dia de enjoo nunca é escalado para cima", () => {
  const a = app({ peso: 130, altura: 170, atividade: 1.55 }), m = j(a, "metas()");
  assert.ok(m.fatorEnergia > 1, "perfil que escala para cima");
  const base = a.v("C.nausea.refeicoes.map(r => r.itens.map(it => it[1]))"), plano = j(a, "planoDoDia(7)");
  plano.refeicoes.forEach((r, ri) => r.itens.forEach(it => assert.ok(it.g <= base[ri][it.pos], it.k + ": " + it.g + " g")));
});
test("escala: ovo, pão francês e outros alimentos de unidade não recebem porção quebrada", () => {
  const a = app({});
  assert.deepStrictEqual(j(a, "[porcao('ovo', 100, 0.85), porcao('ovo', 100, 0.5), porcao('ovo', 100, 1.3), porcao('ovo', 50, 0.5)]"), [100, 50, 150, 50]);
  assert.strictEqual(a.v("porcao('frango_peito', 120, 0.85)"), 100);
  PERFIS.forEach(p => {
    const b = app(p);
    for (let i = 0; i < 8; i++) j(b, "planoDoDia(" + i + ")").refeicoes.forEach(r => r.itens.forEach(it => {
      const passo = b.v("passoDaUnidade('" + it.k + "')");
      if (passo) { const n = it.g / passo; assert.ok(Math.abs(n - Math.round(n)) <= Math.max(0.2, 0.5 / passo + 0.01) && n >= 0.9, it.k + " " + it.g + " g (passo " + passo + ")"); }
      if (it.k === "ovo") assert.strictEqual(it.g % 50, 0);
    }));
  });
});
test("escala: verduras, frutas e laticínios ficam na porção de base", () => {
  const a = app({ peso: 130, altura: 170 });
  for (let i = 0; i < 7; i++) {
    const base = a.v("C.dias[" + i + "].refeicoes.map(r => r.itens.map(it => it[1]))");
    j(a, "planoDoDia(" + i + ")").refeicoes.forEach((r, ri) => r.itens.forEach(it => {
      const g = a.v("A['" + it.k + "'].grupo");
      if (g === "vegetal" || g === "laticinio") assert.strictEqual(it.g, a.v("porcao('" + it.k + "', " + base[ri][it.pos] + ", 1)"), it.k);
    }));
  }
});

test("restrições: nada do que você não come sobra no cardápio, inclusive no dia de enjoo", () => {
  const casos = [["lactose", "leite"], ["ovo", "ovo"], ["peixe", "peixe"], ["carne_vermelha", "carne_vermelha"], ["porco", "porco"], ["gluten", "gluten"], ["vegetariana", "carne"]];
  casos.forEach(([id, marca]) => {
    const a = app({ naoCome: [id] });
    let trocados = 0;
    for (let i = 0; i < 8; i++) j(a, "planoDoDia(" + i + ")").refeicoes.forEach(r => {
      r.itens.forEach(it => {
        assert.ok(a.v("A['" + it.k + "'].contem.indexOf('" + marca + "')") < 0, id + ": sobrou " + it.k);
        if (it.de) { trocados++; assert.strictEqual(it.motivo, "restricao"); assert.ok(a.v("A['" + it.de + "'].contem.indexOf('" + marca + "')") >= 0); assert.ok(it.g > 0 && it.g <= 250 || it.g <= a.v("TETO_TROCA") * 2); }
      });
      trocados += r.fora.length;
      assert.strictEqual(r.trocada, r.fora.length > 0 || r.itens.some(it => !!it.de));
    });
    assert.ok(trocados > 0, id + ": alguma troca aconteceu");
  });
});
test("restrições: troca dentro do grupo mantém o nutriente do grupo; sem substituto, o item sai", () => {
  const a = app({});
  assert.ok(Math.abs(a.v("gramasEquivalentes('frango_peito', 100, 'ovo')") * a.v("A.ovo.prot") - 100 * a.v("A.frango_peito.prot")) < 0.01, "proteína: mesma proteína");
  assert.ok(Math.abs(a.v("gramasEquivalentes('arroz_branco', 100, 'batata')") * a.v("A.batata.kcal") - 100 * a.v("A.arroz_branco.kcal")) < 0.01, "carboidrato: mesma energia");
  assert.strictEqual(a.v("gramasEquivalentes('tomate', 80, 'pepino')"), 80, "vegetal: mesmos gramas");
  // sem leite e derivados: hoje a base nao tem laticinio sem leite, entao o item sai e a refeicao fica marcada
  const b = app({ naoCome: ["lactose"] });
  const semLaticinio = b.v("Object.keys(A).filter(k => A[k].grupo === 'laticinio' && A[k].contem.indexOf('leite') < 0).length") === 0;
  if (semLaticinio) assert.ok(j(b, "planoDoDia(0)").refeicoes.some(r => r.fora.length > 0 && r.trocada));
  // quem tira um alimento avulso recebe outro do mesmo grupo
  const c = app({ naoGosta: ["frango_peito"] }), seg = j(c, "planoDoDia(0)");
  const it = [].concat.apply([], seg.refeicoes.map(r => r.itens)).filter(x => x.de === "frango_peito")[0];
  assert.ok(it && c.v("A['" + it.k + "'].grupo") === "proteina" && it.k !== "whey");
});
test("restrições: aviso de nutriente que cai compara com e sem as restrições", () => {
  assert.deepStrictEqual(j(app({}), "quedasPorRestricao()"), []);
  // Sem lactose, o laticínio é trocado pela bebida de soja com cálcio (troca por cálcio): o cálcio não cai e não há aviso dele.
  const soja = j(app({ naoCome: ["lactose"] }), "quedasPorRestricao()");
  assert.ok(!soja.some(x => x.campo === "ca"), "sem lactose, com bebida de soja, o cálcio se mantém: " + JSON.stringify(soja));
  // Sem lactose e sem a bebida de soja, não sobra laticínio: o cálcio cai e o aviso aparece.
  const q = j(app({ naoCome: ["lactose"], naoGosta: ["bebida_soja"] }), "quedasPorRestricao()"), ca = q.filter(x => x.campo === "ca")[0];
  assert.ok(ca && ca.pct < 80 && ca.pct < ca.pctSem, "sem laticínio nenhum o cálcio cai: " + JSON.stringify(q));
});
test("contrato: planoDoDia e planoDaData devolvem refeições com itens { k, g } e a soma bate", () => {
  const a = app({});
  for (let i = 0; i < 8; i++) {
    const p = j(a, "planoDoDia(" + i + ")");
    assert.strictEqual(p.indice, i); assert.strictEqual(p.refeicoes.length, 5);
    p.refeicoes.forEach(r => { assert.ok(r.tipo && r.titulo && typeof r.preparo === "string" && typeof r.trocada === "boolean"); r.itens.forEach(it => assert.ok(a.v("!!A['" + it.k + "']") && it.g > 0)); });
  }
  assert.ok(a.v("somarPlano(planoDaData(hoje())).prot") > 30);
  assert.ok(a.v("somarPlano(planoDoDia(0), [true, false, false, false, false]).kcal") < a.v("somarPlano(planoDoDia(0)).kcal"));
});

test("achado 2: aviso de hipoglicemia só para diabetes com insulina ou sulfonilureia", () => {
  assert.strictEqual(app({}).v("avisoHipoglicemia('plano')"), "");
  assert.strictEqual(app({ diabetes: true, insulinaSulf: false }).v("avisoHipoglicemia('plano')"), "");
  assert.strictEqual(app({ diabetes: true, insulinaSulf: null }).v("avisoHipoglicemia('treino')"), "");
  const a = app({ diabetes: true, insulinaSulf: true });
  assert.match(a.v("avisoHipoglicemia('plano')"), /aumenta o risco de hipoglicemia\. O médico pode precisar ajustar a dose desses remédios/);
  assert.match(a.v("avisoHipoglicemia('treino')"), /algo doce por perto/);
  assert.match(a.v("telaPlano()"), /data-aviso="hipoglicemia"/);
});
test("achado 2: mais de 65 anos mostra o aviso sobre músculo; até 65, não", () => {
  assert.strictEqual(app({ nascimento: ANO - 65 }).v("avisoIdade()"), "");
  assert.match(app({ nascimento: ANO - 70 }).v("avisoIdade()"), /perder mais músculo junto/);
});
test("achado 2: meta de energia abaixo de 1.200 só é gravada depois de confirmar que veio do médico", () => {
  const a = app({});
  a.v("var perguntas = [], resposta = false; confirmar = (t, aoSim) => { perguntas.push(t); if (resposta) aoSim(); }");
  const enviar = "FORM.perfil({ nome: '', sexo: 'F', nascimento: '" + (ANO - 36) + "', altura: '163', peso: '95', atividade: '1.2', metaKcal: '1000', metaProt: '', metaAgua: '' })";
  a.v(enviar);
  assert.strictEqual(a.v("perguntas.length"), 1); assert.match(a.v("perguntas[0]"), /1\.000 kcal, abaixo de 1\.200 kcal/);
  assert.strictEqual(a.v("E.perfil.metaKcal"), null, "respondeu não: não grava");
  a.v("resposta = true; " + enviar);
  assert.strictEqual(a.v("E.perfil.metaKcal"), 1000, "respondeu sim: grava");
  assert.strictEqual(a.v("metas().kcal"), 1000);
  a.v(enviar); assert.strictEqual(a.v("perguntas.length"), 2, "mesma meta salva de novo não pergunta outra vez");
});
test("revisão clínica B1 e B2: sinais de alerta por urgência e o que fazer na hipoglicemia", () => {
  const a = app({ diabetes: true, insulinaSulf: true });
  const guia = a.v("JSON.stringify(G.filter(x => x.titulo === 'Sinais de alerta')[0].corpo)");
  assert.match(guia, /Ligue 192 \(SAMU\) agora se/); assert.match(guia, /Vá ao pronto-socorro hoje se/); assert.match(guia, /Fale com o médico nos próximos dias se/);
  assert.match(guia, /sem fazer cocô nem soltar gases/); assert.match(guia, /Perda de visão de repente em um olho/);
  assert.match(a.v("avisoHipoglicemia('plano')"), /abaixo de 70.*Espere 15 minutos.*ligue 192 e não dê nada pela boca/);
});
