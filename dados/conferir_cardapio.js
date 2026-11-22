// Soma macros e micros de cada dia do cardapio base. Uso: node dados/conferir_cardapio.js [fator]
// A coluna "gramas" e o peso total de comida e bebida do dia (o volume conta: o apetite dela esta baixo).
// Tambem serve de modulo para o teste: require("../../dados/conferir_cardapio").conferir(fator).
// Regras de vesicula e figado (REGRAS_CARDAPIO, em app/cardapio.js), com o cardapio ja escalado para um perfil:
//   node dados/conferir_cardapio.js --perfil sexo=F,altura=158,peso=120,idade=45,atividade=1.2[,metaKcal=..,metaProt=..,naoCome=peixe+ovo]
// Mostra gordura e kcal de cada refeicao, % de gordura, fibra e peixe, e sai com erro se alguma regra falhar.
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

/* ---------- regras de vesicula e figado ---------- */
/* plano: lista de dias no formato de planoDoDia() do app ({ nome, refeicoes: [{ tipo, titulo, preparo, itens: [{ k, g }] }] }),
   os 7 dias e, se vier, o dia de enjoo na posicao 7. opcoes.peixe: false quando o perfil nao come peixe (a regra nao se aplica).
   Devolve { problemas: [texto], acimaDoAlvo: [texto], dias: [{ nome, kcal, gord, prot, fibra, pctGord, refeicoes: [{ tipo, kcal, gord, azeite }] }], peixe }. */
function conferirRegras(plano, A, RG, opcoes) {
  const o = opcoes || {}, problemas = [], acimaDoAlvo = [];
  let peixe = 0;
  const dias = plano.map((d, i) => {
    const enjoo = i === 7, t = { nome: d.nome, kcal: 0, gord: 0, prot: 0, fibra: 0, refeicoes: [] };
    let temPeixe = false;
    d.refeicoes.forEach(r => {
      const m = { tipo: r.tipo, kcal: 0, gord: 0, azeite: 0 };
      r.itens.forEach(it => {
        const a = A[it.k]; m.kcal += a.kcal * it.g / 100; m.gord += a.gord * it.g / 100;
        t.prot += a.prot * it.g / 100; t.fibra += a.fibra * it.g / 100;
        if (RG.gordurasDeAdicao.indexOf(it.k) >= 0) m.azeite += it.g;
        if ((a.contem || []).indexOf("peixe") >= 0) temPeixe = true;
      });
      t.kcal += m.kcal; t.gord += m.gord; t.refeicoes.push(m);
      const onde = d.nome + " / " + r.tipo + ": ";
      if (m.gord > RG.gordTetoRefeicao.valor) problemas.push(onde + m.gord.toFixed(1) + " g de gordura, acima do teto de " + RG.gordTetoRefeicao.valor + " g (R4)");
      else if (m.gord > RG.gordAlvoRefeicao.valor) acimaDoAlvo.push(onde + m.gord.toFixed(1) + " g de gordura (alvo até " + RG.gordAlvoRefeicao.valor + " g)");
      if (m.azeite > RG.azeiteMaxRefeicao.valor) problemas.push(onde + m.azeite + " g de azeite ou óleo, acima de " + RG.azeiteMaxRefeicao.valor + " g (R4)");
      if (m.kcal > RG.kcalMaxRefeicao.valor) problemas.push(onde + m.kcal.toFixed(0) + " kcal, acima de " + RG.kcalMaxRefeicao.valor + " (R5)");
      if (!enjoo && RG.principais.indexOf(r.tipo) >= 0 && m.gord < RG.gordMinPrincipal.valor) problemas.push(onde + m.gord.toFixed(1) + " g de gordura, abaixo do mínimo de " + RG.gordMinPrincipal.valor + " g numa refeição principal (R3)");
      const texto = (r.titulo || "") + " " + (r.preparo || "");
      if (/frit/i.test(texto.replace(/sem fritura/ig, ""))) problemas.push(onde + "fala em fritura (R6)");
      if (/açúcar|acucar/i.test(texto.replace(/sem açúcar/ig, ""))) problemas.push(onde + "fala em açúcar (R8)");
    });
    t.pctGord = 100 * t.gord * 9 / t.kcal;
    const maior = Math.max.apply(null, t.refeicoes.map(m => m.gord)), onde = d.nome + ": ";
    if (enjoo) {
      if (maior < RG.enjooGordUmaRefeicao.valor) problemas.push(onde + "nenhuma refeição com " + RG.enjooGordUmaRefeicao.valor + " g de gordura ou mais (maior: " + maior.toFixed(1) + " g)");
      if (t.gord < RG.enjooGordMinDia.valor) problemas.push(onde + t.gord.toFixed(0) + " g de gordura no dia, abaixo de " + RG.enjooGordMinDia.valor + " g");
    } else {
      if (temPeixe) peixe++;
      if (maior < RG.gordMinUmaRefeicao.valor) problemas.push(onde + "nenhuma refeição com " + RG.gordMinUmaRefeicao.valor + " g de gordura ou mais (R3)");
      if (t.gord < RG.gordMinDia.valor) problemas.push(onde + t.gord.toFixed(0) + " g de gordura no dia, abaixo de " + RG.gordMinDia.valor + " g (R3)");
      if (t.pctGord < RG.pctGordDia.min || t.pctGord > RG.pctGordDia.max) problemas.push(onde + "gordura em " + t.pctGord.toFixed(0) + "% da energia, fora de " + RG.pctGordDia.min + " a " + RG.pctGordDia.max + "% (R4)");
      if (t.fibra < RG.fibraMinDia.valor) problemas.push(onde + t.fibra.toFixed(1) + " g de fibra, abaixo de " + RG.fibraMinDia.valor + " g (R12)");
    }
    return t;
  });
  if (o.peixe !== false && peixe < RG.peixeMinSemana.valor) problemas.push("peixe em " + peixe + " dias da semana, abaixo de " + RG.peixeMinSemana.valor + " (R11)");
  return { problemas, acimaDoAlvo, dias, peixe };
}

