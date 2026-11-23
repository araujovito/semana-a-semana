"use strict";
/* Liga tudo: escolhe a tela pelo endereço (#hoje, #plano...), desenha e escuta toques, campos e formulários. Último arquivo a carregar.
   Também moram aqui a folha (painel de escolha), os diálogos da página (confirmar e alerta), a troca de aba e o botão voltar do aparelho. */

const tela = document.getElementById("tela");
const TELAS = { hoje: telaHoje, plano: telaPlano, treino: telaTreino, diario: telaDiario, guia: telaGuia, perfil: telaPerfil };
/* Abas da barra e as telas de cada uma. A primeira tela do grupo é a que abre ao tocar na aba.
   Telas que se registram depois (semana.js, painel.js, a futura tela de caminhos) entram no grupo só se existirem em TELAS. */
const ABAS_GRUPOS = {
  hoje: [["hoje", "Hoje"]],
  semana: [["semana", "Semana"], ["diario", "Diário"], ["painel", "Painel"]],
  comer: [["plano", "Plano"], ["caminhos", "Caminhos"]],
  mover: [["treino", "Treino"]],
  guia: [["guia", "Guia"]],
};
function grupoDe(h) { return Object.keys(ABAS_GRUPOS).find(g => ABAS_GRUPOS[g].some(t => t[0] === h)) || ""; }
/* Sub-abas acima da tela quando o grupo tem mais de uma tela registrada (ex.: Semana · Diário · Painel). */
function subAbas(h) {
  const g = grupoDe(h), telas = g ? ABAS_GRUPOS[g].filter(t => TELAS[t[0]]) : [];
  if (telas.length < 2) return "";
  return '<nav id="subabas" aria-label="Telas de ' + esc(g) + '">' + telas.map(t =>
    '<a href="#' + t[0] + '" data-sub="' + t[0] + '"' + (t[0] === h ? ' class="ativa" aria-current="page"' : "") + ">" + t[1] + "</a>").join("") + "</nav>";
}
function atual() { let h = (location.hash || "#hoje").slice(1); if (!E.perfil) h = "perfil"; return TELAS[h] ? h : "hoje"; }

/* Dados guardados que o app não conseguiu ler (versão mais nova ou arquivo danificado): nada é gravado por cima sem ela decidir. */
function telaIlegivel() {
  return '<div class="cartao alerta"><h2>Não consegui ler os dados guardados</h2><p style="margin:0">Os registros deste celular foram gravados por uma versão diferente do app ou estão danificados. Nada foi apagado e nada será gravado por cima.</p>' +
    '<p class="sub">Você pode mandar os dados guardados para você mesma (para restaurar depois na versão certa do app) e, se quiser, começar do zero. Ao começar do zero, os dados antigos continuam guardados à parte neste celular.</p>' +
    '<div class="botoes"><button data-ac="ilegivelCompartilhar">Compartilhar os dados guardados</button><button class="sec" data-ac="ilegivelRecomecar">Guardar à parte e começar do zero</button></div></div>';
}
AC.ilegivelCompartilhar = function () { compartilhar(ILEGIVEL); };
AC.ilegivelRecomecar = function () {
  confirmar("Começar do zero? Os dados antigos ficam guardados à parte neste celular, mas o app não vai mostrá-los.", function () {
    try { localStorage.setItem(CHAVE + ".guardado." + Date.now(), ILEGIVEL); } catch (x) { alerta("Não foi possível guardar os dados antigos à parte. Nada foi alterado."); return; }
    ILEGIVEL = null; E = vazio(); salvar(); render(true);
  }, "Começar do zero");
};

/* diaDesenhado: a data em que a tela foi desenhada pela última vez. Se o dia virou com o app aberto, a tela é refeita antes de qualquer gravação. */
let diaDesenhado = null;
/* rolarPara: id de um elemento para mostrar no próximo desenho, logo abaixo do cabeçalho fixo (ex.: "Todos os sinais no Guia"
   abre o Guia já nos Sinais de alerta; teste final do APK 2.0, M3). Vale uma vez. */
