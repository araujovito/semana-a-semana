// Soma macros e micros de cada dia do cardapio base. Uso: node dados/conferir_cardapio.js [fator]
const fs = require("fs"), path = require("path");
const window = {};
for (const f of ["alimentos.js", "cardapio.js"]) eval(fs.readFileSync(path.join(__dirname, "..", "app", f), "utf8"));
const fator = parseFloat(process.argv[2] || "1");
const campos = ["kcal","prot","gord","carb","fibra","ca","fe","mg","zn","k","vitc","vita","b1","b12","vitd","folato","vite","vitk"];
const meta = {kcal:1350,prot:100,gord:45,carb:135,fibra:25,ca:1000,fe:18,mg:320,zn:8,k:2600,vitc:75,vita:700,b1:1.1,b12:2.4,vitd:15,folato:400,vite:15,vitk:90};
const dias = [...window.CARDAPIO.dias, window.CARDAPIO.nausea];
const media = {}; campos.forEach(c => media[c] = 0);
console.log("dia".padEnd(13) + campos.map(c => c.padStart(7)).join(""));
for (const d of dias) {
  const t = {}; campos.forEach(c => t[c] = 0);
  for (const r of d.refeicoes) for (const [k, g] of r.itens) {
    const a = window.ALIMENTOS[k]; if (!a) throw new Error("alimento inexistente: " + k);
    campos.forEach(c => t[c] += a[c] * g * fator / 100);
  }
  if (d !== window.CARDAPIO.nausea) campos.forEach(c => media[c] += t[c] / 7);
  console.log(d.nome.padEnd(13) + campos.map(c => t[c].toFixed(t[c] < 10 ? 1 : 0).padStart(7)).join(""));
}
console.log("MEDIA".padEnd(13) + campos.map(c => media[c].toFixed(media[c] < 10 ? 1 : 0).padStart(7)).join(""));
console.log("% da meta".padEnd(13) + campos.map(c => (100 * media[c] / meta[c]).toFixed(0).padStart(7)).join(""));
