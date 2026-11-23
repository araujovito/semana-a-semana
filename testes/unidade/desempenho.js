// Atalhos de desempenho (empresa/relatorios/desempenho.md): a escala só é calculada quando lida. Não pode mudar resultado.
const test = require("node:test"), assert = require("node:assert");
const carregar = require("../carregar-app");
const ANO = new Date().getFullYear();
const estado = ui => ({ v: 2, perfil: { nome: "", sexo: "F", nascimento: ANO - 45, altura: 160, peso: 118, atividade: 1.2, metaKcal: null, metaProt: null, metaAgua: null,
  diabetes: null, insulinaSulf: null, pilula: null, naoCome: [], naoGosta: [] }, doses: [], pesos: [], sintomas: [], treinos: [], dias: {}, trocas: {}, caneta: null, suplementos: [], exames: [], lembretes: {}, ui });

test("metas(): a escala só é calculada quando um campo dela é lido, e vale o mesmo que calcularEscala", () => {
  const a = carregar(estado({}));
  a.v("var m = metas()");
  assert.strictEqual(a.v("Object.keys(MEMO_ESCALA).length"), 0, "ler só as metas (Hoje com o plano da nutricionista) não calcula a escala");
  assert.strictEqual(a.v("m.prot > 0 && m.vesicula === false && m.micro.fe === 18"), true, "os outros campos continuam na hora");
  const r = JSON.parse(a.v("JSON.stringify([m.fatorProt, m.fatorEnergia, m.fatorDias, m.fator, m.escalaNoLimite, m.planoKcal, m.planoProt])"));
  assert.strictEqual(a.v("Object.keys(MEMO_ESCALA).length"), 1, "ler um campo da escala calcula uma vez");
  const e = JSON.parse(a.v("JSON.stringify(calcularEscala(m.kcal, m.prot, restricoesDoPerfil(), m.pisoDia, m.protMax))"));
  assert.deepStrictEqual(r, [e.prot, e.energia, e.dias, e.energia, e.noLimite, e.kcalMedia, e.protMedia]);
  const copia = JSON.parse(a.v("JSON.stringify(metas())"));
  assert.strictEqual(copia.fatorProt, e.prot, "JSON.stringify(metas()) continua levando os campos da escala");
  assert.deepStrictEqual(Object.keys(copia).filter(k => /^(fator|escala|plano)/.test(k)).sort(), ["escalaNoLimite", "fator", "fatorDias", "fatorEnergia", "fatorProt", "planoKcal", "planoProt"]);
});

test("com o plano da nutricionista, Hoje, Painel e Semana não calculam a escala; sem ele, Hoje calcula", () => {
  for (const tela of ["telaHoje()", "telaPainel()", "telaSemana()"]) {
    const a = carregar(estado({}));
    a.v(tela);
    assert.strictEqual(a.v("Object.keys(MEMO_ESCALA).length"), 0, tela);
  }
  const b = carregar(estado({ planoNutri: false }));
  b.v("telaHoje()");
  assert.strictEqual(b.v("Object.keys(MEMO_ESCALA).length"), 1, "cardápio do app em uso: a escala entra na conta");
});
