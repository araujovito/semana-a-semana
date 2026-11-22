// Monta as páginas do protótipo: cada fonte/*.html recebe o CSS, os ícones e a barra de abas embutidos,
// para que cada página final (prototipo/*.html) abra sozinha, sem nenhum arquivo ao lado e sem nada de fora.
// Uso: node prototipo/fonte/montar.js
const fs = require("fs"), path = require("path");
const F = __dirname, SAI = path.join(F, "..");
const css = fs.readFileSync(path.join(F, "base.css"), "utf8"), icones = fs.readFileSync(path.join(F, "icones.svg"), "utf8");
const ABAS = [["hoje", "Hoje"], ["semana", "Semana"], ["comer", "Comer"], ["mover", "Mover"], ["guia", "Guia"]];
const abas = ativa => '<nav class="abas" aria-label="Seções">' + ABAS.map(([id, n]) =>
  '<a href="#"' + (id === ativa ? ' class="ativa" aria-current="page"' : "") + '><svg class="ic" aria-hidden="true"><use href="#i-' + id + '"/></svg>' + n + "</a>").join("") + "</nav>";
for (const nome of fs.readdirSync(F).filter(n => n.endsWith(".html"))) {
  let h = fs.readFileSync(path.join(F, nome), "utf8");
  h = h.replace("<!--CSS-->", "<style>\n" + css + "</style>").replace("<!--ICONES-->", icones).replace(/<!--ABAS:(\w+)-->/, (_, a) => abas(a));
  h = h.replace(/^<!doctype html>/i, m => m + "\n<!-- Gerado por fonte/montar.js a partir de fonte/" + nome + ". Edite a fonte. -->");
  fs.writeFileSync(path.join(SAI, nome), h);
  console.log("montou", nome);
}
