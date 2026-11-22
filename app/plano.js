"use strict";
/* Tela Plano: metas, cardápio do dia com porções e trocas automáticas, nutrientes, média da semana, tabela de trocas e fontes de cada nutriente. */

/* Frase sobre a escala das porções (dois fatores: ver calcularEscala em nutricao.js). */
function fraseEscala(m) {
  const d = m.discreto, dif = (v, meta) => Math.abs(v / meta - 1) > ESCALA.tolerancia;
  let t = "O cardápio multiplica carnes, ovos e peixes por " + fmt(m.fatorProt, 2) + (d ? "" : ", para chegar à sua proteína,") + " e arroz, pães e feijões por " + fmt(m.fatorEnergia, 2) +
    (d ? "" : ", para completar a sua energia") + ". Azeite e castanhas têm limite por refeição (até 10 g de azeite e cerca de 15 g de gordura no prato), e nenhuma refeição passa de cerca de 500 kcal: o que sobra vai para os lanches. Verduras, frutas e laticínios ficam na porção de base. Ovo, pão francês e frutas vêm em unidades inteiras ou meias.";
  if (!d && m.fatorDias.some(f => f > m.fatorEnergia)) t += " Nos dias mais leves, arroz, pães e feijões sobem um pouco para o dia não ficar abaixo de " + fmt(m.pisoDia) + " kcal.";
  if (m.escalaNoLimite) {
    const partes = [];
    if (!d && dif(m.planoKcal, m.kcal)) partes.push(fmt(m.planoKcal) + " kcal (" + fmt(100 * m.planoKcal / m.kcal) + "% da meta de energia)");
    if (dif(m.planoProt, m.prot)) partes.push(fmt(m.planoProt) + " g de proteína (" + fmt(100 * m.planoProt / m.prot) + "% da meta)");
    t += " As porções chegaram ao limite do app" + (partes.length ? ": a média da semana fica em " + partes.join(" e ") : "") + ".";
  }
  return t;
}
/* Aviso de nutriente que cai por causa do que você não come. Texto de saúde novo (decisão da direção): só o fato calculado
   (média do cardápio contra a meta de referência, DRIs, que o app já usa) e o encaminhamento; não sugere suplemento. */
function fraseRestricoes() {
  const q = quedasPorRestricao(); if (!q.length) return "";
  const p = E.perfil, sem = RESTRICOES.filter(r => (p.naoCome || []).indexOf(r.id) >= 0).map(r => r.sem);
  if ((p.naoGosta || []).length) sem.push("sem os alimentos que você marcou");
  const junta = l => (l.length > 1 ? l.slice(0, -1).join(", ") + " e " + l[l.length - 1] : l[0]);
  const ini = junta(sem);
  return ini.charAt(0).toUpperCase() + ini.slice(1) + ", o cardápio fica com " + junta(q.map(x => x.rotulo.charAt(0).toLowerCase() + x.rotulo.slice(1) + " em " + x.pct + "% da meta")) + ". É assunto para o médico ou nutricionista.";
}
function linhaItem(it) {
  const md = medida(it.k, it.g);
  let t = "<li>" + esc(A[it.k].nome) + ": <strong>" + it.g + " g</strong>" + (md ? ' <span class="sub">(' + esc(md) + ")</span>" : "");
  if (it.de) t += '<div class="troca">no lugar de ' + esc(A[it.de].nome) + (it.outroGrupo ? " (não sobrou alimento permitido do mesmo grupo; entra um feijão com a mesma proteína)" : "") + "</div>";
  return t + "</li>";
}

