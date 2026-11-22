"use strict";
/* Cifra dos registros com PIN de 6 dígitos (pedido do dono, 22/11). Usa só a WebCrypto do próprio navegador (crypto.subtle); nada vem de fora.
   Carregado logo depois de nucleo.js. inicio.js chama cifIniciar() antes do primeiro desenho, e render() chama cifDesenharPortao().

   Como funciona:
   - Uma chave de dados aleatória (AES-GCM, 256 bits) cifra o estado inteiro (o mesmo JSON que antes ia em texto para "semana-a-semana.v1").
   - Essa chave é guardada embrulhada (AES-KW) duas vezes: por uma chave derivada do PIN e por uma derivada do código de recuperação.
     As duas derivações são PBKDF2-SHA256 com sal aleatório próprio. O número de iterações é medido no próprio aparelho na criação
     do PIN (alvo de CIF_ALVO_MS, com piso e teto) e fica guardado junto.
   - Em localStorage, na chave CIF_GUARDA, fica só { v, sal, salRec, iter, chaveEmbrulhadaPin, chaveEmbrulhadaRec, iv, dadosCifrados }.
     O PIN e o código de recuperação nunca são gravados; a chave de dados só existe em memória (cifChave) enquanto o app está desbloqueado.
   - Bloqueia ao abrir, quando o app vai para segundo plano e depois de 5 minutos sem toque. Ao bloquear, a chave e o estado (E) saem da memória.
   - PIN errado: a partir do 5º erro seguido, espera de 30 s, depois 1 min, depois 5 min. Os dados nunca são apagados por erro de PIN.
   - Criação: com dados em texto já existentes, eles são cifrados, a cópia cifrada é relida e decifrada, e só se o texto bater o texto puro é apagado.
   O que a cifra protege e o que não protege: empresa/relatorios/cifra.md. */

const CIF_VERSAO = 1;
const CIF_TENTATIVAS = "semana-a-semana.cifra.tentativas"; // { n: erros seguidos, ate: instante (ms) até quando esperar }. Não é segredo.
const CIF_ALFABETO = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";    // 32 símbolos, sem 0/O e 1/I: 4 grupos de 5 = 100 bits
const CIF_INATIVO_MS = 5 * 60 * 1000;
const CIF_ESPERAS = [30, 60, 300];                              // segundos depois do 5º, 6º e 7º erro (e seguintes)
const CIF_ALVO_MS = 750, CIF_ITER_MIN = 600000, CIF_ITER_MAX = 10000000;
const CIF_CAMPOS = ["v", "sal", "salRec", "iter", "chaveEmbrulhadaPin", "chaveEmbrulhadaRec", "iv", "dadosCifrados"];

let cifChave = null;      // chave de dados (CryptoKey) enquanto desbloqueado; null quando bloqueado
let cifReg = null;        // último registro gravado (sem nenhum segredo: sal, iterações e chaves embrulhadas)
let cifFila = Promise.resolve(); // gravações em ordem: uma não passa a outra
let cifUltimoUso = Date.now();
let cifEngolirClique = false;

