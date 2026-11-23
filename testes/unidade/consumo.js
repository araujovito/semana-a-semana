// Consumo: o que foi comido de fato (fracoes, foto da porcao, dia de enjoo, virada do dia), avisos de comer pouco e relatorio.
const test = require("node:test"), assert = require("node:assert");
const carregar = require("../carregar-app");

// Relogio que os testes controlam. R.ir("2026-11-17T00:05:00") muda a hora de "agora".
function relogio(inicio) {
  let agora = new Date(inicio).getTime();
  class R extends Date { constructor(...a) { if (a.length) super(...a); else super(agora); } static now() { return agora; } }
  R.ir = s => { agora = new Date(s).getTime(); };
  return R;
}
const PERFIL = { nome: "T", sexo: "F", nascimento: 1990, altura: 163, peso: 95.4, atividade: 1.2, metaKcal: null, metaProt: null, metaAgua: null, diabetes: null, insulinaSulf: null, pilula: null, naoCome: [], naoGosta: [] };
// ui.planoNutri: false = estes testes são do cardápio do app; o plano da nutricionista tem os dele (testes/unidade/planonutri.js).
const estado = extra => Object.assign({ v: 2, perfil: Object.assign({}, PERFIL), doses: [], pesos: [], sintomas: [], treinos: [], dias: {}, trocas: {}, caneta: null, suplementos: [], exames: [], lembretes: {}, ui: { planoNutri: false } }, extra || {});
const SEG = "2026-11-16", TER = "2026-11-17";   // segunda e terca
function abrir(extra, hora) { const R = relogio(hora || SEG + "T12:00:00"), app = carregar(estado(extra), { Date: R }); return { app, R, v: app.v, j: c => JSON.parse(app.v("JSON.stringify(" + c + ")")) }; }
const marcar = (a, dia, i, q, marcado) => a.v("MUD.refeicao({ checked: " + (marcado !== false) + ", dataset: { dia: '" + dia + "', i: '" + i + "', q: '" + q + "' } })");
const perto = (a, b, m) => assert.ok(Math.abs(a - b) < 1e-6, (m || "") + " " + a + " != " + b);

test("tudo, metade, um pouco e nada contam na proporção", () => {
  const a = abrir();
  const p = a.j("planoDaData('" + SEG + "').refeicoes.map(r => somarItens(r.itens))");
  marcar(a, SEG, 0, 1); marcar(a, SEG, 1, 0.5); marcar(a, SEG, 2, 0.25); marcar(a, SEG, 3, 0);
  const c = a.j("consumoDoDia('" + SEG + "')");
  perto(c.comida.prot, p[0].prot + p[1].prot / 2 + p[2].prot / 4, "proteína");
  perto(c.comida.kcal, p[0].kcal + p[1].kcal / 2 + p[2].kcal / 4, "energia");
  perto(c.total.ca, p[0].ca + p[1].ca / 2 + p[2].ca / 4, "cálcio");
  assert.deepStrictEqual([c.registrou, c.refeicoes, c.comidas, c.pouco, c.nada], [true, 4, 3, 1, 1]);
  assert.strictEqual(Object.keys(c.total).length, a.v("CAMPOS.length"));
  // tocar de novo na opcao marcada desfaz
  marcar(a, SEG, 0, 1, false);
  assert.strictEqual(a.j("E.dias['" + SEG + "'].comido[0]"), null);
  assert.strictEqual(a.j("consumoDoDia('" + SEG + "').refeicoes"), 3);
});

test("dia sem nada marcado: zeros e registrou falso", () => {
  const a = abrir(), c = a.j("consumoDoDia('" + SEG + "')");
  assert.deepStrictEqual([c.registrou, c.refeicoes, c.total.prot, c.total.kcal], [false, 0, 0, 0]);
});

