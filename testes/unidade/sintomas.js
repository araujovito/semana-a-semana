// Sintomas: montar o registro, corrigir sem duplicar e datas aceitas.
const test = require("node:test"), assert = require("node:assert");
const carregar = require("../carregar-app");
const base = () => carregar({ v: 2, perfil: { nome: "", sexo: "F", nascimento: 1990, altura: 163, peso: 95, atividade: 1.2 }, sintomas: [] });

test("registro novo ganha id; correção mantém o id e o que o formulário não mostra", () => {
  const a = base();
  const novo = JSON.parse(a.v('JSON.stringify(montarSintoma({ data: "2026-11-20", enjoo: "2", intestino: "Preso", vomito: "on", nota: " oi " }, null))'));
  assert.ok(novo.id);
  assert.deepStrictEqual(Object.assign({}, novo, { id: 0 }), { id: 0, data: "2026-11-20", enjoo: 2, intestino: "Preso", vomito: true, refluxo: false, tontura: false, cansaco: false, dor: false, nota: "oi" });
  const cor = JSON.parse(a.v('JSON.stringify(montarSintoma({ data: "2026-11-19", enjoo: "0", intestino: "Qualquer" }, { id: "x1", data: "2026-11-20", enjoo: 3, vomito: true, glicemia: 110 }))'));
  assert.deepStrictEqual(cor, { id: "x1", data: "2026-11-19", enjoo: 0, vomito: false, glicemia: 110, intestino: "Normal", refluxo: false, tontura: false, cansaco: false, dor: false, nota: "" });
});
test("salvar: data absurda é recusada; correção não duplica", () => {
  const a = base();
  a.v('FORM.sintoma({ data: "0026-11-20", enjoo: "1", intestino: "Normal" })');
  a.v('FORM.sintoma({ data: mais(hoje(), -400), enjoo: "1", intestino: "Normal" })');
  assert.strictEqual(a.v("E.sintomas.length"), 0);
  assert.match(a.avisos[a.avisos.length - 1], /Confira a data/);
  a.v('FORM.sintoma({ data: hoje(), enjoo: "1", intestino: "Normal" }); FORM.sintoma({ data: hoje(), enjoo: "2", intestino: "Solto", refluxo: "on" })');
  assert.strictEqual(a.v("E.sintomas.length"), 2);
  const id = a.v("E.sintomas[0].id");
  a.v('sintomaEmEdicao = E.sintomas[0].id; FORM.sintoma({ data: mais(hoje(), -1), enjoo: "3", intestino: "Preso", tontura: "on", nota: "corrigido" })');
  assert.strictEqual(a.v("E.sintomas.length"), 2);
  const s = JSON.parse(a.v("JSON.stringify(E.sintomas[0])"));
  assert.deepStrictEqual([s.id, s.enjoo, s.intestino, s.tontura, s.nota, s.data], [id, 3, "Preso", true, "corrigido", a.v("mais(hoje(), -1)")]);
  assert.strictEqual(a.v("sintomaEmEdicao"), null);
});
test("texto do histórico e trecho do relatório", () => {
  const a = base();
  assert.strictEqual(a.v('resumoSintoma({ enjoo: 2, intestino: "Solto", vomito: true, dor: true })'), "Enjoo moderado, intestino solto, vômito, dor forte na barriga");
  a.v('E.sintomas = [{ id: "a", data: hoje(), enjoo: 2, intestino: "Preso", vomito: true, nota: "pior à noite" }, { id: "b", data: mais(hoje(), -60), enjoo: 3 }]');
  const rel = a.v("relSintomas(mais(hoje(), -29))");
  assert.match(rel[1], /^1 registro\. Enjoo moderado ou forte: 1\. Vômito: 1\. Intestino preso: 1\./);
  assert.match(rel[2], /pior à noite/);
});
