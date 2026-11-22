"use strict";
/* Sintomas: aba Sintomas do diário (registrar e corrigir) e trecho do relatório. O app só registra e conta: não interpreta. */

/* id do registro que está sendo corrigido no formulário do topo. Não é gravado: some ao fechar o app. */
let sintomaEmEdicao = null;

const NIVEIS_ENJOO = ["Nenhum", "Leve", "Moderado", "Forte"];
const INTESTINOS = ["Normal", "Preso", "Solto"];
const MARCAS_SINTOMA = [["vomito", "Vômito", "vômito"], ["refluxo", "Refluxo", "refluxo"], ["tontura", "Tontura", "tontura"], ["cansaco", "Cansaço", "cansaço"], ["dor", "Dor forte na barriga", "dor forte na barriga"]];

function resumoSintoma(s) {
  const p = [];
  p.push("Enjoo " + NIVEIS_ENJOO[s.enjoo || 0].toLowerCase());
  p.push("intestino " + String(s.intestino || "Normal").toLowerCase());
  MARCAS_SINTOMA.forEach(x => { if (s[x[0]]) p.push(x[2]); });
  return p.join(", ");
}

/* Monta o registro a partir dos campos do formulário. anterior: o registro que está sendo corrigido (ou null).
   Na correção o id é mantido, e também o que o formulário não mostra (por exemplo uma glicemia vinda de outra versão). */
function montarSintoma(f, anterior) {
  return Object.assign({}, anterior || {}, { id: anterior ? anterior.id : novoId(), data: f.data, enjoo: Number(f.enjoo) || 0, intestino: INTESTINOS.indexOf(f.intestino) >= 0 ? f.intestino : "Normal",
    vomito: !!f.vomito, refluxo: !!f.refluxo, tontura: !!f.tontura, cansaco: !!f.cansaco, dor: !!f.dor, nota: (f.nota || "").trim() });
}

function subSintomas() {
  const h = hoje();
  const ed = sintomaEmEdicao ? E.sintomas.find(s => s.id === sintomaEmEdicao) : null;
  if (!ed) sintomaEmEdicao = null;
  const r = ed || { enjoo: 0, intestino: "Normal" };
  let out = "";
  out += '<form class="cartao' + (ed ? " destaque" : "") + '" data-form="sintoma"><h2>' + (ed ? "Corrigir registro" : "Como você está hoje") + "</h2>" + (ed ? '<p class="sub" style="margin:0">Você está corrigindo o registro de ' + brAno(ed.data) + ".</p>" : "") +
    '<label>Data<input type="date" name="data" value="' + esc(ed ? ed.data : h) + '" min="' + dataMinima() + '" max="' + h + '" required></label>' +
    '<div class="duas"><label>Enjoo<select name="enjoo">' + NIVEIS_ENJOO.map((n, i) => '<option value="' + i + '"' + ((r.enjoo || 0) === i ? " selected" : "") + ">" + n + "</option>").join("") + "</select></label>" +
    '<label>Intestino<select name="intestino">' + INTESTINOS.map(n => "<option" + ((r.intestino || "Normal") === n ? " selected" : "") + ">" + n + "</option>").join("") + "</select></label></div>" +
    '<div class="marcas">' + MARCAS_SINTOMA.map(x => '<label><input type="checkbox" name="' + x[0] + '"' + (r[x[0]] ? " checked" : "") + ">" + x[1] + "</label>").join("") + "</div>" +
    '<label>Anotação (opcional)<input name="nota" maxlength="200" value="' + esc(r.nota || "") + '"></label>' +
    '<div class="botoes"><button>' + (ed ? "Salvar alteração" : "Salvar") + "</button>" + (ed ? '<button type="button" class="sec" data-ac="cancelarSintoma">Cancelar</button>' : "") + "</div></form>";
  const ss = E.sintomas.slice().sort(porData).reverse();
  out += '<div class="cartao" id="hist-sintomas"><h2>Histórico</h2>' + (ss.length ? ss.map(s => '<div class="reg"><div class="txt">' + esc(brAno(s.data)) + "<div>" + esc(resumoSintoma(s)) + "</div>" + (s.nota ? '<div class="sub">' + esc(s.nota) + "</div>" : "") +
    '</div><div class="acoes"><button class="x ed" data-ac="editarSintoma" data-id="' + esc(s.id) + '">editar</button><button class="x" data-ac="apagar" data-lista="sintomas" data-id="' + esc(s.id) + '">apagar</button></div></div>').join("") : '<p class="sub" style="margin:0">Nada registrado.</p>') + "</div>";
  return out;
}

Object.assign(AC, {
  editarSintoma(d) { sintomaEmEdicao = d.id; render(); rolarAteForm("sintoma"); },
  cancelarSintoma() { sintomaEmEdicao = null; render(); },
});

FORM.sintoma = function (f) {
  const erro = erroDeData(f.data); if (erro) return aviso(erro);
  const ed = sintomaEmEdicao ? E.sintomas.find(x => x.id === sintomaEmEdicao) : null;
  const s = montarSintoma(f, ed);
  if (ed) E.sintomas = E.sintomas.map(x => (x.id === ed.id ? s : x)); else E.sintomas.push(s);
  sintomaEmEdicao = null;
  salvar(); render();
  if (s.dor || (s.vomito && s.enjoo >= 3)) alerta("Dor forte e contínua na barriga, ou vômito que não para, estão na lista de sinais de alerta do Guia. A orientação é procurar atendimento médico sem esperar a consulta.");
  else aviso(ed ? "Registro corrigido." : "Registrado.");
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
