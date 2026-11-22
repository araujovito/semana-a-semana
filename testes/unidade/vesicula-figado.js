// Avisos de vesícula e fígado: quando aparecem e o que dizem. Pesos de teste, não os da usuária.
const test = require("node:test"), assert = require("node:assert");
const carregar = require("../carregar-app");
const estado = (perfil, pesos) => ({ v: 2, perfil: Object.assign({ nome: "T", sexo: "F", nascimento: 1980, altura: 160, peso: 100, atividade: 1.2 }, perfil), pesos: pesos || [] });

test("vesícula: sem resposta, não ou prefiro não responder, não há cartão em nenhuma tela", () => {
  for (const v of [undefined, null, false]) {
    const app = carregar(estado({ vesicula: v }));
    for (const onde of ["hoje", "plano", "perfil"]) assert.strictEqual(app.v('avisoVesicula("' + onde + '")'), "");
  }
});
test("vesícula marcada: cartão com bula, crise, onde procurar ajuda e a pergunta para o médico", () => {
  const app = carregar(estado({ vesicula: true }));
  const t = app.v('avisoVesicula("plano")');
  assert.match(t, /bula da tirzepatida lista problemas de vesícula/);
  assert.match(t, /perder peso rápido aumenta esse risco/);
  assert.match(t, /O seu médico sabe que você tem pedra na vesícula\? Confirme com ele antes de começar/);
  assert.match(t, /pronto-socorro hoje/); assert.match(t, /ligue 192/); assert.match(t, /conte ao médico/);
  assert.match(app.v("avisosDoPerfil()"), /data-aviso="vesicula"/, "Perfil e Plano usam avisosDoPerfil");
  assert.match(app.v('avisoVesicula("hoje")'), /data-para="guia"/, "na tela Hoje, atalho para os sinais de alerta do Guia");
  assert.doesNotMatch(t, /data-para="guia"/);
});
test("vesícula: o cartão não traz dose, remédio nem suplemento", () => {
  const t = carregar(estado({ vesicula: true })).v('avisoVesicula("hoje")');
  assert.doesNotMatch(t, /\bmg\b|suplement|tome |ursodesox/i);
});