/* ---------- conversões ---------- */
const cifTxt = s => new TextEncoder().encode(s);
function cifB64(u8) { let s = ""; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); }
function cifDeB64(s) { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
const cifAleatorio = n => crypto.getRandomValues(new Uint8Array(n));
function cifTemSubtle() { return typeof crypto !== "undefined" && !!crypto && !!crypto.subtle; }
const cifPinValido = p => /^\d{6}$/.test(String(p == null ? "" : p));

/* ---------- código de recuperação ---------- */
function cifNovoCodigo() {
  const b = cifAleatorio(20); let s = "";
  for (let i = 0; i < 20; i++) { s += CIF_ALFABETO[b[i] & 31]; if (i % 5 === 4 && i < 19) s += "-"; }
  return s;
}
/* Aceita minúsculas, espaços e traços. Devolve os 20 símbolos juntos, ou null se não for um código possível. */
function cifNormalizarCodigo(s) {
  const t = String(s == null ? "" : s).toUpperCase().replace(/[^0-9A-Z]/g, "");
  return t.length === 20 && t.split("").every(c => CIF_ALFABETO.indexOf(c) >= 0) ? t : null;
}

/* ---------- WebCrypto ---------- */
async function cifDerivar(segredo, sal, iter) {
  const base = await crypto.subtle.importKey("raw", cifTxt(segredo), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt: sal, iterations: iter }, base, { name: "AES-KW", length: 256 }, false, ["wrapKey", "unwrapKey"]);
}
async function cifEmbrulhar(chave, kek) { return cifB64(new Uint8Array(await crypto.subtle.wrapKey("raw", chave, kek, "AES-KW"))); }
/* Lança erro se o segredo (PIN ou código) estiver errado: o AES-KW confere a integridade ao desembrulhar. */
async function cifDesembrulhar(b64, kek, extraivel) {
  return crypto.subtle.unwrapKey("raw", cifDeB64(b64), kek, "AES-KW", { name: "AES-GCM" }, !!extraivel, ["encrypt", "decrypt"]);
}
async function cifCifrar(chave, texto) {
  const iv = cifAleatorio(12);
  const c = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, chave, cifTxt(texto));
  return { iv: cifB64(iv), dadosCifrados: cifB64(new Uint8Array(c)) };
}
async function cifDecifrar(chave, iv, dados) {
  return new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: cifDeB64(iv) }, chave, cifDeB64(dados)));
}
/* Iterações para a derivação levar cerca de CIF_ALVO_MS neste aparelho. Mede com contagens crescentes até passar de 150 ms. */
async function cifCalibrar() {
  let it = 50000, ms = 0;
  for (;;) {
    const base = await crypto.subtle.importKey("raw", cifTxt("calibrar"), "PBKDF2", false, ["deriveBits"]);
    const t = Date.now();
    await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: cifAleatorio(16), iterations: it }, base, 256);
    ms = Date.now() - t;
    if (ms >= 150 || it >= CIF_ITER_MAX) break;
    it *= 4;
  }
  const alvo = Math.round(it * CIF_ALVO_MS / Math.max(ms, 1) / 10000) * 10000;
  return Math.min(CIF_ITER_MAX, Math.max(CIF_ITER_MIN, alvo));
}

/* ---------- registro guardado ---------- */
const cifB64Ok = (s, bytes) => { if (typeof s !== "string" || !/^[A-Za-z0-9+/]+=*$/.test(s)) return false; try { return bytes == null || atob(s).length === bytes; } catch (x) { return false; } };
/* Devolve o registro se tiver o formato certo; null se estiver danificado. */
function cifValidar(r) {
  if (!r || typeof r !== "object" || r.v !== CIF_VERSAO || !Number.isInteger(r.iter) || r.iter < 1000 || r.iter > 100000000) return null;
  if (!cifB64Ok(r.sal, 16) || !cifB64Ok(r.salRec, 16) || !cifB64Ok(r.chaveEmbrulhadaPin, 40) || !cifB64Ok(r.chaveEmbrulhadaRec, 40) || !cifB64Ok(r.iv, 12) || !cifB64Ok(r.dadosCifrados)) return null;
  const o = {}; CIF_CAMPOS.forEach(k => { o[k] = r[k]; }); return o;
}
/* undefined: não há dados cifrados; null: há, mas danificados; objeto: o registro. */
function cifLerGuardado() {
  let bruto = null;
  try { bruto = localStorage.getItem(CIF_GUARDA); } catch (x) { return null; }
  if (bruto == null) return undefined;
  try { return cifValidar(JSON.parse(bruto)); } catch (x) { return null; }
}
/* Monta um registro novo (sem gravar). Devolve { reg, chave }. */
async function cifMontar(pin, codigo, texto, iter) {
  const chave = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const sal = cifAleatorio(16), salRec = cifAleatorio(16);
  const reg = { v: CIF_VERSAO, sal: cifB64(sal), salRec: cifB64(salRec), iter,
    chaveEmbrulhadaPin: await cifEmbrulhar(chave, await cifDerivar(pin, sal, iter)),
    chaveEmbrulhadaRec: await cifEmbrulhar(chave, await cifDerivar(cifNormalizarCodigo(codigo), salRec, iter)) };
  Object.assign(reg, await cifCifrar(chave, texto));
  return { reg, chave };
}

