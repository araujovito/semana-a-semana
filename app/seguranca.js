"use strict";
/* Segurança dos dados que saem do celular. Carregado depois de diario.js e aparelho.js (embrulha a ação de compartilhar de diario.js; aparelho.js usa segLerCopia) e antes de inicio.js.
   - Antes de "Exportar tudo" e de "Compartilhar" o relatório, um diálogo avisa que o texto tem dados de saúde; ela pode seguir ou cancelar.
   - Lembrete discreto de cópia: passados SEG_DIAS_COPIA dias da última exportação, um cartão pequeno em Diário > Relatório, logo acima
     do cartão de cópia, oferece exportar. "Agora não" (E.ui.lembreteCopia) adia pelo mesmo prazo. Quem nunca exportou conta a partir do
     registro mais antigo, para não aparecer no primeiro dia de uso.
   - Exportação e restauração com código de verificação (SHA-256): ver "cópia verificada" abaixo.
   A data da exportação fica em E.ui.ultimaExportacao (AAAA-MM-DD): é a da cópia conferida e entregue ao compartilhar, porque o app
   não tem como saber se ela guardou o texto. */

const SEG_DIAS_COPIA = 14;
const SEG_TEXTO_EXPORTAR = "A cópia tem todos os seus dados de saúde: perfil, aplicações, peso, sintomas e alimentação. Quem receber o texto consegue ler tudo, e o app de mensagens pode guardar uma cópia. Uma opção é mandar só para você mesma.";
const SEG_TEXTO_RELATORIO = "O relatório tem dados de saúde: aplicações, peso, sintomas e alimentação. Quem receber o texto consegue ler tudo, e o app de mensagens pode guardar uma cópia. Mande só para quem você escolher, como o médico ou a nutricionista.";

/* Data (AAAA-MM-DD) a partir da qual o prazo do lembrete conta, ou null se ainda não há nada a guardar. */
function segInicioDoPrazo() {
  const ui = E.ui || {}, marcadas = [ui.ultimaExportacao, ui.lembreteCopia].filter(dataValida).sort();
  if (marcadas.length) return marcadas[marcadas.length - 1];
  const datas = [].concat(E.doses, E.pesos, E.sintomas, E.treinos).map(r => r && r.data).concat(Object.keys(E.dias || {})).filter(dataValida).sort();
  return datas.length ? datas[0] : null;
}
/* Dias desde a última exportação (null se nunca exportou) e se o cartão deve aparecer hoje. */
function segSituacaoCopia(h) {
  const ui = E.ui || {}, inicio = segInicioDoPrazo();
  return { mostrar: !!E.perfil && !!inicio && entre(inicio, h) > SEG_DIAS_COPIA, dias: dataValida(ui.ultimaExportacao) ? entre(ui.ultimaExportacao, h) : null };
}
function segCartaoLembrete() {
  const s = segSituacaoCopia(hoje());
  if (!s.mostrar) return "";
  const frase = s.dias == null ? "Você ainda não exportou uma cópia dos seus registros." : "A última cópia dos seus registros foi exportada há " + s.dias + " dias.";
  return '<div class="cartao seg-lembrete" id="seg-lembrete-copia"><p class="sub">' + frase + ' Se quiser, dá para exportar agora.</p>' +
    '<div class="botoes"><button class="sec" data-ac="exportar">Exportar agora</button><button class="sec" data-ac="segAdiarCopia">Agora não</button></div></div>';
}

/* ---------- cópia verificada ----------
   Formato da exportação (desde a onda 2): { formato: SEG_FORMATO, versao: 1, criada: "AAAA-MM-DD", sha256: "<64 hex>", dados: E }.
   sha256 é o SHA-256 de JSON.stringify(dados). Na restauração o app recalcula: se não bate, o texto foi cortado, corrompido ou
   editado à mão, e nada é gravado. Não é assinatura: quem editar de propósito pode recalcular o código (não há segredo no app).
   Logo depois de exportar, o app relê o texto gerado pelo mesmo caminho da restauração e só então diz "Cópia pronta e conferida".
   Texto antigo (o E puro, sem esse envelope) continua sendo aceito, com aviso de que não tem código de verificação.
   SEG_MAX_TEXTO é o mesmo MAX_TEXTO de MainActivity.java: acima disso o Android não passa o texto para outro app. */
const SEG_FORMATO = "semana-a-semana/copia";
const SEG_VERSAO_COPIA = 1;
const SEG_MAX_TEXTO = 250000;

