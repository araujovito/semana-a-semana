"use strict";
/* Tela Perfil: tela de entrada (para quem o app serve), seus dados, perguntas de saúde, o que você não come,
   metas informadas pelo médico e explicação do cálculo. Avisos de segurança usados também em outras telas. */

/* Textos de saúde desta tela (auditoria 1, achado 2; decisão da direção de 20/11):
   - tela de entrada: público do app e quem precisa conversar com o médico antes;
   - gravidez e amamentação: a primeira frase é a do Guia (conteudo.js, "Anticoncepcional e gravidez"), que segue a bula;
   - peso baixo: IMC abaixo de 18,5 é "baixo peso" na classificação de IMC da OMS. */
function telaEntrada() {
  return '<div class="cartao destaque"><h2>Antes de começar</h2>' +
    '<p style="margin:0">Este app foi feito para uma mulher adulta em tratamento com tirzepatida, acompanhada por médico. Ele organiza o cardápio, o treino e os seus registros. Não substitui a consulta.</p></div>' +
    '<div class="cartao"><h2>Converse com o seu médico antes de seguir o plano do app se você:</h2><ul class="lista">' +
    "<li>tem menos de 18 anos;</li><li>está grávida ou amamentando;</li><li>tem ou já teve transtorno alimentar;</li><li>já teve pancreatite;</li><li>tem, ou alguém da família tem, câncer medular de tireoide ou NEM2 (a bula contraindica o remédio nesses casos).</li></ul>" +
    '<div class="botoes"><button data-ac="entradaContinuar">Continuar</button></div></div>';
}
/* Cartão para as telas Perfil, Plano e Hoje. Devolve "" quando não se aplica. */
function avisoGestante() {
  const m = metas(); if (!m || !m.gestante) return "";
  return '<div class="cartao alerta"><h2>Gravidez e amamentação</h2><p style="margin:0">O remédio não é usado na gravidez; na amamentação, quem decide é o médico. Fale com o seu médico. Enquanto esta resposta estiver marcada no Perfil, o app não calcula redução de calorias.</p></div>';
}
/* Mais de 65 anos. Fonte: grupo PROT-AGE (Bauer e colaboradores, J Am Med Dir Assoc 2013): perda de peso em idosos leva junto
   mais massa muscular; recomenda mais proteína e exercício de força. O app não muda a meta sozinho: encaminha a conversa. */
function avisoIdade() {
  const m = metas(); if (!m || m.idade <= 65) return "";
  return '<div class="cartao"><h2>Depois dos 65 anos</h2><p style="margin:0">Nessa idade, quem perde peso costuma perder mais músculo junto. Vale combinar com o médico a meta de energia e a de proteína. O treino de força ajuda a manter o músculo.</p></div>';
}
/* onde: "plano" na tela Plano (acrescenta o cartão do fígado); sem valor na tela Perfil. */
function avisosDoPerfil(onde) {
  return avisoGestante() + avisoPesoBaixo() + avisoVesicula(onde === "plano" ? "plano" : "perfil") + avisoHipoglicemia("plano") + avisoIdade() + (onde === "plano" ? avisoFigado() : "");
}

/* ---------- vesícula e fígado ---------- */
/* Progresso da perda de peso até as marcas de 5%, 7% e 10% do peso inicial do Perfil (as marcas da diretriz de fígado, ver
   avisoFigado). Conta pura: recebe o peso inicial e o atual, devolve null se faltar um deles. Nada é gravado; muda a cada pesagem.
   perdaPct negativo = ganhou peso. alvoN = peso em kg que corresponde a perder N%. faltaN em kg, nunca negativo. */
