// PIN e cifra dos dados (app/cifra.js). PINs e códigos aqui são inventados para o teste.
const test = require("node:test"), assert = require("node:assert");
const carregar = require("../carregar-app");
const CHAVE = "semana-a-semana.v1", GUARDA = "semana-a-semana.cifrado", TENT = "semana-a-semana.cifra.tentativas";
const PIN = "246810", OUTRO = "135791", ITER = 2000; // poucas iterações só para o teste ser rápido; no app, cifCalibrar() mede
const ESTADO = { v: 2, perfil: { nome: "Zuleica", sexo: "F", nascimento: 1980, altura: 160, peso: 110, atividade: 1.2 },
  doses: [{ id: "d1", data: "2026-11-02", mg: 2.5, local: "Coxa esquerda", obs: "primeira" }],
  pesos: [{ id: "p1", data: "2026-11-02", kg: 110.4, cintura: 118 }], sintomas: [{ id: "s1", data: "2026-11-03", enjoo: 2, nota: "enjoo de manhã" }],
  treinos: [], dias: { "2026-11-03": { enjoo: true, comido: [{ q: 1 }], agua: 1500, protExtra: 10, caminhada: 20 } }, ui: { planoNutri: false } };

// Relógio que o teste adianta: app.relogio.passar(ms)
function relogio() {
  let desvio = 0;
  class R extends Date { constructor(...a) { if (a.length === 0) super(Date.now() + desvio); else super(...a); } static now() { return Date.now() + desvio; } }
  R.passar = ms => { desvio += ms; };
  return R;
}
function abrir(estado, guardado) { const R = relogio(); const app = carregar(estado, { guardado: guardado || {}, Date: R }); app.relogio = R; return app; }
const codigo = app => app.v("cifNovoCodigo()");
const estadoDe = app => app.v("JSON.stringify(E)");
async function criar(app, cod) { await app.v("cifCriarProtecao(" + JSON.stringify(PIN) + ", " + JSON.stringify(cod) + ", " + ITER + ")"); }

test("código de recuperação: 4 grupos de 5, sem 0, O, 1 e I; aceita minúsculas e espaços", () => {
  const app = abrir();
  for (let i = 0; i < 50; i++) { const c = codigo(app); assert.match(c, /^[2-9A-HJ-NP-Z]{5}(-[2-9A-HJ-NP-Z]{5}){3}$/); }
  const c = codigo(app);
  assert.strictEqual(app.v("cifNormalizarCodigo(" + JSON.stringify(" " + c.toLowerCase().replace(/-/g, " ") + " ") + ")"), c.replace(/-/g, ""));
  assert.strictEqual(app.v("cifNormalizarCodigo('ABCDE-ABCDE-ABCDE-ABCD0')"), null);
  assert.strictEqual(app.v("cifNormalizarCodigo('ABCDE')"), null);
});

test("criar PIN com dados: cifra, confere e só então apaga o texto; nada legível fica guardado", async () => {
  const g = {}, app = abrir(ESTADO, g), antes = estadoDe(app), cod = codigo(app);
  await criar(app, cod);
  assert.ok(!(CHAVE in g), "texto puro apagado");
  const reg = JSON.parse(g[GUARDA]);
  assert.deepStrictEqual(Object.keys(reg).sort(), ["chaveEmbrulhadaPin", "chaveEmbrulhadaRec", "dadosCifrados", "iter", "iv", "sal", "salRec", "v"]);
  assert.strictEqual(reg.iter, ITER);
  const tudo = JSON.stringify(g);
  ["Zuleica", "enjoo de manhã", "110.4", PIN, cod, cod.replace(/-/g, "")].forEach(x => assert.ok(tudo.indexOf(x) < 0, "não aparece no armazenamento: " + x));
  assert.strictEqual(estadoDe(app), antes, "estado em memória igual ao de antes");
  // Abrir de novo (outra instância do app com o mesmo armazenamento): começa trancado e vazio; com o PIN, volta igual.
  const app2 = abrir(null, g);
  assert.strictEqual(app2.v("CIF_TRANCADO"), true);
  assert.strictEqual(app2.v("E.perfil"), null);
  assert.strictEqual(await app2.v("cifDesbloquear('" + PIN + "')"), "ok");
  assert.strictEqual(estadoDe(app2), antes, "migração sem perda: estado depois de decifrar igual ao de antes");
});

test("criar PIN sem dados", async () => {
  const g = {}, app = abrir(null, g);
  await criar(app, codigo(app));
  assert.ok(GUARDA in g && !(CHAVE in g));
  const app2 = abrir(null, g);
  assert.strictEqual(await app2.v("cifDesbloquear('" + PIN + "')"), "ok");
  assert.strictEqual(app2.v("E.perfil"), null);
  assert.strictEqual(app2.v("E.v"), 2);
});

