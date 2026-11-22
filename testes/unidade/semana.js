// Visão semanal: agrupamento por semana de tratamento, aplicação no dia ou atrasada, peso, sintomas, comida e padrões.
const test = require("node:test"), assert = require("node:assert");
const carregar = require("../carregar-app");
const H = "2026-11-20";                       // sexta-feira
const perfil = { nome: "", sexo: "F", nascimento: 1990, altura: 163, peso: 120, atividade: 1.2 };
const dose = (data, mg, local) => ({ id: "d" + data, data, mg, local: local || "Coxa esquerda", obs: "" });
const sint = (data, enjoo, extra) => Object.assign({ id: "s" + data + enjoo, data, enjoo, intestino: "Normal" }, extra || {});
const base = extra => carregar(Object.assign({ v: 2, perfil, doses: [], pesos: [], sintomas: [], dias: {} }, extra || {}));
const semanas = a => JSON.parse(a.v('JSON.stringify(semanasDoTratamento("' + H + '"))'));

test("sem aplicação não há semanas", () => {
  assert.deepStrictEqual(semanas(base()), []);
});

test("semanas contam a partir da primeira aplicação, iguais à semana da tela Hoje", () => {
  // primeira aplicação numa segunda (12/10): 39 dias até 20/11 = semana 6
  const a = base({ doses: [dose("2026-10-12", 2.5), dose("2026-10-19", 2.5), dose("2026-10-26", 2.5), dose("2026-11-02", 5), dose("2026-11-11", 5), dose("2026-11-16", 5)] });
  const s = semanas(a);
  assert.strictEqual(s.length, 6);
  assert.strictEqual(s.length, a.v('situacaoDoseEm(E.doses, E.diaDose, "' + H + '").semana'));
  assert.deepStrictEqual(s.map(x => [x.n, x.de, x.ate]), [[1, "2026-10-12", "2026-10-18"], [2, "2026-10-19", "2026-10-25"], [3, "2026-10-26", "2026-11-01"],
    [4, "2026-11-02", "2026-11-08"], [5, "2026-11-09", "2026-11-15"], [6, "2026-11-16", "2026-11-20"]]);
  assert.deepStrictEqual(s.map(x => x.atual), [false, false, false, false, false, true]);
  // troca de dose só na semana 4 (2,5 -> 5); a primeira aplicação não conta como troca
  assert.deepStrictEqual(s.map(x => x.troca), [false, false, false, true, false, false]);
  // semana 5: previsto 09/11 (segunda), aplicou 11/11 = 2 dias depois
  assert.deepStrictEqual(s[4].doses.map(d => [d.data, d.atraso]), [["2026-11-11", 2]]);
  assert.strictEqual(s[5].doses[0].atraso, 0);
  assert.strictEqual(s[5].mg, 5);
});

test("aplicação adiantada fica na semana em que estava prevista", () => {
  // prevista 19/10 (segunda); aplicou no sábado 17/10, 2 dias antes
  const s = semanas(base({ doses: [dose("2026-10-12", 2.5), dose("2026-10-17", 2.5)] }));
  assert.strictEqual(s[0].doses.length, 1);
  assert.deepStrictEqual(s[1].doses.map(d => [d.data, d.atraso]), [["2026-10-17", -2]]);
});

test("peso: última pesagem da semana contra a última de antes da semana", () => {
  const a = base({ doses: [dose("2026-11-02", 2.5), dose("2026-11-09", 2.5), dose("2026-11-16", 2.5)],
    pesos: [{ id: "p1", data: "2026-11-02", kg: 120 }, { id: "p2", data: "2026-11-12", kg: 119.5 }, { id: "p3", data: "2026-11-14", kg: 118.8 }] });
  const s = semanas(a);
  assert.deepStrictEqual(s[0].peso, { pesagens: 1, kg: 120, dif: null, pct: null });
  assert.strictEqual(s[1].peso.pesagens, 2);
  assert.strictEqual(s[1].peso.kg, 118.8);
  assert.ok(Math.abs(s[1].peso.dif + 1.2) < 1e-9);
  assert.strictEqual(s[2].peso.pesagens, 0);
  // modo discreto: a linha não mostra kg
  assert.strictEqual(a.v('semanaTextoPeso(semanasDoTratamento("' + H + '")[1], true)'), "2 pesagens");
  assert.strictEqual(a.v('semanaTextoPeso(semanasDoTratamento("' + H + '")[1], false)'), "118,8 kg (-1,2 kg na semana)");
});

test("sintomas contados por dia; dias de enjoo marcados e comida da semana", () => {
  const a = base({ doses: [dose("2026-11-16", 2.5)],
    sintomas: [sint("2026-11-17", 2, { vomito: true }), sint("2026-11-17", 1), sint("2026-11-18", 0, { intestino: "Preso" })],
    dias: { "2026-11-17": { enjoo: true, comido: [], protExtra: 30 }, "2026-11-18": { enjoo: false, comido: [], protExtra: 50 }, "2026-11-19": { enjoo: true, comido: [] } } });
  const s = semanas(a)[0];
  assert.strictEqual(s.sintomas.registros, 3);
  assert.strictEqual(s.sintomas.enjoo, 1);         // dois registros no mesmo dia contam um dia
  assert.strictEqual(s.sintomas.vomito, 1);
  assert.strictEqual(s.sintomas.preso, 1);
  assert.strictEqual(s.enjooMarcado, 2);
  assert.deepStrictEqual([s.comida.dias, s.comida.prot], [2, 40]);
  assert.strictEqual(a.v('semanaTextoSintomas(semanasDoTratamento("' + H + '")[0].sintomas)'), "enjoo em 1 dia, vômito em 1 dia, intestino preso em 1 dia; nenhuma dor forte registrada");
  // calorias só sem o modo discreto
  assert.doesNotMatch(a.v('semanaTextoComida(semanasDoTratamento("' + H + '")[0], true, 90)'), /kcal/);
  assert.match(a.v('semanaTextoComida(semanasDoTratamento("' + H + '")[0], false, 90)'), /^proteína média de 40 g por dia \(meta 90 g\), energia média de .* kcal, em 2 dias com registro$/);
});

