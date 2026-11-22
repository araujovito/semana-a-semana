"use strict";
/* Diário: abas, relatório para a consulta e cópia de segurança. Cada aba mora no arquivo da sua área. */

function telaDiario() {
  const sub = E.ui.diario || "doses", h = hoje();
  const abas = [["doses", "Aplicações"], ["peso", "Peso"], ["sintomas", "Sintomas"], ["relatorio", "Relatório"]];
  let out = '<div class="chips">' + abas.map(a => '<button data-ac="diario" data-v="' + a[0] + '" class="' + (sub === a[0] ? "ativa" : "") + '">' + a[1] + "</button>").join("") + "</div>";
  if (sub === "doses") out += subDoses();
  if (sub === "peso") out += subPeso();
  if (sub === "sintomas") out += subSintomas();
  if (sub === "relatorio") {
    out += '<div class="cartao"><h2>Relatório para a consulta</h2><p class="sub" style="margin:0">Resumo dos últimos 30 dias, em texto, para mandar por WhatsApp ou mostrar ao médico.</p><textarea id="rel" readonly style="min-height:260px;font-size:13px">' + esc(relatorio()) + '</textarea><div class="botoes"><button data-ac="compartilhar" data-de="rel">Compartilhar</button><button class="sec" data-ac="copiar" data-de="rel">Copiar</button></div></div>';
    out += cartaoCopia();
  }
  return out;
}

/* O relatório é a soma dos trechos de cada área, nesta ordem, separados por uma linha em branco. */
function relatorio() {
  const p = E.perfil, h = hoje(), de = mais(h, -29);
  const cabecalho = ["RELATÓRIO DE ACOMPANHAMENTO" + (p.nome ? " - " + p.nome : ""), "Período: " + brAno(de) + " a " + brAno(h)];
  return [cabecalho, relTratamento(de), relPeso(de), relSintomas(de), relAlimentacao(de), relExercicio(de)].concat(camRelatorio()).map(t => t.join("\n")).join("\n\n");
}

Object.assign(AC, {
  diario(d) { E.ui.diario = d.v; salvar(); render(); },
  apagar(d) { confirmar("Apagar este registro?", function () { E[d.lista] = E[d.lista].filter(x => x.id !== d.id); salvar(); render(); }, "Apagar"); },
  compartilhar(d) { compartilhar(texto(d.de)); },
  copiar(d) { copiar(texto(d.de)); },
});
