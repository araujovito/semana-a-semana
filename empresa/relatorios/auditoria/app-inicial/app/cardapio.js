// Cardapio base de 7 dias. Cada item: [chave do alimento, gramas na porcao base].
// As porcoes sao multiplicadas pelo fator do perfil (ver metas em app.js).
window.CARDAPIO = {
 dias: [
  { nome: "Segunda", refeicoes: [
   { tipo: "Café da manhã", titulo: "Ovos mexidos, pão integral e mamão", preparo: "Mexa os ovos em frigideira antiaderente, sem óleo ou com um fio de azeite. Comece pelos ovos.", itens: [["ovo",100],["pao_integral",25],["mamao",100]] },
   { tipo: "Lanche da manhã", titulo: "Iogurte com aveia e linhaça", preparo: "Misture tudo no pote. A linhaça triturada é melhor aproveitada que a inteira.", itens: [["iogurte",170],["aveia",15],["linhaca",10]] },
   { tipo: "Almoço", titulo: "Frango grelhado, arroz, feijão e brócolis", preparo: "Coma primeiro o frango, depois os vegetais, por último arroz e feijão. Azeite cru por cima.", itens: [["frango_peito",120],["arroz_integral",75],["feijao_carioca",80],["brocolis",75],["tomate",80],["azeite",8]] },
   { tipo: "Lanche da tarde", titulo: "Queijo minas e laranja", preparo: "A laranja inteira (com o bagaço) tem mais fibra que o suco.", itens: [["queijo_minas",60],["laranja",130]] },
   { tipo: "Jantar", titulo: "Sardinha com batata-doce e couve", preparo: "Sardinha em lata drenada, com as espinhas (fonte de cálcio). Couve refogada rápida no alho.", itens: [["sardinha",84],["batata_doce",80],["couve",60],["cenoura_crua",36]] },
  ]},
  { nome: "Terça", refeicoes: [
   { tipo: "Café da manhã", titulo: "Iogurte com banana, aveia e castanha", preparo: "Banana amassada ou em rodelas. Uma castanha-do-pará por dia basta.", itens: [["iogurte",170],["banana",70],["aveia",15],["castanha_brasil",4]] },
   { tipo: "Lanche da manhã", titulo: "Ovos cozidos", preparo: "Cozinhe vários de uma vez; duram 5 dias na geladeira com casca.", itens: [["ovo",100]] },
   { tipo: "Almoço", titulo: "Patinho grelhado, arroz, feijão-preto, couve e beterraba", preparo: "Carne primeiro. A laranja ou o limão na refeição ajudam a absorver o ferro do feijão.", itens: [["carne_patinho",100],["arroz_branco",75],["feijao_preto",80],["couve",40],["beterraba",60],["azeite",4]] },
   { tipo: "Lanche da tarde", titulo: "Vitamina de morango com leite em pó", preparo: "Bata o leite, o leite em pó desnatado e os morangos. O leite em pó aumenta proteína e cálcio sem aumentar o volume.", itens: [["leite",200],["leite_po_desn",20],["morango",120]] },
   { tipo: "Jantar", titulo: "Frango desfiado com abóbora e espinafre", preparo: "Abóbora cozida amassada ou em cubos, espinafre refogado, frango desfiado por cima.", itens: [["frango_peito",100],["abobora",120],["espinafre",50],["tomate",80],["azeite",8]] },
  ]},
  { nome: "Quarta", refeicoes: [
   { tipo: "Café da manhã", titulo: "Cuscuz com ovos e queijo", preparo: "Cuscuz no vapor, ovos mexidos ou cozidos, queijo por cima.", itens: [["cuscuz",80],["ovo",100],["queijo_minas",30]] },
   { tipo: "Lanche da manhã", titulo: "Goiaba e queijo minas", preparo: "Goiaba com casca, bem lavada. Meia goiaba cobre a vitamina C do dia.", itens: [["goiaba",85],["queijo_minas",30]] },
   { tipo: "Almoço", titulo: "Tilápia grelhada, batata, brócolis e salada", preparo: "Peixe grelhado ou assado com limão. Batata cozida, sem fritura.", itens: [["tilapia",130],["batata",120],["brocolis",75],["cenoura_coz",50],["alface",30],["azeite",8]] },
   { tipo: "Lanche da tarde", titulo: "Iogurte com mamão e linhaça", preparo: "Mamão e linhaça ajudam o intestino, que tende a ficar preso.", itens: [["iogurte",170],["mamao",100],["linhaca",10]] },
   { tipo: "Jantar", titulo: "Lentilha com carne moída e abobrinha", preparo: "Refogue a carne moída, junte a lentilha cozida e a abobrinha em cubos.", itens: [["lentilha",120],["carne_moida",80],["abobrinha",90],["arroz_integral",50]] },
  ]},
  { nome: "Quinta", refeicoes: [
   { tipo: "Café da manhã", titulo: "Pão integral com ricota e tomate, laranja", preparo: "Ricota amassada com sal, orégano e um fio de azeite.", itens: [["pao_integral",50],["ricota",70],["tomate",40],["laranja",130]] },
   { tipo: "Lanche da manhã", titulo: "Mingau frio de aveia com banana", preparo: "Leite, aveia e banana amassada. Pode ser batido como vitamina.", itens: [["leite",200],["aveia",15],["banana",70]] },
   { tipo: "Almoço", titulo: "Sobrecoxa assada, arroz, feijão e couve", preparo: "Sobrecoxa sem pele, assada. Cenoura crua ralada com limão.", itens: [["frango_sobrecoxa",100],["arroz_integral",75],["feijao_carioca",80],["couve",40],["cenoura_crua",36]] },
   { tipo: "Lanche da tarde", titulo: "Ovos cozidos e kiwi", preparo: "", itens: [["ovo",100],["kiwi",75]] },
   { tipo: "Jantar", titulo: "Salada de atum com grão-de-bico e batata-doce", preparo: "Atum drenado, grão-de-bico cozido, rúcula e tomate. Tempere com limão e azeite.", itens: [["atum",90],["grao_bico",60],["batata_doce",80],["rucula",30],["tomate",80],["azeite",8]] },
  ]},
  { nome: "Sexta", refeicoes: [
   { tipo: "Café da manhã", titulo: "Omelete de espinafre com queijo, mamão", preparo: "Dois ovos batidos, espinafre refogado e queijo em cubos.", itens: [["ovo",100],["espinafre",40],["queijo_minas",30],["mamao",100]] },
   { tipo: "Lanche da manhã", titulo: "Iogurte com morango e castanha de caju", preparo: "", itens: [["iogurte",170],["morango",100],["castanha_caju",10]] },
   { tipo: "Almoço", titulo: "Músculo cozido com mandioca e legumes", preparo: "Cozido de panela de pressão: músculo, chuchu e cenoura. Feijão-preto à parte.", itens: [["carne_musculo",110],["mandioca",80],["chuchu",80],["cenoura_coz",50],["feijao_preto",80]] },
   { tipo: "Lanche da tarde", titulo: "Queijo minas e tangerina", preparo: "", itens: [["queijo_minas",60],["tangerina",135]] },
   { tipo: "Jantar", titulo: "Salmão grelhado, arroz integral, brócolis e couve-flor", preparo: "Salmão grelhado só com sal e limão; ele é uma das poucas fontes de vitamina D na comida.", itens: [["salmao",100],["arroz_integral",50],["brocolis",75],["couve_flor",60],["azeite",4]] },
  ]},
  { nome: "Sábado", refeicoes: [
   { tipo: "Café da manhã", titulo: "Iogurte com aveia, banana e gergelim", preparo: "", itens: [["iogurte",170],["aveia",15],["banana",70],["gergelim",8]] },
   { tipo: "Lanche da manhã", titulo: "Ovo cozido e maçã", preparo: "", itens: [["ovo",50],["maca",110]] },
   { tipo: "Almoço", titulo: "Lombo assado, arroz, lentilha, repolho e beterraba", preparo: "Lombo assado em fatias. Salada de repolho cru com limão.", itens: [["porco_lombo",110],["arroz_integral",75],["lentilha",100],["repolho",50],["beterraba",60],["azeite",8]] },
   { tipo: "Lanche da tarde", titulo: "Vitamina de abacate com leite em pó", preparo: "Bata o leite, o leite em pó desnatado e o abacate. Sem açúcar, ou com adoçante.", itens: [["leite",200],["leite_po_desn",20],["abacate",45]] },
   { tipo: "Jantar", titulo: "Frango grelhado com abóbora e couve", preparo: "", itens: [["frango_peito",110],["abobora",120],["couve",40],["tomate",80]] },
  ]},
  { nome: "Domingo", refeicoes: [
   { tipo: "Café da manhã", titulo: "Pão francês com ovos e queijo, melão", preparo: "Ovos mexidos dentro do pão, queijo por cima.", itens: [["pao_frances",50],["ovo",100],["queijo_minas",30],["melao",90]] },
   { tipo: "Lanche da manhã", titulo: "Goiaba, castanha-do-pará e leite", preparo: "", itens: [["goiaba",85],["castanha_brasil",4],["leite",200]] },
   { tipo: "Almoço", titulo: "Merluza assada, batata, feijão e salada", preparo: "Merluza assada com tomate e cebola. Rúcula e tomate com azeite.", itens: [["merluza",130],["batata",120],["feijao_carioca",80],["rucula",30],["tomate",80],["azeite",8]] },
   { tipo: "Lanche da tarde", titulo: "Iogurte com manga e linhaça", preparo: "", itens: [["iogurte",170],["manga",60],["linhaca",10]] },
   { tipo: "Jantar", titulo: "Sopa de frango com legumes e grão-de-bico", preparo: "Frango desfiado, abobrinha, cenoura, chuchu e grão-de-bico no caldo caseiro.", itens: [["frango_peito",100],["abobrinha",90],["cenoura_coz",50],["chuchu",60],["grao_bico",60]] },
  ]},
 ],
 nausea: { nome: "Dia de enjoo", refeicoes: [
   { tipo: "Café da manhã", titulo: "Pão francês com queijo minas", preparo: "Comida seca e fria costuma descer melhor. Coma devagar, pare ao primeiro sinal de estômago cheio.", itens: [["pao_frances",50],["queijo_minas",30]] },
   { tipo: "Lanche da manhã", titulo: "Iogurte desnatado com banana", preparo: "Gelado, em colheradas pequenas.", itens: [["iogurte_desn",170],["banana",70]] },
   { tipo: "Almoço", titulo: "Canja: frango, arroz, cenoura e chuchu", preparo: "Bem cozida, pouca gordura, sem temperos fortes. Se não couber tudo, priorize o frango.", itens: [["frango_peito",100],["arroz_branco",100],["cenoura_coz",50],["chuchu",60]] },
   { tipo: "Lanche da tarde", titulo: "Maçã e água de coco", preparo: "Água de coco em goles pequenos ao longo da tarde.", itens: [["maca",110],["agua_coco",200]] },
   { tipo: "Jantar", titulo: "Ovos mexidos com purê de batata e abobrinha", preparo: "Purê só com a batata e um pouco de leite, sem manteiga.", itens: [["ovo",100],["batata",120],["abobrinha",60]] },
 ]},
};
