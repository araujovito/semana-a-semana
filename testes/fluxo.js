// Roda todos os testes de ponta a ponta (testes/fluxo-*.js), um de cada vez. Uso igual ao de sempre:
//   node testes/fluxo.js <caminho do playwright-core> <executavel do chromium> [pasta de capturas]
const fs = require("fs"), path = require("path"), { spawnSync } = require("child_process");
let falhas = 0;
for (const f of fs.readdirSync(__dirname).filter(n => /^fluxo-.*\.js$/.test(n)).sort()) {
  console.log("== " + f);
  const r = spawnSync(process.execPath, [path.join(__dirname, f)].concat(process.argv.slice(2)), { stdio: "inherit" });
  if (r.status !== 0) { falhas++; console.log("FALHOU: " + f + " terminou com erro"); }
}
console.log(falhas ? "PONTA A PONTA: " + falhas + " arquivo(s) com falha" : "PONTA A PONTA: tudo verde");
process.exit(falhas ? 1 : 0);
