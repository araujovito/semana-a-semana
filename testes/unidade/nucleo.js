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
  assert.strictEqual(app.v("migrar({ v: 2, perfil: { nome: 'B', pilula: true, naoCome: ['ovo'] } }).perfil.pilula"), true);
});
test("sem dados guardados o app começa vazio e sem perfil", () => {
  const app = carregar();
  assert.strictEqual(app.v("E.perfil"), null);
  assert.strictEqual(app.v("metas()"), null);
});
