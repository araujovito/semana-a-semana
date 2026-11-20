"use strict";
/* Treino: fase, próximo treino, tela Treino e trecho do relatório. */

function treinosDaSemana() { const i = inicioSemana(hoje()); return E.treinos.filter(t => t.data >= i && t.data <= mais(i, 6)); }
function proximoTreino() { const t = E.treinos.slice().sort(porData); return t.length && t[t.length - 1].tipo === "A" ? "B" : "A"; }
function faseTreino() {
  const t = E.treinos.slice().sort(porData);
  const sem = t.length ? Math.floor(entre(t[0].data, hoje()) / 7) + 1 : 1;
  return { sem, fase: T.fases[sem <= 2 ? 0 : sem <= 6 ? 1 : 2] };
}

function telaTreino() {
  const local = E.ui.local || "casa", f = faseTreino(), px = proximoTreino(), h = hoje(), fezHoje = E.treinos.some(t => t.data === h);
  let out = avisoHipoglicemia("treino");
  out += '<div class="chips"><button data-ac="local" data-v="casa" class="' + (local === "casa" ? "ativa" : "") + '">Em casa</button><button data-ac="local" data-v="academia" class="' + (local === "academia" ? "ativa" : "") + '">Na academia</button></div>';
  out += '<div class="cartao destaque"><div class="sub">Semana ' + f.sem + " de treino · " + esc(f.fase.semanas) + '</div><p style="margin:6px 0 0">' + esc(f.fase.texto) + '</p><p class="sub" style="margin:8px 0 0">Nesta semana: ' + treinosDaSemana().length + " de 3 treinos. Próximo: treino " + px + ".</p></div>";
  ["A", "B"].forEach(tipo => {
    out += '<div class="cartao"><div class="linha"><h2 style="margin:0">Treino ' + tipo + "</h2>" + (fezHoje ? "" : '<button class="mini' + (tipo === px ? "" : " sec") + '" data-ac="treino" data-tipo="' + tipo + '">Concluí hoje</button>') + "</div>" +
      T[local][tipo].map(ex => "<details><summary>" + esc(ex.nome) + ' <span class="sub">' + f.fase.series + " × " + esc(ex.reps) + '</span></summary><p class="como">' + esc(ex.como) + "</p></details>").join("") + "</div>";
  });
  out += '<div class="cartao"><h2>Como funciona</h2><ul class="lista">' + T.regras.map(r => "<li>" + esc(r) + "</li>").join("") + "</ul>" +
    '<h3>Progressão em 12 semanas</h3><ul class="lista">' + T.fases.map(x => "<li><strong>" + esc(x.semanas) + ":</strong> " + esc(x.texto) + "</li>").join("") + "</ul>" +
    '<p class="sub">Quem tem problema no coração, nas articulações ou na coluna combina o treino com o médico antes de começar.</p></div>';
  const hist = E.treinos.slice().sort(porData).reverse().slice(0, 12);
  out += '<div class="cartao"><h2>Treinos registrados</h2>' + (hist.length ? "<table>" + hist.map(t => "<tr><td>" + brAno(t.data) + "</td><td>Treino " + esc(t.tipo) + " · " + (t.local === "academia" ? "academia" : "casa") + '</td><td class="num"><button class="x" data-ac="apagar" data-lista="treinos" data-id="' + t.id + '">apagar</button></td></tr>').join("") + "</table>" : '<p class="sub" style="margin:0">Nenhum treino registrado ainda.</p>') + "</div>";
  return out;
}

function relExercicio(de) {
  const h = hoje();
  let cam = 0;
  Object.keys(E.dias).filter(d => d >= de && d <= h).forEach(d => { cam += dia(d).caminhada || 0; });
  return ["EXERCÍCIO (no período)", "Treinos de força: " + E.treinos.filter(t => t.data >= de).length + ". Caminhada: " + cam + " minutos."];
}

Object.assign(AC, {
  treino(d) { E.treinos.push({ id: novoId(), data: hoje(), tipo: d.tipo, local: E.ui.local || "casa" }); salvar(); aviso("Treino " + d.tipo + " registrado."); render(); },
  local(d) { E.ui.local = d.v; salvar(); render(); },
});
