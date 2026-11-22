// Avisos de vesícula e fígado: quando aparecem e o que dizem. Pesos de teste, não os da usuária.
const test = require("node:test"), assert = require("node:assert");
const carregar = require("../carregar-app");
const estado = (perfil, pesos) => ({ v: 2, perfil: Object.assign({ nome: "T", sexo: "F", nascimento: 1980, altura: 160, peso: 100, atividade: 1.2 }, perfil), pesos: pesos || [] });

test("vesícula: sem resposta, não ou prefiro não responder, não há cartão em nenhuma tela", () => {
  for (const v of [undefined, null, false]) {
    const app = carregar(estado({ vesicula: v }));
    for (const onde of ["hoje", "plano", "perfil"]) assert.strictEqual(app.v('avisoVesicula("' + onde + '")'), "");
  }
});
test("vesícula marcada: cartão com bula, crise, onde procurar ajuda e a pergunta para o médico", () => {
  const app = carregar(estado({ vesicula: true }));
  const t = app.v('avisoVesicula("plano")');
  assert.match(t, /bula da tirzepatida lista problemas de vesícula/);
  assert.match(t, /perder peso rápido aumenta esse risco/);
  assert.match(t, /O seu médico sabe que você tem pedra na vesícula\? Confirme com ele antes de começar/);
  assert.match(t, /Pronto-socorro hoje<\/strong> se a dor não passar em cerca de 6 horas/); assert.match(t, /febre ou calafrio/);
  assert.match(t, /urina escura e fezes claras/); assert.match(t, /Ligue 192/); assert.match(t, /Avise o médico<\/strong> nos próximos dias se teve uma crise que passou sozinha/);
  assert.match(app.v("avisosDoPerfil()"), /data-aviso="vesicula"/, "Perfil e Plano usam avisosDoPerfil");
  assert.match(app.v('avisoVesicula("hoje")'), /data-para="guia"/, "na tela Hoje, atalho para os sinais de alerta do Guia");
  assert.doesNotMatch(t, /data-para="guia"/);
});
test("vesícula: o cartão não traz dose, remédio nem suplemento", () => {
  const t = carregar(estado({ vesicula: true })).v('avisoVesicula("hoje")');
  assert.doesNotMatch(t, /\bmg\b|suplement|tome |ursodesox/i);
});
test("Guia, sinais de alerta: itens da vesícula para quem tem pedra (pesquisa de 22/11, seção 6)", () => {
  const g = carregar().v("JSON.stringify(G.filter(x => x.titulo === 'Sinais de alerta')[0].corpo)");
  const i = r => JSON.parse(g).findIndex(l => r.test(l)), idx = t => JSON.parse(g).indexOf(t);
  const ps = idx("Vá ao pronto-socorro hoje se:"), med = idx("Fale com o médico nos próximos dias se:");
  assert.ok(i(/não passa em cerca de 6 horas/) > ps && i(/não passa em cerca de 6 horas/) < med, "dor que não passa: pronto-socorro");
  assert.ok(i(/febre ou calafrio/) > ps && i(/fezes claras/) > ps && i(/fezes claras/) < med, "febre e amarelão com fezes claras: pronto-socorro");
  assert.ok(i(/passou sozinha/) > med, "cólica que passou sozinha: médico nos próximos dias");
  assert.ok(i(/febre alta e pele amarela, junto com confusão/) < ps, "com confusão ou desmaio: 192");
});
test("progresso até 5, 7 e 10% do peso inicial: contas", () => {
  const g = JSON.parse(carregar().v("JSON.stringify(progressoPerda(100, 94))"));
  assert.ok(Math.abs(g.perdaPct - 6) < 1e-9);
  assert.deepStrictEqual([g.alvo5, g.alvo7, g.alvo10].map(x => Math.round(x * 10) / 10), [95, 93, 90]);
  assert.deepStrictEqual([g.chegou5, g.chegou7, g.chegou10], [true, false, false]);
  assert.deepStrictEqual([g.falta5, Math.round(g.falta7 * 10) / 10, Math.round(g.falta10 * 10) / 10], [0, 1, 4]);
  const e = JSON.parse(carregar().v("JSON.stringify(progressoPerda(100, 93))"));
  assert.strictEqual(e.chegou7, true, "exatamente 7% conta como alcançado");
  assert.ok(JSON.parse(carregar().v("JSON.stringify(progressoPerda(100, 103))")).perdaPct < 0, "ganho de peso dá negativo");
  assert.strictEqual(carregar().v("progressoPerda(null, 90)"), null);
});
test("fígado: sem resposta ou não, sem cartão; marcado, cartão só no Plano com as marcas calculadas do peso dela", () => {
  for (const v of [undefined, null, false]) assert.doesNotMatch(carregar(estado({ figado: v })).v('avisosDoPerfil("plano")'), /data-aviso="figado"/);
  const app = carregar(estado({ figado: true, peso: 130 }, [{ id: "a", data: "2026-11-01", kg: 120 }]));
  const t = app.v('avisosDoPerfil("plano")');
  assert.match(t, /data-aviso="figado"/);
  assert.match(t, /5% do peso já reduz a gordura, de 7 a 10% melhora a inflamação e 10% ou mais melhora a fibrose/);
  assert.match(t, /bebida açucarada/); assert.match(t, /não beber álcool/); assert.match(t, /150 minutos por semana/);
  assert.match(t, /Peso no início: 130,0 kg\. Peso dos 5%: 123,5 kg \(alcançado\)\. Peso dos 7%: 120,9 kg \(alcançado\)\. Peso dos 10%: 117,0 kg, faltam 3,0 kg\./);
  assert.doesNotMatch(app.v("avisosDoPerfil()"), /data-aviso="figado"/, "não aparece no Perfil");
  assert.doesNotMatch(app.v('avisoVesicula("hoje")'), /figado/);
});
test("fígado no modo sem calorias e peso em destaque: só percentuais, nenhum quilo", () => {
  const t = carregar(estado({ figado: true, peso: 130, discreto: true }, [{ id: "a", data: "2026-11-01", kg: 120 }])).v("avisoFigado()");
  assert.match(t, /Marcas: 5% \(alcançada\), 7% \(alcançada\), 10%\./);
  assert.doesNotMatch(t, /kg/);
});
