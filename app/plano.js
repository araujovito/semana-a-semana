"use strict";
/* Tela Plano: metas, cardápio do dia com porções, nutrientes, média da semana, tabela de trocas e fontes de cada nutriente. */

function telaPlano() {
  const m = metas(), h = hoje();
  let sel = E.ui.diaPlano; if (sel == null) sel = diaSemana(h);
  const d = planoDoDia(sel), t = somarPlano(d), med = mediaSemana();
  let out = '<div class="cartao"><h2>Metas diárias</h2><div class="tres"><div><div class="sub">Energia</div><strong>' + m.kcal + ' kcal</strong></div><div><div class="sub">Proteína</div><strong>' + m.prot + ' g</strong></div><div><div class="sub">Água</div><strong>' + fmt(m.agua / 1000, 1) + ' L</strong></div><div><div class="sub">Carboidrato</div><strong>' + m.carb + ' g</strong></div><div><div class="sub">Gordura</div><strong>' + m.gord + ' g</strong></div><div><div class="sub">Fibra</div><strong>' + m.fibra + " g</strong></div></div>" +
    '<p class="sub" style="margin:10px 0 0">Faixa de proteína: ' + m.protMin + " a " + m.protMax + " g. Porções do cardápio multiplicadas por " + fmt(m.fator, 2) + " para chegar perto da sua energia. As metas mudam na aba Perfil.</p></div>";

  out += '<div class="chips">' + SEMANA.map((n, i) => '<button data-ac="diaPlano" data-i="' + i + '" class="' + (sel === i ? "ativa" : "") + '">' + n + (i === diaSemana(h) ? " ·" : "") + "</button>").join("") + '<button data-ac="diaPlano" data-i="7" class="' + (sel === 7 ? "ativa" : "") + '">Enjoo</button></div>';

  out += '<div class="cartao"><h2>' + esc(d.nome) + "</h2>";
  d.refeicoes.forEach(ref => {
    const p = somarItens(ref.itens);
    out += '<div class="refeicao"><div class="txt"><div class="tipo">' + esc(ref.tipo) + " · " + fmt(p.prot) + " g prot · " + fmt(p.kcal) + ' kcal</div><div class="tit">' + esc(ref.titulo) + "</div><ul>" +
      ref.itens.map(it => { const g = it.g, md = medida(it.k, g); return "<li>" + esc(A[it.k].nome) + ": <strong>" + g + " g</strong>" + (md ? ' <span class="sub">(' + esc(md) + ")</span>" : "") + "</li>"; }).join("") +
      "</ul>" + (ref.preparo ? '<div class="prep">' + esc(ref.preparo) + "</div>" : "") + "</div></div>";
  });
  out += "</div>";

  out += '<div class="cartao"><h2>Macronutrientes do dia</h2>' + barra("Energia", t.kcal, m.kcal, "kcal") + barra("Proteína", t.prot, m.prot, "g") + barra("Carboidrato", t.carb, m.carb, "g", 0, true) + barra("Gordura", t.gord, m.gord, "g", 0, true) + barra("Fibra", t.fibra, m.fibra, "g") +
    '<p class="sub" style="margin:10px 0 0">Energia e proteína são as metas que contam. Carboidrato e gordura são só uma divisão de referência do que sobra; o cardápio usa um pouco mais de gordura (ovo, peixe, azeite, castanhas) e menos carboidrato.</p>' +
    (sel === 7 ? '<p class="sub" style="margin:10px 0 0">O dia de enjoo é leve de propósito e fica abaixo das metas. Serve para um ou dois dias, não como rotina.</p>' : "") + "</div>";
  out += '<div class="cartao"><h2>Vitaminas e minerais do dia</h2>' + barrasMicro(t, m) + "</div>";

  const baixos = NUTRI.filter(n => med[n[0]] < 0.8 * m.micro[n[0]]).map(n => n[1].toLowerCase());
  out += '<div class="cartao"><h2>Média da semana</h2><p class="sub" style="margin:0">Vitaminas e minerais variam de um dia para o outro; o que conta é a média.</p>' + barra("Proteína", med.prot, m.prot, "g") + barrasMicro(med, m) +
    (baixos.length ? '<p style="margin:12px 0 0"><strong>Abaixo de 80% da meta só com comida:</strong> ' + esc(baixos.join(", ")) + '.</p><p class="sub" style="margin:4px 0 0">Com esta quantidade de calorias isso é esperado para alguns nutrientes. É o ponto para levar ao médico ou nutricionista, que decide sobre exame e suplemento.</p>' : "") + "</div>";

  out += '<div class="cartao"><h2>Trocas</h2><p class="sub" style="margin:0">Quantidades equivalentes para trocar um alimento por outro do mesmo grupo.</p>' +
    trocas("Proteínas (cada linha dá cerca de 25 g de proteína)", ["proteina"], "prot", 25) +
    trocas("Laticínios (cerca de 250 mg de cálcio)", ["laticinio"], "ca", 250) +
    trocas("Arroz, pães, raízes e feijões (cerca de 100 kcal)", ["carboidrato", "leguminosa"], "kcal", 100) +
    trocas("Frutas (cerca de 60 kcal)", ["fruta"], "kcal", 60) + "</div>";

  out += '<div class="cartao"><h2>Onde está cada nutriente</h2><p class="sub" style="margin:0">Os cinco alimentos da lista que mais entregam, por porção usada no cardápio.</p>' +
    NUTRI.map(n => "<details><summary>" + n[1] + ' <span class="sub">meta ' + fmt(m.micro[n[0]], m.micro[n[0]] < 20 ? 1 : 0) + " " + n[2] + "</span></summary><table>" +
      fontes(n[0]).map(f => "<tr><td>" + esc(A[f.k].nome) + ' <span class="sub">' + f.g + ' g</span></td><td class="num">' + fmt(f.v, f.v < 20 ? 1 : 0) + " " + n[2] + "</td></tr>").join("") + "</table></details>").join("") +
    '<p class="sub" style="margin:10px 0 0">Valores da TACO (Unicamp); B12, D, E, K e folato do USDA. São médias: marca, preparo e safra mudam o número real.</p></div>';
  return out;
}
function trocas(titulo, grupos, campo, alvo) {
  const linhas = Object.keys(A).filter(k => grupos.indexOf(A[k].grupo) >= 0 && A[k][campo] > 0).map(k => {
    const g = gramas(100 * alvo / A[k][campo], 1);
    return { k, g };
  }).filter(l => l.g <= 400);
  return "<details><summary>" + esc(titulo) + "</summary><table>" + linhas.map(l => { const md = medida(l.k, l.g); return "<tr><td>" + esc(A[l.k].nome) + (md ? ' <span class="sub">' + esc(md) + "</span>" : "") + '</td><td class="num">' + l.g + " g</td></tr>"; }).join("") + "</table></details>";
}
let PORCOES;
function fontes(campo) {
  if (!PORCOES) {
    PORCOES = {};
    C.dias.concat([C.nausea]).forEach(d => d.refeicoes.forEach(r => r.itens.forEach(it => { PORCOES[it[0]] = Math.max(PORCOES[it[0]] || 0, it[1]); })));
  }
  return Object.keys(A).filter(k => k !== "whey").map(k => { const g = PORCOES[k] || A[k].gMedida; return { k, g, v: A[k][campo] * g / 100 }; })
    .sort((a, b) => b.v - a.v).slice(0, 5);
}

AC.diaPlano = function (d) { E.ui.diaPlano = Number(d.i); salvar(); render(); };
