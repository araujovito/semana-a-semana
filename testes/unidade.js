// Roda todos os testes de unidade (testes/unidade/*.js) com o executor de testes do Node.
const { spawnSync } = require("child_process"), path = require("path"), fs = require("fs");
const dir = path.join(__dirname, "unidade");
const arquivos = fs.readdirSync(dir).filter(n => n.endsWith(".js")).sort().map(n => path.join(dir, n));
process.exit(spawnSync(process.execPath, ["--test"].concat(arquivos), { stdio: "inherit" }).status);
