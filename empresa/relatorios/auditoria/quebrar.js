// Auditoria: roteiros para tentar quebrar a versao do commit inicial (copia em app-inicial/).
// Uso: node quebrar.js <playwright-core> <chromium> [filtro]
const path = require("path");
const { chromium } = require(process.argv[2]);
const URL = "file://" + path.join(__dirname, "app-inicial", "app", "index.html");
const CAP = path.join(__dirname, "capturas"); require("fs").mkdirSync(CAP, { recursive: true });
const CH = "semana-a-semana.v1";
const filtro = process.argv[4] || "";
const iso = d => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const menos = (base, n) => { const d = new Date(base); d.setDate(d.getDate() - n); return iso(d); };
const perfil = (o) => Object.assign({ nome: "", sexo: "F", nascimento: 1990, altura: 163, peso: 95.4, atividade: 1.2, metaKcal: null, metaProt: null, metaAgua: null }, o || {});
const estado = (o) => Object.assign({ v: 1, perfil: perfil(), doses: [], pesos: [], sintomas: [], treinos: [], dias: {}, ui: {} }, o || {});
let b;
async function abrir(est, opt) {
  opt = opt || {};
  const ctx = await b.newContext({ viewport: opt.viewport || { width: 390, height: 800 }, deviceScaleFactor: 2, colorScheme: opt.escuro ? "dark" : "light", timezoneId: opt.fuso || "America/Sao_Paulo", locale: "pt-BR" });
  const p = await ctx.newPage();
  p.erros = []; p.on("pageerror", e => p.erros.push(String(e))); p.dialogos = [];
  p.on("dialog", d => { p.dialogos.push(d.message()); (opt.recusar ? d.dismiss() : d.accept()); });
  if (opt.agora) await p.clock.install({ time: new Date(opt.agora) });
  if (opt.antes) await p.addInitScript(opt.antes);
  await p.goto(URL);
  if (est) { await p.evaluate(([k, v]) => localStorage.setItem(k, v), [CH, typeof est === "string" ? est : JSON.stringify(est)]); await p.goto(URL + (opt.hash || "#hoje")); await p.reload(); }
  return p;
}
const txt = async (p, sel) => (await p.locator(sel).allInnerTexts()).join(" | ").replace(/\s+/g, " ");
const casos = {};

casos.metas = async () => {
  const perfis = [["1,50m 62kg 58a", { altura: 150, peso: 62, nascimento: 1968 }], ["1,75m 140kg 30a", { altura: 175, peso: 140, nascimento: 1996 }], ["1,60m 70kg 25a", { altura: 160, peso: 70, nascimento: 2001 }],
    ["1,60m 50kg 30a (IMC 19,5)", { altura: 160, peso: 50, nascimento: 1996 }], ["1,55m 58kg 75a", { altura: 155, peso: 58, nascimento: 1951 }], ["1,60m 76,8kg (IMC 30,0)", { altura: 160, peso: 76.8, nascimento: 1986 }], ["1,60m 76,7kg (IMC 29,96)", { altura: 160, peso: 76.7, nascimento: 1986 }],
    ["1,60m 180kg 30a", { altura: 160, peso: 180, nascimento: 1996 }], ["meta 800 kcal informada", { altura: 160, peso: 70, nascimento: 2001, metaKcal: 800 }], ["16 anos", { altura: 160, peso: 70, nascimento: 2010 }]];
  for (const [nome, pf] of perfis) {
    const p = await abrir(estado({ perfil: perfil(pf) }), { agora: "2026-11-20T10:00:00", hash: "#perfil" });
    console.log("\n== " + nome + "\n" + (await txt(p, "ul.lista li")));
    await p.goto(URL + "#plano"); await p.reload();
    console.log("   metas: " + (await txt(p, ".cartao >> nth=0")));
    const linhas = [];
    for (let i = 0; i <= 7; i++) { await p.click("[data-ac=diaPlano][data-i='" + i + "']"); const e = await p.locator(".nutri .linha span:last-child").nth(0).innerText(); const pr = await p.locator(".nutri .linha span:last-child").nth(1).innerText(); linhas.push((i === 7 ? "Enjoo" : "d" + i) + " " + e + " / prot " + pr); }
    console.log("   por dia: " + linhas.join(" ; "));
    if (/140kg|1,50m/.test(nome)) { await p.click("[data-ac=diaPlano][data-i='0']"); console.log("   segunda: " + (await txt(p, ".refeicao li"))); await p.click("[data-ac=diaPlano][data-i='7']"); console.log("   enjoo: " + (await txt(p, ".refeicao li"))); }
    console.log("   erros: " + p.erros.join(" / ")); await p.context().close();
  }
};

