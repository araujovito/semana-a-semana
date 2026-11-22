// Caminhos de alimentação (app/caminhos.js): só dados, cada um com fonte e encaminhamento à nutricionista.
const test = require("node:test"), assert = require("node:assert");
const app = require("../carregar-app")();
const j = c => JSON.parse(app.v("JSON.stringify(" + c + ")"));
test("caminhos: A a E, todos com os campos, fonte e 'converse com sua nutricionista'", () => {
  const L = j("caminhoAlimentar()");
  assert.deepStrictEqual(L.map(c => c.id), ["A", "B", "C", "D", "E"]);
  L.forEach(c => {
    ["nome", "paraQuem", "comoFunciona", "vesicula", "fonte", "noApp", "conversa"].forEach(k => assert.ok(typeof c[k] === "string" && c[k].length > 5, c.id + "." + k));
    assert.ok(c.pros.length && c.contras.length, c.id);
    assert.match(c.conversa, /[Cc]onverse com sua nutricionista/);
    assert.ok(!/\bdose\b|suplemento|ursodesoxic/i.test(JSON.stringify(c)), c.id + ": sem dose, remédio ou suplemento");
  });
  assert.strictEqual(j("caminhoAlimentar('D')").soComEquipe, true);
  assert.match(j("caminhoAlimentar('D')").noApp, /não monta/);
  assert.strictEqual(j("caminhoAlimentar('Z')"), null);
});
