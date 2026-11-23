// Dias do Plano e sub-abas do Diário na largura do Redmi Note 13 Pro (440 px), com letra 1,0, 1,3 e 1,5, claro e escuro.
// Teste final do APK 2.0, M4: "Enjoo" ficava fora da faixa de dias já com letra 1,0, e nada mostrava que dava para arrastar.
// A letra do sistema chega à WebView por setTextZoom (MainActivity.java), que aumenta o tamanho da letra sem mudar a largura.
// Aqui isso é simulado multiplicando o font-size calculado de cada elemento (atributo style; a CSP proíbe <style> injetado).
// Confere: sem rolagem horizontal; nenhum botão das faixas sai da faixa ou da tela; nenhum texto de botão ou sub-aba corta;
// alvos de toque com 44 px.
const { abrir, ok, estadoBase } = require("./apoio");
async function letra(p, z) {
  await p.evaluate(z => {
    const els = [...document.querySelectorAll("body *")], fs = els.map(e => parseFloat(getComputedStyle(e).fontSize));
    els.forEach((e, i) => e.style.setProperty("font-size", fs[i] * z + "px", "important"));
  }, z);
}
async function conferir(t, nome) {
  const r = await t.p.evaluate(() => {
    const ruins = [], vw = document.documentElement.clientWidth;
    document.querySelectorAll("#tela .chips-dias, #tela .chips-abas").forEach(c => {
      const cb = c.getBoundingClientRect();
      if (c.scrollWidth > c.clientWidth + 1) ruins.push("faixa rola escondida: " + c.className + " " + c.scrollWidth + ">" + c.clientWidth);
      [...c.children].forEach(b => {
        const r = b.getBoundingClientRect(), txt = b.textContent.trim();
        if (r.left < cb.left - 0.5 || r.right > cb.right + 0.5 || r.right > vw) ruins.push("fora da faixa: " + txt + " (" + Math.round(r.left) + "-" + Math.round(r.right) + ")");
        if (b.scrollWidth > b.clientWidth + 1) ruins.push("texto corta: " + txt);
      });
    });
    document.querySelectorAll("#subabas a").forEach(a => { if (a.scrollWidth > a.clientWidth + 1) ruins.push("sub-aba corta: " + a.textContent.trim()); });
    return ruins;
  });
  ok(r.length === 0, "dias e sub-abas inteiros à vista em " + nome + (r.length ? ": " + r.slice(0, 5).join("; ") : ""));
  await t.semRolagem(nome); await t.alvosDeToque(nome);
}
(async () => {
  for (const escuro of [false, true]) for (const z of [1, 1.3, 1.5]) for (const aba of ["plano", "diario"]) {
    const nome = aba + " 440 px letra " + String(z).replace(".", ",") + (escuro ? " escuro" : " claro");
    const t = await abrir({ estado: estadoBase(), aba, largura: 440, escuro }), p = t.p;
    const faixa = aba === "plano" ? "#tela .chips-dias" : "#tela .chips-abas";
    await p.waitForSelector(faixa);
    ok(await p.locator(faixa + " button").count() === (aba === "plano" ? 8 : 4), nome + ": faixa com todos os botões");
    await letra(p, z);
    const fs = await p.evaluate(s => parseFloat(getComputedStyle(document.querySelector(s + " button")).fontSize), faixa);
    ok(fs > 16 * z - 0.5, nome + ": a letra cresceu (" + fs + " px)");
    await conferir(t, nome);
    if (aba === "plano") {
      ok(await p.evaluate(() => { const b = document.querySelector("[data-ac=diaPlano][data-i='7']").getBoundingClientRect(); return b.left >= 0 && b.right <= document.documentElement.clientWidth; }), nome + ": \"Enjoo\" à vista sem arrastar");
      await p.locator("[data-ac=diaPlano][data-i='7']").scrollIntoViewIfNeeded();
      if (z === 1 && !escuro) await t.foto("plano-dias-440");
    } else if (z === 1.5) await t.foto("diario-abas-440-letra-15" + (escuro ? "-escuro" : ""));
    await t.fechar();
  }
})();