casos.dose = async () => {
  const H = "2026-11-20T10:00:00", h = new Date(H);
  const dz = (n, mg) => ({ id: "d" + n + Math.random(), data: menos(h, n), mg: mg || 5, local: "Abdômen esquerdo", obs: "" });
  const cs = [["ultima ha 8 dias (atraso 1)", [dz(8)]], ["ha 11 dias (atraso 4)", [dz(11)]], ["ha 12 dias (atraso 5)", [dz(12)]], ["ha 14 dias (atraso 7 = dia habitual)", [dz(14)]], ["ha 15 dias (atraso 8 = 1 dia depois do dia habitual seguinte)", [dz(15)]], ["ha 18 dias (atraso 11)", [dz(18)]],
    ["ha 97 dias, dose 10 mg (meses sem registro)", [dz(97, 10)]], ["4 doses em 10 dias (0,3,6,9...)", [dz(12), dz(9), dz(6), dz(3)]], ["data digitada com ano errado (2025) + dose de ontem", [{ id: "x", data: "2025-11-13", mg: 2.5, local: "Coxa direita" }, dz(1, 2.5)]],
    ["habitual segunda; aplicou atrasada na quinta 19/11 (ontem)", [dz(18), dz(11), dz(1)]], ["dose no futuro (vinda de restauracao)", [{ id: "f", data: "2026-12-25", mg: 5, local: "Coxa direita" }]], ["2,5 -> 10 mg sem escalonamento", [dz(7, 2.5), dz(0, 10)]]];
  for (const [nome, doses] of cs) {
    const p = await abrir(estado({ doses }), { agora: H });
    console.log("\n== " + nome + "\n   " + (await txt(p, ".cartao.destaque")) + "\n   erros: " + p.erros.join(" / ")); await p.context().close();
  }
  // formulario: intervalo, data futura digitada, duplo toque
  const p = await abrir(estado({ doses: [dz(3)] }), { agora: H, hash: "#diario" });
  await p.click("form[data-form=dose] button"); console.log("\n== nova dose 3 dias depois: dialogos=" + JSON.stringify(p.dialogos));
  await p.click("form[data-form=dose] button"); console.log("   duplo toque no mesmo dia: dialogos=" + JSON.stringify(p.dialogos));
  await p.fill("form[data-form=dose] [name=data]", "2027-01-05"); await p.click("form[data-form=dose] button");
  await p.fill("form[data-form=dose] [name=data]", "0026-11-20"); await p.click("form[data-form=dose] button");
  await p.selectOption("[name=mg]", "15"); await p.fill("form[data-form=dose] [name=data]", "2026-11-10"); await p.click("form[data-form=dose] button");
  console.log("   doses gravadas: " + (await p.evaluate(k => JSON.parse(localStorage.getItem(k)).doses.map(d => d.data + " " + d.mg).join(", "), CH)) + "\n   dialogos: " + JSON.stringify(p.dialogos));
  await p.goto(URL + "#hoje"); console.log("   hoje: " + (await txt(p, ".cartao.destaque"))); await p.context().close();
};