const MARCAS_FIGADO = [5, 7, 10];
function progressoPerda(ini, atual) {
  if (!(ini > 0) || !(atual > 0)) return null;
  const g = { ini, atual, perdaPct: 100 * (ini - atual) / ini };
  MARCAS_FIGADO.forEach(n => { g["alvo" + n] = ini * (1 - n / 100); g["falta" + n] = Math.max(0, atual - g["alvo" + n]); g["chegou" + n] = g.perdaPct >= n - 1e-9; });
  return g;
}
/* Bloco de progresso até 10%, com as três marcas. No modo sem calorias e peso em destaque, só percentuais, sem quilos. */
function blocoProgressoPerda(m) {
  const g = progressoPerda(E.perfil.peso, m.peso); if (!g) return "";
  let t = '<div class="progresso-perda" data-progresso="figado">' + barra("Perda desde o início, até a marca de 10%", Math.max(0, g.perdaPct), 10, "%", 1, true);
  if (m.discreto) t += '<p class="sub" style="margin:4px 0 0">Marcas: ' + MARCAS_FIGADO.map(n => n + "%" + (g["chegou" + n] ? " (alcançada)" : "")).join(", ") + ".</p>";
  else t += '<p class="sub" style="margin:4px 0 0">Peso no início: ' + fmt(g.ini, 1) + " kg. " + MARCAS_FIGADO.map(n => "Peso dos " + n + "%: " + fmt(g["alvo" + n], 1) + " kg" +
    (g["chegou" + n] ? " (alcançado)" : ", faltam " + fmt(g["falta" + n], 1) + " kg")).join(". ") + ".</p>";
  return t + "</div>";
}
/* TEXTO DE SAÚDE: gordura no fígado (esteatose) marcada no Perfil. Cartão só na tela Plano.
   Fontes: diretriz EASL-EASD-EASO 2024 sobre MASLD, resumo executivo, Diabetologia 2024;67:2375-2392,
   https://pmc.ncbi.nlm.nih.gov/articles/PMC11519095/ : perda de 5% ou mais reduz a gordura do fígado, 7 a 10% melhora a inflamação,
   10% ou mais melhora a fibrose; evitar bebida açucarada; limitar ultraprocessados; desaconselhar álcool; mais de 150 min por semana
   de atividade moderada ou 75 de vigorosa. Diretriz brasileira SBEM/SBH/Abeso, Arch Endocrinol Metab 2023;67(6),
   doi 10.20945/2359-4292-2023-0123: mais de 7% de perda (rec. 22), sem quantidade segura de álcool estabelecida (rec. 34).
   Resumo em empresa/relatorios/pesquisa-vesicula-figado.md, seção 3 e regras R8, R9, R13, R15 e R16. As marcas de peso são calculadas
   a partir do peso inicial que ela preencheu no Perfil; nenhum peso fica no código. */
function avisoFigado() {
  const m = metas(); if (!m || !m.figado) return "";
  return '<div class="cartao" data-aviso="figado"><h2>Gordura no fígado</h2>' +
    '<p style="margin:0">O que mais reduz a gordura do fígado é perder peso: 5% do peso já reduz a gordura, de 7 a 10% melhora a inflamação e 10% ou mais melhora a fibrose.</p>' +
    '<p style="margin:6px 0 0">Também ajudam: cortar bebida açucarada (refrigerante, suco de caixinha, chá pronto) e ultraprocessados; não beber álcool, porque não há quantidade segura estabelecida para quem tem gordura no fígado; e atividade física, mais de 150 minutos por semana de atividade moderada, como caminhada rápida.</p>' +
    blocoProgressoPerda(m) + '<p class="sub" style="margin:6px 0 0">Exames e metas do fígado são combinados com o seu médico.</p></div>';
}
/* TEXTO DE SAÚDE: pedra na vesícula marcada no Perfil. Cartão fixo nas telas Hoje, Plano e Perfil.
   Fontes:
   - bula americana do Mounjaro (tirzepatida), seção 5.8, doença aguda da vesícula biliar (pedra, inflamação, retirada da vesícula
     nos estudos); https://pi.lilly.com/us/mounjaro-uspi.pdf
   - perder peso rápido aumenta o risco: bula do Zepbound (tirzepatida para obesidade), eventos de vesícula associados à redução de
     peso, https://pi.lilly.com/us/zepbound-uspi.pdf; Weinsier 1995 (ver LIMITE_RITMO em peso.js).
   - sinais da crise e quando procurar atendimento: os mesmos itens de "Sinais de alerta" do Guia (conteudo.js), propostos em
     empresa/relatorios/pesquisa-vesicula-figado.md, seção 6 (Manual MSD; NIDDK, "Symptoms & Causes of Gallstones",
     https://www.niddk.nih.gov/health-information/digestive-diseases/gallstones/symptoms-causes). O limite de "cerca de 6 horas"
     é escolha conservadora da equipe e PRECISA DE AVAL MÉDICO; a divisão 192 / pronto-socorro / médico também.
   - aguardando cirurgia: que a cirurgia depende de o fígado diminuir é informação do caso dela (briefing da onda 2); fígado grande e
     gorduroso atrapalha a videolaparoscopia (pesquisa-vesicula-figado.md, seção 3, "Ligação com a cirurgia"); as marcas de 5, 7 e 10%
     são da diretriz EASL-EASD-EASO 2024 (ver avisoFigado). Quem decide a data e o critério é o cirurgião.
   onde: "hoje", "plano" ou "perfil". No Plano, com fígado marcado, o progresso fica no cartão do fígado (não repete). */
