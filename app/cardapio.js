// Cardapio base de 7 dias. Cada item: [chave do alimento, gramas na porcao base, nome na lista (opcional)].
// O nome opcional so troca o texto da lista quando o preparo da receita muda o nome do alimento (o ovo vem como
// "Ovo cozido" de alimentos.js, mas na omelete e nos ovos mexidos nao e cozido). A conta usa sempre a chave.
// As porcoes sao multiplicadas pelo fator do perfil (ver metas em app.js).
window.CARDAPIO = {
 dias: [
  { nome: "Segunda", refeicoes: [
   { tipo: "Café da manhã", titulo: "Ovos mexidos, pão integral e mamão", preparo: "Mexa os ovos em frigideira antiaderente com 1 colher de chá de azeite. Comece pelos ovos.", itens: [["ovo",100,"Ovo mexido"],["pao_integral",25],["mamao",100],["azeite",3]] },
   { tipo: "Lanche da manhã", titulo: "Iogurte desnatado com aveia e linhaça", preparo: "Misture tudo no pote. A linhaça triturada é melhor aproveitada que a inteira.", itens: [["iogurte_desn",170],["aveia",20],["linhaca",10]] },
   { tipo: "Almoço", titulo: "Frango grelhado, arroz, feijão e brócolis", preparo: "Coma primeiro o frango, depois os vegetais, por último arroz e feijão. Azeite cru por cima.", itens: [["frango_peito",120],["arroz_integral",75],["feijao_carioca",80],["brocolis",100],["tomate",80],["azeite",8]] },
   { tipo: "Lanche da tarde", titulo: "Pão integral com queijo minas e laranja", preparo: "A laranja inteira (com o bagaço) tem mais fibra que o suco.", itens: [["pao_integral",25],["queijo_minas",30],["laranja",130]] },
   { tipo: "Jantar", titulo: "Sardinha com batata-doce e couve", preparo: "Sardinha em lata drenada, com as espinhas (fonte de cálcio). Couve refogada rápida no alho.", itens: [["sardinha",84],["batata_doce",80],["couve",40],["cenoura_crua",60]] },
  ]},
  { nome: "Terça", refeicoes: [
   { tipo: "Café da manhã", titulo: "Iogurte com banana, aveia, linhaça e castanha", preparo: "Banana amassada ou em rodelas. Uma castanha-do-pará por dia basta.", itens: [["iogurte",170],["banana",70],["aveia",20],["linhaca",10],["castanha_brasil",4]] },
   { tipo: "Lanche da manhã", titulo: "Ovos cozidos", preparo: "Cozinhe vários de uma vez; duram 5 dias na geladeira com casca.", itens: [["ovo",100]] },
   { tipo: "Almoço", titulo: "Patinho grelhado, arroz integral, feijão-preto, couve e beterraba", preparo: "Carne primeiro. A couve refogada já leva óleo: só 1 colher de chá de azeite na salada. A laranja ou o limão na refeição ajudam a absorver o ferro do feijão.", itens: [["carne_patinho",100],["arroz_integral",75],["feijao_preto",80],["couve",40],["beterraba",60],["azeite",3]] },
   { tipo: "Lanche da tarde", titulo: "Vitamina de morango com aveia e leite em pó", preparo: "Bata o leite desnatado, o leite em pó desnatado, a aveia e os morangos. O leite em pó aumenta proteína e cálcio sem aumentar o volume.", itens: [["leite_desn",200],["leite_po_desn",20],["aveia",10],["morango",120]] },
   { tipo: "Jantar", titulo: "Frango desfiado com abóbora, espinafre e arroz integral", preparo: "Abóbora cozida amassada ou em cubos, espinafre refogado, frango desfiado por cima. O espinafre refogado já tem óleo: só um fio de azeite.", itens: [["frango_peito",100],["abobora",120],["espinafre",50],["tomate",80],["arroz_integral",50],["azeite",6]] },
  ]},
  { nome: "Quarta", refeicoes: [
   { tipo: "Café da manhã", titulo: "Cuscuz com ovos e ricota", preparo: "Cuscuz no vapor, ovos mexidos ou cozidos, ricota por cima.", itens: [["cuscuz",80],["ovo",100,"Ovo mexido ou cozido"],["ricota",30]] },
   { tipo: "Lanche da manhã", titulo: "Goiaba e queijo minas", preparo: "Goiaba com casca, bem lavada. Meia goiaba cobre a vitamina C do dia.", itens: [["goiaba",85],["queijo_minas",30]] },
   { tipo: "Almoço", titulo: "Tilápia grelhada, batata, brócolis e salada", preparo: "Peixe grelhado ou assado com limão. Batata cozida, sem fritura.", itens: [["tilapia",130],["batata",160],["brocolis",75],["cenoura_coz",50],["alface",30],["azeite",8]] },
   { tipo: "Lanche da tarde", titulo: "Iogurte desnatado com mamão, aveia e linhaça", preparo: "Misture o leite em pó no iogurte. Mamão e linhaça ajudam o intestino, que tende a ficar preso.", itens: [["iogurte_desn",170],["leite_po_desn",10],["mamao",100],["aveia",15],["linhaca",10]] },
   { tipo: "Jantar", titulo: "Lentilha com carne moída, abobrinha e cenoura", preparo: "Refogue a carne moída em 1 colher de chá de azeite, junte a lentilha cozida e a abobrinha em cubos. Cenoura crua ralada à parte.", itens: [["lentilha",120],["carne_moida",80],["abobrinha",90],["cenoura_crua",36],["arroz_integral",75],["azeite",3]] },
  ]},
  { nome: "Quinta", refeicoes: [
   { tipo: "Café da manhã", titulo: "Pão integral com ricota e tomate, laranja", preparo: "Ricota amassada com sal, orégano e 1 colher de chá de azeite.", itens: [["pao_integral",50],["ricota",70],["tomate",40],["laranja",130],["azeite",5]] },
   { tipo: "Lanche da manhã", titulo: "Mingau frio de aveia com banana", preparo: "Leite desnatado com o leite em pó, aveia e banana amassada. Pode ser batido como vitamina.", itens: [["leite_desn",200],["leite_po_desn",10],["aveia",15],["banana",70]] },
   { tipo: "Almoço", titulo: "Sobrecoxa assada, arroz, feijão e brócolis", preparo: "Sobrecoxa sem pele, assada. Brócolis no vapor. Cenoura crua ralada com limão.", itens: [["frango_sobrecoxa",100],["arroz_integral",75],["feijao_carioca",80],["brocolis",75],["cenoura_crua",36]] },
   { tipo: "Lanche da tarde", titulo: "Ovos cozidos e kiwi", preparo: "", itens: [["ovo",100],["kiwi",75]] },
   { tipo: "Jantar", titulo: "Salada de atum com grão-de-bico e batata-doce", preparo: "Atum em água, drenado; grão-de-bico cozido, rúcula e tomate. Tempere com limão e pouco azeite.", itens: [["atum",90],["grao_bico",60],["batata_doce",40],["rucula",30],["tomate",80],["azeite",6]] },
  ]},
  { nome: "Sexta", refeicoes: [
   { tipo: "Café da manhã", titulo: "Omelete de espinafre com pão integral, mamão", preparo: "Dois ovos batidos com espinafre refogado, em frigideira antiaderente.", itens: [["ovo",100,"Ovo batido, para a omelete"],["espinafre",40],["pao_integral",25],["mamao",100]] },
   { tipo: "Lanche da manhã", titulo: "Iogurte desnatado com morango e linhaça", preparo: "", itens: [["iogurte_desn",170],["leite_po_desn",10],["morango",100],["linhaca",10]] },
   { tipo: "Almoço", titulo: "Músculo cozido com mandioca e legumes", preparo: "Cozido de panela de pressão: músculo, chuchu e cenoura. Feijão-preto à parte. Um fio de azeite no prato.", itens: [["carne_musculo",110],["mandioca",80],["chuchu",80],["cenoura_coz",50],["feijao_preto",80],["azeite",6]] },
   { tipo: "Lanche da tarde", titulo: "Pão integral com queijo minas e goiaba", preparo: "Goiaba com casca, bem lavada.", itens: [["pao_integral",25],["queijo_minas",30],["goiaba",85]] },
   { tipo: "Jantar", titulo: "Salmão grelhado, arroz integral, brócolis e couve-flor", preparo: "Salmão grelhado só com sal e limão, sem azeite: ele já tem a gordura da refeição. É uma das poucas fontes de vitamina D na comida.", itens: [["salmao",90],["arroz_integral",50],["brocolis",75],["couve_flor",60]] },
  ]},
  { nome: "Sábado", refeicoes: [
   { tipo: "Café da manhã", titulo: "Iogurte com aveia, banana e gergelim", preparo: "", itens: [["iogurte",170],["aveia",15],["banana",70],["gergelim",8]] },
   { tipo: "Lanche da manhã", titulo: "Ovo cozido e maçã", preparo: "", itens: [["ovo",50],["maca",110]] },
   { tipo: "Almoço", titulo: "Lombo assado, arroz, lentilha, repolho e beterraba", preparo: "Lombo assado em fatias. Salada de repolho cru com limão.", itens: [["porco_lombo",100],["arroz_integral",75],["lentilha",80],["repolho",50],["beterraba",60],["azeite",6]] },
   { tipo: "Lanche da tarde", titulo: "Vitamina de abacate com aveia e leite em pó", preparo: "Bata o leite desnatado, o leite em pó desnatado, a aveia e o abacate. Sem açúcar, ou com adoçante.", itens: [["leite_desn",200],["leite_po_desn",20],["aveia",15],["abacate",45]] },
   { tipo: "Jantar", titulo: "Frango grelhado com abóbora, feijão e couve", preparo: "Um fio de azeite no prato.", itens: [["frango_peito",110],["abobora",120],["feijao_carioca",80],["couve",40],["tomate",80],["azeite",6]] },
  ]},
  { nome: "Domingo", refeicoes: [
   { tipo: "Café da manhã", titulo: "Pão francês com ovos mexidos, melão", preparo: "Ovos mexidos dentro do pão, em frigideira antiaderente com 1 colher de chá de azeite.", itens: [["pao_frances",50],["ovo",100,"Ovo mexido"],["melao",90],["azeite",3]] },
   { tipo: "Lanche da manhã", titulo: "Goiaba, castanha-do-pará e leite", preparo: "", itens: [["goiaba",85],["castanha_brasil",4],["leite_desn",200],["leite_po_desn",10]] },
   { tipo: "Almoço", titulo: "Merluza assada, batata, feijão e salada", preparo: "Merluza assada com tomate e cebola. Rúcula e tomate com azeite.", itens: [["merluza",130],["batata",120],["feijao_carioca",80],["rucula",30],["tomate",80],["azeite",10]] },
   { tipo: "Lanche da tarde", titulo: "Iogurte com manga, aveia e linhaça", preparo: "", itens: [["iogurte",170],["manga",60],["aveia",15],["linhaca",10]] },
   { tipo: "Jantar", titulo: "Sopa de frango com legumes e grão-de-bico", preparo: "Frango desfiado, abobrinha, cenoura, chuchu e grão-de-bico no caldo caseiro. Um fio de azeite no prato.", itens: [["frango_peito",100],["abobrinha",90],["cenoura_coz",50],["chuchu",60],["grao_bico",60],["azeite",5]] },
  ]},
 ],
 nausea: { nome: "Dia de enjoo", refeicoes: [
   { tipo: "Café da manhã", titulo: "Pão francês com queijo minas", preparo: "Comida seca e fria costuma descer melhor. Coma devagar, pare ao primeiro sinal de estômago cheio.", itens: [["pao_frances",50],["queijo_minas",40]] },
   { tipo: "Lanche da manhã", titulo: "Iogurte desnatado com banana", preparo: "Gelado, em colheradas pequenas.", itens: [["iogurte_desn",170],["banana",70]] },
   { tipo: "Almoço", titulo: "Canja: frango, arroz, cenoura e chuchu", preparo: "Bem cozida, pouca gordura, sem temperos fortes. Se não couber tudo, priorize o frango.", itens: [["frango_peito",100],["arroz_branco",100],["cenoura_coz",50],["chuchu",60]] },
   { tipo: "Lanche da tarde", titulo: "Maçã e água de coco", preparo: "Água de coco em goles pequenos ao longo da tarde.", itens: [["maca",110],["agua_coco",200]] },
   { tipo: "Jantar", titulo: "Ovos mexidos com purê de batata e abobrinha", preparo: "Purê só com a batata e um pouco de leite, sem manteiga.", itens: [["ovo",100,"Ovo mexido"],["batata",120],["abobrinha",60]] },
 ]},
};

