"use strict";
/* Aplicações: situação da dose, cartão da tela Hoje, aba Aplicações do diário e trecho do relatório. */

function situacaoDose() {
  const ds = E.doses.slice().sort(porData);
  if (!ds.length) return null;
  const ult = ds[ds.length - 1], h = hoje();
  let naDose = 0;
  for (let i = ds.length - 1; i >= 0 && ds[i].mg === ult.mg; i--) naDose++;
  const prox = mais(ult.data, 7), falta = entre(h, prox);
  const usados = ds.slice(-3).map(d => d.local);
  const sugerido = LOCAIS.find(l => usados.indexOf(l) < 0) || LOCAIS[(LOCAIS.indexOf(ult.local) + 1) % LOCAIS.length];
  return { ult, naDose, total: ds.length, semana: Math.floor(entre(ds[0].data, h) / 7) + 1, prox, falta, sugerido };
}

function cartaoTratamentoHoje() {
  const s = situacaoDose();
  let out = "";
  if (!s) {
    out += '<div class="cartao destaque"><h2>Tratamento</h2><p class="sub">Quando ela fizer a primeira aplicação, registre aqui. O app passa a contar as semanas e avisar a data da próxima.</p><div class="botoes"><button data-ac="ir" data-para="diario" data-sub="doses">Registrar aplicação</button></div></div>';
  } else {
    let quando;
    if (s.falta > 0) quando = "em " + s.falta + (s.falta === 1 ? " dia" : " dias") + " (" + SEMANA[diaSemana(s.prox)] + ", " + br(s.prox) + ")";
    else if (s.falta === 0) quando = "hoje";
    else if (s.falta >= -4) quando = "atrasada " + (-s.falta) + (s.falta === -1 ? " dia" : " dias") + ". Dentro de 4 dias ainda dá para aplicar.";
    else quando = "atrasada " + (-s.falta) + " dias. Passou de 4 dias: a orientação da bula é pular essa dose e aplicar a próxima no dia habitual (" + br(mais(s.prox, 7 * Math.ceil(-s.falta / 7))) + ").";
    out += '<div class="cartao destaque"><div class="linha"><div><div class="sub">Semana ' + s.semana + " do tratamento</div><div class=\"grande\">" + fmt(s.ult.mg, 1) + ' mg</div></div><div style="text-align:right"><div class="sub">Nesta dose</div><div><strong>' + s.naDose + (s.naDose === 1 ? " aplicação" : " aplicações") + "</strong></div></div></div>" +
      '<p style="margin:10px 0 0"><strong>Próxima aplicação:</strong> ' + quando + '</p><p class="sub" style="margin:4px 0 0">Local sugerido: ' + esc(s.sugerido) + "." +
      (s.naDose >= 4 && s.ult.mg < 15 ? " Já são 4 semanas nesta dose: subir ou manter é assunto para a consulta." : "") + "</p>" +
      (s.falta <= 0 ? '<div class="botoes"><button data-ac="ir" data-para="diario" data-sub="doses">Registrar aplicação</button></div>' : "") + "</div>";
  }
  return out;
}

/* Destaque do risco de hipoglicemia para quem tem diabetes e usa insulina ou sulfonilureia. onde: "treino" ou "guia". Devolve "" quando não se aplica. */
function avisoHipoglicemia(onde) { return ""; }

function subDoses() {
  const h = hoje();
  let out = "";
    const s = situacaoDose(), mgPadrao = s ? s.ult.mg : 2.5, localPadrao = s ? s.sugerido : LOCAIS[0];
    out += '<form class="cartao" data-form="dose"><h2>Registrar aplicação</h2><label>Data<input type="date" name="data" value="' + h + '" max="' + h + '" required></label>' +
      "<label>Dose<select name=\"mg\">" + DOSES.map(d => '<option value="' + d + '"' + (d === mgPadrao ? " selected" : "") + ">" + fmt(d, 1) + " mg</option>").join("") + "</select></label>" +
      '<label>Local<select name="local">' + LOCAIS.map(l => "<option" + (l === localPadrao ? " selected" : "") + ">" + l + "</option>").join("") + "</select></label>" +
      '<label>Observação (opcional)<input name="obs" maxlength="120"></label><div class="botoes"><button>Salvar aplicação</button></div></form>';
    const ds = E.doses.slice().sort(porData).reverse();
    out += '<div class="cartao"><h2>Histórico</h2>' + (ds.length ? "<table><tr><th>Data</th><th>Dose</th><th>Local</th><th></th></tr>" + ds.map(d => "<tr><td>" + brAno(d.data) + "</td><td>" + fmt(d.mg, 1) + " mg</td><td>" + esc(d.local) + (d.obs ? '<div class="sub">' + esc(d.obs) + "</div>" : "") + '</td><td class="num"><button class="x" data-ac="apagar" data-lista="doses" data-id="' + d.id + '">apagar</button></td></tr>').join("") + "</table>" : '<p class="sub" style="margin:0">Nenhuma aplicação registrada.</p>') + "</div>";
  out += cartaoCaneta();
  return out;
}

FORM.dose = function (f) {
    if (!f.data) return;
    const outra = E.doses.find(d => Math.abs(entre(d.data, f.data)) < 3);
    if (outra && !confirm("Já existe uma aplicação em " + brAno(outra.data) + ", a menos de 3 dias desta data. O intervalo mínimo entre doses é de 72 horas. Salvar mesmo assim?")) return;
    E.doses.push({ id: novoId(), data: f.data, mg: num(f.mg), local: f.local, obs: (f.obs || "").trim() });
    salvar(); aviso("Aplicação registrada."); render();
};

function relTratamento(de) {
  const L = [], s = situacaoDose();
  L.push("TRATAMENTO");
  if (s) {
    L.push("Semana " + s.semana + ", " + s.total + " aplicações no total. Dose atual: " + fmt(s.ult.mg, 1) + " mg (" + s.naDose + " aplicações nesta dose).");
    E.doses.slice().sort(porData).filter(d => d.data >= de).forEach(d => L.push("  " + brAno(d.data) + ": " + fmt(d.mg, 1) + " mg, " + d.local + (d.obs ? " (" + d.obs + ")" : "")));
  } else L.push("Nenhuma aplicação registrada.");
  return L;
}