function avisoVesicula(onde) {
  const m = metas(); if (!m || !m.vesicula) return "";
  let t = '<div class="cartao alerta" data-aviso="vesicula"><h2>Pedra na vesícula</h2>' +
    '<p style="margin:0">A bula da tirzepatida lista problemas de vesícula (pedra e inflamação) entre os efeitos do remédio, e perder peso rápido aumenta esse risco. O seu médico sabe que você tem pedra na vesícula? Confirme com ele antes de começar.</p>';
  /* Na tela Hoje o cartão fica curto: os sinais ficam num bloco que abre com um toque (os mesmos itens do Guia). */
  const sinais = '<p style="margin:6px 0 0"><strong>Crise de vesícula:</strong> dor forte no alto da barriga, do lado direito ou na boca do estômago, muitas vezes depois de comer.</p>' +
    '<p style="margin:6px 0 0"><strong>Pronto-socorro hoje</strong> se a dor não passar em cerca de 6 horas ou voltar várias vezes no mesmo dia, se vier com febre ou calafrio, ou se aparecer pele ou olhos amarelados, urina escura e fezes claras. Dor forte e contínua que vai para as costas também (pode ser pâncreas).</p>' +
    '<p style="margin:6px 0 0"><strong>Ligue 192</strong> se a dor vier com febre e pele amarela e houver confusão, desmaio ou muita fraqueza. <strong>Avise o médico</strong> nos próximos dias se teve uma crise que passou sozinha, sem febre e sem pele amarela.</p>';
  t += onde === "hoje" ? '<details style="margin-top:6px"><summary>Sinais de crise e o que fazer</summary>' + sinais + "</details>" : sinais;
  if (m.aguardaCirurgia) {
    t += '<p style="margin:6px 0 0" data-cirurgia>A sua cirurgia depende de o fígado diminuir. Perder de 7 a 10% do peso reduz a gordura e a inflamação do fígado; o app mostra o seu progresso até essas marcas. Quem decide a data é o cirurgião.</p>';
    if (!(onde === "plano" && m.figado)) t += blocoProgressoPerda(m);
  }
  if (onde === "hoje") t += '<div class="botoes"><button class="sec" data-ac="ir" data-para="guia">Ver todos os sinais de alerta</button></div>';
  return t + "</div>";
}
function avisoPesoBaixo() {
  const m = metas(); if (!m || !m.abaixoDoPeso) return "";
  return '<div class="cartao alerta"><h2>Peso abaixo da faixa de referência</h2><p style="margin:0">Pelo peso e pela altura registrados, você está abaixo da faixa de referência (IMC menor que 18,5). Fale com o seu médico sobre a dose e o peso. O app não calcula redução de calorias nesta faixa.</p></div>';
}