/* ---------- tentativas de PIN ---------- */
function cifTentativas() { try { const x = JSON.parse(localStorage.getItem(CIF_TENTATIVAS)); if (x && Number.isInteger(x.n) && typeof x.ate === "number") return x; } catch (e) {} return { n: 0, ate: 0 }; }
const cifEsperaDepoisDe = n => (n < 5 ? 0 : CIF_ESPERAS[Math.min(n - 5, CIF_ESPERAS.length - 1)]);
/* Segundos que ainda faltam esperar (0 = pode tentar). */
function cifFaltaEsperar() { return Math.max(0, Math.ceil((cifTentativas().ate - Date.now()) / 1000)); }
function cifErrou() { const t = cifTentativas(); t.n++; t.ate = Date.now() + cifEsperaDepoisDe(t.n) * 1000; try { localStorage.setItem(CIF_TENTATIVAS, JSON.stringify(t)); } catch (e) {} return t; }
function cifAcertou() { try { localStorage.removeItem(CIF_TENTATIVAS); } catch (e) {} }

/* ---------- estado aberto / fechado ---------- */
/* Grava o estado cifrado com a chave em memória. Devolve true na hora (a gravação segue na fila); se falhar, a faixa de erro aparece. */
function cifGravar(textoDoEstado) {
  const chave = cifChave;
  if (!chave || !cifReg) return false;
  cifFila = cifFila.then(async () => {
    const c = await cifCifrar(chave, textoDoEstado);
    const novo = Object.assign({}, cifReg, c);
    localStorage.setItem(CIF_GUARDA, JSON.stringify(novo));
    cifReg = novo;
  }).catch(() => {
    FALHA_SALVAR = true;
    const f = typeof document !== "undefined" && document.getElementById("erro-salvar"); if (f) f.hidden = false;
  });
  return true;
}
function cifAbrir(chave, reg, estado) {
  cifChave = chave; cifReg = reg; E = estado;
  CIF_TRANCADO = false; CIF_GRAVAR = cifGravar; cifUltimoUso = Date.now();
}
/* Descarta a chave e os dados da memória. As gravações já na fila terminam com a chave que tinham. */
function cifBloquear() {
  if (!cifChave) return false;
  cifChave = null; CIF_GRAVAR = null; CIF_TRANCADO = true; E = vazio();
  cifPasso = "pin"; cifMsg = "";
  return true;
}
/* Espera as gravações pendentes (usado nos testes e antes de trocar o PIN). */
function cifEsperarGravacoes() { return cifFila; }

/* ---------- operações (sem tela; testadas em testes/unidade/cifra.js) ---------- */
/* Cria a proteção com o estado atual (E). Grava o registro, relê, decifra e confere; só então apaga o texto puro.
   Se algo falhar, apaga só o que acabou de gravar e lança erro: os dados em texto ficam como estavam. */
