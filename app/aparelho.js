"use strict";
/* Aparelho: o que depende do celular (evento no calendário, cópia de segurança). Tudo aqui tem caminho alternativo no navegador.
   Ponte com o Android (android/java/br/semanaasemana/MainActivity.java), sempre conferida antes de usar:
     window.Android.compartilhar(texto), window.Android.copiar(texto)
     window.Android.calendario("AAAA-MM-DD") -> true se abriu o calendário do celular com um evento semanal a partir dessa data */

const DIAS_POR_EXTENSO = ["segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado", "domingo"];
let avisoCalendario = "";

function temCalendario() { return typeof window !== "undefined" && !!window.Android && typeof window.Android.calendario === "function"; }

/* Data (AAAA-MM-DD) em que o evento semanal começa: o primeiro dia habitual de aplicação (situacaoDose em tratamento.js) que ainda
   não tem aplicação feita, de hoje em diante. Em dia: a próxima prevista. Prevista hoje: hoje. Atrasada ou a pular: o dia habitual
   da semana seguinte (com atraso a data de hoje cairia fora do dia habitual e o evento repetiria no dia errado).
   null sem aplicação registrada ou quando a conta manda falar com o médico (mais de 14 dias sem registro). */
function dataParaCalendario(s, h) {
  if (!s || s.estado === "medico") return null;
  const d = s.estado === "emDia" ? s.prox : s.estado === "hoje" ? h : s.seguinte;
  return dataValida(d) && d >= h ? d : null;
}

/* Cartão mostrado no fim da tela Perfil: põe a aplicação semanal no calendário do celular. Só existe no app instalado e depois da primeira aplicação. */
function cartaoLembretes() {
  if (!temCalendario()) return "";
  const data = dataParaCalendario(situacaoDose(), hoje());
  if (!data) return "";
  return '<div class="cartao" id="cartao-calendario"><h2>Aplicação no calendário</h2><p class="sub" style="margin:0">Pelos seus registros, seu dia de aplicação é ' + DIAS_POR_EXTENSO[diaSemana(data)] + ". O evento começa em " + br(data) + ". " +
    "O botão abre o calendário do celular com um evento que se repete toda semana, com o nome “Semana a Semana: aplicação”, sem o nome do remédio. Você confere, escolhe o aviso e salva por lá. Se o dia mudar, o evento é alterado no calendário.</p>" +
    '<div class="botoes"><button class="sec" data-ac="calendario" data-data="' + data + '">Pôr no calendário</button></div>' +
    (avisoCalendario ? '<p class="sub" role="status">' + esc(avisoCalendario) + "</p>" : "") + "</div>";
}

/* Cartão mostrado em Diário > Relatório, com o lembrete de cópia (seguranca.js) logo acima quando é a hora. */
function cartaoCopia() {
  return segCartaoLembrete() + '<div class="cartao"><h2>Cópia de segurança</h2><p class="sub" style="margin:0">' + (window.EH_PWA ? "Seus registros ficam guardados neste navegador, neste celular, e o app não os envia para lugar nenhum. Se você limpar os dados do navegador ou desinstalar o app, eles se perdem." : "Seus registros ficam neste celular e o app não os envia para lugar nenhum. Se a cópia de segurança do Google estiver ligada no aparelho, o Android pode incluí-los na cópia da sua conta. Se o app for desinstalado, eles se perdem.") + ' Exporte de vez em quando e guarde o texto (por exemplo, mandando para você mesma).</p><div class="botoes"><button class="sec" data-ac="exportar">Exportar tudo</button></div>' +
      '<label>Restaurar: cole aqui o texto exportado<textarea id="imp"></textarea></label><div class="botoes"><button class="sec" data-ac="importar">Restaurar</button><button class="perigo" data-ac="zerar">Apagar todos os dados</button></div></div>';
}

/* Celular novo ou dados apagados: antes, para restaurar era preciso preencher um perfil qualquer e só então achar o campo em
   Diário > Relatório. Agora a primeira tela do Perfil (a do formulário, depois de "Antes de começar") também oferece restaurar. */
function cartaoRestaurarInicio() {
  return '<div class="cartao" id="restaurar-inicio"><h2>Já usava o app?</h2><p class="sub">Se você exportou uma cópia de segurança, cole o texto aqui para trazer tudo de volta. Não precisa preencher os dados acima.</p>' +
    '<label>Texto exportado<textarea id="imp"></textarea></label><div class="botoes"><button class="sec" data-ac="importar">Restaurar</button></div></div>';
}
const aparelhoTelaPerfil = telaPerfil;
telaPerfil = function () {
  const t = aparelhoTelaPerfil();
  return !E.perfil && E.ui.entradaVista && ILEGIVEL == null ? t + cartaoRestaurarInicio() : t;
};

Object.assign(AC, {
  calendario(d) {
    let abriu = false;
    try { abriu = temCalendario() && window.Android.calendario(d.data) === true; } catch (e) { abriu = false; }
    avisoCalendario = abriu ? "" : "Não foi possível abrir um app de calendário neste celular. Dá para criar o evento à mão, no calendário que você usa.";
    render();
  },
  exportar() { compartilhar(JSON.stringify(E)); },
  importar() {
    let j; try { j = migrar(JSON.parse(texto("imp"))); } catch (e) { j = null; }
    if (!j || !j.perfil) { aviso("Texto inválido. Cole o conteúdo exportado inteiro."); return; }
    const restaurar = function () { E = j; salvar(); aviso("Dados restaurados."); irPara("hoje"); };
    // Sem perfil não há o que substituir (celular novo ou dados apagados): restaura direto.
    if (!E.perfil) { restaurar(); return; }
    confirmar("Substituir os dados deste celular pelos do texto colado?", restaurar, "Substituir");
  },
  zerar() { confirmar("Apagar TODOS os dados deste celular? Não dá para desfazer.", function () { E = vazio(); salvar(); render(true); }, "Apagar tudo"); },
});

