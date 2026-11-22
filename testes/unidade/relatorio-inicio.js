// Começo do relatório para a consulta: condições do perfil, datas de dor forte e marcas de 5, 7 e 10% com fígado ou cirurgia.
// Pesos de teste, não os da usuária. As datas contam a partir de hoje, para o teste não depender do dia em que roda.
const test = require("node:test"), assert = require("node:assert");
const carregar = require("../carregar-app");
const dia = n => { const x = new Date(); x.setDate(x.getDate() - n); return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0"); };
const br = s => s.split("-").reverse().join("/");
// 101 kg há 21 dias e 96,5 kg hoje: 1,5% por semana.
const rapido = [{ id: "a", data: dia(21), kg: 101 }, { id: "b", data: dia(0), kg: 96.5 }];
const estado = (perfil, resto) => Object.assign({ v: 2, perfil: Object.assign({ nome: "", sexo: "F", nascimento: 1980, altura: 160, peso: 102, atividade: 1.2 }, perfil),
  doses: [], pesos: [], sintomas: [], dias: {}, ui: { planoNutri: false } }, resto || {});

test("Relatório começa pelas condições do perfil e pelas datas de dor forte", () => {
  const sintomas = [{ id: "s1", data: dia(3), enjoo: 0, dor: true }, { id: "s2", data: dia(3), enjoo: 1, dor: true }, { id: "s3", data: dia(10), enjoo: 0, dor: true },
    { id: "s4", data: dia(5), enjoo: 2, dor: false }, { id: "s5", data: dia(45), enjoo: 0, dor: true }];
  const r = carregar(estado({ vesicula: true, aguardaCirurgia: true, figado: true, diabetes: true, insulinaSulf: false }, { sintomas, pesos: rapido })).v("relatorio()");
  const l = r.split("\n");
  assert.strictEqual(l[3], "PARA COMEÇAR", "logo depois do cabeçalho");
  assert.strictEqual(l[4], "Condições informadas no perfil: pedra na vesícula: sim; aguardando cirurgia da vesícula: sim; gordura no fígado: sim; diabetes: sim; usa insulina ou sulfonilureia: não.");
  assert.strictEqual(l[5], "Dor forte na barriga registrada em: " + br(dia(10)) + ", " + br(dia(3)) + ". Antes do período: 1 dia, o último em " + br(dia(45)) + ".");
  assert.match(l[6], /^Marcas de perda de peso da diretriz de fígado: perda de 5,4% do peso desde o início \(102,0 kg -> 96,5 kg\)\. 5% \(96,9 kg\) alcançada; 7% \(94,9 kg\), faltam 1,6 kg; 10% \(91,8 kg\), faltam 4,7 kg\.$/);
});
test("Relatório: só entra o que foi respondido; sem dor, diz que não houve registro; sem fígado nem cirurgia, sem marcas", () => {
  const r = carregar(estado({ vesicula: false, figado: null, diabetes: null })).v("relatorio()").split("\n");
  assert.strictEqual(r[4], "Condições informadas no perfil: pedra na vesícula: não.");
  assert.strictEqual(r[5], "Dor forte na barriga: nenhum registro no período.");
  assert.strictEqual(r[6], "", "sem linha de marcas");
  assert.match(carregar(estado({})).v("relatorio()"), /Condições informadas no perfil: nenhuma respondida\./);
  assert.match(carregar(estado({ figado: true })).v("relatorio()"), /Marcas de perda de peso da diretriz de fígado \(5, 7 e 10%\): sem pesagens registradas\./);
});
test("Relatório no modo discreto: marcas só em percentuais, nenhum quilo nessa linha", () => {
  const l = carregar(estado({ vesicula: true, aguardaCirurgia: true, discreto: true }, { pesos: rapido })).v("relatorio()").split("\n").find(x => /^Marcas de perda/.test(x));
  assert.strictEqual(l, "Marcas de perda de peso da diretriz de fígado: perda de 5,4% do peso desde o início. 5% alcançada; 7% ainda não; 10% ainda não.");
});