function telaPlano() {
  const m = metas(), h = hoje(), disc = m.discreto;
  let sel = E.ui.diaPlano; if (sel == null || !(sel >= 0 && sel <= 7)) sel = diaSemana(h);
  const d = planoDoDia(sel), t = somarPlano(d), med = mediaSemana();
  const cel = (r, v) => '<div><div class="sub">' + r + "</div><strong>" + v + "</strong></div>";
  let out = avisosDoPerfil("plano") + pnCartaoPlano(m);
  // Com o plano da nutricionista em uso, as metas são as dela (cartão acima): as metas calculadas pelo app não aparecem.
  if (!pnEmUso()) out += '<div class="cartao"><h2>Metas diárias</h2><div class="tres">' + (disc ? "" : cel("Energia", fmt(m.kcal) + " kcal")) + cel("Proteína", m.prot + " g") + cel("Água", fmt(m.agua / 1000, 1) + " L") +
    (disc ? "" : cel("Carboidrato", m.carb + " g") + cel("Gordura", m.gord + " g")) + cel("Fibra", m.fibra + " g") + "</div>" +
    '<p class="sub" style="margin:10px 0 0">Faixa de proteína: ' + m.protMin + " a " + m.protMax + " g. " + esc(fraseEscala(m)) + " As metas mudam na aba Perfil.</p></div>";

  const fr = fraseRestricoes();
  if (fr) out += '<div class="cartao destaque"><h2>O que muda com o que você não come</h2><p style="margin:0">' + esc(fr) + '</p><p class="sub" style="margin:6px 0 0">Os alimentos trocados aparecem marcados no cardápio de cada dia.</p></div>';

  out += '<div class="chips">' + SEMANA.map((n, i) => '<button data-ac="diaPlano" data-i="' + i + '" class="' + (sel === i ? "ativa" : "") + '">' + n + (i === diaSemana(h) ? " ·" : "") + "</button>").join("") + '<button data-ac="diaPlano" data-i="7" class="' + (sel === 7 ? "ativa" : "") + '">Enjoo</button></div>';

  out += '<div class="cartao"><h2>' + esc(d.nome) + "</h2>";
  d.refeicoes.forEach(ref => {
    const p = somarItens(ref.itens);
    out += '<div class="refeicao"><div class="txt"><div class="tipo">' + esc(ref.tipo) + " · " + fmt(p.prot) + " g prot" + (disc ? "" : " · " + fmt(p.kcal) + " kcal") + '</div><div class="tit">' + esc(ref.titulo) + (ref.trocada ? ' <span class="marca-troca">com trocas</span>' : "") + "</div><ul>" +
      ref.itens.map(linhaItem).join("") +
      (ref.fora || []).map(x => '<li class="fora">' + esc(A[x.k].nome) + ': <span class="troca">sai do cardápio (não há outro alimento do mesmo grupo que você coma)</span></li>').join("") +
      "</ul>" + (ref.preparo ? '<div class="prep">' + esc(ref.preparo) + (ref.trocada ? " (Texto do cardápio original, antes das trocas.)" : "") + "</div>" : "") + "</div></div>";
  });
  out += "</div>";

  out += '<div class="cartao"><h2>Macronutrientes do dia</h2>' + (disc ? "" : barra("Energia", t.kcal, m.kcal, "kcal")) + barra("Proteína", t.prot, m.prot, "g") + (disc ? "" : barra("Carboidrato", t.carb, m.carb, "g", 0, true) + barra("Gordura", t.gord, m.gord, "g", 0, true)) + barra("Fibra", t.fibra, m.fibra, "g") +
    (disc ? "" : '<p class="sub" style="margin:10px 0 0">Energia e proteína são as metas que contam. Carboidrato e gordura são só uma divisão de referência do que sobra; o cardápio usa um pouco mais de gordura (ovo, peixe, azeite, castanhas) e menos carboidrato.</p>') +
    (sel === 7 ? '<p class="sub" style="margin:10px 0 0">O dia de enjoo é leve de propósito e fica abaixo das metas. Serve para um ou dois dias, não como rotina.</p>' : "") + "</div>";
  out += '<div class="cartao"><h2>Vitaminas e minerais do dia</h2>' + barrasMicro(t, m) + "</div>";

  const baixos = NUTRI.filter(n => med[n[0]] < 0.8 * m.micro[n[0]]).map(n => n[1].toLowerCase());
  out += '<div class="cartao"><h2>Média da semana</h2><p class="sub" style="margin:0">Vitaminas e minerais variam de um dia para o outro; o que conta é a média.</p>' + (disc ? "" : barra("Energia", med.kcal, m.kcal, "kcal")) + barra("Proteína", med.prot, m.prot, "g") + barrasMicro(med, m) +
    (baixos.length ? '<p style="margin:12px 0 0"><strong>Abaixo de 80% da meta só com comida:</strong> ' + esc(baixos.join(", ")) + '.</p><p class="sub" style="margin:4px 0 0">' + (disc ? "Com este cardápio" : "Com esta quantidade de calorias") + " isso é esperado para alguns nutrientes. É o ponto para levar ao médico ou nutricionista, que decide sobre exame e suplemento.</p>" : "") + "</div>";

  out += '<div class="cartao"><h2>Trocas</h2><p class="sub" style="margin:0">Quantidades equivalentes para trocar um alimento por outro do mesmo grupo.</p>' +
    trocas("Proteínas (cada linha dá cerca de 25 g de proteína)", ["proteina"], "prot", 25) +
    trocas("Laticínios (cerca de 250 mg de cálcio)", ["laticinio"], "ca", 250) +
    trocas("Arroz, pães, raízes e feijões" + (disc ? "" : " (cerca de 100 kcal)"), ["carboidrato", "leguminosa"], "kcal", 100) +
    trocas("Frutas" + (disc ? "" : " (cerca de 60 kcal)"), ["fruta"], "kcal", 60) + "</div>";

  out += '<div class="cartao"><h2>Onde está cada nutriente</h2><p class="sub" style="margin:0">Os cinco alimentos da lista que mais entregam, por porção usada no cardápio.</p>' +
    NUTRI.map(n => "<details><summary>" + n[1] + ' <span class="sub">meta ' + fmt(m.micro[n[0]], m.micro[n[0]] < 20 ? 1 : 0) + " " + n[2] + "</span></summary><table>" +
      fontes(n[0]).map(f => "<tr><td>" + esc(A[f.k].nome) + ' <span class="sub">' + f.g + ' g</span></td><td class="num">' + fmt(f.v, f.v < 20 ? 1 : 0) + " " + n[2] + "</td></tr>").join("") + "</table></details>").join("") +
    '<p class="sub" style="margin:10px 0 0">Valores da TACO (Unicamp); B12, D, E, K e folato do USDA. São médias: marca, preparo e safra mudam o número real.</p></div>';
  return out;
}
function trocas(titulo, grupos, campo, alvo) {
  const R = restricoesDoPerfil();
  const linhas = Object.keys(A).filter(k => grupos.indexOf(A[k].grupo) >= 0 && A[k][campo] > 0 && podeComer(k, R)).map(k => {
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
  const R = restricoesDoPerfil();
  return Object.keys(A).filter(k => k !== "whey" && podeComer(k, R)).map(k => { const g = PORCOES[k] || A[k].gMedida; return { k, g, v: A[k][campo] * g / 100 }; })
    .sort((a, b) => b.v - a.v).slice(0, 5);
}

AC.diaPlano = function (d) { E.ui.diaPlano = Number(d.i); salvar(); render(); };
