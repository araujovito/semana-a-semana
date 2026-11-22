"use strict";
/* Segurança dos dados que saem do celular. Carregado depois de diario.js e aparelho.js (embrulha ações deles) e antes de inicio.js.
   - Antes de "Exportar tudo" e de "Compartilhar" o relatório, um diálogo avisa que o texto tem dados de saúde; ela pode seguir ou cancelar.
   A data da exportação fica em E.ui.ultimaExportacao (AAAA-MM-DD): é a do toque em "Seguir", porque o app não tem como saber se ela guardou o texto. */

const SEG_TEXTO_EXPORTAR = "A cópia tem todos os seus dados de saúde: perfil, aplicações, peso, sintomas e alimentação. Quem receber o texto consegue ler tudo, e o app de mensagens pode guardar uma cópia. Uma opção é mandar só para você mesma.";
const SEG_TEXTO_RELATORIO = "O relatório tem dados de saúde: aplicações, peso, sintomas e alimentação. Quem receber o texto consegue ler tudo, e o app de mensagens pode guardar uma cópia. Mande só para quem você escolher, como o médico ou a nutricionista.";

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
  });
})();