test("se a gravação falhar na criação, o texto puro fica como estava", async () => {
  const g = { [CHAVE]: JSON.stringify(ESTADO) }, app = carregar(null, { guardado: g });
  const antes = g[CHAVE];
  app.v("localStorage.setItem = function () { throw new Error('sem espaço'); }");
  await assert.rejects(() => app.v("cifCriarProtecao('" + PIN + "', cifNovoCodigo(), " + ITER + ")"));
  assert.strictEqual(g[CHAVE], antes);
  assert.ok(!(GUARDA in g));
  assert.strictEqual(app.v("cifChave"), null);
});

test("desbloqueado, salvar() grava cifrado; bloqueado, não grava nada", async () => {
  const g = {}, app = abrir(ESTADO, g);
  await criar(app, codigo(app));
  const iv1 = JSON.parse(g[GUARDA]).iv;
  app.v("E.pesos.push({ id: 'p2', data: '2026-11-10', kg: 108.2 })");
  assert.strictEqual(app.v("salvar()"), true);
  await app.v("cifEsperarGravacoes()");
  assert.notStrictEqual(JSON.parse(g[GUARDA]).iv, iv1, "iv novo a cada gravação");
  assert.ok(!(CHAVE in g) && g[GUARDA].indexOf("108.2") < 0);
  // bloquear descarta chave e estado
  assert.strictEqual(app.v("cifBloquear()"), true);
  assert.strictEqual(app.v("cifChave"), null);
  assert.strictEqual(app.v("E.perfil"), null);
  const antes = g[GUARDA];
  assert.strictEqual(app.v("salvar()"), false);
  assert.strictEqual(g[GUARDA], antes);
  assert.ok(!(CHAVE in g));
  assert.strictEqual(await app.v("cifDesbloquear('" + PIN + "')"), "ok");
  assert.strictEqual(app.v("E.pesos.length"), 2);
});

test("PIN errado: atraso de 30 s, 1 min e 5 min a partir do 5º erro; nunca apaga", async () => {
  const g = {}, app = abrir(ESTADO, g);
  await criar(app, codigo(app)); app.v("cifBloquear()");
  const guardado = g[GUARDA];
  for (let i = 1; i <= 4; i++) assert.strictEqual(await app.v("cifDesbloquear('" + OUTRO + "')"), "errado", "erro " + i);
  assert.strictEqual(app.v("cifFaltaEsperar()"), 0);
  assert.strictEqual(await app.v("cifDesbloquear('" + OUTRO + "')"), "espera", "5º erro");
  assert.strictEqual(app.v("cifFaltaEsperar()"), 30);
  assert.strictEqual(await app.v("cifDesbloquear('" + PIN + "')"), "espera", "durante a espera nem o PIN certo é conferido");
  app.relogio.passar(31000);
  assert.strictEqual(await app.v("cifDesbloquear('" + OUTRO + "')"), "espera"); assert.strictEqual(app.v("cifFaltaEsperar()"), 60);
  app.relogio.passar(61000);
  assert.strictEqual(await app.v("cifDesbloquear('" + OUTRO + "')"), "espera"); assert.strictEqual(app.v("cifFaltaEsperar()"), 300);
  app.relogio.passar(301000);
  assert.strictEqual(await app.v("cifDesbloquear('" + OUTRO + "')"), "espera"); assert.strictEqual(app.v("cifFaltaEsperar()"), 300);
  // a contagem sobrevive a fechar o app
  const app2 = abrir(null, g); app2.relogio.passar(393000 + 10000); // o mesmo instante do app anterior, mais 10 s
  assert.ok(app2.v("cifFaltaEsperar()") > 0);
  app2.relogio.passar(300000);
  assert.strictEqual(g[GUARDA], guardado, "nada apagado nem regravado");
  assert.strictEqual(await app2.v("cifDesbloquear('" + PIN + "')"), "ok");
  assert.ok(!(TENT in g), "acerto zera a contagem");
});

test("esqueci o PIN: código de recuperação abre e cria PIN novo; o código continua valendo", async () => {
  const g = {}, app = abrir(ESTADO, g), antes = estadoDe(app), cod = codigo(app);
  await criar(app, cod); app.v("cifBloquear()");
  assert.strictEqual(await app.v("cifRecuperar('" + codigo(app) + "')"), "errado");
  assert.strictEqual(await app.v("cifRecuperar(" + JSON.stringify(cod.toLowerCase().replace(/-/g, " ")) + ")"), "ok");
  assert.strictEqual(await app.v("cifPinNovoDepoisDeRecuperar('" + OUTRO + "')"), "ok");
  assert.strictEqual(estadoDe(app), antes);
  const app2 = abrir(null, g);
  assert.strictEqual(await app2.v("cifDesbloquear('" + PIN + "')"), "errado", "PIN antigo não vale mais");
  assert.strictEqual(await app2.v("cifDesbloquear('" + OUTRO + "')"), "ok");
  assert.strictEqual(estadoDe(app2), antes);
  app2.v("cifBloquear()");
  assert.strictEqual(await app2.v("cifRecuperar('" + cod + "')"), "ok");
});

