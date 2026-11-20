"use strict";
/* Aparelho: o que depende do celular (evento no calendário, cópia de segurança, botão voltar). Tudo aqui tem caminho alternativo no navegador.
   Ponte com o Android (android/java/br/semanaasemana/MainActivity.java), sempre conferida antes de usar:
     window.Android.compartilhar(texto), window.Android.copiar(texto)
     window.Android.calendario("AAAA-MM-DD") -> true se abriu o calendário do celular com um evento semanal a partir dessa data */

const DIAS_POR_EXTENSO = ["segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado", "domingo"];
let avisoCalendario = "";

function temCalendario() { return typeof window !== "undefined" && !!window.Android && typeof window.Android.calendario === "function"; }

/* Data (AAAA-MM-DD) em que o evento semanal começa: a próxima aplicação prevista; se ela já passou, o mesmo dia da semana, de hoje em diante.
   Devolve null quando não há aplicação registrada ou a data não é legível. Só usa o campo prox de situacaoDose(). */
function dataParaCalendario(s, h) {
  const prox = s && s.prox;
  if (typeof prox !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(prox) || iso(deIso(prox)) !== prox) return null;
  if (prox >= h) return prox;
  return mais(h, (diaSemana(prox) - diaSemana(h) + 7) % 7);
}

/* Cartão mostrado no fim da tela Perfil: põe a aplicação semanal no calendário do celular. Só existe no app instalado e depois da primeira aplicação. */
function cartaoLembretes() {
  if (!temCalendario()) return "";
  const data = dataParaCalendario(situacaoDose(), hoje());
  if (!data) return "";
  return '<div class="cartao" id="cartao-calendario"><h2>Aplicação no calendário</h2><p class="sub" style="margin:0">Pelos seus registros, a próxima aplicação cai em ' + (diaSemana(data) < 5 ? "uma " : "um ") + DIAS_POR_EXTENSO[diaSemana(data)] + " (" + br(data) + "). " +
    "O botão abre o calendário do celular com um evento que se repete toda semana, com o nome “Semana a Semana: aplicação”, sem o nome do remédio. Você confere, escolhe o aviso e salva por lá. Se o dia mudar, o evento é alterado no calendário.</p>" +
    '<div class="botoes"><button class="sec" data-ac="calendario" data-data="' + data + '">Pôr no calendário</button></div>' +
    (avisoCalendario ? '<p class="sub" role="status">' + esc(avisoCalendario) + "</p>" : "") + "</div>";
}

/* Cartão mostrado em Diário > Relatório. */
function cartaoCopia() {
  return '<div class="cartao"><h2>Cópia de segurança</h2><p class="sub" style="margin:0">Seus registros ficam neste celular e o app não os envia para lugar nenhum. Se a cópia de segurança do Google estiver ligada no aparelho, o Android pode incluí-los na cópia da sua conta. Se o app for desinstalado, eles se perdem. Exporte de vez em quando e guarde o texto (por exemplo, mandando para você mesma).</p><div class="botoes"><button class="sec" data-ac="exportar">Exportar tudo</button></div>' +
      '<label>Restaurar: cole aqui o texto exportado<textarea id="imp"></textarea></label><div class="botoes"><button class="sec" data-ac="importar">Restaurar</button><button class="perigo" data-ac="zerar">Apagar todos os dados</button></div></div>';
}

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
    if (!confirm("Substituir os dados deste celular pelos do texto colado?")) return;
    E = j; salvar(); aviso("Dados restaurados."); location.hash = "hoje"; render(true);
  },
  zerar() { if (!confirm("Apagar TODOS os dados deste celular? Não dá para desfazer.")) return; E = vazio(); salvar(); render(true); },
});

/* ---------- PROVISÓRIO, para testar a casca Android no emulador. O definitivo é do chefe (app/inicio.js e app/estilo.css). ---------- */

/* Botão voltar do Android. O Java chama aoVoltar() e só sai do app se a resposta for "saiu".
   Folha aberta: fecha a folha. Qualquer aba que não seja Hoje: vai para Hoje. Na aba Hoje (ou sem perfil): sai. */
function aoVoltar() {
  if (folhaAberta()) { fecharFolha(); return "folha"; }
  if (E.perfil && atual() !== "hoje") { location.hash = "hoje"; return "hoje"; }
  return "saiu";
}

/* Teclado aberto: a janela encolhe (adjustResize no manifesto) e a barra de abas, que é fixa embaixo, subiria para cima do teclado,
   tapando o campo. Enquanto a janela estiver bem mais baixa que o normal e o foco estiver num campo de digitar, o corpo ganha a
   classe "teclado" (estilo-aparelho.css esconde a barra) e o campo em foco é trazido para o meio da tela. */
function ligarTeclado(janela, doc) {
  let largura = 0, alturaCheia = 0;
  const digitando = () => { const el = doc.activeElement; return !!el && (el.tagName === "TEXTAREA" || (el.tagName === "INPUT" && !/^(checkbox|radio|button|submit|file|range|color)$/.test(el.type))); };
  const conferir = () => {
    if (janela.innerWidth !== largura) { largura = janela.innerWidth; alturaCheia = 0; } // girou o celular: recomeça a medida
    alturaCheia = Math.max(alturaCheia, janela.innerHeight);
    const aberto = digitando() && janela.innerHeight < 0.75 * alturaCheia;
    const mudou = doc.body.classList.contains("teclado") !== aberto;
    doc.body.classList.toggle("teclado", aberto);
    if (aberto && mudou && doc.activeElement.scrollIntoView) doc.activeElement.scrollIntoView({ block: "center" });
  };
  janela.addEventListener("resize", conferir);
  doc.addEventListener("focusin", conferir);
  doc.addEventListener("focusout", () => setTimeout(conferir, 0));
  conferir();
}
if (typeof window !== "undefined" && typeof window.addEventListener === "function" && typeof document !== "undefined" && document.body) ligarTeclado(window, document);