async function cifCriarProtecao(pin, codigo, iter) {
  if (!cifPinValido(pin) || !cifNormalizarCodigo(codigo)) throw new Error("PIN ou código inválido");
  const texto = JSON.stringify(E);
  const m = await cifMontar(pin, codigo, texto, iter || await cifCalibrar());
  try {
    localStorage.setItem(CIF_GUARDA, JSON.stringify(m.reg));
    const relido = cifLerGuardado();
    if (!relido || (await cifDecifrar(m.chave, relido.iv, relido.dadosCifrados)) !== texto) throw new Error("conferência falhou");
  } catch (x) { try { localStorage.removeItem(CIF_GUARDA); } catch (y) {} throw x; }
  try { localStorage.removeItem(CHAVE); } catch (x) {}
  cifAcertou();
  cifAbrir(m.chave, m.reg, E);
  return true;
}
/* Abre com a chave já desembrulhada: decifra, lê e apaga sobra de texto puro de uma migração interrompida (só se for igual). */
async function cifAbrirCom(chave, reg) {
  let estado = null;
  try { estado = migrar(JSON.parse(await cifDecifrar(chave, reg.iv, reg.dadosCifrados))); } catch (x) { estado = null; }
  if (!estado) return "danificado";
  try {
    const sobra = localStorage.getItem(CHAVE);
    if (sobra != null) { const s = migrar(JSON.parse(sobra)); if (s && JSON.stringify(s) === JSON.stringify(estado)) localStorage.removeItem(CHAVE); }
  } catch (x) {}
  cifAbrir(chave, reg, estado);
  return "ok";
}
/* "ok" | "errado" | "espera" | "danificado" */
async function cifDesbloquear(pin) {
  if (cifFaltaEsperar() > 0) return "espera";
  const reg = cifLerGuardado(); if (!reg) return "danificado";
  let chave;
  try { chave = await cifDesembrulhar(reg.chaveEmbrulhadaPin, await cifDerivar(String(pin), cifDeB64(reg.sal), reg.iter), false); }
  catch (x) { cifErrou(); return cifFaltaEsperar() > 0 ? "espera" : "errado"; }
  cifAcertou();
  return cifAbrirCom(chave, reg);
}
/* Esqueci o PIN: com o código certo, a chave fica em cifChaveRecuperada até ela criar o PIN novo. "ok" | "errado" | "danificado" */
let cifChaveRecuperada = null;
async function cifRecuperar(codigo) {
  const c = cifNormalizarCodigo(codigo); if (!c) return "errado";
  const reg = cifLerGuardado(); if (!reg) return "danificado";
  try { cifChaveRecuperada = await cifDesembrulhar(reg.chaveEmbrulhadaRec, await cifDerivar(c, cifDeB64(reg.salRec), reg.iter), true); }
  catch (x) { return "errado"; }
  return "ok";
}
/* Embrulha a chave de dados com um PIN novo (sal novo). O código de recuperação continua o mesmo. */
async function cifReembrulhar(chaveExtraivel, reg, novoPin) {
  const sal = cifAleatorio(16);
  return Object.assign({}, reg, { sal: cifB64(sal), chaveEmbrulhadaPin: await cifEmbrulhar(chaveExtraivel, await cifDerivar(novoPin, sal, reg.iter)) });
}
async function cifPinNovoDepoisDeRecuperar(novoPin) {
  const reg = cifLerGuardado(); if (!reg || !cifChaveRecuperada) return "danificado";
  const k = cifChaveRecuperada, novo = await cifReembrulhar(k, reg, novoPin);
  try { localStorage.setItem(CIF_GUARDA, JSON.stringify(novo)); } catch (x) { return "falhou"; }
  cifChaveRecuperada = null; cifAcertou();
  return cifAbrirCom(k, novo);
}
/* Trocar PIN (desbloqueado). "ok" | "errado" | "espera" | "falhou" */
async function cifTrocarPin(atual, novoPin) {
  if (cifFaltaEsperar() > 0) return "espera";
  await cifFila;
  const reg = cifReg; let k;
  try { k = await cifDesembrulhar(reg.chaveEmbrulhadaPin, await cifDerivar(String(atual), cifDeB64(reg.sal), reg.iter), true); }
  catch (x) { cifErrou(); return cifFaltaEsperar() > 0 ? "espera" : "errado"; }
  cifAcertou();
  let certo = false;
  cifFila = cifFila.then(async () => {
    const novo = await cifReembrulhar(k, cifReg, novoPin);
    localStorage.setItem(CIF_GUARDA, JSON.stringify(novo)); cifReg = novo; certo = true;
  }).catch(() => {});
  await cifFila;
  return certo ? "ok" : "falhou";
}
/* Dados cifrados danificados: guarda à parte (como estão, cifrados) e deixa começar do zero com PIN novo. */
function cifGuardarAParte() {
  const bruto = localStorage.getItem(CIF_GUARDA);
  localStorage.setItem(CIF_GUARDA + ".guardado." + Date.now(), bruto);
  localStorage.removeItem(CIF_GUARDA);
  CIF_TRANCADO = false; cifReg = null; cifChave = null; CIF_GRAVAR = null; E = vazio();
}

