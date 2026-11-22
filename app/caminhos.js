"use strict";
/* Caminhos de alimentação que o app pode oferecer como opções (sem tela: a interface vem depois da aprovação do protótipo).
   Base: empresa/relatorios/pesquisa-vesicula-figado.md, item 4. Todos respeitam as regras de vesícula e fígado de
   REGRAS_CARDAPIO (app/cardapio.js). O app explica, mostra prós e contras e ela escolhe; quem decide com ela é a nutricionista
   ou o médico. Nenhum caminho prescreve dose, remédio ou suplemento.
   Cada caminho: { id, nome, paraQuem, comoFunciona, pros: [], contras: [], vesicula (cuidados com a vesícula), fonte,
   noApp (como o cardápio do app se encaixa), soComEquipe (true: só quando a equipe dela indicar), conversa (frase de encaminhamento) }. */
const CAMINHOS_CONVERSA = "Converse com sua nutricionista antes de mudar de caminho.";
const CAMINHOS = [
  { id: "A", nome: "Mediterrânea do jeito brasileiro",
    paraQuem: "Ponto de partida para quase todo mundo.",
    comoFunciona: "Feijão, arroz (de preferência integral), verduras e legumes em quase toda refeição, fruta inteira, peixe 2 ou mais vezes por semana, azeite como gordura principal, castanhas em pouca quantidade, iogurte e queijo branco. Pouca carne vermelha e nada de embutido.",
    pros: ["É o padrão com evidência mais forte para o fígado, inclusive sem perda de peso.", "Não é pobre em gordura, o que ajuda a vesícula a esvaziar.", "Usa comida comum no Brasil."],
    contras: ["É fácil exagerar no azeite e nas castanhas: muita energia em pouco volume."],
    vesicula: "Gordura espalhada pelo dia: pelo menos 7 a 10 g nas refeições principais e no máximo 1 colher de sopa de azeite por refeição. Sem fritura.",
    fonte: "EASL-EASD-EASO 2024 (Diabetologia 2024;67:2375, padrão mediterrâneo, recomendação forte); Diretriz brasileira SBEM/SBH/Abeso 2023, rec. 26 (Arch Endocrinol Metab 2023;67(6))",
    noApp: "É o cardápio de 7 dias do app, com o azeite limitado e a gordura distribuída pelas refeições.",
    soComEquipe: false },
  { id: "B", nome: "Prato dividido",
    paraQuem: "Quem não quer seguir cardápio fechado ou come fora com frequência.",
    comoFunciona: "Metade do prato com verduras e legumes, um quarto com proteína (carne magra, frango, peixe, ovo), um quarto com arroz, feijão, batata ou mandioca. De 1 colher de chá a 1 colher de sopa de azeite. A proteína primeiro.",
    pros: ["Não exige balança nem receita.", "Funciona em restaurante, na casa de parente e no trabalho.", "Controla o tamanho da refeição."],
    contras: ["Menos preciso para calorias e proteína.", "Com pouco apetite, a metade de vegetais pode encher antes da proteína; por isso a proteína vem primeiro."],
    vesicula: "Refeição de tamanho moderado, que é o que importa para a cólica. Manter o azeite do prato: refeição sem gordura deixa a vesícula parada.",
    fonte: "Método do prato da Associação Americana de Diabetes (diabetes.org/food-nutrition/diabetes-plate); Guia Alimentar para a População Brasileira (Ministério da Saúde, 2014)",
    noApp: "Mostra o prato dividido e a lista de trocas por grupo em vez das gramas do cardápio.",
    soComEquipe: false },
  { id: "C", nome: "Menos açúcar e menos farinha branca",
    paraQuem: "Quem tem refrigerante, suco ou doce na rotina, ou tem diabetes ou pré-diabetes.",
    comoFunciona: "Nenhuma bebida açucarada, doce no máximo de vez em quando, pão e massa de preferência integrais, fruta inteira em vez de suco, sem ultraprocessados.",
    pros: ["Mira direto o que as diretrizes de fígado mais citam: bebida açucarada e ultraprocessados.", "Simples de entender."],
    contras: ["Se o carboidrato for cortado demais e trocado por carne gorda e queijo amarelo, a refeição fica gordurosa. Não é dieta low carb."],
    vesicula: "Não compensar o corte de carboidrato com refeições gordurosas: o teto de gordura por refeição continua valendo.",
    fonte: "EASL-EASD-EASO 2024 (evitar bebida açucarada e ultraprocessados, recomendação forte); Diretriz brasileira 2023, rec. 31 e 32; OMS 2015, açúcares (www.ncbi.nlm.nih.gov/books/NBK285538); Chiu S et al., Eur J Clin Nutr 2014;68:416",
    noApp: "O mesmo cardápio do app (já sem açúcar adicionado); no diário, um contador opcional de bebida açucarada e doce, sem gramas.",
    soComEquipe: false },
  { id: "D", nome: "Redução do fígado antes da cirurgia",
    paraQuem: "Só quando o cirurgião ou a nutricionista indicar, com data e metas dadas por eles.",
    comoFunciona: "Dieta de baixa caloria (800 a 1.200 kcal) por 2 a 4 semanas antes da cirurgia, às vezes com shakes, para diminuir o volume do fígado.",
    pros: ["Efeito rápido no tamanho do fígado.", "Usada para facilitar a cirurgia."],
    contras: ["É perda de peso rápida, com risco de cólica e de pedra nova para quem já tem pedra.", "Com o remédio tirando a fome, a proteína pode cair muito."],
    vesicula: "Perda rápida e pouca gordura favorecem pedra e cólica. O aviso de ritmo de perda do app continua ligado; dor na barriga é sinal de alerta.",
    fonte: "Revisão sistemática, Obes Surg 2021 (pubmed 33140292); Obes Rev 2024 (PMC11884969); colecistectomia: meta-análise 2024 (pubmed 38240381)",
    noApp: "O app não monta essa dieta. Se a equipe indicar, ela digita no Perfil as metas de energia e proteína que o médico deu.",
    soComEquipe: true },
  { id: "E", nome: "Dia leve",
    paraQuem: "Dias de enjoo ou de pouco apetite.",
    comoFunciona: "Refeições pequenas, frias ou secas, pouca gordura e sem temperos fortes.",
    pros: ["Ajuda a comer alguma coisa nos dias ruins."],
    contras: ["Fica abaixo das metas de energia e proteína. Serve para um ou dois dias, não como rotina."],
    vesicula: "Manter pelo menos uma refeição com cerca de 10 g de gordura. Vários dias seguidos comendo muito pouco: avisar o médico.",
    fonte: "Gebhard RL et al., Hepatology 1996 (refeição com 10 g de gordura esvazia a vesícula); Festi D et al., Int J Obes 1998; NIDDK",
    noApp: "É o Dia de enjoo do cardápio.",
    soComEquipe: false },
];
CAMINHOS.forEach(c => { c.conversa = CAMINHOS_CONVERSA; });
/* Caminho pelo id ("A" a "E"); sem id, a lista inteira. */
function caminhoAlimentar(id) { return id == null ? CAMINHOS : (CAMINHOS.filter(c => c.id === id)[0] || null); }
