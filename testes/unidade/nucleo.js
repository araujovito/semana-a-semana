// Formato dos dados e migracao.
const test = require("node:test"), assert = require("node:assert");
const carregar = require("../carregar-app");
const V1 = { v: 1, perfil: { nome: "A", sexo: "F", nascimento: 1990, altura: 163, peso: 95.4, atividade: 1.2, metaKcal: null, metaProt: 110, metaAgua: null },
  doses: [{ id: "a", data: "2026-11-01", mg: 2.5, local: "Coxa esquerda", obs: "" }], pesos: [], sintomas: [], treinos: [],
  dias: { "2026-11-02": { enjoo: false, feitas: [true, false, null, true], agua: 800, protExtra: 0, caminhada: 15 } }, ui: { local: "academia" } };

test("dados da versão 1 sobem para a versão 2 sem perder nada", () => {
  const app = carregar(V1), e = JSON.parse(app.v("JSON.stringify(E)"));
  assert.strictEqual(e.v, 2);
  assert.strictEqual(e.perfil.metaProt, 110);
  assert.deepStrictEqual([e.perfil.diabetes, e.perfil.insulinaSulf, e.perfil.pilula, e.perfil.naoCome, e.perfil.naoGosta], [null, null, null, [], []]);
  assert.deepStrictEqual(e.dias["2026-11-02"].comido, [{ q: 1 }, null, null, { q: 1 }]);
  assert.strictEqual(e.dias["2026-11-02"].feitas, undefined);
  assert.strictEqual(e.dias["2026-11-02"].agua, 800);
  assert.strictEqual(e.doses.length, 1);
  assert.strictEqual(e.ui.local, "academia");
  assert.deepStrictEqual([e.trocas, e.caneta, e.suplementos, e.exames], [{}, null, [], []]);
});
test("migrar recusa o que não é dado do app e aceita a versão 2 como está", () => {
  const app = carregar();
  assert.strictEqual(app.v("migrar(null)"), null);
  assert.strictEqual(app.v("migrar({ v: 9, perfil: {} })"), null);
  assert.strictEqual(app.v("migrar({ v: 2, perfil: { nome: 'B', nascimento: 1990, altura: 160, peso: 80, pilula: true, naoCome: ['ovo'] } }).perfil.pilula"), true);
});
test("sem dados guardados o app começa vazio e sem perfil", () => {
  const app = carregar();
  assert.strictEqual(app.v("E.perfil"), null);
  assert.strictEqual(app.v("metas()"), null);
});

// Achado 20 da auditoria: cópia estragada não pode deixar tela em branco, "NaN" nem executar HTML.
test("migrar conserta tipos errados em vez de quebrar as telas", () => {
  const app = carregar();
  const e = JSON.parse(app.v(`JSON.stringify(migrar({ v: 1, perfil: { nome: "A", nascimento: 1990, altura: 160, peso: 80 }, doses: null, pesos: "x",
    sintomas: [{ id: "<img src=x onerror=alert(1)>", data: "2026-11-01", enjoo: 1 }, { id: "s2", data: "<b>" }, null],
    treinos: [{ id: "t", data: "2026-13-45", tipo: "A" }], dias: { "2026-11-02": { feitas: [true], agua: "muito" }, "lixo": {} }, ui: { diaPlano: 99 }, trocas: [], diaDose: 12 }))`));
  assert.deepStrictEqual([e.doses, e.pesos, e.treinos], [[], [], []]);
  assert.strictEqual(e.sintomas.length, 1);
  assert.ok(/^[A-Za-z0-9_-]+$/.test(e.sintomas[0].id));
  assert.deepStrictEqual(Object.keys(e.dias), ["2026-11-02"]);
  assert.strictEqual(e.dias["2026-11-02"].agua, 0);
  assert.deepStrictEqual(e.dias["2026-11-02"].comido, [{ q: 1 }]);
  assert.strictEqual(e.ui.diaPlano, undefined);
  assert.deepStrictEqual(e.trocas, {});
  assert.strictEqual(e.diaDose, null);
});
test("perfil sem altura, peso ou nascimento válidos volta a ser pedido, sem perder os registros", () => {
  const app = carregar();
  assert.strictEqual(app.v("migrar({ v: 1, perfil: {} }).perfil"), null);
  assert.strictEqual(app.v("migrar({ v: 1, perfil: { nascimento: 1990, altura: 'alta', peso: 80 }, pesos: [{ id: 'p', data: '2026-11-01', kg: 80 }] }).pesos.length"), 1);
});
// Achado 21: dado que o app não entende nunca é sobrescrito.
test("dado de versão desconhecida fica intacto: salvar não grava por cima", () => {
  const futuro = JSON.stringify({ v: 9, perfil: { nome: "do futuro" }, coisas: [1, 2, 3] });
  const app = require("../carregar-app")();
  app.guardado["semana-a-semana.v1"] = futuro;
  const app2 = require("../carregar-app")(null, { guardado: app.guardado });
  assert.strictEqual(app2.v("ILEGIVEL"), futuro);
  assert.strictEqual(app2.v("E.perfil"), null);
  assert.strictEqual(app2.v("salvar()"), false);
  assert.strictEqual(app2.guardado["semana-a-semana.v1"], futuro);
  assert.strictEqual(app2.v("FALHA_SALVAR"), true);
});
test("texto que não é JSON também fica intacto", () => {
  const app = require("../carregar-app")(null, { guardado: { "semana-a-semana.v1": "{quebrado" } });
  assert.strictEqual(app.v("ILEGIVEL"), "{quebrado");
  assert.strictEqual(app.v("salvar()"), false);
  assert.strictEqual(app.guardado["semana-a-semana.v1"], "{quebrado");
});
// Achado 8: falha ao salvar não é coberta por mensagem de sucesso.
test("quando a gravação falha, salvar devolve false e o aviso de sucesso não aparece", () => {
  const app = require("../carregar-app")(null, { falhaAoGravar: true });
  assert.strictEqual(app.v("salvar()"), false);
  app.v('aviso("Peso registrado.")');
  assert.deepStrictEqual(app.avisos, []);
});
