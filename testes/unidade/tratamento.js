// Aplicacoes: proxima aplicacao, dia habitual, semanas na dose, datas e saltos de dose. Relogio fixo: hoje = sexta, 20/11/2026.
const test = require("node:test"), assert = require("node:assert");
const carregar = require("../carregar-app");
const PERFIL = { nome: "A", sexo: "F", nascimento: 1990, altura: 163, peso: 95.4, atividade: 1.2, diabetes: null, insulinaSulf: null, pilula: null, naoCome: [], naoGosta: [] };
const base = extra => Object.assign({ v: 2, perfil: PERFIL, doses: [], pesos: [], sintomas: [], treinos: [], dias: {}, trocas: {}, caneta: null, suplementos: [], exames: [], lembretes: {}, ui: {} }, extra || {});
// Relogio falso: "agora" e sempre o meio-dia da data dada.
function relogio(dataIso) {
  const p = dataIso.split("-").map(Number), fixo = new Date(p[0], p[1] - 1, p[2], 12).getTime();
  return class RelogioFalso extends Date { constructor(...a) { if (a.length) super(...a); else super(fixo); } static now() { return fixo; } };
}
const em = (dataIso, estado) => carregar(estado, { Date: relogio(dataIso) });
const HOJE = "2026-11-20";
let n = 0;
const dose = (data, mg, local) => ({ id: "d" + (++n), data, mg: mg || 2.5, local: local || "Coxa esquerda", obs: "" });
const puro = carregar(base());
const sit = (doses, h, diaDose) => JSON.parse(puro.v("JSON.stringify(situacaoDoseEm(" + JSON.stringify(doses) + ", " + JSON.stringify(diaDose === undefined ? null : diaDose) + ", " + JSON.stringify(h || HOJE) + "))"));
const cartao = (doses, extra) => em(HOJE, base(Object.assign({ doses }, extra || {}))).v("cartaoTratamentoHoje()").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

test("o relógio falso funciona: hoje() é 20/11/2026, uma sexta", () => {
  const a = em(HOJE, base());
  assert.strictEqual(a.v("hoje()"), HOJE);
  assert.strictEqual(a.v("diaSemana(hoje())"), 4);
});

