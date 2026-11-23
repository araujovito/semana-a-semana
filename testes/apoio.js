// Apoio dos testes de ponta a ponta (navegador sem janela). Cada testes/fluxo-*.js usa isto e roda sozinho:
//   node testes/fluxo-hoje.js [caminho do playwright-core] [executavel do chromium] [pasta de capturas]
// Sem argumentos, usa as variaveis PLAYWRIGHT e CHROMIUM ou os caminhos do briefing.
const path = require("path"), os = require("os"), fs = require("fs");
const CHAVE = "semana-a-semana.v1";
function achar() {
  const pw = process.argv[2] || process.env.PLAYWRIGHT || path.join(os.homedir(), "Documents/hub-integracoes/backend/node_modules/playwright-core");
  let exe = process.argv[3] || process.env.CHROMIUM;
  if (!exe) {
    const base = path.join(os.homedir(), ".cache/ms-playwright/chromium_headless_shell-1254");
    const pasta = fs.readdirSync(base).find(n => fs.existsSync(path.join(base, n, "chrome-headless-shell")));
    exe = path.join(base, pasta, "chrome-headless-shell");
  }
  return { pw, exe, capturas: process.argv[4] || process.env.CAPTURAS };
}
const ok = (c, m) => { if (!c) { console.log("FALHOU: " + m); process.exitCode = 1; } else console.log("ok: " + m); };
// data de n dias atras, no formato AAAA-MM-DD
// Relogio fixo: todo teste de ponta a ponta roda como se fosse sexta, 20/11/2026, 10h (hora local), para o resultado nao depender do dia em que roda.
// abrir({ agora: "2026-11-23T23:58:00" }) escolhe outro instante; na pagina, window.__relogio("2026-11-24T08:00:00") muda a hora com o app aberto.
const AGORA = "2026-11-20T10:00:00";
let agoraDoTeste = AGORA;
const d = n => { const x = new Date(agoraDoTeste); x.setDate(x.getDate() - n); return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0"); };
const URL_APP = "file://" + path.join(__dirname, "..", "app", "index.html");
// Perfil pronto para os testes que nao sao sobre o perfil. Formato v2 (ver app/nucleo.js).
// ui.planoNutri: false = estes testes usam o cardapio do app (a reserva). O plano da nutricionista, ligado por padrao,
// tem os testes dele em testes/fluxo-planonutri.js.
function estadoBase(extra) {
  return Object.assign({ v: 2, perfil: { nome: "Teste", sexo: "F", nascimento: 1990, altura: 163, peso: 95.4, atividade: 1.2, metaKcal: null, metaProt: null, metaAgua: null,
    diabetes: null, insulinaSulf: null, pilula: null, naoCome: [], naoGosta: [] },
    doses: [], pesos: [], sintomas: [], treinos: [], dias: {}, trocas: {}, caneta: null, suplementos: [], exames: [], lembretes: {}, ui: { planoNutri: false } }, extra || {});
}
// Letra do sistema (abrir({ letra: 1.5 })). No APK, a casca aplica o tamanho de letra do Android como textZoom da WebView
// (MainActivity.java), que aumenta a letra de todo texto, inclusive a definida em px. O navegador sem janela não tem esse ajuste, então
// a simulação multiplica pelo fator, nas folhas de estilo já carregadas (CSSOM), todo font-size e line-height em px; põe o fator no
// font-size do html (o que está em rem cresce junto) e nos atributos style com font-size em px que o app desenhar depois.
// Texto de gráfico SVG em px fica como está. É o pior caso: o textZoom de verdade pode deixar algum texto menor do que isto, nunca maior.
function letraDoSistema(fator) {
  const px = (st, pr) => { const m = /^([\d.]+)px$/.exec((st.getPropertyValue(pr) || "").trim()); if (m) st.setProperty(pr, (m[1] * fator) + "px", st.getPropertyPriority(pr)); };
  const regras = rs => { for (const r of rs) { if (r.cssRules && !r.style) regras(r.cssRules); else if (r.style && !/svg/.test(r.selectorText || "")) { px(r.style, "font-size"); px(r.style, "line-height"); } } };
  const feitos = new WeakSet();
  const inline = raiz => { if (raiz.querySelectorAll) [raiz, ...raiz.querySelectorAll("[style*=font-size]")].forEach(el => { if (el.style && el.style.fontSize && !feitos.has(el) && !el.closest("svg")) { feitos.add(el); px(el.style, "font-size"); } }); };
  document.addEventListener("DOMContentLoaded", () => {
    document.documentElement.style.setProperty("font-size", (fator * 100) + "%");
    // body usa o atalho font com var() (font: 17px/1.45 var(--fonte)); no CSSOM a regra não mostra o font-size, então vai no atributo.
    const corpo = parseFloat(getComputedStyle(document.body).fontSize);
    for (const s of document.styleSheets) { try { regras(s.cssRules); } catch (x) { /* folha de outra origem */ } }
    document.body.style.setProperty("font-size", (corpo * fator) + "px"); feitos.add(document.body);
    inline(document.body);
    new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(inline))).observe(document.body, { childList: true, subtree: true });
  });
}
// Abre o app. opcoes: { estado: objeto gravado antes de abrir, largura, altura, escuro: true, aba: "plano", letra: 1.5 (ver letraDoSistema) }
// Devolve { p (pagina), erros, foto(nome), ler() (estado salvo), semear(estado), fechar() }. fechar() confere que nao houve erro no console.
async function abrir(opcoes) {
  const o = opcoes || {}, a = achar();
  const { chromium } = require(a.pw);
  // Por file://, o Chromium trata cada folha de estilo como de outra origem e esconde as regras; a simulação da letra precisa lê-las.
  const b = await chromium.launch({ executablePath: a.exe, args: o.letra ? ["--allow-file-access-from-files"] : [] });
  const p = await b.newPage({ viewport: { width: o.largura || 390, height: o.altura || 800 }, deviceScaleFactor: 2, colorScheme: o.escuro ? "dark" : "light" });
  agoraDoTeste = o.agora || AGORA;
  await p.addInitScript(fixo => {
    const Real = Date; let desvio = new Real(fixo).getTime() - Real.now();
    class Relogio extends Real { constructor(...a) { if (a.length === 0) super(Real.now() + desvio); else super(...a); } static now() { return Real.now() + desvio; } }
    window.Date = Relogio;
    window.__relogio = quando => { desvio = new Real(quando).getTime() - Real.now(); };
  }, agoraDoTeste);
  // PIN (app/cifra.js): os testes que não são sobre o PIN rodam sem ele (sem dados cifrados, o app segue em texto como antes).
  // Os testes do PIN abrem com { comPin: true }.
  if (!o.comPin) await p.addInitScript(() => { window.cifTesteSemPin = true; });
  if (o.letra) await p.addInitScript(letraDoSistema, o.letra);
  const erros = []; p.on("pageerror", e => erros.push(String(e))); p.on("console", m => { if (m.type() === "error") erros.push(m.text()); });
  p.on("dialog", x => { erros.push("diálogo do navegador (use confirmar/alerta da página): " + x.message()); x.accept(); });
  const semear = async estado => { await p.goto(URL_APP); await p.evaluate(x => localStorage.setItem(x[0], JSON.stringify(x[1])), [CHAVE, estado]); await p.goto(URL_APP + "#" + (o.aba || "hoje")); await p.reload(); };
  if (o.estado) await semear(o.estado); else await p.goto(URL_APP + (o.aba ? "#" + o.aba : ""));
  return {
    p, erros, semear,
    foto: async n => { if (a.capturas) await p.screenshot({ path: path.join(a.capturas, n + ".png"), fullPage: true }); },
    ler: () => p.evaluate(k => JSON.parse(localStorage.getItem(k)), CHAVE),
    semRolagem: async nome => { const w = await p.evaluate(() => document.documentElement.scrollWidth), v = p.viewportSize().width; ok(w <= v, "sem rolagem horizontal em " + nome + " (" + w + " de " + v + " px)"); },
    // Confere que todo botao, link, campo e titulo que abre/fecha visivel tem pelo menos 44 px de altura (e botao, 44 de largura).
    alvosDeToque: async nome => {
      const ruins = await p.evaluate(() => [...document.querySelectorAll("button, a, select, summary, input:not([type=checkbox]):not([type=radio]):not([type=hidden])")]
        .filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.height < 43.5 || (el.tagName === "BUTTON" && r.width < 43.5)); })
        .map(el => el.tagName.toLowerCase() + " \"" + (el.textContent || el.name || "").trim().slice(0, 30) + "\" " + Math.round(el.getBoundingClientRect().width) + "x" + Math.round(el.getBoundingClientRect().height)));
      ok(ruins.length === 0, "alvos de toque com 44 px ou mais em " + nome + (ruins.length ? ": " + ruins.slice(0, 6).join("; ") : ""));
    },
    // Dialogo da pagina: sim() toca no botao de confirmar, nao() no de cancelar ou "Entendi"; textoDialogo() devolve a pergunta.
    sim: async () => { await p.click("#dialogo [data-ac=dialogoSim]"); },
    nao: async () => { await p.click("#dialogo [data-ac=dialogoNao]"); },
    textoDialogo: async () => ((await p.locator("#dialogo").isVisible()) ? p.locator("#dialogo-texto").textContent() : null),
    relogio: async quando => { await p.evaluate(q => window.__relogio(q), quando); agoraDoTeste = quando; },
    fechar: async () => { ok(erros.length === 0, "sem erros no console " + erros.join(" / ")); await b.close(); },
  };
}
module.exports = { abrir, ok, d, estadoBase, CHAVE, URL_APP, achar };
