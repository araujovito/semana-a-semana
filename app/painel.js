"use strict";
/* Painel: calorias e proteína de hoje e dos últimos 7 ou 30 dias, a partir do que ela marca na tela Hoje (consumo.js).
   As contas (painelSerie, painelResumo) não tocam na página; telaPainel() devolve o HTML da tela.
   Decisões:
   - O gráfico mostra os n dias até hoje (hoje marcado "em andamento"); médias e contagens usam os n dias ANTES de hoje,
     porque hoje ainda está sendo registrado e puxaria a média para baixo.
   - Dia sem registro (consumoDoDia().registrou falso) é lacuna, não zero: fica fora das médias e aparece no gráfico como traço vazio.
   - Modo discreto do perfil (perfil.discreto): some tudo de calorias; fica a proteína.
   - A aba "painel" é registrada em TELAS sem botão na barra; a navegação fica para o redesenho.
   - "Abaixo de X kcal" usa o piso por dia do cardápio (metas().pisoDia: PISO_DIA de nutricao.js, ou a meta do médico se for menor),
     para o painel e o cardápio falarem do mesmo número.
   - A escolha 7 ou 30 dias fica em E.ui.painelPeriodo e vale ao abrir o app de novo. */

/* Período escolhido: 7 ou 30 (qualquer outro valor gravado vira 7). */
function painelPeriodo() { return E.ui && E.ui.painelPeriodo === 30 ? 30 : 7; }

/* Série de n dias terminando em fim (inclusive), do mais antigo ao mais novo:
   [{ data, registrou, kcal, prot }] com kcal e prot null nos dias sem registro. */
function painelSerie(fim, n) {
  const s = [];
  for (let i = n - 1; i >= 0; i--) {
    const data = mais(fim, -i), c = consumoDoDia(data);
    /* Auditoria 3 (I3): dia só com proteína avulsa tem proteína, mas não tem calorias conhecidas; não pode virar "dia de 0 kcal". */
    s.push({ data, registrou: c.registrou, kcal: c.refeicoes > 0 ? c.total.kcal : null, prot: c.registrou ? c.total.prot : null });
  }
  return s;
}
/* Resumo de uma série (só dias com registro contam):
   dias (com registro), total (dias na série), mediaKcal e mediaProt (null sem registro),
   naFaixa: dias com proteína entre m.protMin e m.protMax (inclusive); abaixoKcal: dias com menos de m.pisoDia kcal (PISO_DIA se faltar). */
function painelResumo(serie, m) {
  const piso = m.pisoDia == null ? PISO_DIA : m.pisoDia, com = serie.filter(x => x.registrou), comKcal = com.filter(x => x.kcal != null), soma = (l, k) => l.reduce((t, x) => t + x[k], 0);
  return {
    dias: com.length, total: serie.length, diasKcal: comKcal.length,
    mediaKcal: comKcal.length ? soma(comKcal, "kcal") / comKcal.length : null,
    mediaProt: com.length ? soma(com, "prot") / com.length : null,
    naFaixa: com.filter(x => x.prot >= m.protMin && x.prot <= m.protMax).length,
    abaixoKcal: comKcal.filter(x => x.kcal < piso).length,
  };
}
/* Quanto falta de proteína para a meta (g, nunca negativo). */
function painelFaltaProt(prot, meta) { return Math.max(0, Math.round(meta - prot)); }

/* Anel de progresso: valor de meta. Passar da meta fecha o anel; o número mostra o valor real. */
function painelAnel(rotulo, valor, meta, un, chave) {
  const r = 34, volta = 2 * Math.PI * r, frac = meta ? Math.min(1, valor / meta) : 0;
  return '<div class="painel-anel" data-painel="' + chave + '"><svg viewBox="0 0 84 84" role="img" aria-label="' + Math.round(frac * 100) + "% da meta de " + rotulo.toLowerCase() + '">' +
    '<circle class="fundo" cx="42" cy="42" r="' + r + '"/>' +
    '<circle class="feito" cx="42" cy="42" r="' + r + '" stroke-dasharray="' + (volta * frac).toFixed(1) + " " + volta.toFixed(1) + '" transform="rotate(-90 42 42)"/>' +
    '<text x="42" y="47" text-anchor="middle">' + Math.round(frac * 100) + "%</text></svg>" +
    '<div><div class="sub">' + rotulo + '</div><div class="painel-num"><span data-v="' + chave + '">' + fmt(valor) + "</span> <small>" + un + "</small></div>" +
    '<div class="sub">meta ' + fmt(meta) + " " + un + "</div></div></div>";
}