/* ---------- telas do portão ---------- */
/* cifPasso: null (app aberto) | "criar" | "repetir" | "preparando" | "codigo" | "confirmar" | "pin" | "abrindo" | "recuperar" | "novoPin" | "novoPinRepetir" | "danificado" | "semCifra" */
let cifPasso = null, cifMsg = "";
let cifCriacao = null;   // só durante a criação, em memória: { pin, codigo, grupo, iter }
let cifRelogio = null;

function cifPrecisaCriar() { return !cifChave && !CIF_TRANCADO && ILEGIVEL == null && cifTemSubtle() && !(typeof window !== "undefined" && window.cifTesteSemPin); }

function cifCampoPin(nome, rotulo) {
  return '<label>' + esc(rotulo) + '<input class="cif-pin" name="' + nome + '" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="off" required></label>';
}
function cifForm(form, titulo, texto, campos, botao, extra) {
  return '<form class="cartao cif" data-form="' + form + '"><h2>' + esc(titulo) + '</h2>' + (texto ? '<p class="sub">' + texto + "</p>" : "") + campos +
    (cifMsg ? '<p class="cif-msg" role="alert">' + esc(cifMsg) + "</p>" : "") +
    '<div class="botoes"><button type="submit">' + esc(botao) + "</button>" + (extra || "") + "</div></form>";
}
function cifTela() {
  const espera = cifFaltaEsperar();
  switch (cifPasso) {
    case "criar": return cifForm("cifCriar", "Crie um PIN de 6 dígitos", "O PIN protege seus registros neste celular. O app vai pedir o PIN ao abrir, quando voltar de outro app e depois de 5 minutos sem uso.", cifCampoPin("pin", "PIN (6 números)"), "Continuar");
    case "repetir": return cifForm("cifRepetir", "Digite o PIN de novo", "Para conferir.", cifCampoPin("pin", "PIN de novo"), "Continuar", '<button type="button" class="sec" data-ac="cifRecomecar">Voltar</button>');
    case "preparando": return '<div class="cartao cif"><h2>Preparando a proteção</h2><p class="sub" role="status">Leva alguns segundos.</p></div>';
    case "abrindo": return '<div class="cartao cif"><h2>Conferindo</h2><p class="sub" role="status">Leva alguns segundos.</p></div>';
    case "codigo": return '<div class="cartao cif"><h2>Código de recuperação</h2><p class="sub">Se esquecer o PIN, este código abre os seus registros. Ele só aparece agora, uma vez.</p>' +
      '<p class="cif-codigo" id="cif-codigo">' + esc(cifCriacao.codigo).replace(/-/g, '<span aria-hidden="true"> </span>') + "</p>" +
      '<p class="cif-aviso">Anote em papel e guarde fora do celular. Sem o PIN e sem este código, os dados não podem ser recuperados.</p>' +
      '<div class="botoes"><button data-ac="cifAnotei">Anotei</button></div></div>';
    case "confirmar": return cifForm("cifConfirmar", "Confira o que anotou", "Digite o grupo " + (cifCriacao.grupo + 1) + " do código (o " + ["primeiro", "segundo", "terceiro", "quarto"][cifCriacao.grupo] + " bloco de 5).",
      '<label>Grupo ' + (cifCriacao.grupo + 1) + '<input class="cif-grupo" name="grupo" maxlength="5" autocomplete="off" autocapitalize="characters" spellcheck="false" required></label>', "Confirmar",
      '<button type="button" class="sec" data-ac="cifVerCodigo">Ver o código de novo</button>');
    case "pin": return cifForm("cifEntrar", "Digite o seu PIN", espera ? "Muitas tentativas erradas. Espere " + cifTempo(espera) + " para tentar de novo. Os dados não são apagados." : "",
      cifCampoPin("pin", "PIN"), "Entrar", '<button type="button" class="sec" data-ac="cifEsqueci">Esqueci o PIN</button>');
    case "recuperar": return cifForm("cifRecuperar", "Esqueci o PIN", "Digite o código de recuperação que você anotou (20 letras e números). Depois você cria um PIN novo.",
      '<label>Código de recuperação<input class="cif-grupo" name="codigo" autocomplete="off" autocapitalize="characters" spellcheck="false" required></label>', "Continuar",
      '<button type="button" class="sec" data-ac="cifVoltarPin">Voltar</button>');
    case "novoPin": return cifForm("cifNovoPin", "Crie um PIN novo", "O código de recuperação continua o mesmo.", cifCampoPin("pin", "PIN novo (6 números)"), "Continuar");
    case "novoPinRepetir": return cifForm("cifNovoPinRepetir", "Digite o PIN novo de novo", "Para conferir.", cifCampoPin("pin", "PIN novo de novo"), "Salvar PIN");
    case "danificado": return '<div class="cartao alerta cif"><h2>Não consegui abrir os dados guardados</h2><p style="margin:0">Os registros cifrados deste celular parecem danificados. Nada foi apagado e nada será gravado por cima.</p>' +
      '<p class="sub">Se você tiver uma exportação (texto), dá para começar do zero e restaurar. Ao começar do zero, os dados danificados continuam guardados à parte, cifrados.</p>' +
      '<div class="botoes"><button class="sec" data-ac="cifVoltarPin">Tentar de novo</button><button class="sec" data-ac="cifRecomecarDoZero">Guardar à parte e começar do zero</button></div></div>';
    case "semCifra": return '<div class="cartao alerta cif"><h2>Não consigo abrir os dados</h2><p style="margin:0">Os registros estão protegidos por PIN, mas este navegador não oferece a cifra necessária para abri-los. Nada foi apagado.</p></div>';
  }
  return "";
}
function cifTempo(s) { return s >= 60 ? Math.ceil(s / 60) + (s >= 120 ? " minutos" : " minuto") : s + " segundos"; }

