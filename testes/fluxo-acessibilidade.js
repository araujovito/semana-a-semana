// Acessibilidade: contraste de componentes (WCAG 1.4.11) e rótulos para leitor de tela.
// Relatório: empresa/relatorios/acessibilidade-contraste.md. Contas com as cores computadas pelo navegador.
const { abrir, ok, estadoBase } = require("./apoio");
const razaoNaPagina = () => {
  // devolve funções no navegador: cor computada -> [r,g,b] e razão de contraste
  window.__rgb = c => c.match(/[\d.]+/g).slice(0, 3).map(Number);
  window.__razao = (a, b) => {
    const L = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
    const x = L(a), y = L(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  };
};
(async () => {
  for (const escuro of [false, true]) {
    const modo = escuro ? " (escuro)" : " (claro)";
    const t = await abrir({ estado: estadoBase({ ui: { diario: "peso" } }), aba: "diario", largura: 440, escuro }), p = t.p;
    await p.waitForSelector("form[data-form=peso] input[name=kg]");
    await p.evaluate(razaoNaPagina);
    // Campo de texto: o contorno é o que mostra onde tocar. Precisa de 3:1 com o cartão e com o fundo do próprio campo.
    const r = await p.evaluate(() => {
      const el = document.querySelector("form[data-form=peso] input[name=kg]"), s = getComputedStyle(el), c = getComputedStyle(el.closest(".cartao"));
      const borda = __rgb(s.borderTopColor);
      return { cartao: __razao(borda, __rgb(c.backgroundColor)), campo: __razao(borda, __rgb(s.backgroundColor)) };
    });
    ok(r.cartao >= 3 && r.campo >= 3, "contorno do campo de texto com 3:1 ou mais" + modo + ": " + r.cartao.toFixed(2) + " com o cartão, " + r.campo.toFixed(2) + " com o fundo do campo");
    await t.fechar();
  }
})();
