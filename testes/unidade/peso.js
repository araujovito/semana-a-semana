// Contas do peso: ritmo de perda, variacao por semana, trocas de dose, pontos do grafico e datas aceitas.
const test = require("node:test"), assert = require("node:assert");
const carregar = require("../carregar-app");
const app = carregar();
const f = (nome, ...args) => JSON.parse(app.v("JSON.stringify(" + nome + "(" + args.map(a => JSON.stringify(a)).join(",") + ") ?? null)"));
const P = (data, kg) => ({ id: data, data, kg, cintura: null });
const perto = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, a + " perto de " + b);

test("ritmo: 1,5% por semana em 3 semanas dispara", () => {
  const r = f("ritmoPerda", [P("2026-10-30", 100), P("2026-11-06", 98.5), P("2026-11-13", 97), P("2026-11-20", 95.5)]);
  assert.deepStrictEqual([r.de, r.ate, r.dias, r.kgDe, r.kgAte], ["2026-10-30", "2026-11-20", 21, 100, 95.5]);
  perto(r.pct, 1.5); assert.strictEqual(r.rapida, true);
});
test("ritmo: 0,5% por semana não dispara", () => {
  const r = f("ritmoPerda", [P("2026-10-30", 100), P("2026-11-20", 98.5)]);
  perto(r.pct, 0.5); assert.strictEqual(r.rapida, false);
});
test("ritmo: exatamente 1% por semana não dispara; um pouco acima dispara", () => {
  const r = f("ritmoPerda", [P("2026-10-30", 100), P("2026-11-20", 97)]);
  perto(r.pct, 1); assert.strictEqual(r.rapida, false);
  assert.strictEqual(f("ritmoPerda", [P("2026-10-30", 100), P("2026-11-20", 96.9)]).rapida, true);
});
test("ritmo: uma pesagem só, ou nenhuma, não tem conta", () => {
  assert.strictEqual(f("ritmoPerda", []), null);
  assert.strictEqual(f("ritmoPerda", [P("2026-11-20", 80)]), null);
});
test("ritmo: pesagens que cobrem menos de 14 dias não têm conta, por maior que seja a queda", () => {
  assert.strictEqual(f("ritmoPerda", [P("2026-11-07", 100), P("2026-11-13", 96), P("2026-11-20", 92)]), null);
  assert.notStrictEqual(f("ritmoPerda", [P("2026-11-06", 100), P("2026-11-20", 92)]), null); // 14 dias exatos entram
});
test("ritmo: sem pesagem entre 14 e 28 dias antes da mais recente não há conta", () => {
  assert.strictEqual(f("ritmoPerda", [P("2026-09-01", 100), P("2026-11-20", 90)]), null);
  assert.strictEqual(f("ritmoPerda", [P("2026-10-22", 100), P("2026-11-20", 90)]), null); // 29 dias
  assert.strictEqual(f("ritmoPerda", [P("2026-10-23", 100), P("2026-11-20", 90)]).dias, 28);
});
test("ritmo: escolhe a pesagem mais próxima de 21 dias; no empate, a mais antiga", () => {
  assert.strictEqual(f("ritmoPerda", [P("2026-10-23", 100), P("2026-11-02", 99), P("2026-11-06", 98), P("2026-11-20", 97)]).de, "2026-11-02"); // 18 dias vence 28 e 14
  assert.strictEqual(f("ritmoPerda", [P("2026-10-29", 100), P("2026-10-31", 99), P("2026-11-20", 97)]).de, "2026-10-29"); // 22 e 20 dias
});
test("ritmo: ganho de peso dá número negativo e não dispara", () => {
  const r = f("ritmoPerda", [P("2026-10-30", 100), P("2026-11-20", 103)]);
  perto(r.pct, -1); assert.strictEqual(r.rapida, false);
});
test("ritmo: pesagens fora de ordem dão o mesmo resultado, e a lista recebida não é alterada", () => {
  const lista = [P("2026-11-20", 95.5), P("2026-10-30", 100), P("2026-11-13", 97), P("2026-11-06", 98.5)];
  app.v("var _l = " + JSON.stringify(lista) + "; var _r = ritmoPerda(_l);");
  perto(app.v("_r.pct"), 1.5);
  assert.strictEqual(app.v("_l[0].data"), "2026-11-20");
});
test("ritmo: o peso do perfil não entra na conta", () => {
  const a = carregar({ v: 2, perfil: { nome: "", sexo: "F", nascimento: 1990, altura: 163, peso: 120, atividade: 1.2 }, pesos: [P("2026-11-20", 90)] });
  assert.strictEqual(a.v("ritmoPerda(E.pesos)"), null);
});
test("texto do ritmo traz o número, os dias e as datas", () => {
  const t = app.v('textoRitmo(ritmoPerda([{data:"2026-10-30",kg:100},{data:"2026-11-20",kg:96.1}]))');
  assert.strictEqual(t, "Você perdeu em média 1,3% do peso por semana nos 21 dias entre 30/10 e 20/11. Perda de peso rápida aumenta o risco de pedra na vesícula. É um assunto para levar ao seu médico.");
  // 1,04% não aparece como "1,0%"
  assert.match(app.v('textoRitmo(ritmoPerda([{data:"2026-10-30",kg:100},{data:"2026-11-20",kg:96.88}]))'), /em média 1,04% do peso/);
});

