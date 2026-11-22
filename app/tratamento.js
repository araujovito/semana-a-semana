"use strict";
/* Aplicações: situação da dose, cartão da tela Hoje, aba Aplicações do diário e trecho do relatório. */

/* ---------- contas da próxima aplicação (puras: recebem a lista, o dia habitual e a data de hoje) ---------- */
/* Regras, todas do guia ("Aplicação" e "Esqueci a dose", fonte: bula do Mounjaro):
   - uma vez por semana, sempre no mesmo dia (o DIA HABITUAL);
   - até 4 dias depois do dia previsto: aplicar e seguir o dia habitual na semana seguinte;
   - mais de 4 dias: pular a dose e aplicar a próxima no dia habitual;
   - várias semanas sem aplicar: falar com o médico antes de retomar (o app não dá instrução de dose);
   - pelo menos 3 dias (72 horas) entre duas aplicações. */
const DIAS_TOLERANCIA = 4;      // atraso máximo em que ainda se aplica a dose prevista
const DIAS_SEM_REGISTRO = 14;   // mais do que isto sem registro: só a orientação de falar com o médico
const DIAS_ENTRE_DOSES = 3;     // intervalo mínimo entre duas aplicações
const DIAS_PARA_TRAS = 365;     // data mais antiga aceita no registro: 1 ano atrás
const SEMANA_LONGA = ["segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado", "domingo"];

const dataValida = s => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && iso(deIso(s)) === s;
/* Aplicações que entram nas contas: com data legível e não depois de hoje (dado restaurado pode trazer data futura), em ordem de data. */
function dosesAte(doses, h) { return (doses || []).filter(d => d && dataValida(d.data) && d.data <= h).sort(porData); }
/* Dia habitual, 0 a 6 (segunda a domingo): o que ela informou (E.diaDose) ou, se não informou, o dia da semana da primeira aplicação. null sem aplicação. */
function diaHabitual(doses, diaDose, h) {
  if (Number.isInteger(diaDose) && diaDose >= 0 && diaDose <= 6) return diaDose;
  const ds = dosesAte(doses, h);
  return ds.length ? diaSemana(ds[0].data) : null;
}
/* Dia previsto (no dia habitual) a que uma aplicação feita em `data` corresponde: de 2 dias antes até 4 dias depois dele.
   Com isso a próxima prevista (o resultado + 7) fica sempre de 3 a 9 dias depois da aplicação, respeitando as 72 horas. */
function previstaDe(data, habitual) {
  const atraso = (diaSemana(data) - habitual + 7) % 7;      // dias desde o último dia habitual
  return atraso <= DIAS_TOLERANCIA ? mais(data, -atraso) : mais(data, 7 - atraso);
}
/* Início da sequência atual na mesma dose (data da primeira aplicação seguida com o mg da última). */
function inicioNaDose(ds) {
  let i = ds.length - 1;
  while (i > 0 && ds[i - 1].mg === ds[i].mg) i--;
  return { data: ds[i].data, aplicacoes: ds.length - i };
}
/* Situação do tratamento na data h. null sem aplicação até h. Campo `estado`:
     "emDia"    próxima aplicação no futuro: `prox` e `falta` (dias)
     "hoje"     a aplicação prevista é hoje
     "atrasada" a prevista (`prevista`) passou há `atraso` dias, de 1 a 4: ainda se aplica; `seguinte` é o dia habitual da semana seguinte
     "pular"    passou há 5 ou 6 dias: pular; `prox` é o próximo dia habitual
     "medico"   mais de 14 dias sem registro: nenhuma instrução de dose (`prox` e `falta` nulos) */
