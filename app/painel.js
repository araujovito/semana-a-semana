"use strict";
/* Painel: calorias e proteína de hoje e dos últimos 7 ou 30 dias, a partir do que ela marca na tela Hoje (consumo.js).
   As contas (painelSerie, painelResumo) não tocam na página; telaPainel() devolve o HTML da tela.
   Decisões:
   - O gráfico mostra os n dias até hoje (hoje marcado "em andamento"); médias e contagens usam os n dias ANTES de hoje,
     porque hoje ainda está sendo registrado e puxaria a média para baixo.
   - Dia sem registro (consumoDoDia().registrou falso) é lacuna, não zero: fica fora das médias e aparece no gráfico como traço vazio.
   - Modo discreto do perfil (perfil.discreto): some tudo de calorias; fica a proteína.
   - A aba "painel" é registrada em TELAS sem botão na barra; a navegação fica para o redesenho. */

const PAINEL_KCAL_BAIXO = 1200;   // mesmo valor do piso por dia do cardápio (PISO_DIA em nutricao.js)
let painelPeriodo = 7;            // 7 ou 30 dias no gráfico e no resumo; volta a 7 ao abrir o app

/* Série de n dias terminando em fim (inclusive), do mais antigo ao mais novo:
   [{ data, registrou, kcal, prot }] com kcal e prot null nos dias sem registro. */
function painelSerie(fim, n) {
  const s = [];
  for (let i = n - 1; i >= 0; i--) {
    const data = mais(fim, -i), c = consumoDoDia(data);
    s.push({ data, registrou: c.registrou, kcal: c.registrou ? c.total.kcal : null, prot: c.registrou ? c.total.prot : null });
  }
  return s;
}
/* Resumo de uma série (só dias com registro contam):
   dias (com registro), total (dias na série), mediaKcal e mediaProt (null sem registro),
   naFaixa: dias com proteína entre m.protMin e m.protMax (inclusive); abaixoKcal: dias com menos de PAINEL_KCAL_BAIXO kcal. */
function painelResumo(serie, m) {
  const com = serie.filter(x => x.registrou), soma = k => com.reduce((t, x) => t + x[k], 0);
  return {
    dias: com.length, total: serie.length,
    mediaKcal: com.length ? soma("kcal") / com.length : null,
    mediaProt: com.length ? soma("prot") / com.length : null,
    naFaixa: com.filter(x => x.prot >= m.protMin && x.prot <= m.protMax).length,
    abaixoKcal: com.filter(x => x.kcal < PAINEL_KCAL_BAIXO).length,
  };
}
/* Quanto falta de proteína para a meta (g, nunca negativo). */
function painelFaltaProt(prot, meta) { return Math.max(0, Math.round(meta - prot)); }

/* Anel de progresso: valor de meta. Passar da meta fecha o anel; o número mostra o valor real. */
function painelAnel(rotulo, valor, meta, un, chave) {
  const r = 34, volta = 2 * Math.PI * r, frac = meta ? Math.min(1, valor / meta) : 0;
  return '<div class="painel-anel" data-painel="' + chave + '"><svg viewBox="0 0 84 84" aria-hidden="true">' +
    '<circle class="fundo" cx="42" cy="42" r="' + r + '"/>' +
    '<circle class="feito" cx="42" cy="42" r="' + r + '" stroke-dasharray="' + (volta * frac).toFixed(1) + " " + volta.toFixed(1) + '" transform="rotate(-90 42 42)"/>' +
    '<text x="42" y="47" text-anchor="middle">' + Math.round(frac * 100) + "%</text></svg>" +
    '<div><div class="sub">' + rotulo + '</div><div class="painel-num"><span data-v="' + chave + '">' + fmt(valor) + "</span> <small>" + un + "</small></div>" +
    '<div class="sub">meta ' + fmt(meta) + " " + un + "</div></div></div>";
}

/* Gráfico de barras de uma série para o campo k ("kcal" ou "prot"). meta: linha tracejada; faixa: [min, max] opcional (banda).
   Cada dia tem uma coluna inteira tocável (data-ac=painelDia) que mostra o valor na linha de leitura abaixo do gráfico. */
