// Plano da nutricionista (app/planonutri.js): dados batem com o plano prescrito, todo item tem alimento válido, contas,
// faixa do dia, interruptor e registro (escolher opção, marcar, consumoDoDia).
const test = require("node:test"), assert = require("node:assert");
const carregar = require("../carregar-app");

function relogio(inicio) {
  const agora = new Date(inicio).getTime();
  class R extends Date { constructor(...a) { if (a.length) super(...a); else super(agora); } static now() { return agora; } }
  return R;
}
const PERFIL = { nome: "T", sexo: "F", nascimento: 1990, altura: 163, peso: 95.4, atividade: 1.2, metaKcal: null, metaProt: null, metaAgua: null, diabetes: null, insulinaSulf: null, pilula: null, naoCome: [], naoGosta: [] };
const estado = ui => ({ v: 2, perfil: Object.assign({}, PERFIL), doses: [], pesos: [], sintomas: [], treinos: [], dias: {}, trocas: {}, caneta: null, suplementos: [], exames: [], lembretes: {}, ui: ui || { puPerguntas: true } });
// ui padrão = quem instalou e passou pelo primeiro uso (que grava puPerguntas) sem dizer Não ao plano: ligado.
const SEX = "2026-11-20", QUI = "2026-11-19";
function abrir(ui) { const app = carregar(estado(ui), { Date: relogio(SEX + "T10:00:00") }); return { app, v: app.v, j: c => JSON.parse(app.v("JSON.stringify(" + c + ")")) }; }
const perto = (a, b, m) => assert.ok(Math.abs(a - b) < 1e-6, (m || "") + " " + a + " != " + b);

test("dados: 5 refeições com os horários e o número de opções do plano", () => {
  const a = abrir(), r = a.j("PN_REFEICOES");
  assert.deepStrictEqual(r.map(x => [x.tipo, x.hora, x.opcoes.length, !!x.opcional]),
    [["Café da manhã", "7h30", 5, false], ["Almoço", "13h", 3, false], ["Lanche da tarde", "16h30", 5, false], ["Jantar", "20h", 5, false], ["Ceia", "", 2, true]]);
  assert.strictEqual(a.v("PN_PRESCRITO"), "2026-11-04");
});

test("dados: textos e gramas conferidos com o plano", () => {
  const a = abrir(), r = a.j("PN_REFEICOES");
  const linhas = (i, o) => r[i].opcoes[o].itens.map(x => x.t);
  const g = (i, o, n) => r[i].opcoes[o].itens[n].partes.map(p => p[0] + ":" + p[1]).join(" ");
  assert.deepStrictEqual(linhas(0, 0), ["2 ovos mexidos", "1 fatia de pão integral", "1 fatia de mamão (150 g)"]);
  assert.deepStrictEqual(linhas(0, 1), ["1 iogurte natural proteico (170 g)", "2 colheres de sopa de aveia (20 g)", "1 porção de morangos (100 g)", "1 colher de chá de chia (5 g)"]);
  assert.deepStrictEqual(linhas(0, 4), ["200 ml de leite semidesnatado", "1 banana pequena", "1 dose de whey protein (20 g)", "Canela a gosto"]);
  assert.deepStrictEqual([g(0, 0, 0), g(0, 0, 2), g(0, 1, 0), g(0, 1, 1), g(0, 1, 3), g(0, 2, 0), g(0, 2, 2), g(0, 4, 2)],
    ["ovo:100", "mamao:150", "iogurte_proteico:170", "aveia:20", "chia:5", "fecula_mandioca:22", "queijo_minas:20", "whey:20"]);
  // almoço: as três proteínas com 120 g e os grupos fixos
  r[1].opcoes.forEach(o => {
    assert.strictEqual(o.itens[0].partes[0][1], 120);
    assert.deepStrictEqual(o.itens.slice(1).map(x => x.partes.reduce((s, p) => s + p[1], 0)), [70, 100, 70, 80, 4.6]);
  });
  assert.deepStrictEqual(r[1].opcoes.map(o => o.itens[0].partes[0][0]), ["frango_peito", "tilapia", "carne_patinho"]);
  assert.ok(r[1].opcoes[0].itens[1].est, "salada à vontade é estimativa");
  assert.deepStrictEqual([g(2, 0, 0), g(2, 2, 0), g(2, 4, 1), g(2, 4, 3)], ["iogurte_proteico:170", "ovo:50 fecula_mandioca:15", "chia:10", "castanha_caju:10"]);
  assert.deepStrictEqual([g(3, 0, 0), g(3, 1, 0), g(3, 2, 0), g(3, 2, 1), g(3, 3, 0), g(3, 4, 1)], ["frango_peito:100", "ovo:100 clara:66", "tilapia:120", "abobora:100", "carne_patinho:100", "mandioca:100"]);
  assert.deepStrictEqual([g(4, 0, 0), g(4, 1, 0)], ["kiwi:75", "iogurte:110"]);
});