test("a foto da porção segura o que foi comido quando a meta muda; registro antigo sem foto segue o plano atual", () => {
  const a = abrir({ dias: { "2026-11-09": { enjoo: false, comido: [{ q: 1 }], agua: 0, protExtra: 0, caminhada: 0 } } });
  marcar(a, SEG, 2, 1);
  assert.ok(Array.isArray(a.j("E.dias['" + SEG + "'].comido[2].itens")), "grava a foto");
  const antes = a.j("[consumoDoDia('" + SEG + "').comida.kcal, consumoDoDia('2026-11-09').comida.kcal, metas().fator]");
  a.v("E.perfil.metaKcal = 2400");
  const depois = a.j("[consumoDoDia('" + SEG + "').comida.kcal, consumoDoDia('2026-11-09').comida.kcal, metas().fator]");
  assert.notStrictEqual(antes[2], depois[2], "o fator do plano mudou");
  perto(antes[0], depois[0], "com foto não muda");
  assert.ok(Math.abs(depois[1] - antes[1]) > 1, "sem foto acompanha o plano atual (com a escala de dois fatores, mais energia pode trocar ovo por pão)");
  // corrigir de tudo para metade reaproveita a foto
  marcar(a, SEG, 2, 0.5);
  perto(a.j("consumoDoDia('" + SEG + "').comida.kcal"), antes[0] / 2, "metade da mesma foto");
});

test("alimento que saiu da base não derruba a conta", () => {
  const a = abrir({ dias: { [SEG]: { enjoo: false, comido: [{ q: 1, itens: [["nao_existe", 100], ["ovo", 100]] }], agua: 0, protExtra: 0, caminhada: 0 } } });
  perto(a.j("consumoDoDia('" + SEG + "').comida.prot"), a.v("A.ovo.prot"));
});

test("outros, proteína avulsa (protExtra) e suplementos entram na soma", () => {
  const a = abrir({ dias: { [SEG]: { enjoo: false, comido: [{ q: 0, outros: [["banana", 200]] }], agua: 0, protExtra: 20, caminhada: 0 } } });
  let c = a.j("consumoDoDia('" + SEG + "')");
  perto(c.comida.kcal, 2 * a.v("A.banana.kcal"), "outros");
  perto(c.comida.prot, 2 * a.v("A.banana.prot") + 20, "protExtra");
  assert.strictEqual(c.temExtras, false);
  a.v("EXTRAS_NUTRI.push(d => d === '" + SEG + "' ? { vitd: 25, b12: 2 } : null)");
  c = a.j("consumoDoDia('" + SEG + "')");
  perto(c.total.vitd, c.comida.vitd + 25); perto(c.extras.b12, 2);
  assert.strictEqual(c.temExtras, true);
  // so protExtra ja conta como dia com registro
  const b = abrir({ dias: { [SEG]: { enjoo: false, comido: [], agua: 0, protExtra: 10, caminhada: 0 } } }), cb = b.j("consumoDoDia('" + SEG + "')");
  assert.deepStrictEqual([cb.registrou, cb.refeicoes, cb.total.prot], [true, 0, 10]);
  b.v("AC.prot({ g: '10', dia: '" + SEG + "' })"); assert.strictEqual(b.j("E.dias['" + SEG + "'].protExtra"), 20);
  b.v("AC.prot({ g: '-10', dia: '" + SEG + "' })"); b.v("AC.prot({ g: '-10', dia: '" + SEG + "' })"); b.v("AC.prot({ g: '-10', dia: '" + SEG + "' })");
  assert.strictEqual(b.j("E.dias['" + SEG + "'].protExtra"), 0);
});

test("ligar e desligar o dia de enjoo não apaga o que foi marcado e o total junta os dois cardápios", () => {
  const a = abrir();
  marcar(a, SEG, 0, 1); marcar(a, SEG, 2, 0.5);
  const normal = a.j("consumoDoDia('" + SEG + "').comida.prot");
  a.v("AC.enjoo({ dia: '" + SEG + "' })");
  assert.strictEqual(a.j("E.dias['" + SEG + "'].enjoo"), true);
  assert.strictEqual(a.j("registrosDoDia(dia('" + SEG + "'), '" + SEG + "').filter(Boolean).length"), 0, "o cardápio de enjoo aparece sem marcas");
  perto(a.j("consumoDoDia('" + SEG + "').comida.prot"), normal, "o que já foi comido continua no total ao ligar o enjoo");
  assert.deepStrictEqual(a.j("consumoOutroPlano('" + SEG + "')").refeicoes, 2, "a tela sabe que há 2 marcas no cardápio normal");
  marcar(a, SEG, 1, 1);
  const leve = a.j("somarItens(planoDoDia(7).refeicoes[1].itens).prot");
  perto(a.j("consumoDoDia('" + SEG + "').comida.prot"), normal + leve, "soma o cardápio normal e a refeição leve");
  assert.strictEqual(a.j("consumoDoDia('" + SEG + "').refeicoes"), 3);
  a.v("AC.enjoo({ dia: '" + SEG + "' })");
  perto(a.j("consumoDoDia('" + SEG + "').comida.prot"), normal + leve, "desligar não tira a refeição leve do total");
  assert.strictEqual(a.j("E.dias['" + SEG + "'].comido[2].q"), 0.5);
  assert.strictEqual(a.j("E.dias['" + SEG + "'].comidoEnjoo[1].q"), 1);
  perto(a.j("consumoOutroPlano('" + SEG + "')").prot, leve, "com o enjoo desligado, o outro cardápio é o leve");
});

