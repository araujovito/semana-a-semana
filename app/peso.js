"use strict";
/* Peso: aba Peso do diário, gráfico e trecho do relatório. */

function subPeso() {
  const h = hoje();
  let out = "";
    out += '<form class="cartao" data-form="peso"><h2>Registrar peso</h2><p class="sub" style="margin:0">Uma vez por semana, no mesmo dia e horário, é suficiente.</p><label>Data<input type="date" name="data" value="' + h + '" max="' + h + '" required></label>' +
      '<div class="duas"><label>Peso (kg)<input name="kg" inputmode="decimal" required></label><label>Cintura (cm, opcional)<input name="cintura" inputmode="decimal"></label></div><div class="botoes"><button>Salvar peso</button></div></form>';
    const ps = E.pesos.slice().sort(porData);
    if (ps.length) {
      const ini = E.perfil.peso, at = ps[ps.length - 1].kg, dif = at - ini;
      out += '<div class="cartao"><div class="tres"><div><div class="sub">Inicial</div><strong>' + fmt(ini, 1) + ' kg</strong></div><div><div class="sub">Atual</div><strong>' + fmt(at, 1) + ' kg</strong></div><div><div class="sub">Variação</div><strong>' + (dif > 0 ? "+" : "") + fmt(dif, 1) + " kg (" + fmt(100 * dif / ini, 1) + "%)</strong></div></div>" + grafico([{ data: null, kg: ini }].concat(ps)) + "</div>";
      out += '<div class="cartao"><h2>Histórico</h2><table><tr><th>Data</th><th>Peso</th><th>Cintura</th><th></th></tr>' + ps.slice().reverse().map(p => "<tr><td>" + brAno(p.data) + "</td><td>" + fmt(p.kg, 1) + " kg</td><td>" + (p.cintura ? fmt(p.cintura, 1) + " cm" : "") + '</td><td class="num"><button class="x" data-ac="apagar" data-lista="pesos" data-id="' + p.id + '">apagar</button></td></tr>').join("") + "</table></div>";
    }
  return out;
}
function grafico(ps) {
  const W = 320, H = 150, e = 28, kgs = ps.map(p => p.kg), mn = Math.min.apply(null, kgs), mx = Math.max.apply(null, kgs), amp = (mx - mn) || 1;
  const x = i => e + (ps.length === 1 ? 0 : i * (W - 2 * e) / (ps.length - 1)), y = k => 18 + (mx - k) * (H - 46) / amp;
  return '<svg class="graf" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Gráfico de peso"><line x1="' + e + '" y1="' + (H - 22) + '" x2="' + (W - e) + '" y2="' + (H - 22) + '"/><polyline points="' + ps.map((p, i) => x(i).toFixed(1) + "," + y(p.kg).toFixed(1)).join(" ") + '"/>' +
    ps.map((p, i) => '<circle cx="' + x(i).toFixed(1) + '" cy="' + y(p.kg).toFixed(1) + '" r="3"/>').join("") +
    '<text x="' + x(0) + '" y="' + (y(ps[0].kg) - 7) + '" text-anchor="middle">' + fmt(ps[0].kg, 1) + '</text><text x="' + x(ps.length - 1) + '" y="' + (y(ps[ps.length - 1].kg) - 7) + '" text-anchor="middle">' + fmt(ps[ps.length - 1].kg, 1) + "</text>" +
    '<text x="' + e + '" y="' + (H - 6) + '" text-anchor="middle">início</text><text x="' + (W - e) + '" y="' + (H - 6) + '" text-anchor="middle">' + (ps[ps.length - 1].data ? br(ps[ps.length - 1].data) : "") + "</text></svg>";
}

FORM.peso = function (f) {
    const kg = num(f.kg), c = num(f.cintura);
    if (!kg || kg < 35 || kg > 300) return aviso("Confira o peso em kg.");
    E.pesos = E.pesos.filter(p => p.data !== f.data);
    E.pesos.push({ id: novoId(), data: f.data, kg: kg, cintura: c });
    salvar(); aviso("Peso registrado."); render();
};

function relPeso(de) {
  const L = [], p = E.perfil, m = metas();
  L.push("PESO");
  const ps = E.pesos.slice().sort(porData);
  if (ps.length) {
    const at = ps[ps.length - 1], dif = at.kg - p.peso;
    L.push("Inicial: " + fmt(p.peso, 1) + " kg. Atual: " + fmt(at.kg, 1) + " kg em " + brAno(at.data) + " (" + (dif > 0 ? "+" : "") + fmt(dif, 1) + " kg, " + fmt(100 * dif / p.peso, 1) + "%). IMC atual: " + fmt(m.imc, 1) + ".");
    const noP = ps.filter(x => x.data >= de);
    if (noP.length > 1) L.push("No período: " + fmt(noP[0].kg, 1) + " kg -> " + fmt(noP[noP.length - 1].kg, 1) + " kg.");
    const c = ps.filter(x => x.cintura);
    if (c.length) L.push("Cintura: " + fmt(c[0].cintura, 1) + " cm -> " + fmt(c[c.length - 1].cintura, 1) + " cm.");
  } else L.push("Inicial: " + fmt(p.peso, 1) + " kg. Sem pesagens registradas.");
  return L;
}