test("trocar PIN pede o atual; depois só o novo abre", async () => {
  const g = {}, app = abrir(ESTADO, g), antes = estadoDe(app), cod = codigo(app);
  await criar(app, cod);
  assert.strictEqual(await app.v("cifTrocarPin('" + OUTRO + "', '111222')"), "errado");
  assert.strictEqual(await app.v("cifTrocarPin('" + PIN + "', '" + OUTRO + "')"), "ok");
  assert.strictEqual(estadoDe(app), antes, "continua desbloqueado com os mesmos dados");
  const app2 = abrir(null, g);
  assert.strictEqual(await app2.v("cifDesbloquear('" + PIN + "')"), "errado");
  assert.strictEqual(await app2.v("cifDesbloquear('" + OUTRO + "')"), "ok");
  app2.v("cifBloquear()");
  assert.strictEqual(await app2.v("cifRecuperar('" + cod + "')"), "ok", "código de recuperação segue valendo");
});

test("dados danificados: avisa e não apaga nem grava por cima", async () => {
  const g = {}, app = abrir(ESTADO, g);
  await criar(app, codigo(app));
  const reg = JSON.parse(g[GUARDA]);
  // texto cifrado alterado: o PIN abre a chave, mas a conferência do AES-GCM recusa os dados
  const d = reg.dadosCifrados, troca = d[5] === "A" ? "B" : "A";
  g[GUARDA] = JSON.stringify(Object.assign({}, reg, { dadosCifrados: d.slice(0, 5) + troca + d.slice(6) }));
  const ruim = g[GUARDA], app2 = abrir(null, g);
  assert.strictEqual(await app2.v("cifDesbloquear('" + PIN + "')"), "danificado");
  assert.strictEqual(app2.v("CIF_TRANCADO"), true);
  assert.strictEqual(app2.v("salvar()"), false);
  assert.strictEqual(g[GUARDA], ruim);
  // registro ilegível
  g[GUARDA] = "{ isto não é json";
  const app3 = abrir(null, g);
  assert.strictEqual(await app3.v("cifDesbloquear('" + PIN + "')"), "danificado");
  assert.strictEqual(app3.v("cifLerGuardado()"), null);
  assert.strictEqual(g[GUARDA], "{ isto não é json");
  assert.ok(!(TENT in g), "dado danificado não conta como PIN errado");
  // começar do zero guarda à parte, sem apagar
  app3.v("cifGuardarAParte()");
  const aParte = Object.keys(g).filter(k => k.indexOf(GUARDA + ".guardado.") === 0);
  assert.strictEqual(aParte.length, 1); assert.strictEqual(g[aParte[0]], "{ isto não é json");
  assert.ok(!(GUARDA in g)); assert.strictEqual(app3.v("CIF_TRANCADO"), false);
});

test("migração interrompida: sobra de texto puro igual aos dados é apagada ao desbloquear", async () => {
  const g = {}, app = abrir(ESTADO, g), texto = g[CHAVE];
  await criar(app, codigo(app));
  g[CHAVE] = texto; // como se o app tivesse fechado entre gravar o cifrado e apagar o texto
  const app2 = abrir(null, g);
  assert.strictEqual(app2.v("CIF_TRANCADO"), true, "com os dois guardados, vale o cifrado");
  assert.strictEqual(await app2.v("cifDesbloquear('" + PIN + "')"), "ok");
  assert.ok(!(CHAVE in g));
});

test("restaurar uma exportação cifra de novo com a chave atual", async () => {
  const g = {}, app = abrir(null, g);
  await criar(app, codigo(app));
  const exportado = JSON.stringify(ESTADO);
  app.v("E = migrar(JSON.parse(" + JSON.stringify(exportado) + ")); salvar()");
  await app.v("cifEsperarGravacoes()");
  assert.ok(!(CHAVE in g) && g[GUARDA].indexOf("Zuleica") < 0);
  const app2 = abrir(null, g);
  assert.strictEqual(await app2.v("cifDesbloquear('" + PIN + "')"), "ok");
  assert.strictEqual(app2.v("E.perfil.nome"), "Zuleica");
});

test("calibração fica entre o piso e o teto", async () => {
  const app = abrir();
  const it = await app.v("cifCalibrar()");
  assert.ok(it >= 600000 && it <= 10000000 && it % 10000 === 0, String(it));
});
