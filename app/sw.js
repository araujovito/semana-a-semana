/* Service worker do PWA: guarda o app no aparelho para abrir sem internet.
   Estratégia: responde do que está guardado (abre rápido e offline) e, em paralelo, busca a versão nova e guarda para a próxima abertura.
   O app não manda dados para lugar nenhum: este arquivo só lida com os arquivos do próprio app (mesma origem).
   ARQUIVOS precisa listar tudo o que index.html carrega (testes/fluxo-pwa.js confere). */
"use strict";
const CACHE = "semana-a-semana-v1";
const ARQUIVOS = [
  "./", "index.html", "manifest.webmanifest", "icone-192.png", "icone-512.png", "icone-mascaravel-512.png",
  "estilo.css", "estilo-plano.css", "estilo-hoje.css", "estilo-diario.css", "estilo-treino.css", "estilo-aparelho.css", "estilo-painel.css", "estilo-semana.css",
  "alimentos.js", "cardapio.js", "conteudo.js", "nucleo.js", "nutricao.js", "consumo.js", "tratamento.js", "caneta.js", "peso.js",
  "sintomas.js", "saude.js", "hoje.js", "plano.js", "compras.js", "treino.js", "diario.js", "guia.js", "perfil.js", "aparelho.js",
  "painel.js", "pwa.js", "semana.js", "inicio.js",
];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(c => c.match(r, { ignoreSearch: true }).then(guardado => {
    const rede = fetch(r).then(resp => { if (resp && resp.ok) c.put(r, resp.clone()); return resp; }).catch(() => guardado);
    if (guardado) { e.waitUntil(rede.catch(() => {})); return guardado; }
    return rede;
  })));
});
