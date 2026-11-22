/* Service worker do PWA: guarda o app no aparelho para abrir sem internet.
   Estratégia: responde do que está guardado (abre rápido e offline) e, em paralelo, busca a versão nova e guarda para a próxima abertura.
   O app não manda dados para lugar nenhum: este arquivo só lida com os arquivos do próprio app (mesma origem).
   ARQUIVOS precisa listar tudo o que index.html carrega (testes/fluxo-pwa.js confere).
   Atualização: o navegador compara este arquivo byte a byte; qualquer mudança aqui conta como versão nova. A cada versão publicada,
   troque CACHE (v1, v2...), para a versão nova guardar seus arquivos à parte e apagar os da anterior ao assumir.
   Na primeira instalação o sw assume na hora. Versão nova instala e espera: pwa.js mostra a faixa "Versão nova pronta" e, no toque,
   manda { tipo: "ativar" }; só então ela assume (skipWaiting) e a página recarrega. Assim duas versões não se misturam na mesma tela. */
"use strict";
const CACHE = "semana-a-semana-v1";
const ARQUIVOS = [
  "./", "index.html", "manifest.webmanifest", "icone-192.png", "icone-512.png", "icone-mascaravel-512.png",
  "estilo.css", "estilo-plano.css", "estilo-hoje.css", "estilo-diario.css", "estilo-treino.css", "estilo-aparelho.css", "estilo-painel.css", "estilo-semana.css", "estilo-caminhos.css",
  "alimentos.js", "cardapio.js", "caminhos.js", "conteudo.js", "nucleo.js", "nutricao.js", "consumo.js", "planonutri.js", "tratamento.js", "caneta.js", "peso.js",
  "sintomas.js", "saude.js", "hoje.js", "plano.js", "compras.js", "treino.js", "diario.js", "guia.js", "perfil.js", "aparelho.js", "seguranca.js",
  "painel.js", "pwa.js", "semana.js", "caminhostela.js", "inicio.js",
  "fontes/zilla-slab-latin-400-normal.woff2", "fontes/zilla-slab-latin-500-normal.woff2", "fontes/zilla-slab-latin-600-normal.woff2", "fontes/zilla-slab-latin-700-normal.woff2", // vêm do CSS, não do index.html
];
// cache: "reload" busca na rede, sem passar pelo cache HTTP do navegador, para a versão nova não guardar arquivo velho.
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS.map(u => new Request(u, { cache: "reload" }))))
    .then(() => { if (!self.registration.active) return self.skipWaiting(); }));
});
self.addEventListener("message", e => { if (e.data && e.data.tipo === "ativar") self.skipWaiting(); });
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