let rolarPara = null;
function render(topo) {
  const h = atual();
  diaDesenhado = hoje();
  if (cifDesenharPortao()) return; // PIN (app/cifra.js): enquanto bloqueado, só o portão aparece
  tela.innerHTML = ILEGIVEL != null ? telaIlegivel() : (E.perfil ? subAbas(h) : "") + TELAS[h]();
  tela.querySelectorAll("form").forEach(f => { f.noValidate = true; }); // a validação é a de enviarFormulario, que mostra mensagem
  const g = grupoDe(h);
  document.querySelectorAll("#abas a").forEach(a => { const on = a.dataset.aba === g; a.classList.toggle("ativa", on); if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
  document.getElementById("abas").hidden = !E.perfil || ILEGIVEL != null;
  document.getElementById("btn-perfil").hidden = !E.perfil || ILEGIVEL != null;
  document.getElementById("erro-salvar").hidden = !FALHA_SALVAR;
  if (topo) window.scrollTo(0, 0);
  if (rolarPara) {
    const el = document.getElementById(rolarPara), cab = document.getElementById("topo"); rolarPara = null;
    if (el) window.scrollTo(0, Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - (cab ? cab.offsetHeight : 0) - 8));
  }
}
/* Verdadeiro se o dia virou desde o último desenho: redesenha, avisa e quem chamou desiste da ação (para nunca gravar no dia errado). */
function virouODia() {
  if (diaDesenhado === hoje()) return false;
  fecharFolha(); render(true); aviso("Mudou o dia. A tela foi atualizada.");
  return true;
}
function aoVoltarParaFrente() { if (diaDesenhado !== hoje()) render(true); }
document.addEventListener("visibilitychange", () => { if (!document.hidden) aoVoltarParaFrente(); });
window.addEventListener("focus", aoVoltarParaFrente);
window.addEventListener("pageshow", aoVoltarParaFrente);

/* Troca de aba sem empilhar histórico: o botão voltar do aparelho não percorre as abas visitadas. */
function irPara(aba, sub) {
  if (sub) E.ui.diario = sub;
  if (atual() === aba && (location.hash || "#hoje") === "#" + aba) { render(true); return; }
  location.replace("#" + aba);
}
AC.ir = function (d) { irPara(d.para, d.sub); };
AC.tentarSalvar = function () { if (salvar()) aviso("Salvo."); render(); };

/* Folha: painel que sobe de baixo para escolher algo. abrirFolha(titulo, html) mostra; fecharFolha() esconde.
   Fecha também com toque fora dela e com o botão Fechar. render() não fecha a folha: quem escolheu chama fecharFolha(). */
function abrirFolha(titulo, html) {
  const f = document.getElementById("folha");
  f.querySelector(".folha-corpo").innerHTML = '<div class="linha"><h2 style="margin:0">' + esc(titulo) + '</h2><button class="sec" data-ac="fecharFolha">Fechar</button></div>' + html;
  f.querySelectorAll("form").forEach(x => { x.noValidate = true; });
  f.hidden = false; f.querySelector(".folha-corpo").scrollTop = 0;
}
function fecharFolha() { document.getElementById("folha").hidden = true; }
function folhaAberta() { return !document.getElementById("folha").hidden; }
AC.fecharFolha = fecharFolha;

/* Diálogos da própria página, no lugar de confirm() e alert() (que na WebView mostram o título 'A página em "file://" diz').
   confirmar(texto, aoSim, rotuloDoSim): pergunta; só chama aoSim se ela tocar no botão de confirmar. Não devolve nada: o que vem depois vai dentro de aoSim.
   alerta(texto, aoFechar): mensagem que exige um toque em "Entendi". */
let aoSimDoDialogo = null, aoFecharDoDialogo = null;
function mostrarDialogo(texto, botoes) {
  const d = document.getElementById("dialogo");
  d.querySelector(".dialogo-corpo").innerHTML = '<p id="dialogo-texto">' + esc(texto) + '</p><div class="botoes">' + botoes + "</div>";
  d.hidden = false;
  const b = d.querySelector("button"); if (b) b.focus();
}
function confirmar(texto, aoSim, rotuloDoSim) {
  aoSimDoDialogo = aoSim; aoFecharDoDialogo = null;
  mostrarDialogo(texto, '<button class="sec" data-ac="dialogoNao">Cancelar</button><button data-ac="dialogoSim">' + esc(rotuloDoSim || "Confirmar") + "</button>");
}
function alerta(texto, aoFechar) {
  aoSimDoDialogo = null; aoFecharDoDialogo = aoFechar || null;
  mostrarDialogo(texto, '<button data-ac="dialogoNao">Entendi</button>');
}
function dialogoAberto() { return !document.getElementById("dialogo").hidden; }
function fecharDialogo() { document.getElementById("dialogo").hidden = true; }
AC.dialogoSim = function () { const f = aoSimDoDialogo; aoSimDoDialogo = null; fecharDialogo(); if (f) f(); };
AC.dialogoNao = function () { const f = aoFecharDoDialogo; aoSimDoDialogo = null; aoFecharDoDialogo = null; fecharDialogo(); if (f) f(); };

/* Botão voltar do aparelho (o Android chama window.aoVoltar()): fecha diálogo ou folha; de qualquer aba volta para Hoje; em Hoje devolve "sair". */
window.aoVoltar = function () {
  if (dialogoAberto()) { AC.dialogoNao(); return "ficar"; }
  if (folhaAberta()) { fecharFolha(); return "ficar"; }
  if (E.perfil && ILEGIVEL == null && atual() !== "hoje") { irPara("hoje"); return "ficar"; }
  return "sair";
};

/* Campo obrigatório vazio: a WebView não mostra o balão do navegador, então a página avisa e leva o foco ao campo. */
function campoFaltando(f) {
  const c = Array.prototype.find.call(f.querySelectorAll("[required]"), x => !String(x.value || "").trim());
  if (!c) return false;
  const rot = c.closest("label");
  const nome = rot ? (rot.firstChild && rot.firstChild.nodeType === 3 ? rot.firstChild.textContent : rot.textContent).trim() : "";
  aviso(nome ? "Preencha o campo: " + nome + "." : "Preencha os campos obrigatórios.");
  c.focus();
  return true;
}

document.addEventListener("click", e => {
  if (e.target.id === "folha") { fecharFolha(); return; }
  const aba = e.target.closest("#abas a, #btn-perfil, #subabas a");
  if (aba) { e.preventDefault(); if (!dialogoAberto()) irPara(aba.getAttribute("href").slice(1)); return; }
  const b = e.target.closest("[data-ac]"); if (!b || b.disabled) return;
  e.preventDefault();
  if (b.dataset.ac.indexOf("dialogo") !== 0 && virouODia()) return;
  if (AC[b.dataset.ac]) AC[b.dataset.ac](b.dataset, b);
});
document.addEventListener("change", e => {
  const c = e.target;
  if (!(c.dataset && c.dataset.mud && MUD[c.dataset.mud])) return;
  if (virouODia()) return;
  MUD[c.dataset.mud](c);
});
document.addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target, dados = {};
  if (!FORM[f.dataset.form] || virouODia() || campoFaltando(f)) return;
  new FormData(f).forEach((v, k) => { dados[k] = v; });
  FORM[f.dataset.form](dados, f);
});

/* Teclado aberto: a barra de abas some (sobra tela) e o campo em foco é trazido para o meio. */
function campoDeTexto(el) { return el && (el.tagName === "TEXTAREA" || (el.tagName === "INPUT" && ["checkbox", "radio", "button", "submit", "file", "date"].indexOf(el.type) < 0)); }
document.addEventListener("focusin", e => {
  if (!campoDeTexto(e.target)) return;
  document.body.classList.add("teclado");
  const c = e.target;
  setTimeout(() => { if (document.activeElement === c && c.scrollIntoView) c.scrollIntoView({ block: "center" }); }, 350);
});
document.addEventListener("focusout", () => { setTimeout(() => { if (!campoDeTexto(document.activeElement)) document.body.classList.remove("teclado"); }, 100); });

window.addEventListener("hashchange", () => render(true));
cifIniciar(TELAS);
render(true);
