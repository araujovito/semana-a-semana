// Letra do sistema em 1,5 (o maior tamanho comum no Android) a 440 px, a largura do celular dela, claro e escuro.
// Como a letra é simulada: ver letraDoSistema em testes/apoio.js (todo font-size e line-height em px vezes 1,5, rem junto).
// Em cada tela confere: sem rolagem de lado; nada sai da tela nem do cartão; nada corta texto (conteúdo maior que a caixa
// sem rolagem própria); filhos lado a lado em linhas e grades não se sobrepõem; alvos de toque com 44 px ou mais.
// Telas: primeiro uso, PIN (criar, código, conferir, entrar), Hoje rolada inteira, faixa das perguntas novas, Semana, Diário e as
// quatro partes, Painel, Comer > Plano e Caminhos, Mover, Guia, Perfil, folhas (dor, ritmo, não gosto, trocar PIN) e diálogo.
// Pesos e dados daqui são de teste. PIN inventado para o teste.
const { abrir, ok, d, estadoBase, achar } = require("./apoio");
const path = require("path"), CAPTURAS = achar().capturas;
// Folha e diálogo ficam presos à tela: a captura é só do que aparece na tela, não da página inteira.
const vista = async (t, nome) => { if (CAPTURAS) await t.p.screenshot({ path: path.join(CAPTURAS, nome + ".png") }); };
const LETRA = 1.5, LARGURA = 440;

function estado(extra) {
  const dias = {};
  for (let n = 0; n < 30; n++) if (n % 6 !== 2) dias[d(n)] = { enjoo: n === 3, comido: [{ q: 1 }, { q: 0.5 }, { q: 1 }, { q: 0.25 }, null], agua: 1000, protExtra: n % 5 ? 0 : 20, caminhada: 0 };
  const D = (n, mg) => ({ id: "d" + n, data: d(n), mg, local: "Abdômen esquerdo", obs: "" });
  const e = estadoBase(Object.assign({ dias, doses: [D(39, 2.5), D(32, 2.5), D(25, 2.5), D(18, 5), D(11, 5), D(4, 5)],
    pesos: [{ id: "p1", data: d(21), kg: 101, cintura: 118 }, { id: "p2", data: d(0), kg: 96.5, cintura: 114 }],
    sintomas: [{ id: "s1", data: d(3), enjoo: 2, intestino: "Preso", refluxo: true, tontura: true, cansaco: true }, { id: "s2", data: d(1), enjoo: 0, intestino: "Normal", dor: true }],
    treinos: [{ id: "t1", data: d(2), tipo: "A", local: "casa" }] }, extra || {}));
  Object.assign(e.perfil, { peso: 101, vesicula: true, aguardaCirurgia: true, figado: true });
  e.ui = Object.assign({ puPerguntas: true }, extra && extra.ui);
  return e;
}