test("variação semanal: última pesagem da semana, semana sem pesagem fica sem valor", () => {
  // 2026-11-02 é segunda-feira
  const v = f("variacaoSemanal", [P("2026-11-02", 100), P("2026-11-05", 99.5), P("2026-11-08", 99), P("2026-11-10", 98), P("2026-11-25", 96)]);
  assert.deepStrictEqual(v.map(l => l.semana), ["2026-11-02", "2026-11-09", "2026-11-16", "2026-11-23"]);
  assert.deepStrictEqual([v[0].kg, v[0].data, v[0].dif], [99, "2026-11-08", null]);
  perto(v[1].dif, -1); perto(v[1].pct, -100 / 99); assert.strictEqual(v[1].semanas, 1);
  assert.deepStrictEqual(v[2], { semana: "2026-11-16", kg: null });
  perto(v[3].dif, -2); perto(v[3].pct, -200 / 98); assert.strictEqual(v[3].semanas, 2);
});
test("variação semanal: sem pesagens devolve lista vazia; fora de ordem dá o mesmo resultado", () => {
  assert.deepStrictEqual(f("variacaoSemanal", []), []);
  assert.deepStrictEqual(f("variacaoSemanal", [P("2026-11-10", 98), P("2026-11-02", 100)]), f("variacaoSemanal", [P("2026-11-02", 100), P("2026-11-10", 98)]));
});
test("texto da variação: sinal, percentual, intervalo maior que uma semana e semana vazia", () => {
  assert.strictEqual(f("textoVariacao", { kg: 98, dif: -1, pct: -1.0101, semanas: 1 }), "-1,0 kg (-1,0%)");
  assert.strictEqual(f("textoVariacao", { kg: 98, dif: 0.52, pct: 0.53, semanas: 2 }), "+0,5 kg (+0,5%) em 2 semanas");
  assert.strictEqual(f("textoVariacao", { kg: 98, dif: -0.04, pct: -0.04, semanas: 1 }), "0,0 kg (0,0%)");
  assert.strictEqual(f("textoVariacao", { kg: null }), "sem registro");
  assert.strictEqual(f("textoVariacao", { kg: 98, dif: null }), "");
});

test("trocas de dose: primeira aplicação e cada mudança, em ordem de data", () => {
  const D = (data, mg) => ({ id: data, data, mg, local: "", obs: "" });
  assert.deepStrictEqual(f("trocasDeDose", [D("2026-10-30", 5), D("2026-10-02", 2.5), D("2026-10-09", 2.5), D("2026-11-06", 5), D("2026-11-13", 2.5)]),
    [{ data: "2026-10-02", mg: 2.5 }, { data: "2026-10-30", mg: 5 }, { data: "2026-11-13", mg: 2.5 }]);
  assert.deepStrictEqual(f("trocasDeDose", []), []);
});
test("pontos do gráfico: o início entra na data da primeira aplicação, só se ela for anterior à primeira pesagem", () => {
  const D = data => ({ id: data, data, mg: 2.5 });
  assert.deepStrictEqual(f("pontosDoGrafico", [P("2026-11-10", 94), P("2026-11-03", 95)], 96, [D("2026-11-01")]),
    [{ data: "2026-11-01", kg: 96, inicio: true }, { data: "2026-11-03", kg: 95 }, { data: "2026-11-10", kg: 94 }]);
  assert.strictEqual(f("pontosDoGrafico", [P("2026-11-03", 95)], 96, [D("2026-11-03")]).length, 1);
  assert.strictEqual(f("pontosDoGrafico", [P("2026-11-03", 95)], 96, []).length, 1);
});
test("gráfico: eixo em dias, um círculo por ponto e uma marca por troca de dose", () => {
  const svg = app.v('grafico([{data:"2026-11-01",kg:96,inicio:true},{data:"2026-11-08",kg:95},{data:"2026-11-29",kg:93}],[{data:"2026-11-01",mg:2.5},{data:"2026-11-29",mg:5}])');
  assert.strictEqual((svg.match(/<circle/g) || []).length, 3);
  assert.strictEqual((svg.match(/class="marca"/g) || []).length, 2);
  assert.match(svg, />2,5 mg</); assert.match(svg, />5,0 mg</);
  // 7 dias de 28: o segundo ponto fica a um quarto do caminho (28 + 264/4 = 94)
  assert.deepStrictEqual(svg.match(/<circle cx="([\d.]+)"/g).map(c => c.match(/[\d.]+/)[0]), ["28.0", "94.0", "292.0"]);
  assert.strictEqual(app.v("grafico([], [])"), "");
  assert.match(app.v('grafico([{data:"2026-11-08",kg:95}],[])'), /<circle cx="160.0"/);
});

