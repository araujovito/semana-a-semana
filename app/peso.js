"use strict";
/* Peso: aba Peso do diário (registrar e corrigir, gráfico no tempo com as trocas de dose, variação por semana,
   ritmo de perda) e trecho do relatório. As contas são funções puras, testadas em testes/unidade/peso.js. */

/* id da pesagem que está sendo corrigida no formulário do topo. Não é gravado: some ao fechar o app. */
let pesoEmEdicao = null;

/* ---------- contas (sem acesso à página) ---------- */
const pesagensEmOrdem = pesos => (pesos || []).filter(p => p && p.data && p.kg > 0).slice().sort(porData);
/* Número com sinal, sem "-0,0". */
function comSinal(n, casas) { const r = Number(Number(n).toFixed(casas)); return (r > 0 ? "+" : "") + fmt(r === 0 ? 0 : r, casas); }
/* Campo de formulário: número com vírgula, como se digita. */
const paraCampo = n => (n == null ? "" : String(n).replace(".", ","));

/* Trocas de dose: a primeira aplicação de todas e cada aplicação com dose diferente da anterior (subida ou descida).
   Devolve [{ data, mg }] em ordem de data. */
function trocasDeDose(doses) {
  const out = []; let ant = null;
  (doses || []).filter(d => d && d.data).slice().sort(porData).forEach(d => { if (d.mg !== ant) { out.push({ data: d.data, mg: d.mg }); ant = d.mg; } });
  return out;
}

/* Variação semana a semana. A semana vai de segunda a domingo. Vale a ÚLTIMA pesagem de cada semana.
   Devolve uma linha por semana, da primeira à última pesagem: { semana (data da segunda), data, kg, dif (kg), pct (% do peso anterior), semanas }.
   Semana sem pesagem: { semana, kg: null } (nenhum valor é inventado). A primeira semana não tem variação (dif null).
   A variação compara com a semana anterior QUE TEM pesagem; "semanas" diz quantas semanas separam as duas (1 = semanas seguidas). */
function variacaoSemanal(pesos) {
  const ps = pesagensEmOrdem(pesos), out = [];
  if (!ps.length) return out;
  const ult = {}; ps.forEach(p => { ult[inicioSemana(p.data)] = p; });
  let ant = null;
  for (let s = inicioSemana(ps[0].data), fim = inicioSemana(ps[ps.length - 1].data); s <= fim; s = mais(s, 7)) {
    const p = ult[s];
    if (!p) { out.push({ semana: s, kg: null }); continue; }
    const l = { semana: s, data: p.data, kg: p.kg, dif: null, pct: null, semanas: null };
    if (ant) { l.dif = p.kg - ant.kg; l.pct = 100 * l.dif / ant.kg; l.semanas = Math.round(entre(ant.semana, s) / 7); }
    out.push(l); ant = { kg: p.kg, semana: s };
  }
  return out;
}

/* Ritmo de perda das últimas semanas: sempre a média de 2 a 4 semanas, nunca uma pesagem isolada (a primeira semana é água).
   Pega a pesagem mais recente e, entre as pesagens feitas de 14 a 28 dias antes dela, a mais próxima de 21 dias
   (empate, por exemplo 20 e 22 dias: fica a mais antiga). Sem pesagem nessa janela, devolve null (não há conta nem aviso).
   Só entram pesagens com data: o peso do perfil não tem data e não participa, então uma pesagem só nunca gera aviso.
   pct = perda média em % do peso por semana = (peso antigo − peso atual) / peso antigo / (dias / 7) × 100. Negativo = ganho.
   rapida = pct acima de 1 (exatamente 1% não conta). O limite de 1% por semana foi definido pela chefia de engenharia e mantido
   pela direção em 22/11 para quem tem pedra na vesícula (empresa/relatorios/pesquisa-vesicula-figado.md, regra R1): para quem pesa
   menos de 150 kg ele fica abaixo de 1,5 kg por semana, ritmo acima do qual o risco de formar pedra sobe muito (Weinsier RL e
   colaboradores, Am J Med 1995;98:115-117, https://pubmed.ncbi.nlm.nih.gov/7847427/). */
