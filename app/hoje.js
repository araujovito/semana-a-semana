"use strict";
/* Tela Hoje: proteína e água, refeições do dia, movimento. Trecho de alimentação do relatório. */

function telaHoje() {
  const h = hoje(), m = metas(), r = dia(h), card = planoDaData(h);
  const feito = somarPlano(card, card.refeicoes.map((x, i) => !!r.feitas[i]));
  const prot = feito.prot + r.protExtra;
  let out = "";

  out += cartaoTratamentoHoje();

  out += '<div class="cartao"><div class="duas"><div><div class="sub">Proteína hoje</div><div class="grande">' + fmt(prot) + ' g</div><div class="sub">meta ' + m.prot + ' g</div><div class="barra ' + (prot >= m.prot ? "ok" : "") + '"><i style="width:' + Math.min(100, 100 * prot / m.prot).toFixed(0) + '%"></i></div></div>' +
    '<div><div class="sub">Água hoje</div><div class="grande">' + fmt(r.agua / 1000, 1) + ' L</div><div class="sub">meta ' + fmt(m.agua / 1000, 1) + ' L</div><div class="barra ' + (r.agua >= m.agua ? "ok" : "") + '"><i style="width:' + Math.min(100, 100 * r.agua / m.agua).toFixed(0) + '%"></i></div></div></div>' +
    '<div class="botoes"><button class="mini" data-ac="agua" data-ml="200">+ 1 copo (200 ml)</button><button class="mini" data-ac="agua" data-ml="500">+ 500 ml</button><button class="mini sec" data-ac="agua" data-ml="-200">− 200 ml</button></div>' +
    '<div class="botoes"><button class="mini sec" data-ac="prot" data-g="10">+ 10 g de proteína fora do plano</button>' + (r.protExtra > 0 ? '<button class="mini sec" data-ac="prot" data-g="-10">− 10 g</button>' : "") + "</div>" +
    '<p class="sub" style="margin:8px 0 0">A proteína soma sozinha quando uma refeição é marcada. Energia das refeições marcadas: ' + fmt(feito.kcal) + " de " + m.kcal + " kcal.</p></div>";

  out += '<div class="cartao"><div class="linha"><h2 style="margin:0">Refeições de ' + (r.enjoo ? "hoje (dia de enjoo)" : esc(C.dias[diaSemana(h)].nome.toLowerCase())) + '</h2><button class="mini sec" data-ac="enjoo">' + (r.enjoo ? "Voltar ao normal" : "Dia de enjoo") + "</button></div>";
  card.refeicoes.forEach((ref, i) => {
    const p = somarItens(ref.itens);
    out += '<label class="refeicao' + (r.feitas[i] ? " feita" : "") + '" style="margin:0;color:inherit;font-size:inherit"><input type="checkbox" data-mud="refeicao" data-i="' + i + '"' + (r.feitas[i] ? " checked" : "") + '><div class="txt"><div class="tipo">' + esc(ref.tipo) + '</div><div class="tit">' + esc(ref.titulo) + '</div><div class="sub">' + fmt(p.prot) + " g de proteína · " + fmt(p.kcal) + " kcal</div></div></label>";
  });
  out += '<div class="botoes"><button class="mini sec" data-ac="ir" data-para="plano">Ver porções e nutrientes</button></div></div>';

  const ts = treinosDaSemana(), fezHoje = E.treinos.some(t => t.data === h), px = proximoTreino();
  out += '<div class="cartao"><h2>Movimento</h2><div class="duas"><div><div class="sub">Treinos de força na semana</div><div class="grande">' + ts.length + ' / 3</div></div><div><div class="sub">Caminhada hoje</div><div class="grande">' + r.caminhada + " min</div></div></div>" +
    '<div class="botoes">' + (fezHoje ? '<button class="mini sec" disabled>Treino de hoje registrado</button>' : '<button class="mini" data-ac="treino" data-tipo="' + px + '">Concluí o treino ' + px + "</button>") +
    '<button class="mini sec" data-ac="caminhada" data-min="10">+ 10 min de caminhada</button>' + (r.caminhada ? '<button class="mini sec" data-ac="caminhada" data-min="-10">− 10</button>' : "") + "</div></div>";

  out += '<div class="cartao"><h2>Registrar</h2><div class="botoes" style="margin-top:0"><button class="sec" data-ac="ir" data-para="diario" data-sub="peso">Peso</button><button class="sec" data-ac="ir" data-para="diario" data-sub="sintomas">Sintomas</button><button class="sec" data-ac="ir" data-para="diario" data-sub="doses">Aplicação</button></div></div>';
  return out;
}

function relAlimentacao(de) {
  const L = [], m = metas(), h = hoje();
  L.push("ALIMENTAÇÃO E ÁGUA (dias com registro no período)");
  const ds = Object.keys(E.dias).filter(d => d >= de && d <= h).sort();
  let n = 0, sp = 0, sk = 0, sa = 0, enj = 0;
  ds.forEach(d => {
    const r = dia(d), plano = planoDaData(d), marc = plano.refeicoes.map((x, i) => !!r.feitas[i]);
    if (!marc.some(Boolean) && !r.agua && !r.protExtra) return;
    const t = somarPlano(plano, marc);
    n++; sp += t.prot + r.protExtra; sk += t.kcal; sa += r.agua; if (r.enjoo) enj++;
  });
  if (n) L.push(n + (n === 1 ? " dia" : " dias") + ". Média de proteína: " + fmt(sp / n) + " g (meta " + m.prot + " g). Energia das refeições marcadas: " + fmt(sk / n) + " kcal (referência " + m.kcal + " kcal). Água: " + fmt(sa / n / 1000, 1) + " L (meta " + fmt(m.agua / 1000, 1) + " L). Dias de enjoo: " + enj + ".");
  else L.push("Nenhum dia registrado.");
  const med = mediaSemana(), baixos = NUTRI.filter(x => med[x[0]] < 0.8 * m.micro[x[0]]).map(x => x[1] + " " + fmt(100 * med[x[0]] / m.micro[x[0]]) + "%");
  if (baixos.length) L.push("Cardápio planejado abaixo de 80% da meta (só com comida): " + baixos.join(", ") + ".");
  return L;
}

Object.assign(AC, {
  agua(d) { const h = hoje(), r = dia(h); r.agua = Math.max(0, r.agua + Number(d.ml)); gravarDia(h, r); render(); },
  prot(d) { const h = hoje(), r = dia(h); r.protExtra = Math.max(0, r.protExtra + Number(d.g)); gravarDia(h, r); render(); },
  caminhada(d) { const h = hoje(), r = dia(h); r.caminhada = Math.max(0, r.caminhada + Number(d.min)); gravarDia(h, r); render(); },
  enjoo() { const h = hoje(), r = dia(h); r.enjoo = !r.enjoo; r.feitas = []; gravarDia(h, r); render(); },
});
MUD.refeicao = function (c) { const h = hoje(), r = dia(h); r.feitas[Number(c.dataset.i)] = c.checked; gravarDia(h, r); render(); };