test("sem aplicação: não há situação e o cartão convida a registrar, falando com ela", () => {
  assert.strictEqual(sit([]), null);
  assert.match(cartao([]), /Quando você fizer a primeira aplicação, registre aqui/);
});
test("primeira aplicação: o dia habitual é o dia dela e a próxima é 7 dias depois", () => {
  const s = sit([dose(HOJE)]);
  assert.deepStrictEqual([s.estado, s.habitual, s.prox, s.falta, s.semana, s.semanaNaDose], ["emDia", 4, "2026-11-27", 7, 1, 1]);
  assert.match(cartao([dose(HOJE)]), /Próxima aplicação: em 7 dias \(Sex, 27\/11\)/);
});
test("em dia: habitual segunda, aplicou nas três segundas", () => {
  const s = sit([dose("2026-11-02"), dose("2026-11-09"), dose("2026-11-16")]);
  assert.deepStrictEqual([s.estado, s.habitual, s.prox, s.falta], ["emDia", 0, "2026-11-23", 3]);
});
test("o dia previsto é hoje (auditoria: última em 06/11, o app não dizia 'hoje')", () => {
  const s = sit([dose("2026-11-06"), dose("2026-11-13")]);
  assert.deepStrictEqual([s.estado, s.prox, s.falta], ["hoje", HOJE, 0]);
  const pulouUma = sit([dose("2026-11-06")]);   // 14 dias sem registro: ainda não passou de 2 semanas
  assert.deepStrictEqual([pulouUma.estado, pulouUma.prox, pulouUma.diasSemRegistro], ["hoje", HOJE, 14]);
  assert.match(cartao([dose("2026-11-06")]), /Próxima aplicação: hoje/);
});
test("atrasada 1 dia em relação à PREVISTA: pode aplicar", () => {
  const ds = [dose("2026-11-05"), dose("2026-11-12")];   // quintas; a de 19/11 está 1 dia atrasada
  const s = sit(ds);
  assert.deepStrictEqual([s.estado, s.prevista, s.atraso, s.seguinte], ["atrasada", "2026-11-19", 1, "2026-11-26"]);
  assert.match(cartao(ds), /estava prevista para Qui, 19\/11, há 1 dia\. Até 4 dias depois do dia previsto, a orientação da bula é aplicar assim que lembrar e seguir o dia habitual na semana seguinte \(Qui, 26\/11\)\./);
});
test("atrasada 4 dias: ainda pode aplicar", () => {
  const s = sit([dose("2026-11-02"), dose("2026-11-09")]);   // segundas; a de 16/11 está com 4 dias
  assert.deepStrictEqual([s.estado, s.prevista, s.atraso, s.seguinte], ["atrasada", "2026-11-16", 4, "2026-11-23"]);
});
test("atrasada 5 e 6 dias: pular e aplicar no próximo dia habitual, com a data", () => {
  const dom = [dose("2026-11-01"), dose("2026-11-08")];      // domingos; a de 15/11 está com 5 dias
  const s = sit(dom);
  assert.deepStrictEqual([s.estado, s.prevista, s.atraso, s.prox], ["pular", "2026-11-15", 5, "2026-11-22"]);
  assert.match(cartao(dom), /Próxima aplicação: Dom, 22\/11\. A que estava prevista para Dom, 15\/11 passou de 4 dias: a orientação da bula é pular essa dose e aplicar a próxima no dia habitual\. Não aplicar duas doses para compensar\./);
  const sab = sit([dose("2026-10-31"), dose("2026-11-07")]); // sábados; a de 14/11 está com 6 dias
  assert.deepStrictEqual([sab.estado, sab.atraso, sab.prox], ["pular", 6, "2026-11-21"]);
});
test("o atraso nunca é contado de 'última + 7': de um dia para o outro, pular vira 'hoje' e depois atrasada 1", () => {
  const ds = [dose("2026-11-07"), dose("2026-11-14")];        // sábados
  assert.deepStrictEqual(["2026-11-21", "2026-11-22", "2026-11-25", "2026-11-26", "2026-11-27", "2026-11-28"].map(h => sit(ds, h).estado), ["hoje", "atrasada", "atrasada", "pular", "pular", "hoje"]);
  assert.strictEqual(sit(ds, "2026-11-29").estado, "medico", "15 dias sem registro");
});
test("aplicou atrasada 3 dias: a próxima continua no dia habitual", () => {
  const ds = [dose("2026-11-02"), dose("2026-11-09"), dose("2026-11-19")];   // habitual segunda; aplicou quinta
  const s = sit(ds);
  assert.deepStrictEqual([s.estado, s.habitual, s.prox, s.falta], ["emDia", 0, "2026-11-23", 3]);
  assert.match(cartao(ds), /Próxima aplicação: em 3 dias \(Seg, 23\/11\)/);
});
test("aplicou atrasada 4 dias: a próxima no dia habitual fica a 3 dias (72 horas), nunca menos", () => {
  const s = sit([dose("2026-11-09"), dose("2026-11-20")], "2026-11-20");      // habitual segunda; aplicou sexta
  assert.deepStrictEqual([s.estado, s.prox, s.falta], ["emDia", "2026-11-23", 3]);
  // qualquer dia em que ela aplique, a próxima prevista fica de 3 a 9 dias depois
  for (let hab = 0; hab < 7; hab++) for (let i = 0; i < 7; i++) {
    const data = puro.v("mais('2026-11-16', " + i + ")"), dif = puro.v("entre('" + data + "', mais(previstaDe('" + data + "', " + hab + "), 7))");
    assert.ok(dif >= 3 && dif <= 9, "habitual " + hab + ", aplicou " + data + ": " + dif + " dias");
  }
});
test("15 dias sem registro: nenhuma instrução de dose, só falar com o médico", () => {
  const ds = [dose("2026-11-05")];
  const s = sit(ds);
  assert.deepStrictEqual([s.estado, s.diasSemRegistro, s.prox, s.falta], ["medico", 15, null, null]);
  const t = cartao(ds);
  assert.match(t, /A última aplicação registrada foi em 05\/11\/2026, há 15 dias\. Depois de várias semanas sem aplicar, fale com o médico antes de retomar: pode ser preciso recomeçar numa dose menor\./);
  assert.doesNotMatch(t, /mg|Próxima aplicação|Local sugerido|pular|4 semanas/);
});
test("4 meses sem registro, dose de 10 mg: nada de dose nem de data (auditoria: mandava aplicar 10 mg amanhã)", () => {
  const ds = [dose("2026-08-08", 10), dose("2026-08-15", 10)];
  assert.strictEqual(sit(ds).estado, "medico");
  const t = cartao(ds);
  assert.match(t, /há 97 dias\. Depois de várias semanas sem aplicar, fale com o médico antes de retomar/);
  assert.doesNotMatch(t, /mg|Próxima aplicação|21\/11|Local sugerido/);
  assert.match(em(HOJE, base({ doses: ds })).v("relTratamento('2026-10-22').join('\\n')"), /Última aplicação registrada há 97 dias\./);
});
test("aplicações fora de ordem dão o mesmo resultado", () => {
  const ds = [dose("2026-11-02"), dose("2026-11-09"), dose("2026-11-19")];
  assert.deepStrictEqual(sit([ds[2], ds[0], ds[1]]), sit(ds));
  assert.deepStrictEqual(sit([ds[1], ds[2], ds[0]]), sit(ds));
});
test("duas aplicações no mesmo dia não mudam a conta da próxima", () => {
  const s = sit([dose("2026-11-09"), dose("2026-11-16"), dose("2026-11-16")]);
  assert.deepStrictEqual([s.estado, s.prox, s.total, s.semana], ["emDia", "2026-11-23", 3, 2]);
});
test("mudança de dia habitual: só muda quando ela informa, e a próxima respeita as 72 horas", () => {
  const ds = [dose("2026-11-02"), dose("2026-11-09"), dose("2026-11-16")];   // segundas
  assert.strictEqual(sit(ds).habitual, 0);
  const qua = sit(ds, HOJE, 2);       // mudou para quarta
  assert.deepStrictEqual([qua.habitual, qua.estado, qua.prox], [2, "emDia", "2026-11-25"]);
  const qui = sit(ds, "2026-11-17", 3);  // mudou para quinta, na terça: a próxima é quinta 19/11, 3 dias depois da última
  assert.deepStrictEqual([qui.habitual, qui.estado, qui.prox, qui.falta], [3, "emDia", "2026-11-19", 2]);
  const dom = sit(ds, HOJE, 6);
  assert.deepStrictEqual([dom.estado, dom.prox], ["emDia", "2026-11-22"]);
  // pelo estado guardado (E.diaDose) e pelo campo da tela
  const a = em(HOJE, base({ doses: ds, diaDose: 2 }));
  assert.strictEqual(a.v("situacaoDose().prox"), "2026-11-25");
  a.v("MUD.diaDose({ value: '0' })");
  assert.strictEqual(a.v("E.diaDose"), 0);
  assert.strictEqual(a.v("situacaoDose().prox"), "2026-11-23");
  assert.strictEqual(JSON.parse(a.guardado["semana-a-semana.v1"]).diaDose, 0, "o dia habitual é gravado");
  a.v("MUD.diaDose({ value: '9' })");
  assert.strictEqual(a.v("E.diaDose"), 0, "valor fora de 0 a 6 é ignorado");
  // valor estranho no dado guardado cai no dia da primeira aplicação
  for (const ruim of [7, -1, 2.5, "2", null]) assert.strictEqual(sit(ds, HOJE, ruim).habitual, 0, String(ruim));
});
test("semanas nesta dose: semanas de calendário, mesmo com um registro faltando no meio", () => {
  const ds = [dose("2026-10-23"), dose("2026-10-30"), /* 06/11 sem registro */ dose("2026-11-13")];
  const s = sit(ds);
  assert.deepStrictEqual([s.semanaNaDose, s.naDose, s.inicioNaDose], [5, 3, "2026-10-23"]);
  assert.match(cartao(ds), /Nesta dose 5ª semana/);
  assert.match(cartao(ds), /Já são 4 semanas nesta dose: subir ou manter é assunto para a consulta\./);
});
test("semanas nesta dose: quatro registros em 10 dias não viram '4 semanas' (auditoria)", () => {
  const ds = [dose("2026-11-08"), dose("2026-11-11"), dose("2026-11-14"), dose("2026-11-17")];
  assert.strictEqual(sit(ds).semanaNaDose, 2);
  assert.doesNotMatch(cartao(ds), /4 semanas nesta dose/);
});
test("semanas nesta dose: conta desde a primeira aplicação da sequência atual; a frase aparece na 4ª semana e não em 15 mg", () => {
  const ds = [dose("2026-10-02", 2.5), dose("2026-10-09", 2.5), dose("2026-10-16", 2.5), dose("2026-10-23", 2.5), dose("2026-10-30", 5), dose("2026-11-06", 5), dose("2026-11-13", 5)];
  assert.deepStrictEqual([sit(ds).semanaNaDose, sit(ds).naDose, sit(ds).semana], [4, 3, 8]);
  assert.deepStrictEqual(["2026-11-19", "2026-11-20"].map(h => sit(ds.slice(0, 6).concat([dose("2026-11-13", 5)]), h).semanaNaDose), [3, 4]);
  // desceu e voltou a subir: a sequência atual começa na volta
  const volta = [dose("2026-10-23", 5), dose("2026-10-30", 2.5), dose("2026-11-06", 5), dose("2026-11-13", 5)];
  assert.deepStrictEqual([sit(volta).semanaNaDose, sit(volta).inicioNaDose], [3, "2026-11-06"]);
  const max = [dose("2026-10-23", 15), dose("2026-10-30", 15), dose("2026-11-06", 15), dose("2026-11-13", 15), dose("2026-11-20", 15)];
  assert.doesNotMatch(cartao(max), /subir ou manter/);
});
test("data no futuro (vinda de restauração) e data ilegível não entram na conta (auditoria: 'Semana -4', 'Semana 5218')", () => {
  assert.strictEqual(sit([dose("2026-12-25", 5)]), null);
  const s = sit([dose("2026-11-13"), dose("2026-12-25", 5), { id: "x", data: "ontem", mg: 5, local: "x" }, { id: "y", data: "2026-02-31", mg: 5, local: "x" }]);
  assert.deepStrictEqual([s.semana, s.total, s.ult.data, s.estado], [2, 1, "2026-11-13", "hoje"]);
});
test("data da aplicação: aceita de 1 ano atrás até hoje, com mensagem clara", () => {
  const erro = d => puro.v("erroDataDose(" + JSON.stringify(d) + ", '" + HOJE + "')");
  for (const boa of [HOJE, "2026-11-19", "2025-11-20", "2026-01-01"]) assert.strictEqual(erro(boa), "", boa);
  assert.strictEqual(erro(""), "Escolha a data da aplicação.");
  for (const ruim of ["2026-11-21", "2027-01-05", "2025-11-19", "2025-11-13", "0026-11-20", "20/11/2026", "2026-02-30"])
    assert.strictEqual(erro(ruim), "Confira a data, inclusive o ano: o app aceita aplicações de 20/11/2025 até hoje.", ruim);
  const a = em(HOJE, base({ doses: [dose("2026-11-13")] }));
  for (const ruim of ["", "0026-11-20", "2025-11-13", "2027-01-05"]) a.v("FORM.dose({ data: '" + ruim + "', mg: '2.5', local: 'Coxa direita', obs: '' })");
  assert.strictEqual(a.v("E.doses.length"), 1, "nenhuma data ruim foi gravada");
  assert.strictEqual(a.avisos.length, 4);
  assert.strictEqual(a.avisos[0], "Escolha a data da aplicação.");
});
test("salto de mais de um degrau pede confirmação; subir um degrau, manter e reduzir não pedem", () => {
  const salto = (doses, data, mg) => puro.v("saltoDeDose(" + JSON.stringify(doses) + ", '" + data + "', " + mg + ")");
  const ds = [dose("2026-11-06", 2.5), dose("2026-11-13", 5)];
  assert.strictEqual(salto(ds, HOJE, 5), false);
  assert.strictEqual(salto(ds, HOJE, 7.5), false);
  assert.strictEqual(salto(ds, HOJE, 10), true);
  assert.strictEqual(salto(ds, HOJE, 15), true);
  assert.strictEqual(salto(ds, HOJE, 2.5), false, "redução");
  assert.strictEqual(salto([dose("2026-11-13", 15)], HOJE, 2.5), false, "redução grande");
  assert.strictEqual(salto([], HOJE, 15), false, "primeira aplicação");
  assert.strictEqual(salto(ds, "2026-11-08", 7.5), true, "compara com a aplicação anterior àquela data (2,5), não com a última");
  const a = em(HOJE, base({ doses: [dose("2026-11-13", 2.5)] }));
  a.v("var perguntas = [], resposta = false; confirmar = (t, aoSim) => { perguntas.push(t); if (resposta) aoSim(); }");
  a.v("FORM.dose({ data: '2026-11-20', mg: '10', local: 'Coxa direita', obs: '' })");
  assert.strictEqual(a.v("perguntas.length"), 1);
  assert.strictEqual(a.v("perguntas[0]"), "A aplicação anterior foi de 2,5 mg e esta é de 10,0 mg. As doses costumam subir de 2,5 em 2,5 mg. Salvar 10,0 mg mesmo assim?");
  assert.strictEqual(a.v("E.doses.length"), 1, "respondeu não: não grava");
  a.v("resposta = true; FORM.dose({ data: '2026-11-20', mg: '10', local: 'Coxa direita', obs: '' })");
  assert.strictEqual(a.v("E.doses.length"), 2, "respondeu sim: grava");
  a.v("FORM.dose({ data: '2026-11-20', mg: '5', local: 'Coxa direita', obs: '' })");
  assert.strictEqual(a.v("perguntas.length"), 3, "mesmo dia: pergunta das 72 horas, e nenhuma de salto");
  assert.match(a.v("perguntas[2]"), /72 horas/);
});
test("relatório: plural certo e semanas na dose por calendário", () => {
  const um = em(HOJE, base({ doses: [dose("2026-11-20")] })).v("relTratamento('2026-10-22').join('\\n')");
  assert.match(um, /Semana 1, 1 aplicação no total\. Dose atual: 2,5 mg \(1ª semana nesta dose, 1 aplicação\)\. Dia habitual: sexta-feira\./);
  const tres = em(HOJE, base({ doses: [dose("2026-10-23"), dose("2026-10-30"), dose("2026-11-13")] })).v("relTratamento('2026-10-22').join('\\n')");
  assert.match(tres, /Semana 5, 3 aplicações no total\. Dose atual: 2,5 mg \(5ª semana nesta dose, 3 aplicações\)\. Dia habitual: sexta-feira\./);
});
test("auditoria 2: a data prometida depois de pular não vira 'fale com o médico' no próprio dia", () => {
  const ds = [dose("2026-11-09"), dose("2026-11-15")];   // habitual segunda (primeira aplicação), a última num domingo
  const antes = sit(ds, "2026-11-28"), dia = sit(ds, "2026-11-30");
  assert.strictEqual(antes.estado, "pular"); assert.strictEqual(antes.prox, "2026-11-30");
  assert.strictEqual(dia.estado, "hoje");
  assert.strictEqual(sit(ds, "2026-12-01").estado, "medico", "passada também a segunda prevista, só o médico");
});
test("auditoria 2, resíduo 3: o dia habitual fica gravado e não muda com aplicação mais antiga nem ao apagar a primeira", () => {
  // quem já tinha aplicações e nada gravado recebe, ao abrir, o dia da primeira aplicação atual (migração)
  const seg = [dose("2026-11-02"), dose("2026-11-09"), dose("2026-11-16")];
  const a = em(HOJE, base({ doses: seg, diaDose: null }));
  assert.strictEqual(a.v("E.diaDose"), 0);
  assert.strictEqual(JSON.parse(a.guardado["semana-a-semana.v1"]).diaDose, 0, "a migração é gravada");
  // registra uma aplicação antiga, numa quarta: o dia habitual continua segunda e a próxima continua 23/11
  a.v("FORM.dose({ data: '2026-10-28', mg: '2.5', local: 'Coxa direita', obs: '' })");
  assert.deepStrictEqual([a.v("E.doses.length"), a.v("E.diaDose"), a.v("situacaoDose().habitual"), a.v("situacaoDose().prox")], [4, 0, 0, "2026-11-23"]);
  // apaga a primeira (a de quarta) e depois a de 02/11: nada muda
  a.v("E.doses = E.doses.filter(d => d.data !== '2026-10-28' && d.data !== '2026-11-02')");
  assert.deepStrictEqual([a.v("situacaoDose().habitual"), a.v("situacaoDose().prox")], [0, "2026-11-23"]);
  // só "Mudei o dia da aplicação" muda
  a.v("MUD.diaDose({ value: '2' })");
  assert.strictEqual(a.v("situacaoDose().prox"), "2026-11-25");
  // cópia restaurada com aplicações e sem dia gravado: a primeira conta acerta o dia e grava
  const r = em(HOJE, base());
  r.v("E = migrar(" + JSON.stringify(base({ doses: [dose("2026-11-05"), dose("2026-11-12")] })) + ")");
  assert.strictEqual(r.v("E.diaDose"), null);
  assert.strictEqual(r.v("situacaoDose().habitual"), 3);
  assert.strictEqual(JSON.parse(r.guardado["semana-a-semana.v1"]).diaDose, 3);
  // sem aplicação: nada é gravado
  assert.strictEqual(em(HOJE, base()).v("E.diaDose"), null);
});
test("primeira aplicação grava o dia habitual e diz qual ficou", () => {
  const a = em(HOJE, base());
  a.v("FORM.dose({ data: '2026-11-19', mg: '2.5', local: 'Coxa direita', obs: '' })");
  assert.strictEqual(a.v("E.diaDose"), 3);
  assert.strictEqual(a.avisos[a.avisos.length - 1], "Aplicação registrada. Dia habitual: quinta-feira. Se não for o seu dia, mude em “Mudei o dia da aplicação”.");
  a.v("FORM.dose({ data: '2026-11-12', mg: '2.5', local: 'Coxa direita', obs: '' })");
  assert.strictEqual(a.v("E.diaDose"), 3);
  assert.strictEqual(a.avisos[a.avisos.length - 1], "Aplicação registrada.", "a partir da segunda, o aviso é o curto");
});
