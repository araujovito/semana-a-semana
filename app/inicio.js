"use strict";
/* Liga tudo: escolhe a tela pelo endereço (#hoje, #plano...), desenha e escuta toques, campos e formulários. Último arquivo a carregar. */

const tela = document.getElementById("tela");
const TELAS = { hoje: telaHoje, plano: telaPlano, treino: telaTreino, diario: telaDiario, guia: telaGuia, perfil: telaPerfil };
function atual() { let h = (location.hash || "#hoje").slice(1); if (!E.perfil) h = "perfil"; return TELAS[h] ? h : "hoje"; }
function render(topo) {
  const h = atual();
  tela.innerHTML = TELAS[h]();
  document.querySelectorAll("#abas a").forEach(a => a.classList.toggle("ativa", a.dataset.aba === h));
  document.getElementById("abas").hidden = !E.perfil;
  if (topo) window.scrollTo(0, 0);
}

document.addEventListener("click", e => {
  const b = e.target.closest("[data-ac]"); if (!b || b.disabled) return;
  e.preventDefault(); AC[b.dataset.ac](b.dataset);
});
document.addEventListener("change", e => {
  const c = e.target;
  if (c.dataset && c.dataset.mud && MUD[c.dataset.mud]) MUD[c.dataset.mud](c);
});
document.addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target, dados = {};
  new FormData(f).forEach((v, k) => { dados[k] = v; });
  FORM[f.dataset.form](dados);
});
window.addEventListener("hashchange", () => render(true));
render(true);