function situacaoDoseEm(doses, diaDose, h) {
  const ds = dosesAte(doses, h);
  if (!ds.length) return null;
  const ult = ds[ds.length - 1], habitual = diaHabitual(ds, diaDose, h), nd = inicioNaDose(ds);
  const usados = ds.slice(-3).map(d => d.local);
  const sugerido = LOCAIS.find(l => usados.indexOf(l) < 0) || LOCAIS[(LOCAIS.indexOf(ult.local) + 1) % LOCAIS.length];
  const s = { ult, total: ds.length, habitual, sugerido,
    semana: Math.floor(entre(ds[0].data, h) / 7) + 1,
    /* semanas de calendário desde a primeira aplicação da sequência atual nesta dose (1 = primeira semana) */
    semanaNaDose: Math.floor(entre(nd.data, h) / 7) + 1, inicioNaDose: nd.data, naDose: nd.aplicacoes,
    diasSemRegistro: entre(ult.data, h), prevista: null, atraso: 0, seguinte: null, prox: null, falta: null };
  if (s.diasSemRegistro > DIAS_SEM_REGISTRO) { s.estado = "medico"; return s; }
  const devida = mais(previstaDe(ult.data, habitual), 7);          // primeira aplicação prevista ainda sem registro
  if (h < devida) { s.estado = "emDia"; s.prox = devida; s.falta = entre(h, devida); return s; }
  /* O atraso conta a partir da prevista MAIS RECENTE no dia habitual, não de "última + 7". */
  s.atraso = (diaSemana(h) - habitual + 7) % 7;
  s.prevista = mais(h, -s.atraso);
  s.seguinte = mais(s.prevista, 7);
  s.falta = -s.atraso;
  if (s.atraso === 0) { s.estado = "hoje"; s.prox = h; }
  else if (s.atraso <= DIAS_TOLERANCIA) { s.estado = "atrasada"; s.prox = h; }
  else { s.estado = "pular"; s.prox = s.seguinte; }
  return s;
}
function situacaoDose() { return situacaoDoseEm(E.doses, E.diaDose, hoje()); }

/* Motivo para recusar a data de uma aplicação, ou "" se a data serve: de 1 ano atrás até hoje. */
function erroDataDose(data, h) {
  if (!data) return "Escolha a data da aplicação.";
  if (!dataValida(data) || data > h || data < mais(h, -DIAS_PARA_TRAS)) return "Confira a data, inclusive o ano: o app aceita aplicações de " + brAno(mais(h, -DIAS_PARA_TRAS)) + " até hoje.";
  return "";
}
/* Aplicação imediatamente anterior a `data` (ou no mesmo dia), sem contar o registro `menosId`. null se não há. */
function doseAnterior(doses, data, menosId) {
  const ds = (doses || []).filter(d => d && dataValida(d.data) && d.data <= data && d.id !== menosId).sort(porData);
  return ds.length ? ds[ds.length - 1] : null;
}
/* Verdadeiro quando `mg` está mais de um degrau acima da aplicação anterior (2,5 para 7,5 ou mais). Reduzir, manter e a primeira aplicação não contam. */
function saltoDeDose(doses, data, mg, menosId) {
  const ant = doseAnterior(doses, data, menosId);
  if (!ant) return false;
  const a = DOSES.indexOf(ant.mg), b = DOSES.indexOf(mg);
  return a >= 0 && b >= 0 ? b - a > 1 : mg - ant.mg > 2.5;
}
const diaCurto = d => SEMANA[diaSemana(d)] + ", " + br(d);
const nDias = n => n + (n === 1 ? " dia" : " dias");
const ordinalF = n => n + "ª";

