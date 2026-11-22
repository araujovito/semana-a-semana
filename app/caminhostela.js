"use strict";
/* Tela "Caminhos de alimentação" (#caminhos). Registrada em TELAS (inicio.js) sem botão na barra: a navegação liga depois.
   Decisão de 22/11 (empresa/decisoes.md): o cardápio principal é o plano da nutricionista. Por isso o topo mostra esse plano
   como o caminho em uso, e os caminhos A a E (dados em app/caminhos.js, com fonte em cada um) aparecem só como referência
   para conversar com ela, nunca como substitutos do plano.
   Ela pode marcar "quero conversar sobre este": a lista fica em E.ui.camConversar (ids "A" a "E") e entra no relatório
   da consulta (relatorio() em app/diario.js chama camRelatorio()).

   PONTO DE ENCAIXE do plano da nutricionista (ramo onda2-nutri, ainda não está no main):
   se existir uma função global camResumoPlanoNutri() que devolva um texto curto sobre o plano prescrito
   (por exemplo "Prescrito em 04/11/2026 · 5 refeições com opções"), o cartão do topo mostra esse texto.
   Sem ela, o cartão mostra só o texto fixo. Nada de nome, endereço ou telefone da profissional aqui. */

const CAM_IDS = ["A", "B", "C", "D", "E"];

/* Ids marcados para conversar, só os válidos, na ordem A a E (E.ui vem do aparelho e pode ter qualquer coisa). */
function camMarcados() {
  const m = (E.ui && Array.isArray(E.ui.camConversar)) ? E.ui.camConversar : [];
  return CAM_IDS.filter(id => m.indexOf(id) >= 0);
}

/* Trecho do relatório da consulta: vazio se ela não marcou nada. Devolve uma lista de trechos (0 ou 1) para relatorio() juntar. */
function camRelatorio() {
  const m = camMarcados();
  if (!m.length) return [];
  return [["CAMINHOS DE ALIMENTAÇÃO PARA CONVERSAR (marcados no app; o plano em uso é o da nutricionista)",
    m.map(id => id + ". " + caminhoAlimentar(id).nome).join("; ") + "."]];
}

function camResumoDoPlano() {
  try { return typeof camResumoPlanoNutri === "function" ? String(camResumoPlanoNutri() || "") : ""; } catch (x) { return ""; }
}

function camCartaoPlano() {
  const resumo = camResumoDoPlano();
  return '<section class="cartao cam-plano" aria-labelledby="cam-t-plano"><div class="cam-capa cam-capa-plano">' +
    '<span class="cam-letra" aria-hidden="true">✓</span><div><span class="cam-selo cam-selo-uso">Em uso</span>' +
    '<h2 id="cam-t-plano">Plano da sua nutricionista</h2>' + (resumo ? '<p class="cam-resumo">' + esc(resumo) + "</p>" : "") + "</div></div>" +
    '<div class="cam-corpo"><p>É o plano que ela prescreveu para você. O app ajuda a seguir: mostra as refeições, ajuda a marcar o que comeu e junta tudo para a consulta.</p>' +
    '<p class="sub">Dúvida sobre o plano, troca de alimento ou vontade de mudar de caminho: converse com ela.</p>' +
    '<div class="botoes"><button data-ac="ir" data-para="plano">Ver o plano</button></div></div></section>';
}

function camLista(itens, classe) {
  return '<ul class="cam-prc">' + itens.map(t => '<li class="' + classe + '">' + esc(t) + "</li>").join("") + "</ul>";
}

