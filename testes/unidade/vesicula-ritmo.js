// Vesícula marcada: o aviso de ritmo de perda também em Hoje (uma linha e "ver") e na semana atual da visão semanal.
// Pesos de teste, não os da usuária. As datas contam a partir de hoje, para o teste não depender do dia em que roda.
const test = require("node:test"), assert = require("node:assert");
const carregar = require("../carregar-app");
const dia = n => { const x = new Date(); x.setDate(x.getDate() - n); return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0"); };
// 101 kg há 21 dias e 96,5 kg hoje: 1,5% por semana (rápido). 100 -> 99,3 kg em 21 dias: 0,2% (devagar).
const rapido = [{ id: "a", data: dia(21), kg: 101 }, { id: "b", data: dia(0), kg: 96.5 }];
const devagar = [{ id: "a", data: dia(21), kg: 100 }, { id: "b", data: dia(0), kg: 99.3 }];
const estado = (perfil, resto) => Object.assign({ v: 2, perfil: Object.assign({ nome: "", sexo: "F", nascimento: 1980, altura: 160, peso: 102, atividade: 1.2 }, perfil),
  doses: [], pesos: [], sintomas: [], dias: {}, ui: { planoNutri: false } }, resto || {});

test("Hoje: com vesícula e perda rápida, uma linha com o ritmo e o botão ver", () => {
  const t = carregar(estado({ vesicula: true }, { pesos: rapido })).v("ritmoCurto()");
  assert.match(t, /data-aviso="ritmo"/);
  assert.match(t, /Ritmo de perda:<\/strong> Perda média de 1,5% do peso por semana, acima de 1%\./);
  assert.match(t, /data-ac="verRitmo">ver</);
  assert.doesNotMatch(t, /kg/);
});
test("Hoje: modo discreto, a linha não traz número de peso nem percentual de perda", () => {
  const t = carregar(estado({ vesicula: true, discreto: true }, { pesos: rapido })).v("ritmoCurto()");
  assert.match(t, /O peso caiu mais de 1% por semana nas últimas semanas\./);
  assert.doesNotMatch(t.replace(/<[^>]*>/g, "").replace("1%", ""), /\d/, "no texto à vista, só o limite de 1%");
});
test("Hoje: sem vesícula, ou com perda devagar, não há linha de ritmo", () => {
  for (const v of [undefined, null, false]) assert.strictEqual(carregar(estado({ vesicula: v }, { pesos: rapido })).v("ritmoCurto()"), "");
  assert.strictEqual(carregar(estado({ vesicula: true }, { pesos: devagar })).v("ritmoCurto()"), "");
  assert.strictEqual(carregar(estado({ vesicula: true }, { pesos: [] })).v("ritmoCurto()"), "");
});
test("Semana: com vesícula e perda rápida, o aviso de ritmo entra na semana atual; discreto sem números; sem vesícula, nada", () => {
  const doses = [{ id: "d", data: dia(14), mg: 2.5, local: "Abdômen", obs: "" }];
  const com = carregar(estado({ vesicula: true }, { pesos: rapido, doses })).v("telaSemana()");
  assert.match(com, /data-semana-ritmo/); assert.match(com, /Você perdeu em média 1,5% do peso por semana nos 21 dias/);
  const disc = carregar(estado({ vesicula: true, discreto: true }, { pesos: rapido, doses })).v("telaSemana()");
  assert.match(disc, /data-semana-ritmo/); assert.match(disc, /o peso caiu mais de 1% por semana/i); assert.doesNotMatch(disc, /1,5%/);
  assert.doesNotMatch(carregar(estado({ vesicula: false }, { pesos: rapido, doses })).v("telaSemana()"), /data-semana-ritmo/);
});