/* ---------- cartão da tela Hoje ---------- */
function cartaoTratamentoHoje() {
  const s = situacaoDose(), botao = cls => '<div class="botoes"><button' + (cls ? ' class="' + cls + '"' : "") + ' data-ac="ir" data-para="diario" data-sub="doses">Registrar aplicação</button></div>';
  if (!s) return '<div class="cartao destaque" data-dose="sem"><h2>Tratamento</h2><p class="sub">Quando você fizer a primeira aplicação, registre aqui. O app passa a contar as semanas e avisar a data da próxima.</p>' + botao() + "</div>";
  if (s.estado === "medico") {
    /* Sem dose e sem data, de propósito. Texto do guia, "Esqueci a dose": "Se ficar várias semanas sem aplicar, falar com o médico antes de retomar: pode ser preciso recomeçar numa dose menor." */
    return '<div class="cartao destaque" data-dose="medico"><h2>Tratamento</h2><p style="margin:0">A última aplicação registrada foi em ' + brAno(s.ult.data) + ", há " + s.diasSemRegistro + " dias.</p>" +
      '<p style="margin:8px 0 0"><strong>Depois de várias semanas sem aplicar, fale com o médico antes de retomar:</strong> pode ser preciso recomeçar numa dose menor.</p>' +
      '<p class="sub" style="margin:8px 0 0">Se você aplicou e não anotou, registre a aplicação com a data certa.</p>' + botao("sec") + "</div>";
  }
  let quando;
  if (s.estado === "emDia") quando = "<strong>Próxima aplicação:</strong> em " + nDias(s.falta) + " (" + diaCurto(s.prox) + ")";
  else if (s.estado === "hoje") quando = "<strong>Próxima aplicação:</strong> hoje";
  /* Guia, "Esqueci a dose": "Até 4 dias (96 horas) depois do horário previsto: aplicar assim que lembrar e seguir o dia habitual na semana seguinte." */
  else if (s.estado === "atrasada") quando = "<strong>Próxima aplicação:</strong> estava prevista para " + diaCurto(s.prevista) + ", há " + nDias(s.atraso) + ". Até 4 dias depois do dia previsto, a orientação da bula é aplicar assim que lembrar e seguir o dia habitual na semana seguinte (" + diaCurto(s.seguinte) + ").";
  /* Guia, "Esqueci a dose": "Mais de 4 dias: pular a dose esquecida e aplicar a próxima no dia habitual. Não aplicar duas doses para compensar." */
  else quando = "<strong>Próxima aplicação:</strong> " + diaCurto(s.prox) + ". A que estava prevista para " + diaCurto(s.prevista) + " passou de 4 dias: a orientação da bula é pular essa dose e aplicar a próxima no dia habitual. Não aplicar duas doses para compensar.";
  return '<div class="cartao destaque" data-dose="' + s.estado + '"><div class="linha"><div><div class="sub">Semana ' + s.semana + ' do tratamento</div><div class="grande">' + fmt(s.ult.mg, 1) + ' mg</div></div><div style="text-align:right"><div class="sub">Nesta dose</div><div><strong>' + ordinalF(s.semanaNaDose) + " semana</strong></div></div></div>" +
    '<p style="margin:10px 0 0">' + quando + '</p><p class="sub" style="margin:4px 0 0">Local sugerido: ' + esc(s.sugerido) + "." +
    (s.semanaNaDose >= 4 && s.ult.mg < 15 ? " Já são 4 semanas nesta dose: subir ou manter é assunto para a consulta." : "") + "</p>" +
    (s.estado === "hoje" || s.estado === "atrasada" ? botao() : s.estado === "pular" ? botao("sec") : "") + "</div>";
}

/* Destaque do risco de hipoglicemia para quem tem diabetes e usa insulina ou sulfonilureia. onde: "treino" ou "guia". Devolve "" quando não se aplica. */
function avisoHipoglicemia(onde) { return ""; }