const SIM_NAO = [["", "Prefiro não responder"], ["sim", "Sim"], ["nao", "Não"]];
function simNao(nome, valor, extra) {
  const v = valor === true ? "sim" : valor === false ? "nao" : "";
  return '<select name="' + nome + '"' + (extra || "") + ">" + SIM_NAO.map(o => '<option value="' + o[0] + '"' + (o[0] === v ? " selected" : "") + ">" + o[1] + "</option>").join("") + "</select>";
}
const deSimNao = v => (v === "sim" ? true : v === "nao" ? false : null);
function resumoNaoGosta() {
  const l = ((E.perfil && E.perfil.naoGosta) || []).filter(k => A[k]);
  return l.length ? l.map(k => A[k].nome).join(", ") + "." : "Nenhum alimento marcado.";
}

function telaPerfil() {
  if (!E.perfil && !E.ui.entradaVista) return telaEntrada();
  const p = E.perfil || {}, m = metas();
  const v = k => (p[k] == null ? "" : esc(p[k]));
  const at = [[1.2, "Sedentária (trabalho sentada, sem exercício)"], [1.375, "Leve (caminhadas, 1 a 3 treinos por semana)"], [1.55, "Moderada (3 a 5 treinos por semana)"]];
  const naoCome = p.naoCome || [], saude = ["gestante", "diabetes", "pilula", "vesicula", "figado"], respondidas = saude.filter(k => p[k] === true || p[k] === false).length;
  let out = "";
  if (!E.perfil) out += '<div class="cartao destaque"><h2>Bem-vinda</h2><p style="margin:0">Preencha os dados abaixo para o app calcular as suas metas de proteína, energia, água, vitaminas e minerais. Seus registros ficam neste celular e não são enviados pelo app. Se a cópia de segurança do Google estiver ligada no aparelho, o Android pode incluí-los na cópia da sua conta.</p></div>';
  else out += avisosDoPerfil();
  out += '<form class="cartao" data-form="perfil"><h2>Dados</h2><label>Nome (opcional)<input name="nome" value="' + v("nome") + '" maxlength="40"></label>' +
    '<div class="duas"><label>Sexo<select name="sexo"><option value="F"' + (p.sexo !== "M" ? " selected" : "") + '>Feminino</option><option value="M"' + (p.sexo === "M" ? " selected" : "") + ">Masculino</option></select></label>" +
    '<label>Ano de nascimento<input name="nascimento" inputmode="numeric" value="' + v("nascimento") + '" required></label></div>' +
    '<div class="duas"><label>Altura (cm)<input name="altura" inputmode="decimal" value="' + v("altura") + '" required></label><label>Peso inicial (kg)<input name="peso" inputmode="decimal" value="' + v("peso") + '" required></label></div>' +
    '<label>Atividade física hoje<select name="atividade">' + at.map(a => '<option value="' + a[0] + '"' + ((p.atividade || 1.2) === a[0] ? " selected" : "") + ">" + a[1] + "</option>").join("") + "</select></label>" +
    '<div class="blocos">' +
    '<details><summary><span>Saúde <span class="sub">(opcional' + (respondidas ? " · " + respondidas + " de " + saude.length + " respondidas" : "") + ")</span></span></summary>" +
    '<p class="sub" style="margin:4px 0 0">Serve para o app mostrar os avisos que valem para você.</p>' +
    "<label>Está grávida ou amamentando?" + simNao("gestante", p.gestante) + "</label>" +
    "<label>Tem diabetes?" + simNao("diabetes", p.diabetes, ' data-mud="perfilDiabetes"') + "</label>" +
    '<label id="p-insulina"' + (p.diabetes === true ? "" : " hidden") + ">Usa insulina ou sulfonilureia (glibenclamida, gliclazida, glimepirida)?" + simNao("insulinaSulf", p.insulinaSulf) + "</label>" +
    "<label>Usa pílula anticoncepcional?" + simNao("pilula", p.pilula) + "</label>" +
    "<label>Tem pedra na vesícula?" + simNao("vesicula", p.vesicula, ' data-mud="perfilVesicula"') + "</label>" +
    '<label id="p-cirurgia"' + (p.vesicula === true ? "" : " hidden") + ">Está aguardando cirurgia da vesícula?" + simNao("aguardaCirurgia", p.aguardaCirurgia) + "</label>" +
    "<label>Tem gordura no fígado (esteatose)?" + simNao("figado", p.figado) + "</label></details>" +
    '<details><summary><span>O que você não come <span class="sub">(opcional' + (naoCome.length ? " · " + naoCome.length + (naoCome.length === 1 ? " marcado" : " marcados") : "") + ")</span></span></summary>" +
    '<p class="sub" style="margin:4px 0 0">Serve para o app trocar os alimentos do cardápio. Marque o que você não come:</p><div class="marcas coluna">' +
    RESTRICOES.map(r => '<label><input type="checkbox" name="nc_' + r.id + '"' + (naoCome.indexOf(r.id) >= 0 ? " checked" : "") + ">" + esc(r.rotulo) + "</label>").join("") + "</div>" +
    (E.perfil ? "" : '<p class="sub" style="margin:4px 0 0">Depois de salvar, o Perfil deixa marcar também alimentos avulsos de que você não gosta.</p>') + "</details>" +
    '<details><summary><span>Metas passadas pelo médico ou nutricionista <span class="sub">(opcional)</span></span></summary><p class="sub" style="margin:4px 0 0">Se preencher, elas substituem o cálculo do app.</p>' +
    '<div class="tres"><label>Energia (kcal)<input name="metaKcal" inputmode="numeric" value="' + v("metaKcal") + '"></label><label>Proteína (g)<input name="metaProt" inputmode="numeric" value="' + v("metaProt") + '"></label><label>Água (ml)<input name="metaAgua" inputmode="numeric" value="' + v("metaAgua") + '"></label></div></details>' +
    "</div>" +
    '<div class="marcas"><label><input type="checkbox" name="discreto"' + (p.discreto === true ? " checked" : "") + ">Não mostrar calorias nem peso em destaque</label></div>" +
    '<p class="sub" style="margin:0">Proteína, água, vitaminas e minerais continuam aparecendo.</p>' +
    '<div class="botoes"><button>Salvar</button></div></form>';
  if (E.perfil) out += '<div class="cartao"><h2>Alimentos de que você não gosta</h2><p class="sub" style="margin:0">Serve para o app trocar esses alimentos no cardápio.</p>' +
    '<p id="resumo-nao-gosta" style="margin:8px 0 0">' + esc(resumoNaoGosta()) + '</p><div class="botoes"><button class="sec" data-ac="abrirNaoGosta">Escolher alimentos</button></div></div>';
  if (m) {
    const d = m.discreto;
    out += '<div class="cartao"><h2>Como as metas são calculadas</h2><ul class="lista">' +
      (d ? "" : "<li>Peso atual " + fmt(m.peso, 1) + " kg, IMC " + fmt(m.imc, 1) + ", " + m.idade + " anos.</li>" +
      "<li>Gasto em repouso (fórmula de Mifflin-St Jeor): " + fmt(m.tmb) + " kcal. Gasto diário estimado: " + fmt(m.gasto) + " kcal.</li>" +
      "<li>Energia: " + (m.gestante ? "com gravidez ou amamentação marcada, o app não calcula redução: usa o gasto diário estimado"
        : m.semDeficit ? "com IMC abaixo de 25 o app não calcula redução: usa o gasto diário estimado"
        : "gasto diário menos 500 kcal") + ", nunca abaixo de " + fmt(m.piso) + " kcal. Cálculo do app: " + fmt(m.kcalCalc) + " kcal." + (E.perfil.metaKcal ? " Em uso: " + fmt(m.kcal) + " kcal (informada)." : "") + "</li>" +
      "<li>Nenhum dia do cardápio é planejado abaixo de " + fmt(m.pisoDia) + " kcal, fora o dia de enjoo.</li>") +
      "<li>Proteína: 1,2 a 1,6 g por kg" + (m.imc > 25 ? " de peso ajustado (" + (d ? "" : fmt(m.pesoRef, 1) + " kg: ") + "o peso no IMC 25 mais um quarto do que passa dele, porque acima do IMC 25 o peso real superestima a necessidade)" : "") + ", ou " + m.protMin + " a " + m.protMax + " g. Cálculo do app: " + m.protCalc + " g." + (E.perfil.metaProt ? " Em uso: " + m.prot + " g (informada)." : "") + "</li>" +
      (d ? "" : "<li>Gordura: 30% da energia. Carboidrato: o restante.</li>") + "<li>Fibra, vitaminas e minerais: valores de referência (DRIs) para o sexo e a idade.</li></ul>" +
      '<p class="sub">As metas se atualizam sozinhas a cada peso registrado. São estimativas de população; o médico ou o nutricionista podem definir outras.' + (d ? " Os números de energia e de peso estão escondidos porque você marcou essa opção acima." : "") + "</p></div>";
  }
  if (E.perfil) out += cartaoLembretes();
  return out;
}

