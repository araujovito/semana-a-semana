// Folha "Dor na barriga" aberta a partir de um registro de outro dia (Diário > Sintomas com vesícula marcada).
// As datas contam a partir de hoje, para o teste não depender do dia em que roda.
const test = require("node:test"), assert = require("node:assert");
const carregar = require("../carregar-app");
const dia = n => { const x = new Date(); x.setDate(x.getDate() - n); return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0"); };
const br = s => s.split("-").reverse().join("/");
const estado = (perfil, resto) => Object.assign({ v: 2, perfil: Object.assign({ nome: "", sexo: "F", nascimento: 1980, altura: 160, peso: 102, atividade: 1.2 }, perfil),
  doses: [], pesos: [], sintomas: [], dias: {}, ui: { planoNutri: false } }, resto || {});

test("Dor na barriga: a folha diz a data quando o registro é de outro dia", () => {
  const a = carregar(estado({ vesicula: true }));
  assert.match(a.v('htmlSinaisDor("' + dia(3) + '")'), new RegExp("Registrado em " + br(dia(3)) + ": dor forte na barriga\\."));
  assert.match(a.v('htmlSinaisDor("' + dia(0) + '")'), /Registrado no seu dia: dor forte na barriga\./);
  assert.match(a.v('htmlSinaisDor("leve")'), /Registrado no seu dia: dor na barriga\..*Foi dor forte/);
  assert.match(a.v("htmlSinaisDor(true)"), /Registrado no seu dia/);
  assert.doesNotMatch(a.v("htmlSinaisDor(false)"), /data-registrou/);
});
