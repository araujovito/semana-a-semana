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
  assert.match(t, /Pronto-socorro hoje<\/strong> se a dor não passar em cerca de 6 horas/); assert.match(t, /febre ou calafrio/);
  assert.match(t, /urina escura e fezes claras/); assert.match(t, /Ligue 192/); assert.match(t, /Avise o médico<\/strong> nos próximos dias se teve uma crise que passou sozinha/);
  assert.match(app.v("avisosDoPerfil()"), /data-aviso="vesicula"/, "Perfil e Plano usam avisosDoPerfil");
  assert.match(app.v('avisoVesicula("hoje")'), /data-para="guia"/, "na tela Hoje, atalho para os sinais de alerta do Guia");
  assert.doesNotMatch(t, /data-para="guia"/);
});
test("vesícula: o cartão não traz dose, remédio nem suplemento", () => {
  const t = carregar(estado({ vesicula: true })).v('avisoVesicula("hoje")');
  assert.doesNotMatch(t, /\bmg\b|suplement|tome |ursodesox/i);
});
test("Guia, sinais de alerta: itens da vesícula para quem tem pedra (pesquisa de 22/11, seção 6)", () => {
  const g = carregar().v("JSON.stringify(G.filter(x => x.titulo === 'Sinais de alerta')[0].corpo)");
  const i = r => JSON.parse(g).findIndex(l => r.test(l)), idx = t => JSON.parse(g).indexOf(t);
  const ps = idx("Vá ao pronto-socorro hoje se:"), med = idx("Fale com o médico nos próximos dias se:");
  assert.ok(i(/não passa em cerca de 6 horas/) > ps && i(/não passa em cerca de 6 horas/) < med, "dor que não passa: pronto-socorro");
  assert.ok(i(/febre ou calafrio/) > ps && i(/fezes claras/) > ps && i(/fezes claras/) < med, "febre e amarelão com fezes claras: pronto-socorro");
  assert.ok(i(/passou sozinha/) > med, "cólica que passou sozinha: médico nos próximos dias");
  assert.ok(i(/febre alta e pele amarela, junto com confusão/) < ps, "com confusão ou desmaio: 192");
});
