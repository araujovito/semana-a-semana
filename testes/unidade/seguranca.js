// Lembrete de cópia: quando aparece e quando não.
const test = require("node:test"), assert = require("node:assert");
const carregar = require("../carregar-app");
const perfil = { nome: "", sexo: "F", nascimento: 1990, altura: 163, peso: 95, atividade: 1.2 };
const sit = (estado, h) => JSON.parse(carregar(Object.assign({ v: 2, perfil }, estado)).v("JSON.stringify(segSituacaoCopia('" + h + "'))"));

test("sem registro nenhum, ou sem perfil, não há lembrete", () => {
  assert.strictEqual(sit({}, "2026-11-20").mostrar, false);
  assert.strictEqual(sit({ perfil: null, pesos: [{ id: "p", data: "2026-01-01", kg: 90 }] }, "2026-11-20").mostrar, false);
});
test("nunca exportou: conta a partir do registro mais antigo, só depois de 14 dias", () => {
  const pesos = [{ id: "p", data: "2026-11-06", kg: 90 }];
  assert.strictEqual(sit({ pesos }, "2026-11-20").mostrar, false);
  assert.deepStrictEqual(sit({ pesos }, "2026-11-21"), { mostrar: true, dias: null });
  assert.strictEqual(sit({ dias: { "2026-11-01": { comido: [] } } }, "2026-11-20").mostrar, true);
});
test("última exportação há mais de 14 dias mostra; adiar conta de novo a partir do adiamento", () => {
  const doses = [{ id: "a", data: "2026-01-01", mg: 2.5 }];
  assert.deepStrictEqual(sit({ doses, ui: { ultimaExportacao: "2026-11-05" } }, "2026-11-20"), { mostrar: true, dias: 15 });
  assert.strictEqual(sit({ doses, ui: { ultimaExportacao: "2026-11-06" } }, "2026-11-20").mostrar, false);
  assert.strictEqual(sit({ doses, ui: { ultimaExportacao: "2026-10-01", lembreteCopia: "2026-11-19" } }, "2026-11-20").mostrar, false);
  assert.strictEqual(sit({ doses, ui: { ultimaExportacao: "lixo" } }, "2026-11-20").mostrar, true);
});

// Cópia verificada. Em Node o app não tem WebCrypto: aqui roda o SHA-256 em JavaScript puro, comparado com o do Node.
const crypto = require("crypto");
test("SHA-256 em JavaScript puro bate com o do Node (texto vazio, acentos, emoji, textos longos)", () => {
  const a = carregar({ v: 2, perfil });
  for (const t of ["", "abc", "Proteína, vesícula e fígado: ção", "🍽 💪 ☀", "x".repeat(55), "y".repeat(56), "z".repeat(64), JSON.stringify({ k: "á".repeat(5000) })]) {
    assert.strictEqual(a.v("segSha256Js(" + JSON.stringify(t) + ")"), crypto.createHash("sha256").update(t, "utf8").digest("hex"), "texto de " + t.length + " caracteres");
  }
});
test("cópia montada volta igual; cópia alterada ou cortada é recusada; cópia antiga sem código é aceita como não conferida", async () => {
  const estado = { v: 2, perfil: Object.assign({ vesicula: true }, perfil), pesos: [{ id: "p", data: "2026-11-01", kg: 118.4 }] };
  const a = carregar(estado);
  const texto = await a.v("segMontarCopia(E)");
  const j = JSON.parse(texto);
  assert.strictEqual(j.formato, "semana-a-semana/copia"); assert.strictEqual(j.versao, 1);
  assert.strictEqual(j.sha256, crypto.createHash("sha256").update(JSON.stringify(j.dados), "utf8").digest("hex"));
  const ler = t => a.v("segLerCopia(" + JSON.stringify(t) + ")");
  const ok = await ler(texto);
  assert.strictEqual(ok.conferida, true); assert.strictEqual(JSON.stringify(ok.estado), a.v("JSON.stringify(E)"));
  assert.ok(/não confere/.test((await ler(texto.replace("118.4", "98.4"))).erro), "valor editado à mão");
  assert.ok(/Texto inválido/.test((await ler(texto.slice(0, -40))).erro), "texto cortado");
  assert.ok(/versão mais nova/.test((await ler(texto.replace('"versao":1', '"versao":2'))).erro));
  const antiga = await ler(JSON.stringify(estado));
  assert.strictEqual(antiga.conferida, false); assert.strictEqual(antiga.estado.pesos[0].kg, 118.4);
  // Espaços e quebras de linha fora dos textos (um app de mensagens pode mexer nisso) não mudam o código.
  assert.strictEqual((await ler(JSON.stringify(JSON.parse(texto), null, 2))).conferida, true);
});
