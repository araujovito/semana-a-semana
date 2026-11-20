// Soma macros e micros de cada dia do cardapio base. Uso: node dados/conferir_cardapio.js [fator]
// A coluna "gramas" e o peso total de comida e bebida do dia (o volume conta: o apetite dela esta baixo).
// Tambem serve de modulo para o teste: require("../../dados/conferir_cardapio").conferir(fator).
const fs = require("fs"), path = require("path");
const CAMPOS = ["kcal","prot","gord","carb","fibra","ca","fe","mg","zn","k","vitc","vita","b1","b12","vitd","folato","vite","vitk"];
// Metas de referencia de uma mulher adulta de ate 50 anos (as do app mudam com o perfil; ver metas() em app/nutricao.js).
const META = {kcal:1350,prot:100,gord:45,carb:135,fibra:25,ca:1000,fe:18,mg:320,zn:8,k:2600,vitc:75,vita:700,b1:1.1,b12:2.4,vitd:15,folato:400,vite:15,vitk:90};

function carregar() {
  const window = {};
  for (const f of ["alimentos.js", "cardapio.js"]) eval(fs.readFileSync(path.join(__dirname, "..", "app", f), "utf8"));
  return window;
}
/* Devolve { dias: [{ nome, gramas, kcal, ... }] (7 dias + dia de enjoo), media: { gramas, kcal, ... } (so os 7 dias) }. */
function conferir(fator) {
  const w = carregar(), f = fator || 1;
  const media = { gramas: 0 }; CAMPOS.forEach(c => media[c] = 0);
  const dias = [...w.CARDAPIO.dias, w.CARDAPIO.nausea].map(d => {
    const t = { nome: d.nome, gramas: 0 }; CAMPOS.forEach(c => t[c] = 0);
    for (const r of d.refeicoes) for (const [k, g] of r.itens) {
      const a = w.ALIMENTOS[k]; if (!a) throw new Error("alimento inexistente: " + k);
      t.gramas += g * f;
      CAMPOS.forEach(c => t[c] += a[c] * g * f / 100);
    }
    if (d !== w.CARDAPIO.nausea) ["gramas"].concat(CAMPOS).forEach(c => media[c] += t[c] / 7);
    return t;
  });
  return { dias, media, alimentos: w.ALIMENTOS, cardapio: w.CARDAPIO };
}
module.exports = { conferir, CAMPOS, META };

if (require.main === module) {
  const r = conferir(parseFloat(process.argv[2] || "1"));
  const cols = ["gramas"].concat(CAMPOS);
  const linha = (nome, t) => nome.padEnd(13) + cols.map(c => t[c].toFixed(t[c] < 10 ? 1 : 0).padStart(7)).join("");
  console.log("dia".padEnd(13) + cols.map(c => c.padStart(7)).join(""));
  r.dias.forEach(d => console.log(linha(d.nome, d)));
  console.log(linha("MEDIA", r.media));
  console.log("% da meta".padEnd(13) + "".padStart(7) + CAMPOS.map(c => (100 * r.media[c] / META[c]).toFixed(0).padStart(7)).join(""));
}