/* Regras do cardápio para quem tem pedra na vesícula (colelitíase) e gordura no fígado (esteatose). Um lugar só: a escala das
   porções (app/nutricao.js) e a conferência automática (dados/conferir_cardapio.js e testes/unidade/regras-cardapio.js) leem daqui.
   Base: empresa/relatorios/pesquisa-vesicula-figado.md, item 5 (R3 a R12). Força da evidência, como no relatório:
   F = diretriz com recomendação forte ou meta-análise consistente; M = estudos pequenos ou extrapolados; P = prática ou proposta
   da equipe, sem número com evidência. aval: o número precisa do médico ou nutricionista dela antes de virar texto definitivo.
   Os números valem para o cardápio planejado; o que ela come de fato fica no diário. */
window.REGRAS_CARDAPIO = {
  principais: ["Café da manhã", "Almoço", "Jantar"],
  gordMinPrincipal: { valor: 7, forca: "M", aval: true, regra: "R3", fonte: "Gebhard 1996 (Hepatology 24:544): refeição com 10 g de gordura esvaziou a vesícula ao máximo; Festi 1998 (Int J Obes 22:592); Stokes 2014 (meta-análise)" },
  gordMinUmaRefeicao: { valor: 10, forca: "M", aval: true, regra: "R3", fonte: "Gebhard 1996: 10 g numa refeição esvazia a vesícula ao máximo" },
  gordMinDia: { valor: 30, forca: "M", aval: true, regra: "R3", fonte: "Gebhard 1996 (30 g/dia: 0 de 7 com pedra; menos de 2 g/dia: 4 de 6); Festi 1998" },
  gordAlvoRefeicao: { valor: 15, forca: "P", aval: true, regra: "R4", fonte: "Proposta da equipe: refeição pesada pode disparar cólica (Manual MSD); tirzepatida atrasa o esvaziamento do estômago (bula)" },
  gordTetoRefeicao: { valor: 20, forca: "P", aval: true, regra: "R4", fonte: "Proposta da equipe, mesmo motivo do alvo; não há estudo com teto por refeição" },
  azeiteMaxRefeicao: { valor: 10, forca: "P", aval: true, regra: "R4", fonte: "Proposta da equipe: até 1 colher de sopa (8 a 10 g) de azeite ou óleo por refeição" },
  pctGordDia: { min: 25, max: 35, forca: "P", aval: true, regra: "R4", fonte: "Faixa de 20 a 35% da energia (DRIs, IOM 2005), estreitada para 25% embaixo por causa da vesícula" },
  kcalMaxRefeicao: { valor: 500, forca: "P", aval: true, regra: "R5", fonte: "Proposta da equipe: refeição grande dispara cólica (Manual MSD); apetite baixo com o remédio" },
  fibraMinDia: { valor: 25, forca: "M", aval: false, regra: "R12", fonte: "Resumo AASLD 2023 (dieta rica em fibra); NIDDK (vesícula); DRIs (25 g para mulher até 50 anos)" },
  peixeMinSemana: { valor: 2, forca: "F", aval: false, regra: "R11", fonte: "EASL-EASD-EASO 2024 (padrão mediterrâneo, recomendação forte)" },
  semFritura: { forca: "P", aval: false, regra: "R6", fonte: "NIDDK (evitar frituras e gorduras de sobremesa); prática" },
  semAcucarAdicionado: { forca: "F", aval: false, regra: "R8", fonte: "EASL-EASD-EASO 2024 (evitar bebida açucarada, forte); Diretriz brasileira SBEM/SBH/Abeso 2023 rec. 31; OMS 2015" },
  /* Dia de enjoo (caminho E): leve de propósito, mas sem deixar a vesícula parada. */
  enjooGordUmaRefeicao: { valor: 9, forca: "M", aval: true, regra: "R3", fonte: "Gebhard 1996: cerca de 10 g numa refeição" },
  enjooGordMinDia: { valor: 15, forca: "M", aval: true, regra: "R3", fonte: "Relatório, R3: dia de enjoo com pelo menos 15 a 20 g de gordura" },
  /* Alimentos que são gordura de adição (azeite e óleo): contam para azeiteMaxRefeicao. */
  gordurasDeAdicao: ["azeite", "oleo_girassol"],
};