const LIMITE_RITMO = 1;
function ritmoPerda(pesos) {
  const ps = pesagensEmOrdem(pesos);
  if (ps.length < 2) return null;
  const at = ps[ps.length - 1];
  let ant = null, dist = Infinity;
  ps.forEach(p => { const n = entre(p.data, at.data); if (n >= 14 && n <= 28 && Math.abs(n - 21) < dist) { ant = p; dist = Math.abs(n - 21); } });
  if (!ant) return null;
  const dias = entre(ant.data, at.data), pct = 100 * (ant.kg - at.kg) / ant.kg / (dias / 7);
  return { de: ant.data, ate: at.data, dias: dias, kgDe: ant.kg, kgAte: at.kg, pct: pct, rapida: pct > LIMITE_RITMO + 1e-9 };
}
/* "1,3", ou "1,04" quando uma casa só mostraria "1,0" num ritmo que passou de 1. */
function pctRitmo(r) { const a = Math.abs(r.pct); return r.rapida && Number(a.toFixed(1)) <= LIMITE_RITMO ? fmt(a, 2) : fmt(a, 1); }

/* Pontos do gráfico, em ordem de data. O peso inicial do perfil não tem data: ele entra como ponto "início" na data da
   primeira aplicação, quando ela é anterior à primeira pesagem. Sem aplicação anterior à primeira pesagem não há data
   para ele, e o ponto não é desenhado (o valor continua no quadro "Inicial" acima do gráfico). */
function pontosDoGrafico(pesos, pesoInicial, doses) {
  const ps = pesagensEmOrdem(pesos).map(p => ({ data: p.data, kg: p.kg }));
  const ds = (doses || []).filter(d => d && d.data).slice().sort(porData);
  if (ps.length && ds.length && pesoInicial > 0 && ds[0].data < ps[0].data) ps.unshift({ data: ds[0].data, kg: pesoInicial, inicio: true });
  return ps;
}

/* Gráfico de peso com o eixo horizontal em tempo real (dias). pontos: de pontosDoGrafico(); marcas: de trocasDeDose().
   O eixo vai da primeira à última data entre pontos e marcas. Cada troca de dose é uma linha vertical tracejada com o rótulo
   da dose no alto; rótulos vizinhos que se encostariam descem para uma segunda linha. */
function grafico(pontos, marcas) {
  marcas = marcas || [];
  if (!pontos.length) return "";
  const W = 320, H = 180, e = 28, topo = 46, base = H - 24;
  const datas = pontos.map(p => p.data).concat(marcas.map(m => m.data)).sort();
  const t0 = datas[0], t1 = datas[datas.length - 1], total = entre(t0, t1);
  const kgs = pontos.map(p => p.kg), mn = Math.min.apply(null, kgs), mx = Math.max.apply(null, kgs), amp = (mx - mn) || 1;
  const x = d => (total ? e + entre(t0, d) * (W - 2 * e) / total : W / 2), y = k => topo + (mx - k) * (base - 10 - topo) / amp;
  const n = v => v.toFixed(1);
  let s = '<svg class="graf tempo" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Gráfico de peso ao longo do tempo, com as trocas de dose"><line x1="' + e + '" y1="' + base + '" x2="' + (W - e) + '" y2="' + base + '"/>';
  let xAnt = -99, linhaAnt = 0;
  marcas.forEach(m => {
    const mx_ = x(m.data), linha = mx_ - xAnt < 46 && linhaAnt === 0 ? 1 : 0, yt = linha ? 24 : 10;
    s += '<line class="marca" x1="' + n(mx_) + '" y1="' + (yt + 4) + '" x2="' + n(mx_) + '" y2="' + base + '"/><text class="dose" x="' + n(mx_) + '" y="' + yt + '" text-anchor="middle">' + fmt(m.mg, 1) + " mg</text>";
    xAnt = mx_; linhaAnt = linha;
  });
  s += '<polyline points="' + pontos.map(p => n(x(p.data)) + "," + n(y(p.kg))).join(" ") + '"/>' +
    pontos.map(p => '<circle cx="' + n(x(p.data)) + '" cy="' + n(y(p.kg)) + '" r="' + (pontos.length > 20 ? 2.5 : 3) + '"/>').join("");
  const pri = pontos[0], ult = pontos[pontos.length - 1], rot = p => '<text x="' + n(x(p.data)) + '" y="' + n(y(p.kg) - 7) + '" text-anchor="middle">' + fmt(p.kg, 1) + "</text>";
  if (pontos.length > 1 && x(ult.data) - x(pri.data) >= 34) s += rot(pri);
  s += rot(ult);
  if (total) s += '<text x="' + e + '" y="' + (H - 7) + '" text-anchor="middle">' + (pri.inicio && pri.data === t0 ? "início" : br(t0)) + '</text><text x="' + (W - e) + '" y="' + (H - 7) + '" text-anchor="middle">' + br(t1) + "</text>";
  else s += '<text x="' + (W / 2) + '" y="' + (H - 7) + '" text-anchor="middle">' + br(t0) + "</text>";
  return s + "</svg>";
}