// Devolve a lista do que está errado na página inteira (tela, topo, barra, folha e diálogo abertos).
function problemas() {
  const ruins = [], W = innerWidth;
  const visivel = el => { const s = getComputedStyle(el); return el.getClientRects().length && s.visibility !== "hidden" && s.display !== "none"; };
  const desc = el => el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (typeof el.className === "string" && el.className ? "." + el.className.trim().split(/\s+/)[0] : "") + ' "' + (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 28) + '"';
  const rolaDeLado = el => { for (let x = el.parentElement; x; x = x.parentElement) if (/auto|scroll/.test(getComputedStyle(x).overflowX) && x.scrollWidth > x.clientWidth + 1) return true; return false; };
  for (const el of document.body.querySelectorAll("*")) {
    if (el.closest("svg, [hidden], details:not([open]) > :not(summary), script, style, template") || !visivel(el)) continue;
    const b = el.getBoundingClientRect(), s = getComputedStyle(el);
    if (!b.width || !b.height) continue;
    const oxs = /auto|scroll/.test(s.overflowX);
    if (s.display !== "inline" && !oxs && el.scrollWidth - el.clientWidth > 1 && el.tagName !== "TEXTAREA") ruins.push("corta na largura: " + desc(el) + " " + el.scrollWidth + ">" + el.clientWidth);
    if (s.overflowY === "hidden" && el.scrollHeight - el.clientHeight > 1) ruins.push("corta na altura: " + desc(el));
    if (!rolaDeLado(el) && (b.right > W + 0.5 || b.left < -0.5)) ruins.push("sai da tela: " + desc(el) + " " + Math.round(b.left) + ".." + Math.round(b.right));
    const c = el.parentElement && el.parentElement.closest(".cartao");
    if (c && !rolaDeLado(el)) { const cb = c.getBoundingClientRect(); if (b.right > cb.right + 0.5 || b.left < cb.left - 0.5) ruins.push("sai do cartão: " + desc(el)); }
    if (/flex|grid/.test(s.display)) {
      const fs = [...el.children].filter(visivel).map(x => [x, x.getBoundingClientRect()]).filter(x => x[1].width && x[1].height && getComputedStyle(x[0]).position !== "absolute");
      for (let i = 0; i < fs.length; i++) for (let j = i + 1; j < fs.length; j++) {
        const a = fs[i][1], z = fs[j][1];
        if (Math.min(a.right, z.right) - Math.max(a.left, z.left) > 1 && Math.min(a.bottom, z.bottom) - Math.max(a.top, z.top) > 1) ruins.push("sobrepõe: " + desc(fs[i][0]) + " e " + desc(fs[j][0]));
      }
    }
  }
  return [...new Set(ruins)];
}
async function conferir(t, nome) {
  const p = t.p;
  await p.waitForTimeout(50);
  await t.semRolagem(nome);
  const r = await p.evaluate(problemas);
  ok(r.length === 0, "letra 1,5: nada corta, sai ou sobrepõe em " + nome + (r.length ? ": " + r.slice(0, 6).join("; ") : ""));
  await t.alvosDeToque(nome);
  // A barra de baixo cresce com a letra: rolada até o fim, a tela termina acima dela.
  const fim = await p.evaluate(() => { const a = document.getElementById("abas"), u = document.getElementById("tela").lastElementChild;
    if (a.hidden || !u || !document.getElementById("folha").hidden) return null; window.scrollTo(0, document.documentElement.scrollHeight);
    return [Math.round(u.getBoundingClientRect().bottom), Math.round(a.getBoundingClientRect().top)]; });
  if (fim) ok(fim[0] <= fim[1], "a barra de baixo não cobre o fim de " + nome + " (" + fim[0] + " <= " + fim[1] + ")");
}