casos.viradaDia = async () => {
  const p = await abrir(estado(), { agora: "2026-11-23T23:58:00" }); // segunda
  await p.locator("[data-mud=refeicao]").nth(0).check(); await p.locator("[data-mud=refeicao]").nth(2).check();
  console.log("antes da meia-noite: " + (await txt(p, "h2 >> nth=1")) + " marcadas=" + (await p.locator("[data-mud=refeicao]:checked").count()));
  await p.clock.fastForward("08:00:00");
  console.log("8 h depois, sem tocar em nada (app ficou aberto): titulo=" + (await txt(p, "h2 >> nth=1")) + " marcadas=" + (await p.locator("[data-mud=refeicao]:checked").count()) + " | " + (await txt(p, ".grande >> nth=0")));
  await p.evaluate(() => { document.dispatchEvent(new Event("visibilitychange")); window.dispatchEvent(new Event("focus")); window.dispatchEvent(new Event("pageshow")); });
  console.log("depois de voltar ao app (visibilitychange/focus): titulo=" + (await txt(p, "h2 >> nth=1")) + " marcadas=" + (await p.locator("[data-mud=refeicao]:checked").count()));
  const tit = await p.locator(".refeicao .tit").nth(4).innerText(); await p.locator("[data-mud=refeicao]").nth(4).check();
  console.log("marcou o jantar que via na tela ('" + tit + "') -> gravado em: " + (await p.evaluate(k => JSON.stringify(JSON.parse(localStorage.getItem(k)).dias), CH)) + " ; tela agora: " + (await txt(p, "h2 >> nth=1")) + " / " + (await txt(p, ".refeicao.feita .tit")));
  await p.context().close();
  // virada de ano
  const q = await abrir(estado({ doses: [{ id: "a", data: "2026-12-28", mg: 5, local: "Coxa direita" }], treinos: [{ id: "t", data: "2026-12-28", tipo: "A" }, { id: "u", data: "2027-01-01", tipo: "B" }], pesos: [{ id: "p", data: "2026-12-30", kg: 90 }] }), { agora: "2027-01-02T09:00:00", hash: "#hoje" });
  console.log("virada de ano: " + (await txt(q, ".cartao.destaque")) + " || treinos semana: " + (await txt(q, ".grande >> nth=3")) + " erros=" + q.erros.join("/")); await q.context().close();
  // fuso: registros feitos em SP lidos em Lisboa/Toquio
  for (const fuso of ["Asia/Tokyo", "Pacific/Honolulu", "America/Santiago"]) { const r = await abrir(estado({ doses: [{ id: "a", data: "2026-11-13", mg: 5, local: "Coxa direita" }] }), { agora: "2026-11-20T22:30:00-03:00", fuso }); console.log("fuso " + fuso + ": " + (await txt(r, ".cartao.destaque p >> nth=0"))); await r.context().close(); }
  // horario de verao (Santiago muda em 06/09/2026 e 04/04/2027)
  const s = await abrir(estado({ doses: [{ id: "a", data: "2026-09-01", mg: 5, local: "Coxa direita" }] }), { agora: "2026-09-08T00:30:00-03:00", fuso: "America/Santiago" }); console.log("horario de verao (Santiago): " + (await txt(s, ".cartao.destaque p >> nth=0"))); await s.context().close();
};

