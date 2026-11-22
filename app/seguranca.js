"use strict";
/* Segurança dos dados que saem do celular. Carregado depois de diario.js e aparelho.js (embrulha ações deles) e antes de inicio.js.
   - Antes de "Exportar tudo" e de "Compartilhar" o relatório, um diálogo avisa que o texto tem dados de saúde; ela pode seguir ou cancelar.
   - Lembrete discreto de cópia: passados SEG_DIAS_COPIA dias da última exportação, um cartão pequeno em Diário > Relatório, logo acima
     do cartão de cópia, oferece exportar. "Agora não" (E.ui.lembreteCopia) adia pelo mesmo prazo. Quem nunca exportou conta a partir do
     registro mais antigo, para não aparecer no primeiro dia de uso.
   A data da exportação fica em E.ui.ultimaExportacao (AAAA-MM-DD): é a do toque em "Seguir", porque o app não tem como saber se ela guardou o texto. */

const SEG_DIAS_COPIA = 14;
const SEG_TEXTO_EXPORTAR = "A cópia tem todos os seus dados de saúde: perfil, aplicações, peso, sintomas e alimentação. Quem receber o texto consegue ler tudo, e o app de mensagens pode guardar uma cópia. Uma opção é mandar só para você mesma.";
const SEG_TEXTO_RELATORIO = "O relatório tem dados de saúde: aplicações, peso, sintomas e alimentação. Quem receber o texto consegue ler tudo, e o app de mensagens pode guardar uma cópia. Mande só para quem você escolher, como o médico ou a nutricionista.";

/* Data (AAAA-MM-DD) a partir da qual o prazo do lembrete conta, ou null se ainda não há nada a guardar. */
function segInicioDoPrazo() {
  const ui = E.ui || {}, marcadas = [ui.ultimaExportacao, ui.lembreteCopia].filter(dataValida).sort();
  if (marcadas.length) return marcadas[marcadas.length - 1];
  const datas = [].concat(E.doses, E.pesos, E.sintomas, E.treinos).map(r => r && r.data).concat(Object.keys(E.dias || {})).filter(dataValida).sort();
  return datas.length ? datas[0] : null;
}
/* Dias desde a última exportação (null se nunca exportou) e se o cartão deve aparecer hoje. */
function segSituacaoCopia(h) {
  const ui = E.ui || {}, inicio = segInicioDoPrazo();
  return { mostrar: !!E.perfil && !!inicio && entre(inicio, h) > SEG_DIAS_COPIA, dias: dataValida(ui.ultimaExportacao) ? entre(ui.ultimaExportacao, h) : null };
}
function segCartaoLembrete() {
  const s = segSituacaoCopia(hoje());
  if (!s.mostrar) return "";
  const frase = s.dias == null ? "Você ainda não exportou uma cópia dos seus registros." : "A última cópia dos seus registros foi exportada há " + s.dias + " dias.";
  return '<div class="cartao seg-lembrete" id="seg-lembrete-copia"><p class="sub">' + frase + ' Se quiser, dá para exportar agora.</p>' +
    '<div class="botoes"><button class="sec" data-ac="exportar">Exportar agora</button><button class="sec" data-ac="segAdiarCopia">Agora não</button></div></div>';
}

(function () {
  const exportar = AC.exportar, compartilharTexto = AC.compartilhar;
  Object.assign(AC, {
    exportar() {
      confirmar(SEG_TEXTO_EXPORTAR, function () { E.ui.ultimaExportacao = hoje(); salvar(); exportar(); render(); }, "Seguir");
    },
    compartilhar(d, b) {
      if (d.de !== "rel") { compartilharTexto(d, b); return; }
      confirmar(SEG_TEXTO_RELATORIO, function () { compartilharTexto(d, b); }, "Seguir");
    },
    segAdiarCopia() { E.ui.lembreteCopia = hoje(); salvar(); render(); },
  });
})();
