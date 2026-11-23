// Casca Android vista pela pagina: botao voltar (o mesmo JavaScript que MainActivity.java roda), cartao do calendario,
// copia de seguranca com dialogos da pagina e nomes globais repetidos entre os arquivos de app/.
const fs = require("fs"), path = require("path");
const { abrir, ok, d, estadoBase } = require("./apoio");

// Todos os app/*.js dividem o mesmo escopo global: um nome de topo repetido derruba o app inteiro (ja aconteceu uma vez).
const PASTA = path.join(__dirname, "..", "app"), vistos = {}, repetidos = [];
for (const f of fs.readdirSync(PASTA).filter(n => n.endsWith(".js"))) {
  for (const m of fs.readFileSync(path.join(PASTA, f), "utf8").matchAll(/^(?:function\*?|const|let|var|class)\s+([A-Za-z_$][\w$]*)/gm)) {
    if (vistos[m[1]]) repetidos.push(m[1] + " (" + vistos[m[1]] + " e " + f + ")"); else vistos[m[1]] = f;
  }
}
ok(repetidos.length === 0, "nenhum nome global repetido entre os arquivos de app/" + (repetidos.length ? ": " + repetidos.join(", ") : ""));

// O trecho que o Java manda rodar quando ela aperta voltar, e a resposta que faz o app sair.
const JAVA = fs.readFileSync(path.join(__dirname, "..", "android/java/br/semanaasemana/MainActivity.java"), "utf8");
const trecho = (JAVA.match(/evaluateJavascript\("(.*?)", r ->/) || [])[1];
const saida = (JAVA.match(/"\\"(\w+)\\""\.equals\(r\)/) || [])[1];
ok(trecho && saida === "sair", "MainActivity sai do app quando a página responde \"sair\" (encontrado: " + saida + ")");

// Compartilhar e copiar no Java: depois de conferir o tamanho, erro do sistema vira false (nao derruba o app pela ponte).
ok(/compartilhar\(String texto\) \{[\s\S]*?try \{[\s\S]*?return true;\s*\} catch \(Exception e\) \{\s*return false;/.test(JAVA) &&
  /copiar\(String texto\) \{[\s\S]*?try \{[\s\S]*?return true;\s*\} catch \(Exception e\) \{\s*return false;/.test(JAVA),
  "Android: compartilhar e copiar devolvem false quando o sistema falha, sem derrubar o app");

// Ponte falsa do Android, que devolve o que o Java devolveria: grava as datas pedidas ao calendario e os textos enviados;
// window.__calendarioAbre e window.__ponteAceita decidem a resposta (false = o Java recusou).
const ponte = () => {
  window.__pedidos = []; window.__enviados = []; window.__calendarioAbre = true; window.__ponteAceita = true;
  window.Android = { calendario: x => { window.__pedidos.push(x); return window.__calendarioAbre; },
    compartilhar: x => { window.__enviados.push(x); return window.__ponteAceita; }, copiar: x => { window.__enviados.push(x); return window.__ponteAceita; } };
};

(async () => {
  // Sem a ponte (navegador), o cartao nao existe.
  let t = await abrir({ estado: estadoBase({ doses: [{ id: "a1", data: d(3), mg: 2.5, local: "Coxa esquerda", obs: "" }] }), aba: "perfil" }), p = t.p;
  await p.waitForSelector("form[data-form=perfil]");
  ok(await p.locator("#cartao-calendario").count() === 0, "no navegador, sem o Android, o cartão do calendário não aparece");
  await t.fechar();

  // App instalado, em dia: a ultima foi terca 17/11, a proxima prevista e terca 24/11.
  t = await abrir({ estado: estadoBase({ doses: [{ id: "a1", data: d(3), mg: 2.5, local: "Coxa esquerda", obs: "" }] }), aba: "perfil" }); p = t.p;
  await p.addInitScript(ponte); await p.reload(); await p.waitForSelector("#cartao-calendario");
  const txt = await p.locator("#cartao-calendario").innerText();
  ok(/seu dia de aplicação é terça-feira/.test(txt) && /começa em 24\/11/.test(txt), "cartão do calendário mostra o dia habitual e a data de início");
  ok(!/mounjaro|tirzepatida/i.test(txt), "cartão do calendário não cita o nome do remédio");
  await t.foto("aparelho-calendario");
  await p.click("[data-ac=calendario]");
  ok(JSON.stringify(await p.evaluate(() => window.__pedidos)) === '["2026-11-24"]', "botão pede ao Android o evento a partir de 24/11");
  ok(await p.locator("#cartao-calendario [role=status]").count() === 0, "calendário aberto: sem aviso");
  await p.evaluate(() => { window.__calendarioAbre = false; }); await p.click("[data-ac=calendario]");
  ok(/Não foi possível abrir um app de calendário/.test(await p.locator("#cartao-calendario").innerText()), "sem app de calendário: aviso no cartão");

  // Botao voltar pelo trecho do Java: de Perfil vai para Hoje e fica; de Hoje sai.
  ok(await p.evaluate(trecho) === "ficar" && await p.evaluate(() => location.hash) === "#hoje", "voltar (como o Android chama) leva de Perfil para Hoje");
  ok(await p.evaluate(trecho) === "sair", "voltar (como o Android chama) na aba Hoje sai do app");
  await t.fechar();

  // Atrasada: a ultima foi quarta 11/11 e hoje e sexta 20/11; o evento comeca no dia habitual seguinte (quarta 25/11), nao hoje.
  t = await abrir({ estado: estadoBase({ doses: [{ id: "a1", data: d(9), mg: 2.5, local: "Coxa esquerda", obs: "" }] }), aba: "perfil" }); p = t.p;
  await p.addInitScript(ponte); await p.reload(); await p.waitForSelector("#cartao-calendario");
  ok(/quarta-feira/.test(await p.locator("#cartao-calendario").innerText()), "aplicação atrasada: o cartão mantém o dia habitual");
  await p.click("[data-ac=calendario]");
  ok(JSON.stringify(await p.evaluate(() => window.__pedidos)) === '["2026-11-25"]', "aplicação atrasada: o evento começa no dia habitual seguinte");
  await t.fechar();

  // Mais de 14 dias sem registro: o app manda falar com o medico e nao sugere data.
  t = await abrir({ estado: estadoBase({ doses: [{ id: "a1", data: d(20), mg: 2.5, local: "Coxa esquerda", obs: "" }] }), aba: "perfil" }); p = t.p;
  await p.addInitScript(ponte); await p.reload(); await p.waitForSelector("form[data-form=perfil]");
  ok(await p.locator("#cartao-calendario").count() === 0, "mais de 14 dias sem aplicação: sem cartão do calendário");
  await t.fechar();

  // Relatorio: copiar so diz "Copiado." quando a ponte aceitou; recusa (texto grande demais ou erro) avisa num dialogo.
  t = await abrir({ estado: estadoBase({ doses: [{ id: "a1", data: d(3), mg: 2.5, local: "Coxa esquerda", obs: "" }], ui: { diario: "relatorio" } }), aba: "diario" }); p = t.p;
  await p.addInitScript(ponte); await p.reload(); await p.waitForSelector("[data-ac=copiar][data-de=rel]");
  await p.click("[data-ac=copiar][data-de=rel]");
  ok(/Copiado/.test(await p.locator("#aviso").innerText()) && await t.textoDialogo() === null, "copiar aceito pela ponte: \"Copiado.\"");
  await p.evaluate(() => { document.getElementById("aviso").hidden = true; window.__ponteAceita = false; });
  await p.click("[data-ac=copiar][data-de=rel]");
  ok(/Não foi possível copiar/.test(await t.textoDialogo() || "") && !(await p.locator("#aviso").isVisible()), "copiar recusado pela ponte: avisa e não diz \"Copiado.\"");
  await t.nao();
  await p.click("[data-ac=compartilhar][data-de=rel]"); await t.sim(); // primeiro o aviso de dados de saúde
  ok(/Não foi possível compartilhar. Nada foi enviado/.test(await t.textoDialogo() || ""), "compartilhar recusado pela ponte: avisa que nada foi enviado");
  await t.nao();
  // Exportar recusado pela ponte (depois da conferência de tamanho): não diz "Cópia pronta" nem marca como exportada.
  await p.click("[data-ac=exportar]"); await t.sim(); await p.waitForFunction(() => window.__enviados.length === 4);
  await p.waitForSelector("#dialogo:not([hidden])");
  ok(/Não foi possível compartilhar/.test(await t.textoDialogo() || "") && !(await t.ler()).ui.ultimaExportacao, "exportar recusado pela ponte: avisa e não marca a cópia como feita");
  await t.nao();
  // Texto acima do limite (o Java recusa): o aviso diz o tamanho e o limite.
  const grande = await p.evaluate(() => { window.__enviados = []; copiar("x".repeat(SEG_MAX_TEXTO + 1)); return SEG_MAX_TEXTO; });
  ok(new RegExp("limite do Android é " + grande / 1000 + " mil").test(await t.textoDialogo() || ""), "texto grande demais: o aviso diz o limite");
  await t.nao(); await t.fechar();

  // Copia de seguranca: apagar e restaurar perguntam num dialogo da pagina (nao no confirm() do navegador).
  t = await abrir({ estado: estadoBase({ doses: [{ id: "a1", data: d(3), mg: 2.5, local: "Coxa esquerda", obs: "" }], ui: { diario: "relatorio" } }), aba: "diario" }); p = t.p;
  await p.waitForSelector("[data-ac=zerar]");
  const copia = JSON.stringify(await t.ler());
  await p.click("[data-ac=zerar]");
  ok(/Apagar TODOS os dados/.test(await t.textoDialogo()), "apagar todos os dados pergunta num diálogo da página");
  await t.nao(); ok((await t.ler()).doses.length === 1, "cancelar não apaga os dados");
  await p.click("[data-ac=zerar]"); await t.sim();
  ok(!(await t.ler()).perfil, "confirmar apaga os dados");
  await t.semear(Object.assign(estadoBase(), { ui: { diario: "relatorio" } })); await p.goto(p.url().replace(/#.*$/, "#diario")); await p.waitForSelector("#imp");
  await p.fill("#imp", copia); await p.click("[data-ac=importar]");
  ok(/Substituir os dados/.test(await t.textoDialogo()), "restaurar pergunta num diálogo da página");
  await t.nao(); ok((await t.ler()).doses.length === 0, "cancelar não restaura");
  await p.click("[data-ac=importar]"); await t.sim(); await p.waitForSelector("text=Proteína hoje");
  ok((await t.ler()).doses.length === 1, "confirmar restaura e volta para Hoje");
  await t.fechar();
})().catch(e => { console.log("FALHOU: " + e.message); process.exit(1); });