casos.entradas = async () => {
  const p = await abrir(null, { agora: "2026-11-20T10:00:00" });
  console.log("boas-vindas: barra de abas visivel? " + (await p.locator("#abas").isVisible()) + " (atributo hidden=" + (await p.evaluate(() => document.getElementById("abas").hidden)) + ")");
  await p.screenshot({ path: path.join(CAP, "boas-vindas-390.png") });
  const tenta = async (n, a, k, extra) => { await p.goto(URL + "#perfil"); await p.waitForSelector("[name=nascimento]"); await p.fill("[name=nascimento]", n); await p.fill("[name=altura]", a); await p.fill("[name=peso]", k); if (extra) for (const c in extra) await p.fill("[name=" + c + "]", extra[c]); await p.click("form[data-form=perfil] button"); await p.waitForTimeout(50); const s = await p.evaluate(k2 => localStorage.getItem(k2), CH); console.log("  perfil(" + [n, a, k, JSON.stringify(extra || {})].join(", ") + ") -> aviso='" + (await p.locator("#aviso").innerText()) + "' salvo=" + (s ? JSON.stringify(JSON.parse(s).perfil) : "nao")); };
  await tenta("35", "165", "90"); await tenta("1990", "1,65", "90"); await tenta("1990", "165", "9,5"); await tenta("1990", "165", "1.095,5"); await tenta("1990", "165", "90 kg"); await tenta("1990", "165", "noventa"); await tenta("2010", "165", "90"); await tenta("1990.7", "165.55", "90,449", { metaKcal: "0", metaProt: "-5" });
  await tenta("1990", "165", "90", { nome: "<img src=x onerror=alert(1)> \"aspas\" 'simples' & e", metaKcal: "800", metaProt: "", metaAgua: "500" });
  await p.goto(URL + "#hoje"); await p.waitForSelector("text=Proteína hoje"); console.log("  dialogos (XSS no nome dispararia alert): " + JSON.stringify(p.dialogos));
  await p.goto(URL + "#diario"); await p.fill("[name=obs]", "</td><script>alert(2)</script><b onmouseover=alert(3)>\"x'"); await p.click("form[data-form=dose] button");
  await p.click("[data-ac=diario][data-v=sintomas]"); await p.fill("[name=nota]", "</textarea><img src=x onerror=alert(4)>"); await p.check("[name=dor]"); await p.click("form[data-form=sintoma] button");
  await p.click("[data-ac=diario][data-v=relatorio]"); const rel = await p.inputValue("#rel");
  console.log("  dialogos: " + JSON.stringify(p.dialogos) + "\n  relatorio traz o texto cru? " + /onerror=alert\(4\)/.test(rel) + " ; img injetada no DOM? " + (await p.locator("img").count()) + " erros=" + p.erros.join("/"));
  // peso
  await p.click("[data-ac=diario][data-v=peso]");
  for (const [d, kg, c] of [["2026-11-20", "89", ""], ["2026-11-20", "88,5", "abc"], ["2026-10-01", "95", "-3"], ["2026-11-19", "59", ""], ["2026-11-18", "890", ""], ["2027-03-01", "80", ""]]) { await p.fill("form[data-form=peso] [name=data]", d); await p.fill("[name=kg]", kg); await p.fill("[name=cintura]", c); await p.click("form[data-form=peso] button"); await p.waitForTimeout(30); }
  console.log("  pesos: " + (await p.evaluate(k => JSON.stringify(JSON.parse(localStorage.getItem(k)).pesos.map(x => [x.data, x.kg, x.cintura])), CH)) + "\n  resumo: " + (await txt(p, ".tres")));
  await p.screenshot({ path: path.join(CAP, "peso-antigo-antes-do-inicial.png"), fullPage: true });
  // apagar com recusa / aceite
  await p.locator("[data-ac=apagar]").first().click(); console.log("  apagou; pesos restantes=" + (await p.evaluate(k => JSON.parse(localStorage.getItem(k)).pesos.length, CH)));
  // enjoo apaga refeicoes marcadas
  await p.goto(URL + "#hoje"); await p.locator("[data-mud=refeicao]").nth(0).check(); await p.locator("[data-mud=refeicao]").nth(1).check(); const antes = await txt(p, ".grande >> nth=1"); await p.click("[data-ac=enjoo]"); const meio = await txt(p, ".grande >> nth=1"); await p.click("[data-ac=enjoo]");
  console.log("  enjoo: proteina antes=" + antes + " ; depois de ligar 'Dia de enjoo'=" + meio + " ; depois de desligar=" + (await txt(p, ".grande >> nth=1")));
  // agua sem teto
  for (let i = 0; i < 40; i++) await p.click("[data-ac=agua][data-ml='500']"); console.log("  agua apos 40 toques de 500 ml: " + (await txt(p, ".duas .grande >> nth=1")) + " (sem aviso?) aviso='" + (await p.locator("#aviso").innerText()) + "'");
  await p.context().close();
};