/* Texto da variação de uma linha de variacaoSemanal(), para a tela e para o relatório. */
function textoVariacao(l) {
  if (l.kg == null) return "sem registro";
  if (l.dif == null) return "";
  return comSinal(l.dif, 1) + " kg (" + comSinal(l.pct, 1) + "%)" + (l.semanas > 1 ? " em " + l.semanas + " semanas" : "");
}

/* TEXTO DE SAÚDE (aviso de perda rápida). Fontes: bula americana do Zepbound (tirzepatida para obesidade), seção de doença aguda da
   vesícula: os eventos de vesícula foram associados à redução de peso (https://pi.lilly.com/us/zepbound-uspi.pdf); Weinsier 1995
   (acima). A bula do Mounjaro (seção 5.8) lista a doença da vesícula, mas não fala de perda rápida (pesquisa-vesicula-figado.md, item 4).
   vesicula = true (pedra na vesícula marcada no Perfil): acrescenta o encaminhamento proposto na pesquisa (seção 1, "O que fazer se
   passar"). discreto = true: a mesma mensagem sem números, para o modo sem peso em destaque. O app só mostra o número e encaminha. */
function textoRitmo(r, vesicula, discreto) {
  const fim = vesicula ? " Se tiver dor na barriga, veja os sinais de alerta no Guia." : "";
  if (discreto) return "Nas últimas semanas, o peso caiu mais de 1% por semana, em média. Perda de peso rápida aumenta o risco de pedra na vesícula. É um assunto para levar ao seu médico." + fim;
  return "Você perdeu em média " + pctRitmo(r) + "% do peso por semana nos " + r.dias + " dias entre " + br(r.de) + " e " + br(r.ate) + ". Perda de peso rápida aumenta o risco de pedra na vesícula. É um assunto para levar ao seu médico." + fim;
}

/* Datas dos formulários de peso e de sintomas: de 1 ano atrás até hoje. Devolve a mensagem de erro, ou "" se a data serve. */
const dataMinima = () => mais(hoje(), -365);
function erroDeData(data) {
  if (!data) return "Informe a data.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || data < dataMinima() || data > hoje()) return "Confira a data: o app aceita de " + brAno(dataMinima()) + " até hoje.";
  return "";
}

