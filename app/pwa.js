"use strict";
/* Versão web instalável (PWA). No app Android (WebView, window.Android) e ao abrir o arquivo direto (file://) nada disto roda.
   - registra o service worker (sw.js), que guarda o app para abrir sem internet;
   - pede ao navegador para não apagar os dados do app sozinho quando faltar espaço (navigator.storage.persist);
   - versão nova: quando um sw.js diferente termina de se instalar, ele fica esperando (sw.js não assume sozinho enquanto o app está
     aberto, para não misturar arquivos de duas versões). Uma faixa no rodapé diz "Versão nova pronta. Toque para atualizar"; o toque
     manda o sw novo assumir ({ tipo: "ativar" }) e, quando ele assume (controllerchange), a página recarrega já na versão nova.
     Sem o toque, a versão nova assume sozinha quando todas as janelas do app forem fechadas.
   Os dados continuam em localStorage, só neste aparelho e neste navegador; atualizar não mexe neles. */
(function () {
  const web = !window.Android && /^https?:$/.test(location.protocol);
  window.EH_PWA = web;
  if (!web) return;
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  if (!("serviceWorker" in navigator)) return;
  let pediuAtualizar = false;
  function mostrarFaixa(novo) {
    let f = document.getElementById("seg-versao-nova");
    if (!f) {
      f = document.createElement("div"); f.id = "seg-versao-nova"; f.setAttribute("role", "status");
      f.innerHTML = '<button type="button">Versão nova pronta. Toque para atualizar</button>';
      document.body.appendChild(f);
    }
    f.querySelector("button").onclick = function () { pediuAtualizar = true; this.disabled = true; novo.postMessage({ tipo: "ativar" }); };
    f.hidden = false;
  }
  // Só é "versão nova" se já havia uma versão controlando a página; na primeira instalação não há o que atualizar.
  function acompanhar(sw) {
    if (!sw) return;
    const ver = () => { if (sw.state === "installed" && navigator.serviceWorker.controller) mostrarFaixa(sw); };
    ver(); sw.addEventListener("statechange", ver);
  }
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (pediuAtualizar) location.reload(); });
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").then(reg => {
      acompanhar(reg.waiting);
      reg.addEventListener("updatefound", () => acompanhar(reg.installing));
      // O app costuma ficar aberto por dias: ao voltar para ele, confere se há versão nova.
      document.addEventListener("visibilitychange", () => { if (!document.hidden) reg.update().catch(() => {}); });
    }).catch(() => {});
  });
})();
