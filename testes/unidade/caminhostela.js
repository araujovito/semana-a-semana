// Tela de caminhos (app/caminhostela.js): marcação "quero conversar" e o trecho que entra no relatório da consulta.
const test = require("node:test"), assert = require("node:assert");
const carregar = require("../carregar-app");
const base = ui => ({ v: 2, perfil: { nome: "", sexo: "F", nascimento: 1981, altura: 160, peso: 100, atividade: 1.2, naoCome: [], naoGosta: [] },
  doses: [], pesos: [], sintomas: [], treinos: [], dias: {}, trocas: {}, caneta: null, suplementos: [], exames: [], lembretes: {}, ui: ui || {} });
test("caminhos: nada marcado, nada no relatório", () => {
  const app = carregar(base());
  assert.strictEqual(app.v("camRelatorio().length"), 0);
  assert.ok(!/CAMINHOS DE ALIMENTAÇÃO/.test(app.v("relatorio()")));
});
test("caminhos: marcar e desmarcar guarda em E.ui.camConversar, na ordem A a E, e entra no relatório", () => {
  const app = carregar(base());
  app.v("AC.camConversar({ id: 'D' }); AC.camConversar({ id: 'A' }); AC.camConversar({ id: 'Z' })");
  assert.deepStrictEqual(JSON.parse(app.v("JSON.stringify(E.ui.camConversar)")), ["A", "D"]);
  assert.deepStrictEqual(JSON.parse(app.guardado["semana-a-semana.v1"]).ui.camConversar, ["A", "D"]);
  const r = app.v("relatorio()");
  assert.match(r, /CAMINHOS DE ALIMENTAÇÃO PARA CONVERSAR \(marcados no app; o plano em uso é o da nutricionista\)\nA\. Mediterrânea do jeito brasileiro; D\. Redução do fígado antes da cirurgia\./);
  assert.match(r, /EXERCÍCIO[\s\S]*\n\nCAMINHOS DE ALIMENTAÇÃO/, "vem por último, separado por linha em branco");
  app.v("AC.camConversar({ id: 'A' })");
  assert.deepStrictEqual(JSON.parse(app.v("JSON.stringify(E.ui.camConversar)")), ["D"]);
});
test("caminhos: E.ui.camConversar danificado não quebra a tela nem o relatório", () => {
  const app = carregar(base({ camConversar: ["C", "x", 3, "C", null] }));
  assert.deepStrictEqual(JSON.parse(app.v("JSON.stringify(camMarcados())")), ["C"]);
  assert.match(app.v("telaCaminhos()"), /Plano da sua nutricionista/);
  const app2 = carregar(base({ camConversar: "A" }));
  assert.strictEqual(app2.v("camRelatorio().length"), 0);
});
test("caminhos: encaixe do plano da nutricionista é opcional", () => {
  const app = carregar(base());
  assert.ok(!/class="cam-resumo"/.test(app.v("telaCaminhos()")));
  app.v("globalThis.camResumoPlanoNutri = () => 'Prescrito em 04/11 · 5 refeições'");
  assert.match(app.v("telaCaminhos()"), /<p class="cam-resumo">Prescrito em 04\/11 · 5 refeições<\/p>/);
  app.v("globalThis.camResumoPlanoNutri = () => { throw new Error('x'); }");
  assert.match(app.v("telaCaminhos()"), /Plano da sua nutricionista/);
});