/* ---------- tela ---------- */
function subPeso() {
  const h = hoje(), discreto = E.perfil.discreto === true;
  const ed = pesoEmEdicao ? E.pesos.find(p => p.id === pesoEmEdicao) : null;
  if (!ed) pesoEmEdicao = null;
  let out = "";
  out += '<form class="cartao' + (ed ? " destaque" : "") + '" data-form="peso"><h2>' + (ed ? "Corrigir peso" : "Registrar peso") + '</h2><p class="sub" style="margin:0">' + (ed ? "Você está corrigindo a pesagem de " + brAno(ed.data) + "." : "Uma vez por semana, no mesmo dia e horário, é suficiente.") + '</p><label>Data<input type="date" name="data" value="' + esc(ed ? ed.data : h) + '" min="' + dataMinima() + '" max="' + h + '" required></label>' +
    '<div class="duas"><label>Peso (kg)<input name="kg" inputmode="decimal" value="' + (ed ? esc(paraCampo(ed.kg)) : "") + '" required></label><label>Cintura (cm, opcional)<input name="cintura" inputmode="decimal" value="' + (ed ? esc(paraCampo(ed.cintura)) : "") + '"></label></div>' +
    '<div class="botoes"><button>' + (ed ? "Salvar alteração" : "Salvar peso") + "</button>" + (ed ? '<button type="button" class="sec" data-ac="cancelarPeso">Cancelar</button>' : "") + "</div></form>";
  const ps = pesagensEmOrdem(E.pesos);
  /* Modo discreto (perfil.discreto === true; ausente = falso): nada de diferença, percentual ou aviso de ritmo em destaque.
     Fica a lista de pesagens, e o gráfico só aparece se você abrir "Ver gráfico". O relatório continua completo. */
  const vesicula = E.perfil.vesicula === true;
  if (ps.length && discreto) {
    /* Exceção do modo discreto: com pedra na vesícula o aviso de ritmo aparece, sem números (é cuidado de segurança para ela). */
    const rd = vesicula ? ritmoPerda(E.pesos) : null;
    if (rd && rd.rapida) out += '<div class="cartao" id="ritmo"><h2>Ritmo de perda</h2><p style="margin:0">' + esc(textoRitmo(rd, true, true)) + "</p></div>";
    out += '<div class="cartao" id="graf-discreto"><details><summary>Ver gráfico</summary>' + grafico(pontosDoGrafico(E.pesos, E.perfil.peso, E.doses), trocasDeDose(E.doses)) + "</details></div>";
  } else if (ps.length) {
    const ini = E.perfil.peso, at = ps[ps.length - 1].kg, dif = at - ini;
    out += '<div class="cartao"><div class="tres"><div><div class="sub">Inicial</div><strong>' + fmt(ini, 1) + ' kg</strong></div><div><div class="sub">Atual</div><strong>' + fmt(at, 1) + ' kg</strong></div><div><div class="sub">Variação</div><strong>' + comSinal(dif, 1) + " kg (" + comSinal(100 * dif / ini, 1) + "%)</strong></div></div>" +
      grafico(pontosDoGrafico(E.pesos, ini, E.doses), trocasDeDose(E.doses)) +
      (E.doses.length ? '<p class="sub" style="margin:4px 0 0">As linhas tracejadas marcam a primeira aplicação de cada dose.</p>' : "") + "</div>";
    const r = ritmoPerda(E.pesos);
    if (r && r.rapida) out += '<div class="cartao" id="ritmo"><h2>Ritmo de perda</h2><p style="margin:0">' + esc(textoRitmo(r, vesicula)) + "</p></div>";
    const sem = variacaoSemanal(E.pesos).reverse();
    if (sem.length > 1) {
      const lin = l => "<tr><td>" + br(l.semana) + "</td><td>" + (l.kg == null ? '<span class="sub">sem registro</span>' : fmt(l.kg, 1) + " kg") + "</td><td>" + (l.kg == null ? "" : esc(textoVariacao(l))) + "</td></tr>";
      const cab = "<tr><th>Semana de</th><th>Peso</th><th>Variação</th></tr>";
      out += '<div class="cartao" id="semanas"><h2>Variação por semana</h2><p class="sub" style="margin:0 0 4px">Semana de segunda a domingo. Com mais de uma pesagem na semana, vale a última.</p><table>' + cab + sem.slice(0, 8).map(lin).join("") + "</table>" +
        (sem.length > 8 ? "<details><summary>Semanas anteriores (" + (sem.length - 8) + ")</summary><table>" + cab + sem.slice(8).map(lin).join("") + "</table></details>" : "") + "</div>";
    }
  }
  if (ps.length) {
    out += '<div class="cartao" id="hist-peso"><h2>Histórico</h2>' + ps.slice().reverse().map(p => '<div class="reg"><div class="txt">' + esc(brAno(p.data)) + "<div><strong>" + fmt(p.kg, 1) + " kg</strong>" + (p.cintura ? '<span class="sub"> · cintura ' + fmt(p.cintura, 1) + " cm</span>" : "") + "</div>" +
      '</div><div class="acoes"><button class="x ed" data-ac="editarPeso" data-id="' + esc(p.id) + '">editar</button><button class="x" data-ac="apagar" data-lista="pesos" data-id="' + esc(p.id) + '">apagar</button></div></div>').join("") + "</div>";
  }
  return out;
}

