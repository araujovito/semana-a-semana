// Painel: série de dias (lacuna não é zero), médias, proteína na faixa, dias abaixo de 1.200 kcal e modo discreto.
const test = require("node:test"), assert = require("node:assert");
const carregar = require("../carregar-app");

function relogio(inicio) {
  const agora = new Date(inicio).getTime();
  return class R extends Date { constructor(...a) { if (a.length) super(...a); else super(agora); } static now() { return agora; } };
}
const PERFIL = { nome: "T", sexo: "F", nascimento: 1990, altura: 163, peso: 95.4, atividade: 1.2, metaKcal: null, metaProt: null, metaAgua: null, diabetes: null, insulinaSulf: null, pilula: null, naoCome: [], naoGosta: [] };
const estado = (dias, perfil) => ({ v: 2, perfil: Object.assign({}, PERFIL, perfil || {}), doses: [], pesos: [], sintomas: [], treinos: [], dias: dias || {}, trocas: {}, caneta: null, suplementos: [], exames: [], lembretes: {}, ui: {} });
// Dia que só tem proteína avulsa: proteína conhecida e 0 kcal (a conta fica exata sem depender do cardápio).
const so = g => ({ enjoo: false, comido: [], agua: 0, protExtra: g, caminhada: 0 });
const HOJE = "2026-11-20";
function abrir(dias, perfil) { const app = carregar(estado(dias, perfil), { Date: relogio(HOJE + "T10:00:00") }); return { v: app.v, j: c => JSON.parse(app.v("JSON.stringify(" + c + ")")) }; }

test("série: dias sem registro ficam null (lacuna), dia com 'nada' marcado é zero", () => {
  const a = abrir({ "2026-11-18": so(50), "2026-11-19": { enjoo: false, comido: [{ q: 0 }], agua: 0, protExtra: 0, caminhada: 0 } });
  const s = a.j("painelSerie('" + HOJE + "', 7)");
  assert.strictEqual(s.length, 7);
  assert.deepStrictEqual(s.map(x => x.data), ["2026-11-14", "2026-11-15", "2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19", "2026-11-20"]);
  assert.deepStrictEqual(s.map(x => x.registrou), [false, false, false, false, true, true, false]);
  assert.strictEqual(s[0].prot, null); assert.strictEqual(s[0].kcal, null);
  assert.strictEqual(s[4].prot, 50);
  assert.deepStrictEqual([s[5].prot, s[5].kcal], [0, 0], "registrou 'nada': zero de verdade");
});

test("resumo: média só dos dias com registro; faixa inclusiva; abaixo de 1.200 kcal", () => {
  const a = abrir();
  const m = { protMin: 80, protMax: 110, pisoDia: 1200 };
  const serie = [
    { registrou: true, kcal: 1500, prot: 80 },     // na faixa (limite de baixo)
    { registrou: false, kcal: null, prot: null },  // lacuna: fora de tudo
    { registrou: true, kcal: 1199, prot: 110 },    // na faixa (limite de cima), abaixo de 1.200
    { registrou: true, kcal: 1200, prot: 111 },    // acima da faixa, não está abaixo de 1.200
    { registrou: true, kcal: 900, prot: 40 },      // abaixo dos dois
  ];
  const r = a.j("painelResumo(" + JSON.stringify(serie) + ", " + JSON.stringify(m) + ")");
  assert.deepStrictEqual([r.dias, r.total, r.naFaixa, r.abaixoKcal], [4, 5, 2, 2]);
  assert.strictEqual(r.mediaProt, (80 + 110 + 111 + 40) / 4);
  assert.strictEqual(r.mediaKcal, (1500 + 1199 + 1200 + 900) / 4);
  const vazio = a.j("painelResumo([{ registrou: false, kcal: null, prot: null }], " + JSON.stringify(m) + ")");
  assert.deepStrictEqual([vazio.dias, vazio.mediaProt, vazio.mediaKcal, vazio.naFaixa], [0, null, null, 0]);
});

test("quanto falta de proteína nunca é negativo", () => {
  const a = abrir();
  assert.strictEqual(a.v("painelFaltaProt(30.4, 100)"), 70);
  assert.strictEqual(a.v("painelFaltaProt(120, 100)"), 0);
});

test("tela: resumo usa os dias antes de hoje; lacunas no gráfico; discreto esconde calorias", () => {
  const dias = { "2026-11-20": so(30), "2026-11-19": so(100), "2026-11-17": so(60) };
  const a = abrir(dias);
  const m = a.j("metas()");
  const html = a.v("telaPainel()");
  assert.ok(/Faltam [\d.]+ g de proteína/.test(html), "mostra quanto falta");
  assert.ok(/Dias com registro: 2 de 7/.test(html), "hoje fica fora do resumo");
  assert.ok(html.indexOf('data-graf="kcal"') > 0 && html.indexOf('data-graf="prot"') > 0);
  assert.strictEqual((html.match(/class="dia lacuna"/g) || []).length * 1 + (html.match(/class="dia lacuna hoje"/g) || []).length, 2 * 4, "4 lacunas em cada gráfico");
  assert.ok(m.protMin <= 100 && 100 <= m.protMax, "100 g está na faixa do perfil de teste");
  assert.ok(/data-v="naFaixa">1 /.test(html));
  assert.ok(/kcal/.test(html));
  a.v("E.perfil.discreto = true");
  const d = a.v("telaPainel()");
  assert.ok(!/kcal|[Cc]alorias/.test(d), "modo discreto: nada de calorias");
  assert.ok(/Proteína/.test(d) && d.indexOf('data-graf="prot"') > 0);
});

