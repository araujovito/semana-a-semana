// Regras de vesícula e fígado (REGRAS_CARDAPIO, app/cardapio.js) no cardápio já escalado para perfis de exemplo,
// e o conferidor genérico (dados/conferir_cardapio.js), que também serve para conferir outro plano alimentar.
const test = require("node:test"), assert = require("node:assert");
const { conferirRegras, conferirPerfil, conferir } = require("../../dados/conferir_cardapio");
const base = conferir(1), A = base.alimentos;
const RG = (function () { const window = {}; eval(require("fs").readFileSync(require("path").join(__dirname, "../../app/cardapio.js"), "utf8")); return window.REGRAS_CARDAPIO; })();

// Parecido com o perfil do relatório (não é o dela: ela preenche no Perfil): mulher adulta com obesidade, sedentária.
const PARECIDO = { sexo: "F", altura: 158, peso: 120, idade: 45, atividade: 1.2 };
// Os PERFIS de testes/unidade/nutricao.js, menos o de 1.200 kcal com 140 g de proteína (de propósito fora dos limites),
// e outros de 1.200 a 1.950 kcal.
const PERFIS = [PARECIDO,
  { peso: 55, altura: 155 }, { peso: 95, altura: 163 }, { peso: 130, altura: 170 },
  { peso: 55, altura: 155, metaKcal: 1300, metaProt: 80 }, { peso: 95, altura: 163, metaKcal: 1600, metaProt: 110 }, { peso: 130, altura: 170, metaKcal: 1800, metaProt: 130 },
  { peso: 62, altura: 150, idade: 58 }, { peso: 80, altura: 160 }, { peso: 70, altura: 165 }, { sexo: "M", peso: 110, altura: 180 },
  { peso: 80, altura: 160, naoCome: ["lactose"] }, { peso: 80, altura: 160, naoCome: ["peixe"] }, { peso: 80, altura: 160, naoCome: ["ovo"] }];

test("regras: toda regra numérica tem fonte, força F/M/P e o número do relatório", () => {
  Object.keys(RG).filter(k => RG[k] && typeof RG[k] === "object" && !Array.isArray(RG[k])).forEach(k => {
    assert.ok(/^[FMP]$/.test(RG[k].forca), k); assert.ok(RG[k].fonte && RG[k].fonte.length > 10, k); assert.ok(/^R\d+$/.test(RG[k].regra), k);
  });
  assert.deepStrictEqual([RG.gordMinPrincipal.valor, RG.gordAlvoRefeicao.valor, RG.gordTetoRefeicao.valor, RG.pctGordDia.min, RG.pctGordDia.max, RG.kcalMaxRefeicao.valor, RG.fibraMinDia.valor, RG.peixeMinSemana.valor], [7, 15, 20, 25, 35, 500, 25, 2]);
});

test("conferidor genérico: aponta refeição gordurosa, grande, com azeite demais, sem gordura e com fritura", () => {
  const dia = { nome: "Teste", refeicoes: [
    { tipo: "Café da manhã", titulo: "Pão com ovo frito", itens: [{ k: "pao_frances", g: 50 }, { k: "ovo", g: 50 }] },
    { tipo: "Almoço", titulo: "Salmão", itens: [{ k: "salmao", g: 150 }, { k: "arroz_branco", g: 200 }, { k: "azeite", g: 12 }] },
    { tipo: "Jantar", titulo: "Merluza", itens: [{ k: "merluza", g: 100 }, { k: "batata", g: 100 }] },
  ] };
  const r = conferirRegras([dia], A, RG, { peixe: false }), t = r.problemas.join("\n");
  assert.match(t, /Almoço: .* acima do teto de 20 g/); assert.match(t, /Almoço: 12 g de azeite/); assert.match(t, /Almoço: \d+ kcal, acima de 500/);
  assert.match(t, /Jantar: .* abaixo do mínimo de 7 g/); assert.match(t, /Café da manhã: fala em fritura/);
  assert.ok(Math.abs(r.dias[0].refeicoes[2].gord - (0.92 + 0.06)) < 0.01);
  const ok = conferirRegras(base.cardapio.dias.map(d => ({ nome: d.nome, refeicoes: d.refeicoes.map(x => ({ tipo: x.tipo, titulo: x.titulo, preparo: x.preparo, itens: x.itens.map(i => ({ k: i[0], g: i[1] })) })) })), A, RG);
  assert.deepStrictEqual(ok.problemas, [], "cardápio na porção base");
});

test("cardápio escalado: perfis de exemplo cumprem gordura mínima e teto, % de gordura, kcal por refeição, fibra e peixe", () => {
  PERFIS.forEach(p => {
    const r = conferirPerfil(p), m = r.metas;
    assert.deepStrictEqual(r.problemas, [], JSON.stringify(p));
    if (!m.escalaNoLimite) assert.ok(Math.abs(m.planoKcal / m.kcal - 1) <= 0.07 && m.planoProt >= m.prot * 0.93, JSON.stringify(p) + ": metas mantidas");
    r.planos.slice(0, 7).forEach(d => assert.ok(d.refeicoes.reduce((s, x) => s + x.itens.reduce((t, i) => t + A[i.k].kcal * i.g / 100, 0), 0) >= 1200, d.nome));
  });
});

test("perfil parecido: azeite até 10 g por refeição, nenhuma refeição acima de 15 g de gordura nem de 500 kcal, metas dentro de 7%", () => {
  const r = conferirPerfil(PARECIDO), m = r.metas;
  r.planos.forEach(d => d.refeicoes.forEach(x => assert.ok(x.itens.filter(i => i.k === "azeite").every(i => i.g <= 10), d.nome)));
  assert.deepStrictEqual(r.acimaDoAlvo, []);
  assert.ok(Math.max.apply(null, r.dias.slice(0, 7).map(d => Math.max.apply(null, d.refeicoes.map(x => x.kcal)))) <= 500);
  assert.ok(!m.escalaNoLimite && Math.abs(m.planoKcal / m.kcal - 1) <= 0.07 && Math.abs(m.planoProt / m.prot - 1) <= 0.07);
  const enjoo = r.dias[7]; assert.ok(enjoo.kcal < 1200 && Math.max.apply(null, enjoo.refeicoes.map(x => x.gord)) >= 9, "dia de enjoo leve, com uma refeição de cerca de 10 g");
});

test("cardápio base: cálcio não caiu com a troca para laticínio desnatado (média da semana a partir de 990 mg)", () => {
  assert.ok(base.media.ca >= 990, base.media.ca.toFixed(0));
});
