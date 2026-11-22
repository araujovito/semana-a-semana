/* Service worker do PWA: guarda o app no aparelho para abrir sem internet.
   Estratégia: responde só do que esta versão guardou (abre rápido e offline). A versão nova chega inteira por um sw novo (ver abaixo).
   O app não manda dados para lugar nenhum: este arquivo só lida com os arquivos do próprio app (mesma origem).
   ARQUIVOS precisa listar tudo o que index.html carrega (testes/fluxo-pwa.js confere).
   Atualização: o navegador compara este arquivo byte a byte; qualquer mudança aqui conta como versão nova. A CADA ENTREGA, suba
   VERSAO_APP (montar-apk.sh lembra e o LEIAME diz): o cache tem o nome da versão, então a versão nova guarda os arquivos dela à
   parte e só apaga os da anterior quando assume.
   Cada versão serve SÓ o próprio cache (auditoria 3, I5). Antes, a versão em uso respondia do cache e, ao fundo, gravava por cima o que
   vinha da rede: depois de uma publicação a página podia ficar com metade dos arquivos de cada versão. Agora o arquivo novo só chega
   pelo sw novo, que guarda tudo de uma vez (addAll é atômico: ou guarda todos ou nenhum). Se um arquivo falhar (rede caiu, servidor
   respondeu 503), a instalação do sw novo falha, o cache incompleto é apagado e o sw antigo continua servindo a versão inteira dele;
   o navegador tenta de novo na próxima verificação.
   Na primeira instalação o sw assume na hora. Versão nova instala e espera: pwa.js mostra a faixa "Versão nova pronta" e, no toque,
   manda { tipo: "ativar" }; só então ela assume (skipWaiting) e a página recarrega. Assim duas versões não se misturam na mesma tela. */
"use strict";
const VERSAO_APP = "2026.11.22-3";   // suba a cada entrega (ano.mês.dia-n)
const CACHE = "semana-a-semana-" + VERSAO_APP;
const ARQUIVOS = [
  "./", "index.html", "manifest.webmanifest", "icone-192.png", "icone-512.png", "icone-mascaravel-512.png",
  "estilo.css", "estilo-plano.css", "estilo-hoje.css", "estilo-diario.css", "estilo-treino.css", "estilo-aparelho.css", "estilo-painel.css", "estilo-semana.css", "estilo-caminhos.css", "estilo-cifra.css",
  "alimentos.js", "cardapio.js", "caminhos.js", "conteudo.js", "nucleo.js", "cifra.js", "nutricao.js", "consumo.js", "planonutri.js", "tratamento.js", "caneta.js", "peso.js",
  "sintomas.js", "saude.js", "hoje.js", "plano.js", "compras.js", "treino.js", "diario.js", "guia.js", "perfil.js", "aparelho.js", "seguranca.js",
  "painel.js", "pwa.js", "semana.js", "caminhostela.js", "inicio.js",
  "fontes/zilla-slab-latin-400-normal.woff2", "fontes/zilla-slab-latin-500-normal.woff2", "fontes/zilla-slab-latin-600-normal.woff2", "fontes/zilla-slab-latin-700-normal.woff2", // vêm do CSS, não do index.html
];
// cache: "reload" busca na rede, sem passar pelo cache HTTP do navegador, para a versão nova não guardar arquivo velho.
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS.map(u => new Request(u, { cache: "reload" }))))
    // Falhou um arquivo: apaga o cache desta versão (vazio, porque addAll não grava pela metade) e deixa a instalação falhar.
    .catch(erro => caches.delete(CACHE).then(() => { throw erro; }))
    .then(() => { if (!self.registration.active) return self.skipWaiting(); }));
});
self.addEventListener("message", e => { if (e.data && e.data.tipo === "ativar") self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== self.location.origin) return;
  // Do cache desta versão; o que não está nele (nada do app, em princípio) vai à rede sem ser guardado.
  e.respondWith(caches.open(CACHE).then(c => c.match(r, { ignoreSearch: true })).then(guardado => guardado || fetch(r)));
});