/* Gráfico de barras de uma série para o campo k ("kcal" ou "prot"). meta: linha tracejada; faixa: [min, max] opcional (banda).
   Cada dia tem uma coluna inteira tocável (data-ac=painelDia) que mostra o valor na linha de leitura abaixo do gráfico.
   Em 30 dias a barra fica com uns 10 px num celular de 320 px, então o alvo (rect.alvo, invisível) ocupa a coluna do dia na altura
   toda do gráfico (mais de 100 px), e arrastar o dedo na horizontal vai trocando o dia (painelArrastar). Teclado: o gráfico recebe
   foco e as setas, Home e End percorrem os dias; a linha de leitura é aria-live, então o leitor de tela fala o valor.
   Para quem não enxerga o gráfico, painelTabela() dá os mesmos números numa tabela. */
function painelGrafico(serie, k, meta, un, faixa, hojeData) {
  const W = 320, H = 150, esq = 6, dir = 6, topo = 8, base = H - 20, n = serie.length, larg = (W - esq - dir) / n;
  const vals = serie.filter(x => x.registrou).map(x => x[k]);
  const max = Math.max.apply(null, [meta * 1.2, faixa ? faixa[1] * 1.1 : 0].concat(vals)) || 1;
  const y = v => base - v * (base - topo) / max, f = v => v.toFixed(1);
  const nome = k === "kcal" ? "calorias" : "proteína";
  let s = '<svg class="painel-graf" data-graf="' + k + '" viewBox="0 0 ' + W + " " + H + '" tabindex="0" role="img" aria-label="Gráfico de ' + nome + " por dia, " + n + " dias, meta de " + fmt(meta) + " " + un +
    '. Setas para a esquerda e a direita percorrem os dias. Os mesmos números estão na tabela logo abaixo.">';
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
/* Mesmos números do gráfico em tabela (para leitor de tela e para quem prefere ler): fechada em "Ver como tabela". */
function painelTabela(serie, k, un, hojeData) {
  const nome = k === "kcal" ? "Calorias" : "Proteína";
  return '<details class="painel-tabela" data-tabela="' + k + '"><summary>Ver ' + nome.toLowerCase() + " como tabela</summary>" +
    "<table><caption>" + nome + " por dia (" + un + ")</caption><thead><tr><th scope=\"col\">Dia</th><th scope=\"col\">" + nome + " (" + un + ")</th></tr></thead><tbody>" +
    serie.slice().reverse().map(x => "<tr><th scope=\"row\">" + (x.data === hojeData ? "Hoje (em andamento)" : painelDiaSemana(x.data) + ", " + br(x.data)) + "</th><td class=\"num\">" +
      (x.registrou ? fmt(x[k]) : "sem registro") + "</td></tr>").join("") + "</tbody></table></details>";
}
function painelDiaSemana(data) { return ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"][deIso(data).getDay()]; }

function telaPainel() {
  const m = metas(), h = hoje(), disc = m.discreto, c = consumoDoDia(h), a = alvoProteina(m);
  /* Alvo único de proteína (alvoProteina, planonutri.js): o mesmo de Hoje e do relatório; a faixa é a do plano dela, se em uso. */
  const mp = Object.assign({}, m, { prot: a.g, protMin: a.min, protMax: a.max });
  const kcal = c.total.kcal, prot = c.total.prot, falta = painelFaltaProt(prot, a.g);
  let out = '<div class="cartao painel-hoje"><h2>Hoje</h2><div class="painel-aneis' + (disc ? " so-um" : "") + '">' +
    painelAnel("Proteína", prot, a.g, "g", "prot") + (disc ? "" : painelAnel("Calorias", kcal, m.kcal, "kcal", "kcal")) + "</div>" +
    '<p class="painel-falta" data-painel="falta">' + (falta > 0 ? "Faltam " + fmt(falta) + " g de proteína para a meta de hoje." : "A meta de proteína de hoje já foi alcançada.") +
    (c.registrou ? "" : " Nada registrado hoje ainda.") + "</p>" +
    '<p class="sub">' + (a.nutri ? "Faixa de proteína do plano da sua nutricionista: " + fmt(a.min) + " a " + fmt(a.max) + " g por dia; o alvo de hoje (" + fmt(a.g) + " g) é o começo da faixa, o mesmo da tela Hoje."
      : "Faixa de proteína: " + fmt(a.min) + " a " + fmt(a.max) + " g por dia.") + ' Os números vêm do que você marca na tela Hoje.</p></div>';

  const n = painelPeriodo(), serie = painelSerie(h, n), r = painelResumo(painelSerie(mais(h, -1), n), mp);
  const chip = (v, t) => '<button class="' + (n === v ? "ativa" : "") + '" data-ac="painelPeriodo" data-n="' + v + '" aria-pressed="' + (n === v) + '">' + t + "</button>";
  out += '<div class="cartao painel-periodo"><div class="linha"><h2>Por dia</h2><div class="chips painel-chips">' + chip(7, "7 dias") + chip(30, "30 dias") + "</div></div>" +
    '<h3>Proteína (g)</h3>' + painelGrafico(serie, "prot", a.g, "g", [a.min, a.max], h) + painelTabela(serie, "prot", "g", h) +
    (disc ? "" : "<h3>Calorias (kcal)</h3>" + painelGrafico(serie, "kcal", m.kcal, "kcal", null, h) + painelTabela(serie, "kcal", "kcal", h)) +
    '<p class="painel-leitura" data-painel="leitura" aria-live="polite">Toque numa barra ou arraste o dedo para ver o valor do dia.</p>' +
    '<p class="sub painel-legenda"><span class="leg coluna"></span>registrado <span class="leg vazio"></span>sem registro <span class="leg meta"></span>meta' + ' <span class="leg faixa"></span>faixa de proteína</p></div>';

  const periodo = "Nos " + n + " dias antes de hoje";
  out += '<div class="cartao painel-resumo" data-painel="resumo"><h2>' + periodo + "</h2>";
  if (!r.dias) out += '<p class="sub">Nenhum dia com registro nesse período.</p>';
  else {
    out += '<div class="painel-numeros">' +
      '<div><div class="sub">Média de proteína</div><div class="painel-num" data-v="mediaProt">' + fmt(r.mediaProt) + " <small>g</small></div></div>" +
      (disc ? "" : '<div><div class="sub">Média de calorias</div><div class="painel-num" data-v="mediaKcal">' + fmt(r.mediaKcal) + " <small>kcal</small></div></div>") +
      '<div><div class="sub">Proteína na faixa</div><div class="painel-num" data-v="naFaixa">' + r.naFaixa + " <small>de " + r.dias + "</small></div></div>" +
      (disc ? "" : '<div><div class="sub">Abaixo de ' + fmt(m.pisoDia) + ' kcal</div><div class="painel-num" data-v="abaixoKcal">' + r.abaixoKcal + " <small>de " + r.diasKcal + "</small></div></div>") +
      "</div>";
  }
  out += '<p class="sub" data-v="diasRegistro">Dias com registro: ' + r.dias + " de " + r.total + ". Médias e contagens usam só os dias com registro; hoje fica de fora porque ainda não acabou." +
    (disc ? "" : " " + fmt(m.pisoDia) + " kcal é o mínimo por dia que o cardápio do app usa. Se isso se repetir, vale levar ao médico ou ao nutricionista.") + "</p></div>";
  return out;
}

AC.painelPeriodo = function (d) { E.ui.painelPeriodo = d.n === "30" ? 30 : 7; salvar(); render(); };
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
/* Arrastar o dedo sobre o gráfico vai mostrando o dia que está debaixo dele (o gráfico deixa só a rolagem vertical para o navegador). */
function painelArrastar(e) {
  if (!e.target || !e.target.closest || !e.target.closest("svg.painel-graf")) return;
  const el = document.elementFromPoint(e.clientX, e.clientY), g = el && el.closest ? el.closest(".painel-graf g.dia") : null;
  if (g && !g.classList.contains("sel")) AC.painelDia(g.dataset, g);
}
document.addEventListener("pointerdown", painelArrastar);
document.addEventListener("pointermove", e => { if (e.pointerType !== "mouse") painelArrastar(e); });
/* Teclado no gráfico em foco: setas andam um dia, Home vai ao mais antigo, End a hoje. Sem dia escolhido, começa por hoje. */
document.addEventListener("keydown", e => {
  const svg = e.target && e.target.closest ? e.target.closest("svg.painel-graf") : null;
  if (!svg) return;
  const dias = [...svg.querySelectorAll("g.dia")], atual = dias.findIndex(g => g.classList.contains("sel"));
  const de = atual < 0 ? dias.length : atual;
  const i = { ArrowLeft: de - 1, ArrowRight: atual < 0 ? dias.length - 1 : de + 1, Home: 0, End: dias.length - 1 }[e.key];
  if (i == null) return;
  e.preventDefault();
  const g = dias[Math.max(0, Math.min(dias.length - 1, i))];
  AC.painelDia(g.dataset, g);
});
/* Registra a aba (sem botão na barra) depois que inicio.js criou TELAS; se o endereço já era #painel, redesenha. */
document.addEventListener("DOMContentLoaded", () => {
  TELAS.painel = telaPainel;
  if (location.hash === "#painel" && E.perfil && ILEGIVEL == null) render(true);
});
