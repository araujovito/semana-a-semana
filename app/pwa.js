"use strict";
/* Versão web instalável (PWA). No app Android (WebView, window.Android) e ao abrir o arquivo direto (file://) nada disto roda.
   - registra o service worker (sw.js), que guarda o app para abrir sem internet;
   - pede ao navegador para não apagar os dados do app sozinho quando faltar espaço (navigator.storage.persist).
   Os dados continuam em localStorage, só neste aparelho e neste navegador. */
(function () {
  const web = !window.Android && /^https?:$/.test(location.protocol);
  window.EH_PWA = web;
  if (!web) return;
  if ("serviceWorker" in navigator) window.addEventListener("load", () => { navigator.serviceWorker.register("sw.js").catch(() => {}); });
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
})();