test("datas: aceita de 1 ano atrás até hoje e recusa o resto com mensagem", () => {
  const h = app.v("hoje()");
  assert.strictEqual(app.v("erroDeData(hoje())"), "");
  assert.strictEqual(app.v("erroDeData(mais(hoje(), -365))"), "");
  assert.match(app.v("erroDeData(mais(hoje(), -366))"), /Confira a data/);
  assert.match(app.v("erroDeData(mais(hoje(), 1))"), /Confira a data/);
  assert.match(app.v('erroDeData("0026' + h.slice(4) + '")'), /Confira a data/);
  assert.match(app.v('erroDeData("12026' + h.slice(4) + '")'), /Confira a data/);
  assert.strictEqual(app.v('erroDeData("")'), "Informe a data.");
});
test("salvar peso: data absurda é recusada; correção mantém o id e não duplica", () => {
  const a = carregar({ v: 2, perfil: { nome: "", sexo: "F", nascimento: 1990, altura: 163, peso: 95, atividade: 1.2 }, pesos: [] });
  a.v('FORM.peso({ data: "0026-11-20", kg: "90", cintura: "" })');
  assert.strictEqual(a.v("E.pesos.length"), 0);
  a.v('FORM.peso({ data: mais(hoje(), -7), kg: "94,2", cintura: "" }); FORM.peso({ data: hoje(), kg: "93", cintura: "99" })');
  const id = a.v("E.pesos[0].id");
  a.v("AC.editarPeso = null; pesoEmEdicao = E.pesos[0].id; FORM.peso({ data: mais(hoje(), -8), kg: '94,6', cintura: '' })");
  assert.strictEqual(a.v("E.pesos.length"), 2);
  assert.deepStrictEqual(JSON.parse(a.v("JSON.stringify(E.pesos.find(p => p.id === '" + id + "'))")), { id, data: a.v("mais(hoje(), -8)"), kg: 94.6, cintura: null });
  assert.strictEqual(a.v("pesoEmEdicao"), null);
  assert.strictEqual(JSON.parse(a.guardado["semana-a-semana.v1"]).pesos.length, 2);
});
test("relatório de peso: ritmo e semanas entram mesmo no modo discreto", () => {
  const a = carregar({ v: 2, perfil: { nome: "", sexo: "F", nascimento: 1990, altura: 163, peso: 101, atividade: 1.2, discreto: true }, pesos: [] });
  a.v("E.pesos = [{id:'a',data:mais(hoje(),-21),kg:100},{id:'b',data:hoje(),kg:95.5}]");
  const rel = a.v("relPeso(mais(hoje(), -29)).join('\\n')");
  assert.match(rel, /perda média de 1,5% do peso por semana, acima de 1% por semana\./);
  assert.match(rel, /Semana de \d\d\/\d\d: sem registro/);
  assert.match(rel, /Semana de \d\d\/\d\d: 95,5 kg, -4,5 kg \(-4,5%\) em 3 semanas/);
});
test("ritmo com pedra na vesícula: o limite continua 1% do peso por semana (decisão da direção, 22/11)", () => {
  const l = [{ data: "2026-10-30", kg: 120 }, { data: "2026-11-20", kg: 116.7 }]; // 0,92% por semana
  assert.strictEqual(f("ritmoPerda", l).rapida, false);
  assert.strictEqual(app.v("LIMITE_RITMO"), 1);
});
test("texto do ritmo com vesícula encaminha aos sinais de alerta; versão discreta não tem número do peso", () => {
  const r = 'ritmoPerda([{data:"2026-10-30",kg:100},{data:"2026-11-20",kg:95}])';
  assert.doesNotMatch(app.v("textoRitmo(" + r + ")"), /sinais de alerta/);
  assert.match(app.v("textoRitmo(" + r + ", true)"), /em média 1,7% do peso.*levar ao seu médico\. Se tiver dor na barriga, veja os sinais de alerta no Guia\./);
  const d = app.v("textoRitmo(" + r + ", true, true)");
  assert.match(d, /mais de 1% por semana.*levar ao seu médico/); assert.doesNotMatch(d, /kg|\d+,\d/);
});
