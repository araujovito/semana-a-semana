// Cardápio base e base de alimentos: estrutura, piso de energia e as correções de dados do achado 14 da auditoria.
const test = require("node:test"), assert = require("node:assert");
const { conferir } = require("../../dados/conferir_cardapio");
const r = conferir(1), A = r.alimentos, C = r.cardapio;
const TIPOS = ["Café da manhã", "Lanche da manhã", "Almoço", "Lanche da tarde", "Jantar"];
const GRUPOS = ["proteina", "laticinio", "leguminosa", "carboidrato", "vegetal", "fruta", "gordura", "bebida"];
const SETORES = ["Hortifrúti", "Carnes e peixes", "Frios e laticínios", "Padaria", "Mercearia", "Bebidas"];

test("cardápio: 7 dias e o dia de enjoo, 5 refeições cada, sempre os mesmos tipos", () => {
  assert.strictEqual(C.dias.length, 7);
  C.dias.concat([C.nausea]).forEach(d => {
    assert.deepStrictEqual(d.refeicoes.map(x => x.tipo), TIPOS, d.nome);
    d.refeicoes.forEach(x => { assert.ok(x.titulo && x.itens.length > 0, d.nome + " / " + x.tipo); });
  });
  assert.ok(C.nausea.refeicoes.some(x => /Canja/.test(x.titulo)), "o dia de enjoo mantém a canja");
});

test("cardápio: todo item existe na base de alimentos e tem gramas válidas", () => {
  C.dias.concat([C.nausea]).forEach(d => d.refeicoes.forEach(x => x.itens.forEach(it => {
    assert.ok(A[it[0]], "alimento inexistente: " + it[0] + " (" + d.nome + ")");
    assert.ok(typeof it[1] === "number" && it[1] > 0, "gramas de " + it[0] + " em " + d.nome);
  })));
});

test("alimentos: todos têm setor do mercado, lista 'contem', grupo conhecido e os 18 nutrientes", () => {
  const campos = require("../../dados/conferir_cardapio").CAMPOS;
  Object.keys(A).forEach(k => {
    const a = A[k];
    assert.ok(SETORES.indexOf(a.setor) >= 0, k + ": setor " + a.setor);
    assert.ok(Array.isArray(a.contem), k + ": contem");
    assert.ok(GRUPOS.indexOf(a.grupo) >= 0, k + ": grupo " + a.grupo);
    assert.ok(a.gMedida > 0 && a.medida, k + ": medida");
    campos.forEach(c => assert.ok(typeof a[c] === "number" && a[c] >= 0, k + ": " + c));
  });
});

test("alimentos: origem animal e glúten estão marcados em 'contem'", () => {
  ["frango_peito", "carne_patinho", "porco_lombo", "sardinha", "atum", "salmao"].forEach(k => assert.ok(A[k].contem.indexOf("carne") >= 0, k));
  ["sardinha", "atum", "salmao", "merluza", "tilapia"].forEach(k => assert.ok(A[k].contem.indexOf("peixe") >= 0, k));
  ["leite", "iogurte", "queijo_minas", "ricota", "whey", "tapioca"].forEach(k => assert.ok(A[k].contem.indexOf("leite") >= 0, k));
  ["aveia", "pao_integral", "pao_frances"].forEach(k => assert.ok(A[k].contem.indexOf("gluten") >= 0, k));
  assert.ok(A.ovo.contem.indexOf("ovo") >= 0);
  assert.deepStrictEqual(A.bebida_soja.contem, [], "a bebida de soja é a opção para quem não toma leite");
});

test("cardápio base: nenhum dia planejado abaixo de 1.200 kcal (decisão B4), com folga até 1.350", () => {
  r.dias.slice(0, 7).forEach(d => {
    assert.ok(d.kcal >= 1200, d.nome + ": " + d.kcal.toFixed(0) + " kcal");
    assert.ok(d.kcal >= 1350, d.nome + " ficou perto do piso: " + d.kcal.toFixed(0) + " kcal");
    assert.ok(d.kcal <= 1560, d.nome + ": " + d.kcal.toFixed(0) + " kcal");
    assert.ok(d.prot >= 100, d.nome + ": " + d.prot.toFixed(0) + " g de proteína");
  });
  assert.strictEqual(r.dias[7].nome, "Dia de enjoo");
  assert.ok(r.dias[7].kcal < 1200, "o dia de enjoo é a exceção ao piso; se mudou, reveja este teste");
});

test("cardápio base: média de energia entre 1.400 e 1.470 kcal e de proteína a partir de 108 g", () => {
  assert.ok(r.media.kcal >= 1400 && r.media.kcal <= 1470, r.media.kcal.toFixed(0) + " kcal");
  assert.ok(r.media.prot >= 108, r.media.prot.toFixed(0) + " g");
});

test("as contas do app dão a mesma média do conferidor", () => {
  const app = require("../carregar-app")();
  // Cardápio base: sem restrições e com os dois fatores da escala em 1.
  const base = JSON.parse(app.v("JSON.stringify((function () { const m = zeros(); for (let i = 0; i < 7; i++) { const t = somarPlano(escalar(resolverDia(i, SEM_RESTRICAO), { prot: 1, energia: 1 })); CAMPOS.forEach(c => { m[c] += t[c] / 7; }); } return m; })())"));
  assert.ok(Math.abs(base.kcal - r.media.kcal) < 5, "base " + base.kcal + " x " + r.media.kcal);
  assert.ok(Math.abs(base.prot - r.media.prot) < 1);
});

test("achado 14: batata-doce não entra como fonte de vitamina A", () => {
  assert.strictEqual(A.batata_doce.vita, 0);
  // Sem a batata-doce alaranjada americana, a média da semana fica perto de 800 µg (era 979 a 1.002).
  assert.ok(r.media.vita > 700 && r.media.vita < 900, "vitamina A média: " + r.media.vita.toFixed(0));
});

test("achado 14: folato dos feijões, da lentilha e da batata corrigido pela água do alimento", () => {
  // USDA: carioca (pinto) 172, preto 149, lentilha 181, batata 9 µg por 100 g, com mais matéria seca que o cozido da TACO.
  assert.ok(A.feijao_carioca.folato >= 80 && A.feijao_carioca.folato <= 100, "carioca " + A.feijao_carioca.folato);
  assert.ok(A.feijao_preto.folato >= 75 && A.feijao_preto.folato <= 95, "preto " + A.feijao_preto.folato);
  assert.ok(A.lentilha.folato >= 125 && A.lentilha.folato <= 155, "lentilha " + A.lentilha.folato);
  assert.ok(A.batata.folato >= 4 && A.batata.folato <= 7, "batata " + A.batata.folato);
  // O que vem da TACO não muda com a correção.
  assert.ok(Math.abs(A.feijao_carioca.kcal - 76.4) < 0.5 && Math.abs(A.feijao_carioca.fe - 1.29) < 0.02);
});

test("achado 14: sardinha com o registro da drenada, igual ao nome e à medida", () => {
  assert.ok(/drenada/.test(A.sardinha.nome) && /drenada/.test(A.sardinha.medida));
  assert.strictEqual(A.sardinha.fonte, "USDA 175139");
  assert.ok(Math.abs(A.sardinha.kcal - 208) < 1 && Math.abs(A.sardinha.prot - 24.6) < 0.1 && A.sardinha.gord < 12, JSON.stringify(A.sardinha));
});

test("queijo minas sem a vitamina D do queijo americano de leite fortificado", () => {
  assert.ok(A.queijo_minas.vitd <= 1, "vitamina D " + A.queijo_minas.vitd);
});