/* Rola a tela até o formulário, descontando o cabeçalho fixo. */
function rolarAteForm(nome) {
  const f = document.querySelector('form[data-form="' + nome + '"]'); if (!f) return;
  const topo = document.getElementById("topo");
  window.scrollTo(0, Math.max(0, f.getBoundingClientRect().top + window.pageYOffset - (topo ? topo.offsetHeight : 0) - 8));
}

Object.assign(AC, {
  editarPeso(d) { pesoEmEdicao = d.id; render(); rolarAteForm("peso"); },
  cancelarPeso() { pesoEmEdicao = null; render(); },
});

FORM.peso = function (f) {
  const kg = num(f.kg), c = num(f.cintura);
  const erro = erroDeData(f.data); if (erro) return aviso(erro);
  if (!kg || kg < 35 || kg > 300) return aviso("Confira o peso em kg.");
  if (c != null && (c < 30 || c > 250)) return aviso("Confira a cintura em cm.");
  const ed = pesoEmEdicao ? E.pesos.find(p => p.id === pesoEmEdicao) : null;
  const id = ed ? ed.id : novoId();
  // Uma pesagem por dia: a que for salva substitui outra da mesma data. Na correção, o id é mantido.
  E.pesos = E.pesos.filter(p => p.data !== f.data && p.id !== id);
  E.pesos.push({ id: id, data: f.data, kg: kg, cintura: c });
  pesoEmEdicao = null;
  salvar(); aviso(ed ? "Peso corrigido." : "Peso registrado."); render();
};

/* ---------- relatório ---------- */
function relPeso(de) {
  const L = [], p = E.perfil, m = metas();
  L.push("PESO");
  const ps = pesagensEmOrdem(E.pesos);
  if (ps.length) {
    const at = ps[ps.length - 1], dif = at.kg - p.peso;
    L.push("Inicial: " + fmt(p.peso, 1) + " kg. Atual: " + fmt(at.kg, 1) + " kg em " + brAno(at.data) + " (" + comSinal(dif, 1) + " kg, " + comSinal(100 * dif / p.peso, 1) + "%). IMC atual: " + fmt(m.imc, 1) + ".");
    const noP = ps.filter(x => x.data >= de);
    if (noP.length > 1) L.push("No período: " + fmt(noP[0].kg, 1) + " kg -> " + fmt(noP[noP.length - 1].kg, 1) + " kg.");
    const r = ritmoPerda(E.pesos);
    if (r) L.push("Ritmo entre " + brAno(r.de) + " e " + brAno(r.ate) + " (" + r.dias + " dias): " + (r.pct > 0 ? "perda" : "ganho") + " média de " + pctRitmo(r) + "% do peso por semana" + (r.rapida ? ", acima de 1% por semana." : "."));
    const sem = variacaoSemanal(E.pesos).filter(l => l.semana >= inicioSemana(de));
    if (sem.length > 1 || (sem.length === 1 && sem[0].dif != null)) {
      L.push("Por semana (segunda a domingo, última pesagem da semana):");
      sem.forEach(l => L.push("  Semana de " + br(l.semana) + ": " + (l.kg == null ? "sem registro" : fmt(l.kg, 1) + " kg" + (l.dif == null ? "" : ", " + textoVariacao(l)))));
    }
    const c = ps.filter(x => x.cintura);
    if (c.length) L.push("Cintura: " + fmt(c[0].cintura, 1) + " cm -> " + fmt(c[c.length - 1].cintura, 1) + " cm.");
  } else L.push("Inicial: " + fmt(p.peso, 1) + " kg. Sem pesagens registradas.");
  return L;
}