test("dado antigo: dia de enjoo sem comidoEnjoo tinha as marcas em comido", () => {
  const a = abrir({ dias: { [SEG]: { enjoo: true, comido: [{ q: 1 }, null, { q: 1 }], agua: 0, protExtra: 0, caminhada: 0 } } });
  const c = a.j("consumoDoDia('" + SEG + "')"), p = a.j("planoDoDia(7).refeicoes.map(r => somarItens(r.itens).prot)");
  assert.strictEqual(c.refeicoes, 2); perto(c.comida.prot, p[0] + p[2]);
  a.v("AC.enjoo({ dia: '" + SEG + "' })");
  const d = a.j("E.dias['" + SEG + "']");
  assert.deepStrictEqual([d.enjoo, d.comido, d.comidoEnjoo.length], [false, [], 3], "as marcas vão para comidoEnjoo, não viram marcas do plano normal");
  const c2 = a.j("consumoDoDia('" + SEG + "')");
  assert.strictEqual(c2.refeicoes, 2, "e continuam no total, uma vez só"); perto(c2.comida.prot, p[0] + p[2]);
});

test("virada do dia: o toque nunca grava no dia errado", () => {
  const a = abrir(null, SEG + "T23:58:00");
  assert.strictEqual(a.v("dataSel()"), SEG);
  marcar(a, SEG, 0, 1);
  a.R.ir(TER + "T00:05:00");
  assert.strictEqual(a.v("dataSel()"), TER, "quem estava em hoje passa a ver o novo dia");
  // a tela ainda mostrava segunda: o toque leva data-dia de segunda e nao grava em lugar nenhum
  marcar(a, SEG, 4, 1); a.v("AC.agua({ ml: '200', dia: '" + SEG + "' })"); a.v("AC.enjoo({ dia: '" + SEG + "' })"); a.v("AC.caminhada({ min: '10', dia: '" + SEG + "' })");
  assert.strictEqual(a.j("E.dias['" + TER + "'] || null"), null, "nada gravado na terça");
  assert.deepStrictEqual(a.j("[E.dias['" + SEG + "'].comido.length, E.dias['" + SEG + "'].agua || 0, !!E.dias['" + SEG + "'].enjoo]"), [1, 0, false], "segunda fica como estava");
  assert.ok(a.app.avisos.some(t => /dia virou/.test(t)), "avisa que o dia virou");
  // depois do redesenho o toque vale para terca
  marcar(a, TER, 4, 1);
  assert.strictEqual(a.j("E.dias['" + TER + "'].comido[4].q"), 1);
  assert.strictEqual(a.j("consumoDoDia('" + SEG + "').refeicoes"), 1);
  assert.strictEqual(a.j("consumoDoDia('" + TER + "').refeicoes"), 1);
  assert.deepStrictEqual(a.j("E.dias['" + TER + "'].comido.slice(0, 4)"), [null, null, null, null], "sem buracos no que é gravado");
});

