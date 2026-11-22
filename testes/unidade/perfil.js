// Perfil: o peso no começo do tratamento só muda de propósito (auditoria 1, achado 12). Pesos de teste, não os da usuária.
const test = require("node:test"), assert = require("node:assert");
const carregar = require("../carregar-app");
const PERFIL = { nome: "T", sexo: "F", nascimento: 1980, altura: 160, peso: 100, atividade: 1.2, figado: true, vesicula: true, aguardaCirurgia: true, naoCome: [], naoGosta: [] };
const estado = () => ({ v: 2, perfil: Object.assign({}, PERFIL), pesos: [{ id: "p1", data: "2026-11-01", kg: 96 }] });
// Formulário do Perfil como chega de FORM: inclui um "peso" para simular o campo antigo (ou dado digitado por engano).
const form = extra => "FORM.perfil(" + JSON.stringify(Object.assign({ nome: "Outro", sexo: "F", nascimento: "1982", altura: "158", peso: "90", atividade: "1.375", gestante: "nao", diabetes: "nao", pilula: "sim", vesicula: "sim", aguardaCirurgia: "sim", figado: "sim", metaKcal: "", metaProt: "", metaAgua: "" }, extra || {})) + ")";
const marcos = a => a.v("JSON.stringify(progressoPerda(E.perfil.peso, metas().peso))");

test("editar outros campos do Perfil não muda o peso inicial nem os marcos de 5, 7 e 10%", () => {
  const a = carregar(estado()), antes = marcos(a);
  assert.match(antes, /"alvo5":95,/);
  a.v(form());
  a.v(form({ altura: "170", atividade: "1.55", figado: "nao", discreto: "on" }));
  assert.strictEqual(a.v("E.perfil.peso"), 100, "o peso do formulário é ignorado depois do primeiro preenchimento");
  assert.strictEqual(a.v("E.perfil.altura"), 170, "os outros campos são gravados");
  assert.strictEqual(marcos(a), antes);
  assert.strictEqual(JSON.parse(a.guardado["semana-a-semana.v1"]).perfil.peso, 100);
});
test("o formulário do Perfil já preenchido não tem campo de peso; o peso inicial tem bloco próprio", () => {
  const a = carregar(estado()), t = a.v("telaPerfil()");
  const formPerfil = t.slice(t.indexOf('data-form="perfil"'), t.indexOf("</form>", t.indexOf('data-form="perfil"')));
  assert.doesNotMatch(formPerfil, /name="peso"/);
  assert.match(t, /data-form="pesoInicial"/);
  assert.match(t, /Peso no começo do tratamento/);
  assert.match(t, /Para registrar o peso de hoje, use a aba Peso\./);
  // primeiro preenchimento: o campo está no formulário, com o nome novo
  const novo = carregar().v("E.ui.entradaVista = true; telaPerfil()");
  assert.match(novo, /Peso no começo do tratamento \(kg\)<input name="peso"/);
});
test("primeiro preenchimento grava o peso inicial e confere o intervalo", () => {
  const a = carregar();
  a.v(form({ peso: "8" })); assert.strictEqual(a.v("E.perfil"), null);
  a.v(form({ peso: "120,5" })); assert.strictEqual(a.v("E.perfil.peso"), 120.5);
});
test("corrigir o peso inicial: só no bloco próprio, com confirmação", () => {
  const a = carregar(estado());
  a.v("var perguntas = [], resposta = false; confirmar = (t, aoSim) => { perguntas.push(t); if (resposta) aoSim(); }");
  a.v("FORM.pesoInicial({ pesoInicial: '102' })");
  assert.strictEqual(a.v("perguntas[0]"), "Trocar o peso do começo do tratamento de 100,0 kg para 102,0 kg? As marcas de 5, 7 e 10% passam a contar a partir do novo valor. Para registrar o peso de hoje, use a aba Peso.");
  assert.strictEqual(a.v("E.perfil.peso"), 100, "respondeu não: não muda");
  a.v("resposta = true; FORM.pesoInicial({ pesoInicial: '102' })");
  assert.strictEqual(a.v("E.perfil.peso"), 102);
  assert.match(marcos(a), /"ini":102,.*"alvo10":91\.8,/);
  a.v("FORM.pesoInicial({ pesoInicial: '900' })");
  assert.strictEqual(a.v("E.perfil.peso"), 102); assert.match(a.avisos[a.avisos.length - 1], /entre 35 e 300/);
  const n = a.v("perguntas.length"); a.v("FORM.pesoInicial({ pesoInicial: '102' })");
  assert.strictEqual(a.v("perguntas.length"), n, "mesmo valor não pergunta");
});