function painelGrafico(serie, k, meta, un, faixa, hojeData) {
  const W = 320, H = 150, esq = 6, dir = 6, topo = 8, base = H - 20, n = serie.length, larg = (W - esq - dir) / n;
  const vals = serie.filter(x => x.registrou).map(x => x[k]);
  const max = Math.max.apply(null, [meta * 1.2, faixa ? faixa[1] * 1.1 : 0].concat(vals)) || 1;
  const y = v => base - v * (base - topo) / max, f = v => v.toFixed(1);
  const nome = k === "kcal" ? "calorias" : "proteína";
  let s = '<svg class="painel-graf" data-graf="' + k + '" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Gráfico de ' + nome + " por dia, " + n + ' dias, com a meta como linha">';
  if (faixa) s += '<rect class="faixa" x="' + esq + '" y="' + f(y(faixa[1])) + '" width="' + (W - esq - dir) + '" height="' + f(y(faixa[0]) - y(faixa[1])) + '"/>';
  s += '<line class="eixo" x1="' + esq + '" y1="' + base + '" x2="' + (W - dir) + '" y2="' + base + '"/>';
  serie.forEach((x, i) => {
    const x0 = esq + i * larg, bl = Math.max(2, larg * 0.62), bx = x0 + (larg - bl) / 2, eHoje = x.data === hojeData;
    const valor = x.registrou ? fmt(x[k]) + " " + un : "sem registro";
    const leitura = (eHoje ? "Hoje (em andamento)" : painelDiaSemana(x.data) + ", " + br(x.data)) + ": " + valor;
    s += '<g class="dia' + (x.registrou ? "" : " lacuna") + (eHoje ? " hoje" : "") + '" data-ac="painelDia" data-ler="' + esc(leitura) + '">' +
      '<rect class="alvo" x="' + f(x0) + '" y="0" width="' + f(larg) + '" height="' + H + '"/>';
    if (x.registrou) s += '<rect class="coluna" x="' + f(bx) + '" y="' + f(y(x[k])) + '" width="' + f(bl) + '" height="' + f(Math.max(1, base - y(x[k]))) + '" rx="1.5"/>';
    else s += '<rect class="vazio" x="' + f(bx) + '" y="' + f(base - 10) + '" width="' + f(bl) + '" height="10" rx="1.5"/>';
    s += "<title>" + esc(leitura) + "</title></g>";
    const rotulo = n <= 7 ? (eHoje ? "hoje" : painelDiaSemana(x.data).slice(0, 3)) : (i % 5 === (n - 1) % 5 ? x.data.slice(8) : "");
    if (rotulo) s += '<text x="' + f(x0 + larg / 2) + '" y="' + (H - 5) + '" text-anchor="middle">' + rotulo + "</text>";
  });
  s += '<line class="meta" x1="' + esq + '" y1="' + f(y(meta)) + '" x2="' + (W - dir) + '" y2="' + f(y(meta)) + '"/>';
  return s + "</svg>";
}
function painelDiaSemana(data) { return ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"][deIso(data).getDay()]; }

function telaPainel() {
  const m = metas(), h = hoje(), disc = m.discreto, c = consumoDoDia(h);
  const kcal = c.total.kcal, prot = c.total.prot, falta = painelFaltaProt(prot, m.prot);
  let out = '<div class="cartao painel-hoje"><h2>Hoje</h2><div class="painel-aneis' + (disc ? " so-um" : "") + '">' +
    painelAnel("Proteína", prot, m.prot, "g", "prot") + (disc ? "" : painelAnel("Calorias", kcal, m.kcal, "kcal", "kcal")) + "</div>" +
    '<p class="painel-falta" data-painel="falta">' + (falta > 0 ? "Faltam " + fmt(falta) + " g de proteína para a meta de hoje." : "A meta de proteína de hoje já foi alcançada.") +
    (c.registrou ? "" : " Nada registrado hoje ainda.") + "</p>" +
    '<p class="sub">Faixa de proteína: ' + fmt(m.protMin) + " a " + fmt(m.protMax) + ' g por dia. Os números vêm do que você marca na tela Hoje.</p></div>';

  const n = painelPeriodo, serie = painelSerie(h, n), r = painelResumo(painelSerie(mais(h, -1), n), m);
  const chip = (v, t) => '<button class="' + (n === v ? "ativa" : "") + '" data-ac="painelPeriodo" data-n="' + v + '" aria-pressed="' + (n === v) + '">' + t + "</button>";
  out += '<div class="cartao painel-periodo"><div class="linha"><h2>Por dia</h2><div class="chips painel-chips">' + chip(7, "7 dias") + chip(30, "30 dias") + "</div></div>" +
    '<h3>Proteína (g)</h3>' + painelGrafico(serie, "prot", m.prot, "g", [m.protMin, m.protMax], h) +
    (disc ? "" : "<h3>Calorias (kcal)</h3>" + painelGrafico(serie, "kcal", m.kcal, "kcal", null, h)) +
    '<p class="painel-leitura" data-painel="leitura" aria-live="polite">Toque numa barra para ver o valor do dia.</p>' +
    '<p class="sub painel-legenda"><span class="leg coluna"></span>registrado <span class="leg vazio"></span>sem registro <span class="leg meta"></span>meta' + ' <span class="leg faixa"></span>faixa de proteína</p></div>';

  const periodo = "Nos " + n + " dias antes de hoje";
  out += '<div class="cartao painel-resumo" data-painel="resumo"><h2>' + periodo + "</h2>";
  if (!r.dias) out += '<p class="sub">Nenhum dia com registro nesse período.</p>';
  else {
    out += '<div class="painel-numeros">' +
      '<div><div class="sub">Média de proteína</div><div class="painel-num" data-v="mediaProt">' + fmt(r.mediaProt) + " <small>g</small></div></div>" +
      (disc ? "" : '<div><div class="sub">Média de calorias</div><div class="painel-num" data-v="mediaKcal">' + fmt(r.mediaKcal) + " <small>kcal</small></div></div>") +
      '<div><div class="sub">Proteína na faixa</div><div class="painel-num" data-v="naFaixa">' + r.naFaixa + " <small>de " + r.dias + "</small></div></div>" +
      (disc ? "" : '<div><div class="sub">Abaixo de ' + fmt(PAINEL_KCAL_BAIXO) + ' kcal</div><div class="painel-num" data-v="abaixoKcal">' + r.abaixoKcal + " <small>de " + r.dias + "</small></div></div>") +
      "</div>";
  }
  out += '<p class="sub" data-v="diasRegistro">Dias com registro: ' + r.dias + " de " + r.total + ". Médias e contagens usam só os dias com registro; hoje fica de fora porque ainda não acabou." +
    (disc ? "" : " " + fmt(PAINEL_KCAL_BAIXO) + " kcal é o mínimo por dia que o cardápio do app usa. Se isso se repetir, vale levar ao médico ou ao nutricionista.") + "</p></div>";
  return out;
}

AC.painelPeriodo = function (d) { painelPeriodo = d.n === "30" ? 30 : 7; render(); };
/* Mostra o valor do dia tocado (ou com o ponteiro em cima) na linha de leitura e destaca a coluna. */
AC.painelDia = function (d, el) {
  const l = document.querySelector("[data-painel=leitura]"); if (l) l.textContent = d.ler;
  document.querySelectorAll(".painel-graf g.dia.sel").forEach(g => g.classList.remove("sel"));
  if (el && el.classList) el.classList.add("sel");
};
document.addEventListener("mouseover", e => {
  const g = e.target && e.target.closest ? e.target.closest(".painel-graf g.dia") : null;
  if (g) AC.painelDia(g.dataset, g);
});
/* Registra a aba (sem botão na barra) depois que inicio.js criou TELAS; se o endereço já era #painel, redesenha. */
document.addEventListener("DOMContentLoaded", () => {
  TELAS.painel = telaPainel;
  if (location.hash === "#painel" && E.perfil && ILEGIVEL == null) render(true);
});