/* ---------- aba Aplicações ---------- */
function subDoses() {
  const h = hoje();
  let out = "";
  const s = situacaoDose(), mgPadrao = s ? s.ult.mg : 2.5, localPadrao = s ? s.sugerido : LOCAIS[0];
  /* novalidate: a WebView não mostra o balão de campo inválido; quem confere e avisa é FORM.dose. */
  out += '<form class="cartao" data-form="dose" novalidate><h2>Registrar aplicação</h2><label>Data<input type="date" name="data" required value="' + h + '" min="' + mais(h, -DIAS_PARA_TRAS) + '" max="' + h + '"></label>' +
    "<label>Dose<select name=\"mg\">" + DOSES.map(d => '<option value="' + d + '"' + (d === mgPadrao ? " selected" : "") + ">" + fmt(d, 1) + " mg</option>").join("") + "</select></label>" +
    '<label>Local<select name="local">' + LOCAIS.map(l => "<option" + (l === localPadrao ? " selected" : "") + ">" + l + "</option>").join("") + "</select></label>" +
    '<label>Observação (opcional)<input name="obs" maxlength="120"></label><div class="botoes"><button>Salvar aplicação</button></div></form>';
  const ds = E.doses.slice().sort(porData).reverse();
  out += '<div class="cartao"><h2>Histórico</h2>' + (ds.length ? "<table><tr><th>Data</th><th>Dose</th><th>Local</th><th></th></tr>" + ds.map(d => "<tr><td>" + esc(dataValida(d.data) ? brAno(d.data) : d.data) + "</td><td>" + fmt(d.mg, 1) + " mg</td><td>" + esc(d.local) + (d.obs ? '<div class="sub">' + esc(d.obs) + "</div>" : "") + '</td><td class="num"><button class="x" data-ac="apagar" data-lista="doses" data-id="' + esc(d.id) + '">apagar</button></td></tr>').join("") + "</table>" : '<p class="sub" style="margin:0">Nenhuma aplicação registrada.</p>') + "</div>";
  out += cartaoDiaHabitual(s);
  out += cartaoCaneta();
  return out;
}
/* "Mudei o dia da aplicação": o dia habitual só muda quando ela diz. Guia, "Aplicação": "Dá para mudar o dia da semana, desde que haja pelo menos 3 dias (72 horas) entre duas aplicações." */
function cartaoDiaHabitual(s) {
  if (!s) return "";
  return '<div class="cartao" data-cartao="dia-habitual"><h2>Dia da aplicação</h2><p class="sub" style="margin:0">O app conta a próxima aplicação a partir do seu dia habitual. Aplicar atrasada não muda esse dia.</p>' +
    '<label>Mudei o dia da aplicação para<select data-mud="diaDose">' + SEMANA_LONGA.map((n, i) => '<option value="' + i + '"' + (i === s.habitual ? " selected" : "") + ">" + n + "</option>").join("") + "</select></label>" +
    '<p class="sub" style="margin:8px 0 0">Dá para mudar o dia da semana, desde que haja pelo menos 3 dias (72 horas) entre duas aplicações.</p></div>';
}
MUD.diaDose = function (c) {
  const v = Number(c.value);
  if (!(v >= 0 && v <= 6)) return;
  E.diaDose = v; salvar();
  aviso("Dia habitual: " + SEMANA_LONGA[v] + "."); render();
};

FORM.dose = function (f) {
  const h = hoje(), erro = erroDataDose(f.data, h), mg = num(f.mg);
  if (erro) return aviso(erro);
  const outra = E.doses.find(d => dataValida(d.data) && Math.abs(entre(d.data, f.data)) < DIAS_ENTRE_DOSES);
  const gravar = () => { E.doses.push({ id: novoId(), data: f.data, mg: mg, local: f.local, obs: (f.obs || "").trim() }); salvar(); aviso("Aplicação registrada."); render(); };
  /* Guia, "Doses: como sobem": "o médico pode subir de 2,5 em 2,5 mg". Pular degrau pode ser erro de digitação: pergunta antes de gravar. */
  const conferirSalto = () => saltoDeDose(E.doses, f.data, mg)
    ? confirmar("A aplicação anterior foi de " + fmt(doseAnterior(E.doses, f.data).mg, 1) + " mg e esta é de " + fmt(mg, 1) + " mg. As doses costumam subir de 2,5 em 2,5 mg. Salvar " + fmt(mg, 1) + " mg mesmo assim?", gravar, "Salvar")
    : gravar();
  if (outra) confirmar("Já existe uma aplicação em " + brAno(outra.data) + ", a menos de 3 dias desta data. O intervalo mínimo entre doses é de 72 horas. Salvar mesmo assim?", conferirSalto, "Salvar");
  else conferirSalto();
};

function relTratamento(de) {
  const L = [], s = situacaoDose();
  L.push("TRATAMENTO");
  if (s) {
    L.push("Semana " + s.semana + ", " + s.total + (s.total === 1 ? " aplicação" : " aplicações") + " no total. Dose atual: " + fmt(s.ult.mg, 1) + " mg (" + ordinalF(s.semanaNaDose) + " semana nesta dose, " + s.naDose + (s.naDose === 1 ? " aplicação" : " aplicações") + "). Dia habitual: " + SEMANA_LONGA[s.habitual] + ".");
    if (s.estado === "medico") L.push("Última aplicação registrada há " + s.diasSemRegistro + " dias.");
    E.doses.slice().sort(porData).filter(d => d.data >= de).forEach(d => L.push("  " + (dataValida(d.data) ? brAno(d.data) : d.data) + ": " + fmt(d.mg, 1) + " mg, " + d.local + (d.obs ? " (" + d.obs + ")" : "")));
  } else L.push("Nenhuma aplicação registrada.");
  return L;
}