casos.restaurar = async () => {
  const bons = estado({ doses: [{ id: "a", data: "2026-11-13", mg: 5, local: "Coxa direita" }] });
  const lixo = { "doses nulo": { v: 1, perfil: perfil(), doses: null }, "perfil vazio {}": { v: 1, perfil: {} }, "pesos com texto": { v: 1, perfil: perfil(), pesos: [{ id: 1, data: "ontem", kg: "oitenta" }] }, "dias como lista": { v: 1, perfil: perfil(), dias: [1, 2] },
    "versao futura v2": Object.assign({}, bons, { v: 2 }), "texto cortado (WhatsApp)": JSON.stringify(bons).slice(0, 120), "html no id e na data": { v: 1, perfil: perfil(), treinos: [{ id: '"><img src=x onerror="document.title=\'INJETADO\'">', data: "2026-11-<img src=x onerror=\"document.title='INJETADO2'\">-01", tipo: "A" }] },
    "feitas nao lista": { v: 1, perfil: perfil(), dias: { "2026-11-20": { feitas: "sim", agua: "muita" } } }, "ui.diaPlano 99": { v: 1, perfil: perfil(), ui: { diaPlano: 99, diario: "xx", local: "rua" } } };
  for (const nome in lixo) {
    const p = await abrir(bons, { agora: "2026-11-20T10:00:00", hash: "#diario" });
    await p.click("[data-ac=diario][data-v=relatorio]"); await p.fill("#imp", typeof lixo[nome] === "string" ? lixo[nome] : JSON.stringify(lixo[nome])); await p.click("[data-ac=importar]"); await p.waitForTimeout(80);
    const av = await p.locator("#aviso").innerText(); const e1 = p.erros.slice(); p.erros.length = 0;
    const telas = [];
    for (const t of ["hoje", "plano", "treino", "diario", "perfil"]) { await p.goto(URL + "#" + t); await p.reload(); await p.waitForTimeout(40); telas.push(t + ":" + ((await p.locator("#tela").innerText()).trim().length ? "ok" : "EM BRANCO") + (p.erros.length ? "(" + p.erros[0].slice(0, 60) + ")" : "")); p.erros.length = 0; }
    console.log("== " + nome + ": aviso='" + av + "' erros=" + e1.join("/").slice(0, 120) + "\n   depois de reabrir: " + telas.join(" ") + " titulo=" + (await p.title()) + " NaN na tela? " + /NaN/.test(await p.locator("body").innerText()));
    await p.context().close();
  }
  // armazenamento com versao desconhecida ou corrompido: o que acontece com os dados antigos?
  for (const [nome, bruto] of [["v2 no armazenamento", JSON.stringify(Object.assign({}, bons, { v: 2 }))], ["armazenamento corrompido", JSON.stringify(bons).slice(0, 200)]]) {
    const p = await abrir(bruto, { agora: "2026-11-20T10:00:00" });
    const tela = (await txt(p, "#tela h2")).slice(0, 60); await p.fill("[name=nascimento]", "1990"); await p.fill("[name=altura]", "165"); await p.fill("[name=peso]", "90"); await p.click("form[data-form=perfil] button"); await p.waitForTimeout(50);
    console.log("== " + nome + ": tela='" + tela + "' ; depois de preencher o perfil de novo, doses no armazenamento=" + (await p.evaluate(k => JSON.parse(localStorage.getItem(k)).doses.length, CH)) + " (tinha 1)"); await p.context().close();
  }
};

casos.injecao = async () => {
  const mal = { v: 1, perfil: perfil(), treinos: [{ id: '"><img src=x onerror="document.body.dataset.inj=1">', data: "2026-11-20", tipo: "A" }], doses: [{ id: "a", data: '2026-11-<img src=x onerror="document.body.dataset.inj2=1">', mg: 5, local: "x" }] };
  const p = await abrir(mal, { agora: "2026-11-20T10:00:00", hash: "#treino" }); await p.waitForTimeout(200);
  const a = await p.evaluate(() => document.body.dataset.inj || "nao"); await p.goto(URL + "#diario"); await p.waitForTimeout(200);
  console.log("copia de seguranca com HTML no id (tela Treino): script executou? " + a + " ; HTML na data (tela Diario): " + (await p.evaluate(() => document.body.dataset.inj2 || "nao")) + " erros=" + p.erros.join("/").slice(0, 100)); await p.context().close();
  const q = await abrir(estado({ perfil: perfil({ altura: 160, peso: 77, nascimento: 1986 }) }), { agora: "2026-11-20T10:00:00", hash: "#perfil" }); console.log("IMC 30,08 (77 kg, 1,60 m): " + (await txt(q, "ul.lista li >> nth=3"))); await q.context().close();
};
casos.armazenamento = async () => {
  let p = await abrir(estado(), { agora: "2026-11-20T10:00:00", hash: "#diario" });
  await p.evaluate(() => { Storage.prototype.setItem = function () { throw new DOMException("cheio", "QuotaExceededError"); }; });
  await p.click("form[data-form=dose] button"); await p.waitForTimeout(30); console.log("armazenamento cheio, salvar aplicacao: aviso='" + (await p.locator("#aviso").innerText()) + "'");
  await p.click("[data-ac=diario][data-v=peso]"); await p.fill("[name=kg]", "90"); await p.click("form[data-form=peso] button"); await p.waitForTimeout(30); console.log("  salvar peso: aviso='" + (await p.locator("#aviso").innerText()) + "'");
  await p.reload(); console.log("  depois de reabrir: doses=" + (await p.evaluate(k => JSON.parse(localStorage.getItem(k)).doses.length, CH)));
  await p.context().close();
  p = await abrir(null, { agora: "2026-11-20T10:00:00", antes: () => { Object.defineProperty(window, "localStorage", { get() { throw new DOMException("negado", "SecurityError"); } }); } });
  await p.fill("[name=nascimento]", "1990"); await p.fill("[name=altura]", "165"); await p.fill("[name=peso]", "90"); await p.click("form[data-form=perfil] button"); await p.waitForTimeout(50);
  console.log("localStorage indisponivel: aviso='" + (await p.locator("#aviso").innerText()) + "' tela=" + (await txt(p, "#tela h2")).slice(0, 50) + " erros=" + p.erros.join("/")); await p.context().close();
};

