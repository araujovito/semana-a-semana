// Letra grande nas telas Painel e Semana: com o tamanho de fonte do sistema em 130% e 160% (simulado com font-size no html e o
// corpo do texto em 1rem, como ficaria se estilo.css também usasse rem), em 320 px nada corta nem sobrepõe.
// Confere: sem rolagem horizontal; nenhum elemento da tela com conteúdo maior que a própria caixa (corte); nenhum elemento passa da
// borda do seu cartão; filhos lado a lado nas grades e linhas (anéis, números, itens da semana, chips, títulos) não se sobrepõem;
// alvos de toque continuam com 44 px.
const { abrir, ok, d, estadoBase } = require("./apoio");
function estado(discreto) {
  const dias = {};
  for (let n = 0; n < 30; n++) if (n % 6 !== 2) dias[d(n)] = { enjoo: n === 3, comido: [{ q: 1 }, { q: 1 }, { q: 1 }, { q: 1 }, { q: 1 }], agua: 0, protExtra: n % 5 ? 0 : 20, caminhada: 0 };
  const D = (n, mg) => ({ id: "d" + n, data: d(n), mg, local: "Abdômen esquerdo", obs: "" });
  const e = estadoBase({ dias, doses: [D(39, 2.5), D(32, 2.5), D(25, 2.5), D(18, 5), D(9, 5), D(4, 5)],
    pesos: [{ id: "p1", data: d(30), kg: 120.4, cintura: null }, { id: "p2", data: d(2), kg: 116.4, cintura: null }],
    sintomas: [{ id: "s1", data: d(3), enjoo: 2, intestino: "Preso", refluxo: true, tontura: true, cansaco: true }, { id: "s2", data: d(1), enjoo: 0, intestino: "Normal", dor: true }] });
  e.perfil.discreto = !!discreto;
  e.ui.painelPeriodo = 30;
  return e;
}
async function conferir(t, nome) {
  const p = t.p;
  await t.semRolagem(nome);
  const r = await p.evaluate(() => {
    const tela = document.querySelector("#tela"), ruins = [];
    const desc = el => (el.tagName.toLowerCase() + (el.className && typeof el.className === "string" ? "." + el.className.split(" ")[0] : "") + " \"" + (el.textContent || "").trim().slice(0, 24) + "\"");
    tela.querySelectorAll("*").forEach(el => {
      if (el.closest("svg") || el.closest("details:not([open]) > :not(summary)")) return;
      const b = el.getBoundingClientRect(); if (!b.width || !b.height) return;
      if (el.scrollWidth - el.clientWidth > 1 && getComputedStyle(el).display !== "inline") ruins.push("corta: " + desc(el) + " " + el.scrollWidth + ">" + el.clientWidth);
      const c = el.closest(".cartao");
      if (c && c !== el) { const cb = c.getBoundingClientRect(); if (b.right > cb.right + 0.5 || b.left < cb.left - 0.5) ruins.push("sai do cartão: " + desc(el)); }
    });
    document.querySelectorAll(".painel-aneis, .painel-numeros, .painel-chips, .painel-periodo .linha, .painel-anel, .semana-itens li, .semana-atual > .linha, .semana-marcas, .painel-legenda, .botoes").forEach(g => {
      const fs = [...g.children].filter(x => x.getBoundingClientRect().width > 0).map(x => [x, x.getBoundingClientRect()]);
      for (let i = 0; i < fs.length; i++) for (let j = i + 1; j < fs.length; j++) {
        const a = fs[i][1], b = fs[j][1];
        if (Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1) ruins.push("sobrepõe: " + desc(fs[i][0]) + " e " + desc(fs[j][0]));
      }
    });
    return ruins;
  });
  ok(r.length === 0, "nada corta nem sobrepõe em " + nome + (r.length ? ": " + r.slice(0, 5).join("; ") : ""));
  await t.alvosDeToque(nome);
}
(async () => {
  for (const tam of [130, 160]) for (const discreto of [false, true]) {
    const rot = tam + "%" + (discreto ? " discreto" : "");
    for (const aba of ["painel", "semana"]) {
      const t = await abrir({ estado: estado(discreto), aba, largura: 320 }), p = t.p;
      await p.addStyleTag({ content: "html { font-size: " + tam + "% !important; } body { font-size: 1rem !important; }" });
      await p.waitForSelector(aba === "painel" ? ".painel-hoje" : ".semana-atual");
      const fs = await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector(".painel-num, .semana-itens li")).fontSize));
      ok(fs > (aba === "painel" ? 22 : 15) * (tam / 100) - 0.5, aba + " " + rot + ": a letra da tela cresceu (" + fs + " px)");
      if (aba === "painel") { await p.click("details[data-tabela=prot] summary"); await conferir(t, "painel " + rot + " (30 dias, tabela aberta)"); }
      else { await p.locator("#semana-anteriores details summary").first().click(); await conferir(t, "semana " + rot); }
      if (tam === 160 && !discreto) await t.foto(aba + "-letra-160");
      await t.fechar();
    }
  }
})();