test("dados: todo item tem alimento válido da base e gramas positivas; só 'a gosto' fica fora da conta", () => {
  const a = abrir(), r = a.j("PN_REFEICOES"), A = a.j("A");
  r.forEach(ref => ref.opcoes.forEach(o => o.itens.forEach(x => {
    if (!x.partes.length) { assert.ok(/a gosto/.test(x.t), x.t); return; }
    x.partes.forEach(p => { assert.ok(A[p[0]], "alimento inexistente: " + p[0]); assert.ok(p[1] > 0 && p[1] < 400, p[0] + " " + p[1]); });
  })));
  // alimentos acrescentados: com fonte e fora das trocas automáticas
  ["iogurte_proteico", "creme_ricota", "leite_semi", "clara", "pao_sirio_integral", "wrap_integral", "fecula_mandioca", "chia"].forEach(k => {
    assert.ok(/TACO|USDA/.test(A[k].fonte), k); assert.strictEqual(A[k].soPlanoNutri, true, k);
  });
  assert.ok(/estimativa/.test(A.iogurte_proteico.nome));
});

test("contas: total da opção é a soma dos itens; faixa do dia sem ceia no mínimo e com ceia no máximo", () => {
  const a = abrir(), A = a.j("A");
  const t = a.j("pnTotalDaOpcao(PN_REFEICOES[0].opcoes[0])");
  perto(t.kcal, A.ovo.kcal + A.pao_integral.kcal / 4 + A.mamao.kcal * 1.5, "kcal");
  perto(t.prot, A.ovo.prot + A.pao_integral.prot / 4 + A.mamao.prot * 1.5, "prot");
  const tots = a.j("PN_REFEICOES.map(r => r.opcoes.map(o => pnTotalDaOpcao(o).kcal))"), f = a.j("pnFaixaDia()");
  perto(f.min.kcal, tots.slice(0, 4).reduce((s, l) => s + Math.min.apply(null, l), 0), "mínimo");
  perto(f.max.kcal, tots.reduce((s, l) => s + Math.max.apply(null, l), 0), "máximo");
  assert.ok(f.min.kcal > 900 && f.max.kcal < 2200 && f.min.prot > 60, JSON.stringify([f.min.kcal, f.max.kcal, f.min.prot]));
  assert.ok(f.min.kcal < f.max.kcal && f.min.prot < f.max.prot);
});

test("interruptor: ligado quando ausente depois do primeiro uso; desligado volta ao cardápio do app", () => {
  let a = abrir();
  assert.strictEqual(a.v("pnEmUso()"), true);
  assert.strictEqual(a.v("pnPlanoDaData('" + SEX + "').nutri"), true);
  assert.ok(/nutricionista/.test(a.v("pnReferenciaDoDia(metas()).rotProt")));
  a = abrir({ planoNutri: false });
  assert.strictEqual(a.v("pnEmUso()"), false);
  assert.strictEqual(a.v("!!pnPlanoDaData('" + SEX + "').nutri"), false);
  assert.strictEqual(a.v("pnReferenciaDoDia(metas()).prot"), a.v("metas().prot"));
});