/* Chamado por render(). Devolve true se desenhou o portão (e o app não deve desenhar a tela pedida). */
function cifDesenharPortao() {
  if (!cifPasso && cifPrecisaCriar()) cifPasso = "criar";
  if (!cifPasso) return false;
  const t = document.getElementById("tela");
  t.innerHTML = '<div class="cif-portao">' + cifTela() + "</div>";
  t.querySelectorAll("form").forEach(f => { f.noValidate = true; });
  document.getElementById("abas").hidden = true;
  document.getElementById("btn-perfil").hidden = true;
  document.getElementById("erro-salvar").hidden = true;
  window.scrollTo(0, 0);
  const c = t.querySelector("input"); if (c) c.focus();
  clearTimeout(cifRelogio);
  if (cifPasso === "pin" && cifFaltaEsperar() > 0) cifRelogio = setTimeout(() => { if (cifPasso === "pin") render(); }, 1000);
  return true;
}
function cifIr(passo, msg) { cifPasso = passo; cifMsg = msg || ""; render(true); }

Object.assign(FORM, {
  cifCriar(d) {
    if (!cifPinValido(d.pin)) { cifIr("criar", "O PIN precisa ter 6 números."); return; }
    cifCriacao = { pin: d.pin }; cifIr("repetir");
  },
  async cifRepetir(d) {
    if (!cifCriacao || d.pin !== cifCriacao.pin) { cifCriacao = null; cifIr("criar", "Os dois PINs não são iguais. Crie de novo."); return; }
    cifIr("preparando");
    cifCriacao.iter = await cifCalibrar();
    cifCriacao.codigo = cifNovoCodigo(); cifCriacao.grupo = cifAleatorio(1)[0] & 3;
    cifIr("codigo");
  },
  async cifConfirmar(d) {
    const grupo = cifCriacao.codigo.split("-")[cifCriacao.grupo];
    if (String(d.grupo || "").toUpperCase().replace(/[^0-9A-Z]/g, "") !== grupo) { cifIr("confirmar", "Não confere. Veja o código de novo e confira o que anotou."); return; }
    const c = cifCriacao; cifIr("preparando");
    try { await cifCriarProtecao(c.pin, c.codigo, c.iter); }
    catch (x) { cifCriacao = null; cifIr("criar", "Não foi possível guardar os dados cifrados neste celular. Nada foi apagado. Tente de novo."); return; }
    cifCriacao = null; cifPasso = null; cifMsg = ""; render(true); aviso("PIN criado.");
  },
  async cifEntrar(d) {
    if (cifFaltaEsperar() > 0) { cifIr("pin"); return; }
    if (!cifPinValido(d.pin)) { cifIr("pin", "O PIN tem 6 números."); return; }
    cifIr("abrindo");
    const r = await cifDesbloquear(d.pin);
    if (r === "ok") { cifPasso = null; cifMsg = ""; render(true); return; }
    if (r === "danificado") { cifIr("danificado"); return; }
    const n = cifTentativas().n;
    cifIr("pin", r === "espera" ? "" : "PIN errado." + (n >= 2 && n < 5 ? " Depois de 5 erros seguidos, o app pede para esperar antes de tentar de novo." : ""));
  },
  async cifRecuperar(d) {
    if (!cifNormalizarCodigo(d.codigo)) { cifIr("recuperar", "O código tem 20 letras e números (sem 0, 1, O e I)."); return; }
    cifIr("abrindo");
    const r = await cifRecuperar(d.codigo);
    if (r === "ok") cifIr("novoPin"); else if (r === "danificado") cifIr("danificado"); else cifIr("recuperar", "Código não confere. Confira o que anotou.");
  },
  cifNovoPin(d) {
    if (!cifPinValido(d.pin)) { cifIr("novoPin", "O PIN precisa ter 6 números."); return; }
    cifCriacao = { pin: d.pin }; cifIr("novoPinRepetir");
  },
  async cifNovoPinRepetir(d) {
    if (!cifCriacao || d.pin !== cifCriacao.pin) { cifCriacao = null; cifIr("novoPin", "Os dois PINs não são iguais. Crie de novo."); return; }
    cifCriacao = null; cifIr("preparando");
    const r = await cifPinNovoDepoisDeRecuperar(d.pin);
    if (r === "ok") { cifPasso = null; cifMsg = ""; render(true); aviso("PIN novo criado."); }
    else if (r === "danificado") cifIr("danificado");
    else cifIr("novoPin", "Não foi possível guardar o PIN novo. Tente de novo.");
  },
  async cifTrocar(d, f) {
    const msg = t => { const el = f.querySelector(".cif-msg"); el.textContent = t; el.hidden = false; };
    if (!cifPinValido(d.atual)) { msg("Digite o PIN atual (6 números)."); return; }
    if (!cifPinValido(d.novo)) { msg("O PIN novo precisa ter 6 números."); return; }
    if (d.novo !== d.repetir) { msg("Os dois PINs novos não são iguais."); return; }
    const b = f.querySelector("button[type=submit]"); b.disabled = true; msg("Conferindo…");
    const r = await cifTrocarPin(d.atual, d.novo);
    b.disabled = false;
    if (r === "ok") { fecharFolha(); aviso("PIN trocado."); return; }
    msg(r === "espera" ? "Muitas tentativas erradas. Espere " + cifTempo(cifFaltaEsperar()) + "." : r === "errado" ? "PIN atual errado." : "Não foi possível guardar o PIN novo. Nada mudou.");
  },
});
Object.assign(AC, {
  cifRecomecar() { cifCriacao = null; cifIr("criar"); },
  cifAnotei() { cifIr("confirmar"); },
  cifVerCodigo() { cifIr("codigo"); },
  cifEsqueci() { cifIr("recuperar"); },
  cifVoltarPin() { cifChaveRecuperada = null; cifIr(cifLerGuardado() ? "pin" : "danificado"); },
  cifRecomecarDoZero() {
    confirmar("Começar do zero? Os dados danificados ficam guardados à parte neste celular, cifrados, mas o app não vai mostrá-los.", function () {
      try { cifGuardarAParte(); } catch (x) { alerta("Não foi possível guardar os dados à parte. Nada foi alterado."); return; }
      cifIr("criar");
    }, "Começar do zero");
  },
  cifAbrirTroca() {
    abrirFolha("Trocar PIN", '<form data-form="cifTrocar" class="cif">' + cifCampoPin("atual", "PIN atual") + cifCampoPin("novo", "PIN novo (6 números)") + cifCampoPin("repetir", "PIN novo de novo") +
      '<p class="cif-msg" role="alert" hidden></p><div class="botoes"><button type="submit">Trocar PIN</button></div></form>');
  },
});