/* SHA-256 em JavaScript puro (FIPS 180-4), para quando a página não tem WebCrypto. Recebe texto, devolve 64 dígitos hexadecimais. */
function segSha256Js(texto) {
  const b = unescape(encodeURIComponent(texto)), n = b.length, K = [];
  let H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  for (let c = 2, k = 0; k < 64; c++) { let primo = true; for (let d = 2; d * d <= c; d++) if (c % d === 0) { primo = false; break; } if (primo) K[k++] = (Math.pow(c, 1 / 3) * 4294967296) | 0; }
  const palavras = new Array(((n + 9 + 63) >> 6) << 4).fill(0);
  for (let i = 0; i < n; i++) palavras[i >> 2] |= b.charCodeAt(i) << (24 - (i % 4) * 8);
  palavras[n >> 2] |= 0x80 << (24 - (n % 4) * 8);
  palavras[palavras.length - 1] = (n * 8) | 0; palavras[palavras.length - 2] = Math.floor(n / 0x20000000);
  const r = (x, s) => (x >>> s) | (x << (32 - s)), w = new Array(64);
  for (let i = 0; i < palavras.length; i += 16) {
    let [a, bb, c, d, e, f, g, h] = H;
    for (let t = 0; t < 64; t++) {
      w[t] = t < 16 ? palavras[i + t] : (w[t - 16] + (r(w[t - 15], 7) ^ r(w[t - 15], 18) ^ (w[t - 15] >>> 3)) + w[t - 7] + (r(w[t - 2], 17) ^ r(w[t - 2], 19) ^ (w[t - 2] >>> 10))) | 0;
      const t1 = (h + (r(e, 6) ^ r(e, 11) ^ r(e, 25)) + ((e & f) ^ (~e & g)) + K[t] + w[t]) | 0, t2 = ((r(a, 2) ^ r(a, 13) ^ r(a, 22)) + ((a & bb) ^ (a & c) ^ (bb & c))) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = bb; bb = a; a = (t1 + t2) | 0;
    }
    H = [a, bb, c, d, e, f, g, h].map((x, j) => (H[j] + x) | 0);
  }
  return H.map(x => (x >>> 0).toString(16).padStart(8, "0")).join("");
}
/* SHA-256 pelo WebCrypto do navegador quando existe (file:// e https contam como contexto seguro); senão, o de cima. Devolve Promise. */
function segSha256(texto) {
  const sutil = typeof crypto !== "undefined" && crypto.subtle && typeof TextEncoder !== "undefined" ? crypto.subtle : null;
  if (!sutil) return Promise.resolve(segSha256Js(texto));
  return sutil.digest("SHA-256", new TextEncoder().encode(texto))
    .then(buf => Array.prototype.map.call(new Uint8Array(buf), x => x.toString(16).padStart(2, "0")).join(""), () => segSha256Js(texto));
}
/* Texto da cópia de um estado. Devolve Promise do texto. */
function segMontarCopia(estado) {
  const dados = JSON.stringify(estado);
  return segSha256(dados).then(h => '{"formato":"' + SEG_FORMATO + '","versao":' + SEG_VERSAO_COPIA + ',"criada":"' + hoje() + '","sha256":"' + h + '","dados":' + dados + "}");
}
/* Lê um texto colado. Devolve Promise de { estado, conferida } (conferida = tinha código e bateu) ou { erro: mensagem para ela }. */
function segLerCopia(texto) {
  const invalido = { erro: "Texto inválido. Cole o conteúdo exportado inteiro." };
  let j; try { j = JSON.parse(texto); } catch (e) { return Promise.resolve(invalido); }
  if (j && typeof j === "object" && j.formato === SEG_FORMATO) {
    if (j.versao !== SEG_VERSAO_COPIA) return Promise.resolve({ erro: "Esta cópia foi feita por uma versão mais nova do app. Atualize o app e tente de novo. Nada foi mudado." });
    return segSha256(JSON.stringify(j.dados)).then(h => {
      if (h !== j.sha256) return { erro: "O texto colado não confere com o código de verificação da cópia: ele foi cortado, danificado ou alterado. Nada foi mudado. Tente colar de novo o texto inteiro, do jeito que foi exportado." };
      const e = migrar(j.dados);
      return e && e.perfil ? { estado: e, conferida: true } : invalido;
    });
  }
  const e = migrar(j);
  return Promise.resolve(e && e.perfil ? { estado: e, conferida: false } : invalido);
}
/* Exporta: monta, relê pelo caminho da restauração, confere que volta igual e só então entrega ao compartilhar. */
function segExportar() {
  const estado = JSON.parse(JSON.stringify(E)); estado.ui.ultimaExportacao = hoje(); // a data vai junto na cópia
  const foto = JSON.stringify(estado);
  return segMontarCopia(JSON.parse(foto)).then(t => segLerCopia(t).then(r => {
    if (r.erro || !r.conferida || JSON.stringify(r.estado) !== JSON.stringify(migrar(JSON.parse(foto)))) {
      alerta("Não consegui conferir a cópia gerada, então nada foi enviado. Tente de novo.");
      return;
    }
    if (window.Android && t.length > SEG_MAX_TEXTO) {
      alerta("A cópia ficou grande demais para o Android passar para outro app (" + Math.round(t.length / 1000) + " mil caracteres; o limite é " + SEG_MAX_TEXTO / 1000 + " mil). Nada foi enviado.");
      return;
    }
    if (compartilhar(t) === false) return; // a ponte do Android recusou: já avisou e a cópia não conta como feita
    E.ui.ultimaExportacao = estado.ui.ultimaExportacao; salvar();
    aviso("Cópia pronta e conferida.");
    render();
  }));
}

(function () {
  const compartilharTexto = AC.compartilhar;
  Object.assign(AC, {
    exportar() {
      confirmar(SEG_TEXTO_EXPORTAR, segExportar, "Seguir");
    },
    compartilhar(d, b) {
      if (d.de !== "rel") { compartilharTexto(d, b); return; }
      confirmar(SEG_TEXTO_RELATORIO, function () { compartilharTexto(d, b); }, "Seguir");
    },
    segAdiarCopia() { E.ui.lembreteCopia = hoje(); salvar(); render(); },
  });
})();