test("texto neutro: sem parabéns nem falhou", () => {
  const a = abrir({ "2026-11-19": so(200), "2026-11-18": so(5) });
  const html = a.v("telaPainel()") + a.v("E.ui.painelPeriodo = 30, telaPainel()");
  assert.ok(!/parab|falhou|fracass|deveria|o correto/i.test(html));
  assert.ok(/Nos 30 dias antes de hoje/.test(html));
});

test("corte de calorias vem de metas().pisoDia: meta do médico abaixo de 1.200 vira o corte", () => {
  const serie = [{ registrou: true, kcal: 1100, prot: 90 }, { registrou: true, kcal: 950, prot: 90 }];
  // Corte do cardápio do app: vale com o plano da nutricionista desligado (ligado, o corte é o do teste do I1, mais abaixo).
  const padrao = abrir(); padrao.v("E.ui.planoNutri = false");
  assert.strictEqual(padrao.v("metas().pisoDia"), 1200);
  assert.strictEqual(padrao.j("painelResumo(" + JSON.stringify(serie) + ", metas())").abaixoKcal, 2);
  assert.ok(/Abaixo de 1\.200 kcal/.test(padrao.v("E.dias['2026-11-19'] = { enjoo: false, comido: [], agua: 0, protExtra: 50, caminhada: 0 }, telaPainel()")));
  const medico = abrir({ "2026-11-19": so(50) }, { metaKcal: 1000 }); medico.v("E.ui.planoNutri = false");
  assert.strictEqual(medico.v("metas().pisoDia"), 1000);
  assert.strictEqual(medico.j("painelResumo(" + JSON.stringify(serie) + ", metas())").abaixoKcal, 1, "só 950 fica abaixo de 1.000");
  const html = medico.v("telaPainel()");
  assert.ok(/Abaixo de 1\.000 kcal/.test(html) && /1\.000 kcal é o mínimo por dia/.test(html) && !/1\.200/.test(html));
});

test("período 7/30 lembrado em E.ui.painelPeriodo; valor estranho vira 7", () => {
  const a = abrir();
  assert.strictEqual(a.v("painelPeriodo()"), 7);
  a.v("E.ui.painelPeriodo = 30");
  assert.strictEqual(a.v("painelPeriodo()"), 30);
  assert.ok(/Nos 30 dias antes de hoje/.test(a.v("telaPainel()")));
  a.v("E.ui.painelPeriodo = 12");
  assert.strictEqual(a.v("painelPeriodo()"), 7);
});

test("tabela equivalente ao gráfico: um dia por linha, lacuna escrita, hoje em andamento; discreto sem a de calorias", () => {
  const a = abrir({ "2026-11-20": so(30), "2026-11-19": so(100) });
  const t = a.v("painelTabela(painelSerie('" + HOJE + "', 7), 'prot', 'g', '" + HOJE + "')");
  assert.strictEqual((t.match(/<tr><th scope="row">/g) || []).length, 7);
  assert.match(t, /<caption>Proteína por dia \(g\)<\/caption>/);
  assert.match(t, /^<details class="painel-tabela"[^>]*><summary>Ver proteína como tabela/);
  assert.match(t, /Hoje \(em andamento\)<\/th><td class="num">30</);
  assert.match(t, /quinta, 19\/11<\/th><td class="num">100</);
  assert.strictEqual((t.match(/sem registro/g) || []).length, 5);
  assert.strictEqual((a.v("telaPainel()").match(/data-tabela=/g) || []).length, 2);
  a.v("E.perfil.discreto = true");
  const d = a.v("telaPainel()");
  assert.strictEqual((d.match(/data-tabela=/g) || []).length, 1);
  assert.ok(d.indexOf('data-tabela="prot"') > 0);
});
test("auditoria 3 (I3): dia só com proteína avulsa não vira dia de 0 kcal", () => {
  const carregar = require("../carregar-app");
  const a = carregar({ v: 2, perfil: { nome: "", sexo: "F", nascimento: 1981, altura: 159, peso: 100, atividade: 1.2, metaKcal: null, metaProt: null, metaAgua: null, diabetes: null, insulinaSulf: null, pilula: null, naoCome: [], naoGosta: [] },
    doses: [], pesos: [], sintomas: [], treinos: [], dias: { "2026-11-18": { enjoo: false, protExtra: 10, agua: 0, caminhada: 0 } }, trocas: {}, caneta: null, suplementos: [], exames: [], lembretes: {}, ui: { usarPlanoNutri: false } });
  const r = JSON.parse(a.v("JSON.stringify(painelResumo(painelSerie('2026-11-19', 7), metas()))"));
  assert.strictEqual(r.dias, 1); assert.strictEqual(r.diasKcal, 0); assert.strictEqual(r.abaixoKcal, 0); assert.strictEqual(r.mediaKcal, null);
});
test("teste final (I1): com o plano da nutricionista, calorias comparam com a faixa dela e o corte é KCAL_POUCO", () => {
  const a = abrir({ "2026-11-19": so(50) }, { peso: 120 });
  assert.ok(a.v("pnEmUso()"));
  const ae = a.j("alvoEnergia()");
  assert.ok(ae.nutri && ae.piso === 800 && ae.min < ae.max && ae.kcal === ae.min);
  const html = a.v("telaPainel()");
  assert.match(html, /Abaixo de 800 kcal/);
  assert.match(html, /meta 1\.009 kcal/);
  assert.ok(!/1\.550|mínimo por dia que o cardápio do app usa/.test(html), "a meta do app não aparece com o plano dela em uso");
});
