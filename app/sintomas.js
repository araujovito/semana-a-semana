"use strict";
/* Sintomas: aba Sintomas do diário e trecho do relatório. */

function subSintomas() {
  const h = hoje();
  let out = "";
    out += '<form class="cartao" data-form="sintoma"><h2>Como ela está</h2><label>Data<input type="date" name="data" value="' + h + '" max="' + h + '" required></label>' +
      '<div class="duas"><label>Enjoo<select name="enjoo"><option value="0">Nenhum</option><option value="1">Leve</option><option value="2">Moderado</option><option value="3">Forte</option></select></label>' +
      '<label>Intestino<select name="intestino"><option>Normal</option><option>Preso</option><option>Solto</option></select></label></div>' +
      '<div class="marcas"><label><input type="checkbox" name="vomito">Vômito</label><label><input type="checkbox" name="refluxo">Refluxo</label><label><input type="checkbox" name="tontura">Tontura</label><label><input type="checkbox" name="cansaco">Cansaço</label><label><input type="checkbox" name="dor">Dor forte na barriga</label></div>' +
      '<label>Anotação (opcional)<input name="nota" maxlength="200"></label><div class="botoes"><button>Salvar</button></div></form>';
    const ss = E.sintomas.slice().sort(porData).reverse();
    out += '<div class="cartao"><h2>Histórico</h2>' + (ss.length ? "<table>" + ss.map(s => "<tr><td>" + brAno(s.data) + "</td><td>" + esc(resumoSintoma(s)) + (s.nota ? '<div class="sub">' + esc(s.nota) + "</div>" : "") + '</td><td class="num"><button class="x" data-ac="apagar" data-lista="sintomas" data-id="' + s.id + '">apagar</button></td></tr>').join("") + "</table>" : '<p class="sub" style="margin:0">Nada registrado.</p>') + "</div>";
  return out;
}
function resumoSintoma(s) {
  const p = [];
  p.push("Enjoo " + ["nenhum", "leve", "moderado", "forte"][s.enjoo || 0]);
  p.push("intestino " + String(s.intestino || "Normal").toLowerCase());
  [["vomito", "vômito"], ["refluxo", "refluxo"], ["tontura", "tontura"], ["cansaco", "cansaço"], ["dor", "dor forte na barriga"]].forEach(x => { if (s[x[0]]) p.push(x[1]); });
  return p.join(", ");
}

FORM.sintoma = function (f) {
    const s = { id: novoId(), data: f.data, enjoo: Number(f.enjoo) || 0, intestino: f.intestino, vomito: !!f.vomito, refluxo: !!f.refluxo, tontura: !!f.tontura, cansaco: !!f.cansaco, dor: !!f.dor, nota: (f.nota || "").trim() };
    E.sintomas.push(s); salvar(); render();
    if (s.dor || (s.vomito && s.enjoo >= 3)) alert("Dor forte e contínua na barriga, ou vômito que não para, estão na lista de sinais de alerta do Guia. A orientação é procurar atendimento médico sem esperar a consulta.");
    else aviso("Registrado.");
};

function relSintomas(de) {
  const L = [];
  L.push("SINTOMAS (no período)");
  const ss = E.sintomas.filter(x => x.data >= de).sort(porData);
  if (ss.length) {
    const c = k => ss.filter(x => x[k]).length;
    L.push(ss.length + (ss.length === 1 ? " registro" : " registros") + ". Enjoo moderado ou forte: " + ss.filter(x => x.enjoo >= 2).length + ". Vômito: " + c("vomito") + ". Intestino preso: " + ss.filter(x => x.intestino === "Preso").length + ". Intestino solto: " + ss.filter(x => x.intestino === "Solto").length + ". Refluxo: " + c("refluxo") + ". Tontura: " + c("tontura") + ". Cansaço: " + c("cansaco") + ". Dor forte na barriga: " + c("dor") + ".");
    ss.filter(x => x.nota).forEach(x => L.push("  " + brAno(x.data) + ": " + x.nota));
  } else L.push("Nenhum registro.");
  return L;
}