test("dia anterior: grava no dia escolhido, volta para hoje, limite de 60 dias, e a data escolhida não envelhece para o futuro", () => {
  const a = abrir();
  a.v("AC.diaVer({ n: '-1' })");
  assert.strictEqual(a.v("dataSel()"), "2026-11-15");
  marcar(a, "2026-11-15", 0, 0.5); a.v("AC.agua({ ml: '500', dia: '2026-11-15' })");
  assert.deepStrictEqual(a.j("[E.dias['2026-11-15'].comido[0].q, E.dias['2026-11-15'].agua, E.dias['" + SEG + "'] || null]"), [0.5, 500, null]);
  a.v("AC.diaVer({ n: '1' })"); assert.strictEqual(a.v("diaSel"), null, "chegando em hoje, volta a ser 'hoje' e não uma data fixa");
  a.v("AC.diaVer({ n: '1' })"); assert.strictEqual(a.v("dataSel()"), SEG, "não passa de hoje");
  for (let i = 0; i < 70; i++) a.v("AC.diaVer({ n: '-1' })");
  assert.strictEqual(a.v("entre(dataSel(), hoje())"), 60);
  a.v("AC.diaVer({ n: '0' })"); assert.strictEqual(a.v("dataSel()"), SEG);
  assert.deepStrictEqual(a.j("[rotuloDia('" + SEG + "'), rotuloDia('2026-11-15'), rotuloDia('2026-11-11')]"), ["Hoje", "Ontem", "qua, 11/11"]);
});

const diaCom = (q, n) => ({ enjoo: false, comido: Array.from({ length: n || 1 }, () => ({ q })), agua: 0, protExtra: 0, caminhada: 0 });
test("comer pouco: 3º dia seguido de enjoo", () => {
  const e = d => ({ enjoo: true, comido: [], agua: 0, protExtra: 0, caminhada: 0 });
  assert.strictEqual(abrir({ dias: { "2026-11-14": e(), "2026-11-15": e(), [SEG]: e() } }).v("motivoComerPouco(hoje())"), "enjoo");
  assert.strictEqual(abrir({ dias: { "2026-11-15": e(), [SEG]: e() } }).v("motivoComerPouco(hoje())"), null, "2 dias não disparam");
  assert.strictEqual(abrir({ dias: { "2026-11-13": e(), "2026-11-14": e(), "2026-11-15": e() } }).v("motivoComerPouco(hoje())"), null, "enjoo desligado hoje não dispara");
});
test("comer pouco: vômito em 2 dias seguidos", () => {
  const s = (...ds) => ({ sintomas: ds.map((d, i) => ({ id: "s" + i, data: d, enjoo: 1, vomito: true })) });
  assert.strictEqual(abrir(s("2026-11-15", SEG)).v("motivoComerPouco(hoje())"), "vomito");
  assert.strictEqual(abrir(s("2026-11-14", "2026-11-15")).v("motivoComerPouco(hoje())"), "vomito");
  assert.strictEqual(abrir(s("2026-11-14", SEG)).v("motivoComerPouco(hoje())"), null, "dias alternados não disparam");
  assert.strictEqual(abrir(s("2026-11-12", "2026-11-13")).v("motivoComerPouco(hoje())"), null, "vômito antigo não dispara");
  assert.strictEqual(abrir({ sintomas: [{ id: "a", data: "2026-11-15", vomito: false }, { id: "b", data: SEG, vomito: true }] }).v("motivoComerPouco(hoje())"), null);
});
test("comer pouco: energia marcada abaixo de 800 kcal em 3 dias com registro, sem contar hoje", () => {
  const pouco = { "2026-11-13": diaCom(1), "2026-11-14": diaCom(1), "2026-11-15": diaCom(1) };   // uma refeicao por dia
  const a = abrir({ dias: pouco });
  assert.ok(a.j("consumoDoDia('2026-11-15').comida.kcal") < 800);
  assert.strictEqual(a.v("motivoComerPouco(hoje())"), "energia");
  assert.strictEqual(abrir({ dias: { "2026-11-14": diaCom(1), "2026-11-15": diaCom(1), [SEG]: diaCom(1) } }).v("motivoComerPouco(hoje())"), null, "hoje não conta: só 2 dias encerrados");
  assert.strictEqual(abrir({ dias: Object.assign({}, pouco, { "2026-11-14": diaCom(1, 5) }) }).v("motivoComerPouco(hoje())"), null, "um dia comendo o plano inteiro quebra a sequência");
  assert.strictEqual(abrir({ dias: { "2026-11-10": diaCom(1), "2026-11-12": diaCom(1), "2026-11-15": diaCom(1) } }).v("motivoComerPouco(hoje())"), "energia", "dias sem registro no meio são pulados");
  assert.strictEqual(abrir({ dias: { "2026-11-01": diaCom(1), "2026-11-02": diaCom(1), "2026-11-15": diaCom(1) } }).v("motivoComerPouco(hoje())"), null, "só olha os 7 dias anteriores");
  // no maximo uma vez por dia: Entendi esconde ate o dia seguinte
  assert.strictEqual(a.v("avisoComerPoucoHoje(hoje())"), "energia");
  a.v("AC.entendiPouco()");
  assert.strictEqual(a.j("E.ui.avisoPouco"), SEG);
  assert.strictEqual(a.v("avisoComerPoucoHoje(hoje())"), null);
  a.R.ir(TER + "T08:00:00");
  assert.strictEqual(a.v("avisoComerPoucoHoje(hoje())"), "energia", "volta no dia seguinte se o motivo continua");
  assert.ok(/Assunto para o médico/.test(a.v("telaHoje()")) && !/\bela\b/.test(a.v("cartaoComerPouco('energia') + cartaoComerPouco('vomito') + cartaoComerPouco('enjoo')")));
});