(async () => {
  for (const escuro of [false, true]) {
    const tema = escuro ? " (escuro)" : "", sufixo = escuro ? "-escuro" : "";
    const abre = o => abrir(Object.assign({ largura: LARGURA, altura: 900, escuro, letra: LETRA }, o));

    // A simulação funciona: a letra do corpo e a de um texto em px cresceram 1,5 vez.
    let t = await abre({ estado: estado() }), p = t.p;
    await p.waitForSelector("text=Proteína hoje");
    const fs = await p.evaluate(() => [parseFloat(getComputedStyle(document.body).fontSize), parseFloat(getComputedStyle(document.querySelector("#topo h1")).fontSize)]);
    ok(fs[0] === 17 * LETRA && fs[1] === 20 * LETRA, "letra 1,5 simulada: corpo " + fs[0] + " px e título " + fs[1] + " px" + tema);

    // Hoje, rolada inteira (a captura é da página inteira)
    await conferir(t, "Hoje" + tema); await t.foto("letra15-hoje" + sufixo);
    await p.click("[data-ac=sinaisDor]"); await p.waitForSelector("#folha:not([hidden])");
    await conferir(t, "folha Dor na barriga" + tema); await vista(t, "letra15-folha-dor" + sufixo);
    await p.click("#folha [data-ac=fecharFolha]");
    await p.click("[data-aviso=ritmo] [data-ac=verRitmo]"); await p.waitForSelector("#folha:not([hidden])");
    await conferir(t, "folha Ritmo de perda" + tema); await vista(t, "letra15-folha-ritmo" + sufixo);
    await p.click("#folha [data-ac=fecharFolha]");

    // Semana, Painel, Comer, Mover, Guia, Perfil
    const ir = async (aba, espera) => { await p.goto(p.url().replace(/#.*$/, "") + "#" + aba); await p.waitForSelector(espera); };
    await ir("semana", ".semana-atual"); await p.locator("#semana-anteriores details summary").first().click();
    await conferir(t, "Semana" + tema); await t.foto("letra15-semana" + sufixo);
    await ir("painel", ".painel-hoje"); await p.click("details[data-tabela=prot] summary");
    await conferir(t, "Painel" + tema); await t.foto("letra15-painel" + sufixo);
    await ir("plano", "#tela .cartao"); await conferir(t, "Comer > Plano" + tema); await t.foto("letra15-plano" + sufixo);
    await ir("caminhos", "#tela .cartao"); await conferir(t, "Comer > Caminhos" + tema); await t.foto("letra15-caminhos" + sufixo);
    await ir("treino", "#tela .cartao"); await conferir(t, "Mover" + tema); await t.foto("letra15-mover" + sufixo);
    await ir("guia", "#tela .cartao"); await p.locator("#tela details summary").first().click();
    await conferir(t, "Guia" + tema); await t.foto("letra15-guia" + sufixo);
    await p.click("#btn-perfil"); await p.waitForSelector("form[data-form=perfil]");
    await conferir(t, "Perfil" + tema); await t.foto("letra15-perfil" + sufixo);
    await p.click("[data-ac=abrirNaoGosta]"); await p.waitForSelector("#folha:not([hidden])");
    await conferir(t, "folha Não gosto" + tema); await vista(t, "letra15-folha-naogosta" + sufixo);
    await p.click("#folha [data-ac=fecharFolha]");
    await p.evaluate(() => AC.cifAbrirTroca()); await p.waitForSelector("#folha:not([hidden])");
    await conferir(t, "folha Trocar PIN" + tema); await vista(t, "letra15-folha-pin" + sufixo);
    await p.click("#folha [data-ac=fecharFolha]");

    // Diário: as quatro partes e o diálogo de apagar tudo
    for (const [sub, nomeSub] of [["doses", "Aplicações"], ["peso", "Peso"], ["sintomas", "Sintomas"], ["relatorio", "Relatório"]]) {
      await ir("diario", "#tela .chips"); await p.click("#tela .chips [data-v=" + sub + "]"); await p.waitForTimeout(50);
      await conferir(t, "Diário > " + nomeSub + tema); await t.foto("letra15-diario-" + sub + sufixo);
    }
    await p.click("[data-ac=zerar]"); await p.waitForSelector("#dialogo:not([hidden])");
    await conferir(t, "diálogo Apagar tudo" + tema); await vista(t, "letra15-dialogo" + sufixo);
    await t.nao();
    await t.fechar();

    // Faixa "O app ganhou três perguntas" em Hoje (perfil antigo, sem as três respostas)
    const antigo = estado(); delete antigo.ui.puPerguntas; antigo.perfil.vesicula = null; antigo.perfil.figado = null; antigo.perfil.aguardaCirurgia = null;
    t = await abre({ estado: antigo }); p = t.p;
    await p.waitForSelector("[data-ac=puResponder]");
    await conferir(t, "Hoje com a faixa das perguntas novas" + tema); await t.foto("letra15-faixa" + sufixo);
    await t.fechar();

    // Primeiro uso: entrada e formulário
    t = await abre({}); p = t.p;
    await p.waitForSelector("[data-ac=entradaContinuar]");
    await conferir(t, "entrada" + tema); await t.foto("letra15-entrada" + sufixo);
    await p.click("[data-ac=entradaContinuar]"); await p.waitForSelector("form[data-form=perfil]");
    await p.click("form[data-form=perfil] [data-pu=vesicula] label.opcao:has(input[value=sim])");
    await conferir(t, "primeiro uso" + tema); await t.foto("letra15-primeiro-uso" + sufixo);
    await t.fechar();

    // PIN: criar, código de recuperação, conferir o código e entrar
    t = await abre({ comPin: true, estado: estado() }); p = t.p;
    const titulo = x => p.waitForFunction(s => { const h = document.querySelector("#tela h2"); return h && h.textContent.indexOf(s) >= 0; }, x, { timeout: 20000 });
    const digitar = async (form, valor, campo) => { await p.fill("form[data-form=" + form + "] [name=" + (campo || "pin") + "]", valor); await p.click("form[data-form=" + form + "] button[type=submit]"); };
    await titulo("Crie um PIN"); await conferir(t, "PIN criar" + tema); await t.foto("letra15-pin-criar" + sufixo);
    await digitar("cifCriar", "246810"); await titulo("Digite o PIN de novo"); await digitar("cifRepetir", "246810");
    await titulo("Código de recuperação"); await conferir(t, "PIN código" + tema); await t.foto("letra15-pin-codigo" + sufixo);
    const cod = (await p.locator("#cif-codigo").textContent()).trim().split(/\s+/);
    await p.click("[data-ac=cifAnotei]"); await titulo("Confira o que anotou");
    await conferir(t, "PIN conferir código" + tema);
    const n = Number((await p.locator("form[data-form=cifConfirmar] .sub").textContent()).match(/grupo (\d)/)[1]);
    await digitar("cifConfirmar", cod[n - 1], "grupo");
    await p.waitForFunction(() => !document.querySelector(".cif-portao"), null, { timeout: 20000 });
    await p.reload(); await titulo("Digite o seu PIN");
    await conferir(t, "PIN entrar" + tema); await t.foto("letra15-pin-entrar" + sufixo);
    await t.fechar();
  }
})();