/* Cartão no fim do Perfil. */
function cifCartaoPerfil() {
  if (!cifChave) return "";
  return '<div class="cartao" id="cartao-pin"><h2>PIN</h2><p class="sub" style="margin:0">Seus registros estão cifrados neste celular. O app pede o PIN ao abrir, quando volta de outro app e depois de 5 minutos sem uso.</p>' +
    '<div class="botoes"><button class="sec" data-ac="cifAbrirTroca">Trocar PIN</button></div></div>';
}

/* Chamado por inicio.js antes do primeiro desenho: decide o portão e liga o bloqueio por inatividade e por segundo plano. */
function cifIniciar(telas) {
  if (CIF_TRANCADO) cifPasso = !cifTemSubtle() ? "semCifra" : cifLerGuardado() ? "pin" : "danificado";
  const perfil = telas.perfil;
  telas.perfil = function () { return perfil() + (E.perfil ? cifCartaoPerfil() : ""); };
  const bloquearAgora = () => { if (cifBloquear()) { if (typeof fecharFolha === "function") fecharFolha(); if (typeof fecharDialogo === "function") fecharDialogo(); render(true); return true; } return false; };
  const inativo = () => cifChave && Date.now() - cifUltimoUso > CIF_INATIVO_MS;
  window.cifConferirInatividade = () => (inativo() ? bloquearAgora() : false);
  document.addEventListener("visibilitychange", () => { if (document.hidden) bloquearAgora(); }, true);
  ["pointerdown", "keydown"].forEach(ev => document.addEventListener(ev, e => {
    if (inativo()) { bloquearAgora(); cifEngolirClique = true; setTimeout(() => { cifEngolirClique = false; }, 800); e.preventDefault(); e.stopPropagation(); return; }
    cifUltimoUso = Date.now();
  }, true));
  ["click", "submit"].forEach(ev => document.addEventListener(ev, e => {
    if (cifEngolirClique || inativo()) { cifEngolirClique = false; if (inativo()) bloquearAgora(); e.preventDefault(); e.stopPropagation(); }
  }, true));
  setInterval(window.cifConferirInatividade, 15000);
}