test("padrão de enjoo: maior nos 2 dias depois da aplicação só quando os registros mostram", () => {
  const doses = [dose("2026-11-02", 2.5), dose("2026-11-09", 2.5), dose("2026-11-16", 2.5)];
  // semanas 1 e 2: enjoo 2 nos dois dias depois e 0 nos outros
  const sintomas = [];
  ["2026-11-03", "2026-11-04", "2026-11-10", "2026-11-11"].forEach(x => sintomas.push(sint(x, 2)));
  ["2026-11-06", "2026-11-07", "2026-11-13", "2026-11-14"].forEach(x => sintomas.push(sint(x, 0)));
  let a = base({ doses, sintomas });
  let s = semanas(a);
  assert.deepStrictEqual(s.map(x => x.enjooDepois), [true, true, false]);
  assert.match(a.v('semanaMarcas(semanasDoTratamento("' + H + '")[0]).join("|")'), /o enjoo foi maior nos 2 dias depois da aplicação/);
  let p = JSON.parse(a.v("JSON.stringify(semanaPadroesGerais(semanasDoTratamento('" + H + "')))"));
  const enj = p.find(x => x.id === "enjoo-depois");
  assert.ok(enj);
  assert.match(enj.texto, /^Nas 2 semanas com registro de sintomas, o enjoo foi maior nos 2 dias depois da aplicação: nível médio 2,0, contra 0,0/);

  // enjoo igual dentro e fora: nada de padrão
  a = base({ doses, sintomas: sintomas.map(x => Object.assign({}, x, { enjoo: 1 })) });
  s = semanas(a);
  assert.deepStrictEqual(s.map(x => x.enjooDepois), [false, false, false]);
  p = JSON.parse(a.v("JSON.stringify(semanaPadroesGerais(semanasDoTratamento('" + H + "')))"));
  assert.ok(!p.some(x => x.id === "enjoo-depois"));

  // só registros nos 2 dias depois (nada para comparar): não conclui nada
  a = base({ doses, sintomas: sintomas.slice(0, 4) });
  assert.deepStrictEqual(semanas(a).map(x => x.enjooDepois), [false, false, false]);

  // uma semana só não basta para o padrão geral
  a = base({ doses: doses.slice(0, 1), sintomas: [sint("2026-11-03", 3), sint("2026-11-04", 3), sint("2026-11-06", 0), sint("2026-11-07", 0)] });
  s = semanas(a);
  assert.strictEqual(s[0].enjooDepois, true);
  p = JSON.parse(a.v("JSON.stringify(semanaPadroesGerais(semanasDoTratamento('" + H + "')))"));
  assert.ok(!p.some(x => x.id === "enjoo-depois"));
});

test("padrões gerais de troca de dose e de aplicação fora do dia", () => {
  const a = base({ doses: [dose("2026-10-12", 2.5), dose("2026-10-19", 2.5), dose("2026-10-26", 5), dose("2026-11-04", 5), dose("2026-11-09", 7.5)] });
  const p = JSON.parse(a.v("JSON.stringify(semanaPadroesGerais(semanasDoTratamento('" + H + "')))"));
  assert.deepStrictEqual(p.map(x => x.texto), ["Troca de dose nas semanas 3 e 5.", "Aplicação fora do dia habitual na semana 4."]);
  assert.strictEqual(a.v("semanaLista([1, 2, 3])"), "1, 2 e 3");
});

test("dor forte na barriga: caminho para os sinais de alerta do Guia; sem dor, só o que foi marcado", () => {
  const com = base({ doses: [dose("2026-11-16", 2.5)], sintomas: [sint("2026-11-17", 1, { dor: true })] });
  const sc = semanas(com)[0];
  assert.strictEqual(com.v('semanaTextoSintomas(semanasDoTratamento("' + H + '")[0].sintomas)'), "enjoo em 1 dia, dor forte na barriga em 1 dia");
  const html = com.v('semanaCorpo(semanasDoTratamento("' + H + '")[0], false, 90)');
  assert.match(html, /data-ac="ir" data-para="guia"/);
  assert.match(html, /Ver os sinais de alerta no Guia/);
  assert.strictEqual(sc.sintomas.dor, 1);
  const sem = base({ doses: [dose("2026-11-16", 2.5)], sintomas: [sint("2026-11-17", 1)] });
  const h2 = sem.v('semanaCorpo(semanasDoTratamento("' + H + '")[0], false, 90)');
  assert.doesNotMatch(h2, /data-para="guia"/);
  assert.match(h2, /nenhuma dor forte registrada/);
  assert.doesNotMatch(com.v("telaSemana()") + sem.v("telaSemana()"), /sem sinal de alerta|urgente|perigo/i);
});