casos.telas = async () => {
  const H = "2026-11-20T10:00:00", h = new Date(H);
  const est = estado({ perfil: perfil({ nome: "Maria Aparecida dos Santos Albuquerque" }), doses: [28, 21, 14, 7].map((n, i) => ({ id: "d" + i, data: menos(h, n), mg: 12.5, local: "Abdômen esquerdo", obs: "obs longa para ver quebra de linha na tabela do historico" })), pesos: [21, 14, 7, 0].map((n, i) => ({ id: "p" + i, data: menos(h, n), kg: 94 - i, cintura: 100 - i })), sintomas: [{ id: "s", data: menos(h, 1), enjoo: 3, intestino: "Preso", vomito: true, refluxo: true, tontura: true, cansaco: true, dor: true, nota: "nota" }], treinos: [{ id: "t", data: menos(h, 2), tipo: "A", local: "casa" }], dias: { [iso(h)]: { feitas: [true, false, true], agua: 700, protExtra: 10, caminhada: 20 } } });
  const fonteGrande = f => { document.querySelectorAll("*").forEach(el => { el.dataset.fs = parseFloat(getComputedStyle(el).fontSize); }); document.querySelectorAll("*").forEach(el => { el.style.fontSize = (el.dataset.fs * f) + "px"; }); };
  for (const [nome, opt, f] of [["320-claro", { viewport: { width: 320, height: 640 } }, 1], ["320-fonte130", { viewport: { width: 320, height: 640 } }, 1.3], ["320-fonte200", { viewport: { width: 320, height: 640 } }, 2], ["390-escuro", { escuro: true }, 1], ["paisagem-escuro", { viewport: { width: 800, height: 360 }, escuro: true }, 1]]) {
    const p = await abrir(est, Object.assign({ agora: H }, opt));
    for (const t of ["hoje", "plano", "treino", "diario", "guia", "perfil"]) {
      await p.goto(URL + "#" + t); await p.waitForTimeout(40);
      const subs = t === "diario" ? ["doses", "peso", "sintomas", "relatorio"] : [""];
      for (const s of subs) {
        await p.reload(); await p.waitForTimeout(40);
        if (s) await p.click("[data-ac=diario][data-v=" + s + "]");
        if (f !== 1) await p.evaluate(fonteGrande, f);
        const larg = await p.evaluate(() => document.documentElement.scrollWidth), vw = p.viewportSize().width;
        const cortes = await p.evaluate(() => [...document.querySelectorAll("#tela *, #abas a, #topo *")].filter(el => el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX !== "auto" && el.clientWidth > 0 && !/^(svg|text|TEXTAREA|SELECT|INPUT)$/.test(el.tagName)).map(el => el.tagName + "." + el.className + ":" + el.textContent.trim().slice(0, 25)).slice(0, 4));
        const abas = await p.evaluate(() => { const a = document.getElementById("abas").getBoundingClientRect(); return Math.round(a.height); });
        console.log(nome + " " + t + (s ? "/" + s : "") + ": largura " + larg + "/" + vw + (larg > vw ? " ROLAGEM HORIZONTAL" : "") + " barra de abas " + abas + "px" + (cortes.length ? " transborda: " + cortes.join(" ; ") : ""));
        await p.screenshot({ path: path.join(CAP, nome + "-" + t + (s ? "-" + s : "") + ".png"), fullPage: !/paisagem/.test(nome) });
      }
    }
    await p.context().close();
  }
};

(async () => {
  b = await chromium.launch({ executablePath: process.argv[3] });
  for (const n in casos) if (!filtro || filtro.split(",").indexOf(n) >= 0) { console.log("\n################ " + n); try { await casos[n](); } catch (e) { console.log("ROTEIRO FALHOU: " + e.message.split("\n")[0]); } }
  await b.close();
})();