test("perfil de versão anterior sem resposta: alvo, lista e calorias do cardápio do app até ela responder (M1)", () => {
  const a = abrir({});
  const m = a.j("metas()");
  assert.strictEqual(a.v("pnEmUso()"), false, "sem puPerguntas e sem planoNutri: desligado");
  assert.strictEqual(a.v("!!pnPlanoDaData('" + SEX + "').nutri"), false, "a lista de refeições é o cardápio do app");
  const ap = a.j("alvoProteina()"), ae = a.j("alvoEnergia()");
  assert.ok(!ap.nutri && ap.g === m.prot && ap.rotulo === "meta", "alvo de proteína é a meta do app: " + JSON.stringify(ap));
  assert.ok(!ae.nutri && ae.kcal === m.kcal, "energia é a referência do app: " + JSON.stringify(ae));
  assert.strictEqual(a.v("pnReferenciaDoDia(metas()).prot"), m.prot);
  assert.strictEqual(a.v("puFaltaResponder()"), true, "a faixa das perguntas novas continua aparecendo");
  // respondeu Sim no Perfil: liga tudo junto
  a.v("E.ui.planoNutri = true; E.ui.puPerguntas = true");
  assert.ok(a.v("pnEmUso()") && a.v("pnPlanoDaData('" + SEX + "').nutri") && a.j("alvoProteina()").nutri && a.j("alvoEnergia()").nutri);
  // respondeu "Não sei" (planoNutri fica ausente, puPerguntas true): padrão do app, ligado
  a.v("delete E.ui.planoNutri");
  assert.strictEqual(a.v("pnEmUso()"), true);
  // sem perfil (antes do primeiro uso): padrão ligado
  a.v("E.perfil = null; E.ui = {}");
  assert.strictEqual(a.v("pnEmUso()"), true);
});

test("registro: escolher opção, marcar e trocar de opção depois; consumoDoDia acompanha", () => {
  const a = abrir();
  const tot = (i, o) => a.j("pnTotalDaOpcao(PN_REFEICOES[" + i + "].opcoes[" + o + "])");
  a.v("MUD.pnOpcao({ value: '1', dataset: { dia: '" + SEX + "', i: '0' } })");
  a.v("MUD.refeicao({ checked: true, dataset: { dia: '" + SEX + "', i: '0', q: '1' } })");
  a.v("MUD.refeicao({ checked: true, dataset: { dia: '" + SEX + "', i: '1', q: '0.5' } })");
  let c = a.j("consumoDoDia('" + SEX + "')");
  perto(c.comida.prot, tot(0, 1).prot + tot(1, 0).prot / 2, "opção 2 do café inteira e metade do almoço com frango");
  const r = a.j("E.dias['" + SEX + "']");
  assert.strictEqual(r.comidoNutri[0].op, 1); assert.ok(Array.isArray(r.comidoNutri[0].itens)); assert.deepStrictEqual(r.comido, []);
  // trocar o almoço para peixe depois de marcar: a fração fica, a foto passa a ser a do peixe
  a.v("MUD.pnOpcao({ value: '1', dataset: { dia: '" + SEX + "', i: '1' } })");
  c = a.j("consumoDoDia('" + SEX + "')");
  perto(c.comida.kcal, tot(0, 1).kcal + tot(1, 1).kcal / 2, "almoço com peixe pela metade");
  // dia de enjoo continua com o cardápio do app e não apaga as marcas do plano
  a.v("AC.enjoo({ dia: '" + SEX + "' })");
  assert.strictEqual(a.j("consumoDoDia('" + SEX + "').refeicoes"), 0);
  assert.ok(!a.v("pnPlanoDaData('" + SEX + "').nutri"));
  a.v("AC.enjoo({ dia: '" + SEX + "' })");
  perto(a.j("consumoDoDia('" + SEX + "')").comida.kcal, c.comida.kcal, "marcas do plano voltam");
});

test("dia com marca continua no plano em que foi marcado, mesmo depois de mudar o interruptor", () => {
  const a = abrir();
  a.v("diaSel = '" + QUI + "'");
  a.v("MUD.refeicao({ checked: true, dataset: { dia: '" + QUI + "', i: '3', q: '1' } })");
  const antes = a.j("consumoDoDia('" + QUI + "')").comida.kcal;
  assert.ok(antes > 0);
  a.v("E.ui.planoNutri = false");
  perto(a.j("consumoDoDia('" + QUI + "')").comida.kcal, antes, "desligar não apaga o dia passado");
  assert.strictEqual(a.j("consumoDoDia('" + SEX + "')").refeicoes, 0);
});
