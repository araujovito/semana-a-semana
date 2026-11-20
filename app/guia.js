"use strict";
/* Tela Guia: mostra os artigos de conteudo.js. */

function telaGuia() {
  return avisoHipoglicemia("guia") + G.map(a => '<div class="cartao' + (a.alerta ? " alerta" : "") + '"><details' + (a.alerta ? " open" : "") + '><summary>' + esc(a.titulo) + "</summary>" + a.corpo.map(p => "<p>" + esc(p) + "</p>").join("") + "</details></div>").join("");
}