test("hipoglicemia: quando a tela Hoje chama o aviso", () => {
  const dm = { perfil: Object.assign({}, PERFIL, { diabetes: true, insulinaSulf: true }) };
  assert.strictEqual(abrir(dm).v("riscoHipoHoje(hoje(), 10)"), false, "de manhã, sem nada marcado, não");
  assert.strictEqual(abrir(dm).v("riscoHipoHoje(hoje(), 14)"), true, "das 14h em diante com menos de 2 refeições comidas");
  assert.strictEqual(abrir(Object.assign({ dias: { [SEG]: diaCom(1, 2) } }, dm)).v("riscoHipoHoje(hoje(), 15)"), false, "duas refeições comidas");
  assert.strictEqual(abrir(Object.assign({ dias: { [SEG]: diaCom(0.25) } }, dm)).v("riscoHipoHoje(hoje(), 9)"), true, "um pouco");
  assert.strictEqual(abrir(Object.assign({ dias: { [SEG]: diaCom(0) } }, dm)).v("riscoHipoHoje(hoje(), 9)"), true, "nada");
  assert.strictEqual(abrir(Object.assign({ dias: { [SEG]: { enjoo: true, comido: [] } } }, dm)).v("riscoHipoHoje(hoje(), 9)"), true, "dia de enjoo");
  assert.strictEqual(abrir({ dias: { [SEG]: diaCom(0) } }).v("riscoHipoHoje(hoje(), 20)"), false, "sem diabetes com insulina ou sulfonilureia, nunca");
  assert.strictEqual(abrir({ dias: { [SEG]: diaCom(0) }, perfil: Object.assign({}, PERFIL, { diabetes: true, insulinaSulf: false }) }).v("riscoHipoHoje(hoje(), 20)"), false);
  // a tela chama avisoHipoglicemia("hoje") nessa condicao
  const a = abrir(Object.assign({ dias: { [SEG]: diaCom(0) } }, dm));
  a.v("avisoHipoglicemia = onde => '<div id=\"hipo\">' + onde + '</div>'");
  assert.ok(a.v("telaHoje()").includes('<div id="hipo">hoje</div>'));
  const b = abrir({ dias: { [SEG]: diaCom(0) } });
  b.v("avisoHipoglicemia = onde => '<div id=\"hipo\">' + onde + '</div>'");
  assert.ok(!b.v("telaHoje()").includes("hipo"));
});

