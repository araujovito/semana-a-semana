// Lembrete de cópia: quando aparece e quando não.
const test = require("node:test"), assert = require("node:assert");
const carregar = require("../carregar-app");
const perfil = { nome: "", sexo: "F", nascimento: 1990, altura: 163, peso: 95, atividade: 1.2 };
const sit = (estado, h) => JSON.parse(carregar(Object.assign({ v: 2, perfil }, estado)).v("JSON.stringify(segSituacaoCopia('" + h + "'))"));

test("sem registro nenhum, ou sem perfil, não há lembrete", () => {
  assert.strictEqual(sit({}, "2026-11-20").mostrar, false);
  assert.strictEqual(sit({ perfil: null, pesos: [{ id: "p", data: "2026-01-01", kg: 90 }] }, "2026-11-20").mostrar, false);
});
test("nunca exportou: conta a partir do registro mais antigo, só depois de 14 dias", () => {
  const pesos = [{ id: "p", data: "2026-11-06", kg: 90 }];
  assert.strictEqual(sit({ pesos }, "2026-11-20").mostrar, false);
  assert.deepStrictEqual(sit({ pesos }, "2026-11-21"), { mostrar: true, dias: null });
  assert.strictEqual(sit({ dias: { "2026-11-01": { comido: [] } } }, "2026-11-20").mostrar, true);
});
test("última exportação há mais de 14 dias mostra; adiar conta de novo a partir do adiamento", () => {
  const doses = [{ id: "a", data: "2026-01-01", mg: 2.5 }];
  assert.deepStrictEqual(sit({ doses, ui: { ultimaExportacao: "2026-11-05" } }, "2026-11-20"), { mostrar: true, dias: 15 });
  assert.strictEqual(sit({ doses, ui: { ultimaExportacao: "2026-11-06" } }, "2026-11-20").mostrar, false);
  assert.strictEqual(sit({ doses, ui: { ultimaExportacao: "2026-10-01", lembreteCopia: "2026-11-19" } }, "2026-11-20").mostrar, false);
  assert.strictEqual(sit({ doses, ui: { ultimaExportacao: "lixo" } }, "2026-11-20").mostrar, true);
});