/* Carrega o app (sem tela) com um perfil e devolve os 8 planos do dia ja escalados, as metas e a media da semana.
   perfil: { sexo, altura, peso, idade ou nascimento, atividade, metaKcal, metaProt, naoCome, naoGosta }. */
function planosDoPerfil(perfil) {
  const p = Object.assign({ nome: "", sexo: "F", altura: 160, peso: 80, atividade: 1.2, metaKcal: null, metaProt: null, metaAgua: null,
    diabetes: null, insulinaSulf: null, pilula: null, naoCome: [], naoGosta: [] }, perfil);
  if (p.nascimento == null) p.nascimento = new Date().getFullYear() - (p.idade || 36);
  delete p.idade;
  const app = require("../testes/carregar-app")({ v: 2, perfil: p, doses: [], pesos: [], sintomas: [], treinos: [], dias: {}, trocas: {}, caneta: null, suplementos: [], exames: [], lembretes: {}, ui: {} });
  const j = c => JSON.parse(app.v("JSON.stringify(" + c + ")"));
  return { app, metas: j("metas()"), media: j("mediaSemana()"), planos: j("[0,1,2,3,4,5,6,7].map(planoDoDia)"), A: j("A"), regras: j("REGRAS_CARDAPIO") };
}
function conferirPerfil(perfil) {
  const x = planosDoPerfil(perfil), semPeixe = (perfil.naoCome || []).some(r => r === "peixe" || r === "vegetariana");
  return Object.assign(x, conferirRegras(x.planos, x.A, x.regras, { peixe: !semPeixe }));
}

module.exports = { conferir, CAMPOS, META, conferirRegras, planosDoPerfil, conferirPerfil };

if (require.main === module && process.argv[2] === "--perfil") {
  const perfil = {};
  (process.argv[3] || "").split(",").filter(Boolean).forEach(par => {
    const [k, v] = par.split("=");
    perfil[k] = k === "sexo" ? v : (k === "naoCome" || k === "naoGosta") ? v.split("+") : Number(v);
  });
  const r = conferirPerfil(perfil), f = (v, n) => v.toFixed(n || 0).padStart(7);
  console.log("meta " + r.metas.kcal + " kcal e " + r.metas.prot + " g de proteína; fatores prot " + r.metas.fatorProt + ", energia " + r.metas.fatorDias.join("/"));
  console.log("dia".padEnd(13) + r.dias[0].refeicoes.map(m => m.tipo.slice(0, 13).padStart(16)).join("") + "    kcal   gord  %gord  fibra   prot");
  r.dias.forEach(d => console.log(d.nome.padEnd(13) + d.refeicoes.map(m => (m.gord.toFixed(1) + " g " + m.kcal.toFixed(0)).padStart(16)).join("") + f(d.kcal) + f(d.gord) + f(d.pctGord) + f(d.fibra, 1) + f(d.prot)));
  const sem = r.dias.slice(0, 7), maxG = Math.max.apply(null, [].concat.apply([], sem.map(d => d.refeicoes.map(m => m.gord)))), maxK = Math.max.apply(null, [].concat.apply([], sem.map(d => d.refeicoes.map(m => m.kcal))));
  console.log("média da semana: " + r.media.kcal.toFixed(0) + " kcal, " + r.media.prot.toFixed(0) + " g de proteína, " + r.media.fibra.toFixed(1) + " g de fibra; peixe em " + r.peixe + " dias");
  console.log("maior gordura numa refeição: " + maxG.toFixed(1) + " g; maior refeição: " + maxK.toFixed(0) + " kcal; % de gordura do dia: " + Math.min.apply(null, sem.map(d => d.pctGord)).toFixed(0) + " a " + Math.max.apply(null, sem.map(d => d.pctGord)).toFixed(0) + "%");
  r.acimaDoAlvo.forEach(t => console.log("acima do alvo: " + t));
  r.problemas.forEach(t => console.log("PROBLEMA: " + t));
  process.exit(r.problemas.length ? 1 : 0);
} else if (require.main === module) {
  const r = conferir(parseFloat(process.argv[2] || "1"));
  const cols = ["gramas"].concat(CAMPOS);
  const linha = (nome, t) => nome.padEnd(13) + cols.map(c => t[c].toFixed(t[c] < 10 ? 1 : 0).padStart(7)).join("");
  console.log("dia".padEnd(13) + cols.map(c => c.padStart(7)).join(""));
  r.dias.forEach(d => console.log(linha(d.nome, d)));
  console.log(linha("MEDIA", r.media));
  console.log("% da meta".padEnd(13) + "".padStart(7) + CAMPOS.map(c => (100 * r.media[c] / META[c]).toFixed(0).padStart(7)).join(""));
}