/* Folha com todos os alimentos da base, por grupo, com busca por nome. Cada caixa grava na hora em perfil.naoGosta. */
function semAcento(s) { return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
function folhaNaoGosta() {
  const marcados = E.perfil.naoGosta || [], grupos = [];
  Object.keys(A).forEach(k => { if (grupos.indexOf(A[k].grupo) < 0) grupos.push(A[k].grupo); });
  return '<p class="sub" style="margin:8px 0 0">Marque o que você não quer no cardápio. O app troca por outro alimento do mesmo grupo.</p>' +
    '<label>Buscar pelo nome<input id="busca-nao-gosta" oninput="filtrarNaoGosta(this.value)" autocomplete="off"></label>' +
    grupos.map(g => '<div class="grupo-marcas"><h3>' + esc(GRUPOS[g] || g) + '</h3><div class="marcas coluna">' +
      Object.keys(A).filter(k => A[k].grupo === g).map(k => '<label data-nome="' + esc(semAcento(A[k].nome)) + '"><input type="checkbox" data-mud="naoGosta" data-k="' + esc(k) + '"' + (marcados.indexOf(k) >= 0 ? " checked" : "") + ">" + esc(A[k].nome) + "</label>").join("") +
      "</div></div>").join("") +
    '<div class="botoes"><button data-ac="fecharNaoGosta">Pronto</button></div>';
}
function filtrarNaoGosta(v) {
  const q = semAcento(v).trim();
  document.querySelectorAll("#folha .grupo-marcas").forEach(g => {
    let algum = false;
    g.querySelectorAll("label").forEach(l => { const mostra = !q || l.dataset.nome.indexOf(q) >= 0; l.hidden = !mostra; if (mostra) algum = true; });
    g.hidden = !algum;
  });
}

Object.assign(AC, {
  entradaContinuar() { E.ui.entradaVista = true; salvar(); render(true); },
  abrirNaoGosta() { abrirFolha("Alimentos de que você não gosta", folhaNaoGosta()); },
  /* Não redesenha a tela: só o resumo muda (em MUD.naoGosta), para não apagar o que estiver digitado no formulário. */
  fecharNaoGosta() { fecharFolha(); },
});
MUD.perfilVesicula = function (c) { const el = document.getElementById("p-cirurgia"); if (el) el.hidden = c.value !== "sim"; };
MUD.perfilDiabetes = function (c) { const el = document.getElementById("p-insulina"); if (el) el.hidden = c.value !== "sim"; };
MUD.naoGosta = function (c) {
  if (!E.perfil) return;
  const l = (E.perfil.naoGosta || []).filter(k => k !== c.dataset.k);
  if (c.checked) l.push(c.dataset.k);
  E.perfil.naoGosta = l; salvar();
  const el = document.getElementById("resumo-nao-gosta"); if (el) el.textContent = resumoNaoGosta();
};

FORM.perfil = function (f) {
    const nasc = num(f.nascimento), alt = num(f.altura), peso = num(f.peso), ano = new Date().getFullYear();
    if (!nasc || nasc !== Math.round(nasc) || nasc < ano - 100 || nasc > ano) return aviso("Confira o ano de nascimento (4 dígitos, por exemplo 1985).");
    if (nasc > ano - 18) return aviso("Este app é para quem tem 18 anos ou mais. Confira o ano de nascimento.");
    if (!alt || alt < 120 || alt > 220) return aviso("Altura em centímetros, por exemplo 165.");
    if (!peso || peso < 35 || peso > 300) return aviso("Confira o peso em kg (entre 35 e 300).");
    const txt = k => String(f[k] == null ? "" : f[k]).trim(), kcal = num(f.metaKcal), prot = num(f.metaProt), agua = num(f.metaAgua);
    if ((txt("metaKcal") && kcal == null) || (kcal != null && (kcal < 800 || kcal > 4000))) return aviso("Meta de energia fora do intervalo esperado (800 a 4000 kcal).");
    if ((txt("metaProt") && prot == null) || (prot != null && (prot < 30 || prot > 250))) return aviso("Meta de proteína fora do intervalo esperado (30 a 250 g).");
    if ((txt("metaAgua") && agua == null) || (agua != null && (agua < 500 || agua > 6000))) return aviso("Meta de água em ml (entre 500 e 6000), por exemplo 2000.");
    const primeiro = !E.perfil, antes = E.perfil || {}, masc = f.sexo === "M", diabetes = deSimNao(f.diabetes), vesicula = deSimNao(f.vesicula);
    /* Caixa de marcar desmarcada não chega no formulário: a lista é refeita pelas que chegaram. Id que esta versão não conhece é mantido. */
    const naoCome = RESTRICOES.filter(r => f["nc_" + r.id]).map(r => r.id).concat((antes.naoCome || []).filter(id => !RESTRICOES.some(r => r.id === id)));
    const gravar = () => {
      E.perfil = Object.assign({}, PERFIL_NOVO, { gestante: null, discreto: false }, antes, {
        nome: (f.nome || "").trim(), sexo: masc ? "M" : "F", nascimento: nasc, altura: alt, peso: peso, atividade: num(f.atividade) || 1.2,
        metaKcal: kcal || null, metaProt: prot || null, metaAgua: agua || null,
        gestante: masc ? null : deSimNao(f.gestante), diabetes: diabetes, insulinaSulf: diabetes === true ? deSimNao(f.insulinaSulf) : null, pilula: deSimNao(f.pilula),
        vesicula: vesicula, aguardaCirurgia: vesicula === true ? deSimNao(f.aguardaCirurgia) : null, figado: deSimNao(f.figado),
        naoCome: naoCome, discreto: !!f.discreto });
      salvar(); aviso("Perfil salvo.");
      if (primeiro) { irPara("hoje"); render(true); } else render();
    };
    /* Auditoria 1, achado 2: meta de energia abaixo do piso do app (1.200 kcal; 1.800 para homens) é aceita, mas só depois de ela
       confirmar que veio do médico ou da nutricionista. Com a confirmação, o app segue a meta (a decisão clínica é deles). */
    const pisoMeta = masc ? 1800 : 1200;
    if (kcal && kcal < pisoMeta && kcal !== antes.metaKcal)
      return confirmar("A meta de energia informada é de " + fmt(kcal) + " kcal, abaixo de " + fmt(pisoMeta) + " kcal, que é o mínimo que o app usa por conta própria. O app segue essa meta se ela foi passada pelo médico ou pela nutricionista. Foi?", gravar, "Sim, foi passada");
    gravar();
};