function camCartao(c, marcado) {
  const t = "cam-t-" + c.id;
  let selos = "";
  if (c.soComEquipe) selos += '<span class="cam-selo cam-selo-atencao">Só com a equipe</span>';
  if (c.id === "E") selos += '<span class="cam-selo">Dia de enjoo</span>';
  if (marcado) selos += '<span class="cam-selo cam-selo-marcado">Para conversar</span>';
  return '<article class="cartao cam-caminho' + (marcado ? " cam-marcado" : "") + (c.soComEquipe ? " cam-equipe" : "") + '" data-caminho="' + c.id + '" aria-labelledby="' + t + '">' +
    '<div class="cam-capa"><span class="cam-letra" aria-hidden="true">' + c.id + "</span><div>" + (selos ? '<div class="cam-selos">' + selos + "</div>" : "") +
    '<h2 id="' + t + '">' + esc(c.nome) + '</h2><p class="cam-para"><b>Para quem:</b> ' + esc(c.paraQuem) + "</p></div></div>" +
    '<div class="cam-corpo">' +
    (c.soComEquipe ? '<p class="cam-aviso-equipe" role="note"><b>Só com a equipe que cuida de você.</b> O app não monta essa dieta. Se a equipe indicar, as metas de energia e proteína que o médico der entram no Perfil.</p>' : "") +
    '<h3>Como funciona</h3><p>' + esc(c.comoFunciona) + "</p>" +
    '<h3>A favor</h3>' + camLista(c.pros, "cam-a") +
    '<h3>Atenção</h3>' + camLista(c.contras, "cam-t") +
    '<div class="cam-vesicula"><b>Cuidados com a vesícula</b>' + esc(c.vesicula) + "</div>" +
    '<p class="sub cam-fonte">Fonte: ' + esc(c.fonte) + "</p>" +
    '<p class="cam-conversa">' + esc(c.conversa) + "</p>" +
    '<div class="botoes"><button class="' + (marcado ? "" : "sec") + '" data-ac="camConversar" data-id="' + c.id + '" aria-pressed="' + (marcado ? "true" : "false") + '">' +
    (marcado ? "✓ Vou conversar sobre este" : "Quero conversar sobre este") + "</button></div></div></article>";
}

function telaCaminhos() {
  const m = camMarcados();
  let out = '<h2 class="cam-titulo">Caminhos de alimentação</h2>' + camCartaoPlano();
  out += '<section class="cam-intro" aria-labelledby="cam-t-outros"><h2 id="cam-t-outros">Outros caminhos, para conversar com ela</h2>' +
    '<p class="sub">Não substituem o plano. Mostram jeitos diferentes de comer, com prós, contras e cuidados com a vesícula, para você levar perguntas à consulta. Quem decide com você é a nutricionista.</p></section>';
  out += caminhoAlimentar().map(c => camCartao(c, m.indexOf(c.id) >= 0)).join("");
  out += '<section class="cartao destaque cam-fim" id="cam-resumo" aria-labelledby="cam-t-fim"><h2 id="cam-t-fim">Converse com sua nutricionista</h2>' +
    (m.length ? "<p>Para conversar na consulta: " + esc(m.map(id => id + ". " + caminhoAlimentar(id).nome).join("; ")) + ". Isso já entra no relatório da consulta.</p>" +
      '<div class="botoes"><button class="sec" data-ac="ir" data-para="diario" data-sub="relatorio">Ver o relatório</button></div>'
      : "<p>Ela ajusta qualquer caminho ao que você come, aos exames e à data da cirurgia. Marque os que quiser conversar e eles entram no relatório da consulta.</p>") +
    "</section>";
  return out;
}

AC.camConversar = function (d) {
  if (CAM_IDS.indexOf(d.id) < 0) return;
  const m = camMarcados(), i = m.indexOf(d.id);
  if (i >= 0) m.splice(i, 1); else m.push(d.id);
  E.ui.camConversar = CAM_IDS.filter(id => m.indexOf(id) >= 0);
  salvar();
  aviso(i >= 0 ? "Tirado da lista da consulta." : "Vai para o relatório da consulta.");
  render();
};

/* Registra a tela depois que inicio.js criou TELAS; se o endereço já era #caminhos, desenha de novo, agora com ela. */
if (typeof document !== "undefined" && document.addEventListener) {
  document.addEventListener("DOMContentLoaded", () => {
    if (typeof TELAS === "undefined") return;
    TELAS.caminhos = telaCaminhos;
    if (location.hash === "#caminhos" && E.perfil && ILEGIVEL == null) render(true);
  });
}