test("relatório: médias do que foi comido, nada, enjoo, água e micronutrientes abaixo de 80%", () => {
  const dias = { "2026-11-14": diaCom(1, 5), "2026-11-15": Object.assign(diaCom(0, 2), { agua: 1000 }), [SEG]: { enjoo: true, comido: [], comidoEnjoo: [], agua: 2000, protExtra: 0, caminhada: 0 } };
  const a = abrir({ dias });
  const s = a.j("resumoConsumo(mais(hoje(), -29), hoje())"), cheio = a.j("consumoDoDia('2026-11-14').total");
  assert.deepStrictEqual([s.dias, s.refeicoes, s.nada, s.enjoo, s.diasAgua, s.agua], [2, 7, 2, 1, 2, 1500]);
  perto(s.media.prot, cheio.prot / 2); perto(s.media.kcal, cheio.kcal / 2);
  const t = a.j("relAlimentacao(mais(hoje(), -29))").join("\n");
  assert.match(t, /estimativa a partir do que foi marcado/);
  assert.match(t, /Dias com registro do que foi comido: 2 de 30/);
  assert.ok(t.includes("Média de proteína: " + Math.round(cheio.prot / 2) + " g") && /Média de energia: [\d.]+ kcal/.test(t), t);
  assert.match(t, /Refeições marcadas como "nada": 2 de 7 registradas/);
  assert.match(t, /Água: média de 1,5 L em 2 dias com registro/);
  assert.match(t, /Dias de enjoo: 1/);
  assert.match(t, /Média do que foi comido abaixo de 80% da meta \(estimativa: só entra o que foi marcado, nos dias com registro\): .*Cálcio \d+%/);
  assert.match(t, /Cardápio planejado abaixo de 80% da meta/);
  assert.ok(!/\bela\b/.test(t), "sem terceira pessoa");
  assert.match(abrir().j("relAlimentacao(mais(hoje(), -29))").join("\n"), /Nenhum dia com registro do que foi comido\.\nÁgua: sem registro\. Dias de enjoo: 0\./);
});

test("relatório: dia só com proteína avulsa (ex.: enjoo ligado, nada marcado) entra na proteína, não vira dia de 0 kcal", () => {
  const dias = { "2026-11-14": diaCom(1, 5), [SEG]: { enjoo: true, comido: [], comidoEnjoo: [], agua: 0, protExtra: 20, caminhada: 0 } };
  const a = abrir({ dias }), s = a.j("resumoConsumo(mais(hoje(), -29), hoje())"), cheio = a.j("consumoDoDia('2026-11-14').total");
  assert.deepStrictEqual([s.dias, s.diasRef], [2, 1]);
  perto(s.media.prot, (cheio.prot + 20) / 2); perto(s.media.kcal, cheio.kcal); perto(s.media.ca, cheio.ca);
  const t = a.j("relAlimentacao(mais(hoje(), -29))").join("\n");
  assert.ok(t.includes("Média de energia: " + a.v("fmt(" + cheio.kcal + ")") + " kcal") && /em 1 dia com refeição marcada/.test(t), t);
  const so = abrir({ dias: { [SEG]: dias[SEG] } }).j("relAlimentacao(mais(hoje(), -29))").join("\n");
  assert.ok(/Média de proteína: 20 g/.test(so) && !/Média de energia/.test(so) && !/Média do que foi comido/.test(so), so);
});

test("perfil discreto: relatório e tela Hoje sem kcal", () => {
  const a = abrir({ dias: { "2026-11-15": diaCom(1, 5), [SEG]: diaCom(0.5, 3) }, perfil: Object.assign({}, PERFIL, { discreto: true }) });
  const t = a.j("relAlimentacao(mais(hoje(), -29))").join("\n"), tela = a.v("telaHoje()");
  assert.ok(!/kcal|energia/i.test(t), t);
  assert.match(t, /Média de proteína: \d+ g/);
  assert.ok(!/kcal|Energia/.test(tela), "tela sem kcal");
  assert.ok(/Proteína hoje/.test(tela) && /Água hoje/.test(tela));
  // Sem a chave, Hoje também fica sem calorias (vão para o Painel, usabilidade da onda 2); o relatório continua com a energia.
  const b = abrir({ dias: { "2026-11-15": diaCom(1, 5), [SEG]: diaCom(0.5, 3) } });
  assert.ok(!/kcal|energia|calorias/i.test(b.v("telaHoje()")), "sem a chave, Hoje sem calorias");
  assert.match(b.j("relAlimentacao(mais(hoje(), -29))").join("\n"), /Média de energia: [\d.]+ kcal/, "sem a chave, o relatório mostra a energia");
});
