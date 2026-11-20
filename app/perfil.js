"use strict";
/* Tela Perfil: dados dela, metas informadas pelo médico e explicação do cálculo. */

function telaPerfil() {
  const p = E.perfil || {}, m = metas();
  const v = k => (p[k] == null ? "" : esc(p[k]));
  const at = [[1.2, "Sedentária (trabalho sentada, sem exercício)"], [1.375, "Leve (caminhadas, 1 a 3 treinos por semana)"], [1.55, "Moderada (3 a 5 treinos por semana)"]];
  let out = "";
  if (!E.perfil) out += '<div class="cartao destaque"><h2>Bem-vinda</h2><p style="margin:0">Preencha os dados abaixo para o app calcular as metas de proteína, energia, água, vitaminas e minerais. Tudo fica guardado só neste celular.</p></div>';
  out += '<form class="cartao" data-form="perfil"><h2>Dados</h2><label>Nome (opcional)<input name="nome" value="' + v("nome") + '" maxlength="40"></label>' +
    '<div class="duas"><label>Sexo<select name="sexo"><option value="F"' + (p.sexo !== "M" ? " selected" : "") + '>Feminino</option><option value="M"' + (p.sexo === "M" ? " selected" : "") + ">Masculino</option></select></label>" +
    '<label>Ano de nascimento<input name="nascimento" inputmode="numeric" value="' + v("nascimento") + '" required></label></div>' +
    '<div class="duas"><label>Altura (cm)<input name="altura" inputmode="decimal" value="' + v("altura") + '" required></label><label>Peso inicial (kg)<input name="peso" inputmode="decimal" value="' + v("peso") + '" required></label></div>' +
    '<label>Atividade física hoje<select name="atividade">' + at.map(a => '<option value="' + a[0] + '"' + ((p.atividade || 1.2) === a[0] ? " selected" : "") + ">" + a[1] + "</option>").join("") + "</select></label>" +
    '<h3>Metas passadas pelo médico ou nutricionista (opcional)</h3><p class="sub" style="margin:0">Se preencher, elas substituem o cálculo do app.</p>' +
    '<div class="tres"><label>Energia (kcal)<input name="metaKcal" inputmode="numeric" value="' + v("metaKcal") + '"></label><label>Proteína (g)<input name="metaProt" inputmode="numeric" value="' + v("metaProt") + '"></label><label>Água (ml)<input name="metaAgua" inputmode="numeric" value="' + v("metaAgua") + '"></label></div>' +
    '<div class="botoes"><button>Salvar</button></div></form>';
  if (m) {
    out += '<div class="cartao"><h2>Como as metas são calculadas</h2><ul class="lista">' +
      "<li>Peso atual " + fmt(m.peso, 1) + " kg, IMC " + fmt(m.imc, 1) + ", " + m.idade + " anos.</li>" +
      "<li>Gasto em repouso (fórmula de Mifflin-St Jeor): " + fmt(m.tmb) + " kcal. Gasto diário estimado: " + fmt(m.gasto) + " kcal.</li>" +
      "<li>Energia: gasto diário menos 500 kcal, nunca abaixo de " + m.piso + " kcal. Cálculo do app: " + m.kcalCalc + " kcal." + (E.perfil.metaKcal ? " Em uso: " + m.kcal + " kcal (informada)." : "") + "</li>" +
      "<li>Proteína: 1,2 a 1,6 g por kg" + (m.imc >= 30 ? " de peso ajustado (" + fmt(m.pesoRef, 1) + " kg, porque com IMC a partir de 30 o peso real superestima a necessidade)" : "") + ", ou " + m.protMin + " a " + m.protMax + " g. Cálculo do app: " + m.protCalc + " g." + (E.perfil.metaProt ? " Em uso: " + m.prot + " g (informada)." : "") + "</li>" +
      "<li>Gordura: 30% da energia. Carboidrato: o restante.</li><li>Fibra, vitaminas e minerais: valores de referência (DRIs) para o sexo e a idade.</li></ul>" +
      '<p class="sub">As metas se atualizam sozinhas a cada peso registrado. São estimativas de população; o médico ou o nutricionista podem definir outras.</p></div>';
  }
  if (E.perfil) out += cartaoLembretes();
  return out;
}

FORM.perfil = function (f) {
    const nasc = num(f.nascimento), alt = num(f.altura), peso = num(f.peso), ano = new Date().getFullYear();
    if (!nasc || nasc < ano - 100 || nasc > ano - 16) return aviso("Confira o ano de nascimento (4 dígitos).");
    if (!alt || alt < 120 || alt > 220) return aviso("Altura em centímetros, por exemplo 165.");
    if (!peso || peso < 35 || peso > 300) return aviso("Confira o peso em kg.");
    const kcal = num(f.metaKcal), prot = num(f.metaProt), agua = num(f.metaAgua);
    if (kcal && (kcal < 800 || kcal > 4000)) return aviso("Meta de energia fora do intervalo esperado (800 a 4000 kcal).");
    if (prot && (prot < 30 || prot > 250)) return aviso("Meta de proteína fora do intervalo esperado (30 a 250 g).");
    if (agua && (agua < 500 || agua > 6000)) return aviso("Meta de água em ml, por exemplo 2000.");
    const primeiro = !E.perfil;
    E.perfil = Object.assign({}, PERFIL_NOVO, E.perfil, { nome: (f.nome || "").trim(), sexo: f.sexo === "M" ? "M" : "F", nascimento: Math.round(nasc), altura: alt, peso: peso, atividade: num(f.atividade) || 1.2, metaKcal: kcal, metaProt: prot, metaAgua: agua });
    salvar(); aviso("Perfil salvo.");
    if (primeiro) { location.hash = "hoje"; render(true); } else render();
};
