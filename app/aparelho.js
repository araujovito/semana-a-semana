"use strict";
/* Aparelho: o que depende do celular (lembretes, cópia de segurança em arquivo). Tudo aqui tem caminho alternativo no navegador. */

/* Cartão mostrado no fim da tela Perfil. */
function cartaoLembretes() { return ""; }

/* Cartão mostrado em Diário > Relatório. */
function cartaoCopia() {
  return '<div class="cartao"><h2>Cópia de segurança</h2><p class="sub" style="margin:0">Os registros ficam só neste celular. Se o app for desinstalado, eles se perdem. Exporte de vez em quando e guarde o texto (por exemplo, mandando para você mesma).</p><div class="botoes"><button class="sec" data-ac="exportar">Exportar tudo</button></div>' +
      '<label>Restaurar: cole aqui o texto exportado<textarea id="imp"></textarea></label><div class="botoes"><button class="sec" data-ac="importar">Restaurar</button><button class="perigo" data-ac="zerar">Apagar todos os dados</button></div></div>';
}

Object.assign(AC, {
  exportar() { compartilhar(JSON.stringify(E)); },
  importar() {
    let j; try { j = migrar(JSON.parse(texto("imp"))); } catch (e) { j = null; }
    if (!j || !j.perfil) { aviso("Texto inválido. Cole o conteúdo exportado inteiro."); return; }
    if (!confirm("Substituir os dados deste celular pelos do texto colado?")) return;
    E = j; salvar(); aviso("Dados restaurados."); location.hash = "hoje"; render(true);
  },
  zerar() { if (!confirm("Apagar TODOS os dados deste celular? Não dá para desfazer.")) return; E = vazio(); salvar(); render(true); },
});
