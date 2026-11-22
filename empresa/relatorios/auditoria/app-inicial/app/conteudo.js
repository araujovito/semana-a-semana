// Textos do guia e do plano de treino. Sem logica aqui.
window.TREINO = {
 fases: [
  { semanas: "Semanas 1 e 2", series: 2, texto: "2 séries por exercício, carga leve. O objetivo é aprender o movimento. Termine cada série sentindo que faria mais 3 ou 4 repetições." },
  { semanas: "Semanas 3 a 6", series: 3, texto: "3 séries por exercício. Termine cada série sentindo que faria mais 2 ou 3 repetições." },
  { semanas: "Semanas 7 a 12", series: 3, texto: "3 séries. Quando completar o máximo de repetições em todas as séries com sobra, aumente a carga (ou passe para a variação mais difícil) e volte ao mínimo de repetições." },
 ],
 regras: [
  "3 treinos de força por semana, em dias alternados (por exemplo segunda, quarta e sexta). Alterne A e B.",
  "Descanso de 60 a 90 segundos entre as séries.",
  "5 minutos de aquecimento antes: caminhar no lugar, girar ombros e quadril.",
  "Caminhada nos outros dias: comece com 10 a 15 minutos e some até chegar a 150 minutos por semana.",
  "Coma algo com proteína e carboidrato 1 a 2 horas antes. Treinar em jejum com o apetite reduzido aumenta a chance de tontura.",
  "No dia da aplicação ou em dia de enjoo, vale fazer só a caminhada ou reduzir a carga.",
  "Pare e procure atendimento se sentir dor no peito, falta de ar fora do normal, tontura forte ou desmaio.",
 ],
 casa: {
  A: [
   { nome: "Sentar e levantar da cadeira", reps: "10 a 12", como: "Pés na largura dos ombros, sente até encostar na cadeira e levante sem usar as mãos. Mais difícil: segure um garrafão de água junto ao peito." },
   { nome: "Flexão de braço na parede", reps: "8 a 12", como: "Mãos na parede na altura do peito, corpo reto, dobre os cotovelos e empurre. Mais difícil: mãos numa mesa firme ou no braço do sofá." },
   { nome: "Remada com elástico ou mochila", reps: "10 a 12", como: "Com elástico preso na maçaneta, puxe os cotovelos para trás. Sem elástico: apoie uma mão na cadeira e puxe uma mochila com peso até a cintura, um braço de cada vez." },
   { nome: "Ponte de glúteo", reps: "12 a 15", como: "Deitada de costas, joelhos dobrados, suba o quadril apertando os glúteos e desça devagar." },
   { nome: "Prancha com joelhos no chão", reps: "15 a 30 segundos", como: "Antebraços e joelhos no chão, corpo reto dos ombros aos joelhos, barriga contraída." },
  ],
  B: [
   { nome: "Subida no degrau", reps: "8 a 10 em cada perna", como: "Suba num degrau firme com uma perna, estenda o joelho e desça controlando. Segure no corrimão se precisar." },
   { nome: "Desenvolvimento de ombros com garrafas", reps: "10 a 12", como: "Sentada, uma garrafa cheia em cada mão na altura dos ombros, empurre para cima e desça devagar." },
   { nome: "Levantamento com mochila (dobradiça de quadril)", reps: "10 a 12", como: "Mochila com peso à frente das pernas, joelhos levemente dobrados, leve o quadril para trás com a coluna reta e suba apertando os glúteos." },
   { nome: "Elevação de panturrilha", reps: "12 a 15", como: "Em pé, apoiada na parede, suba na ponta dos pés e desça devagar." },
   { nome: "Perdigueiro", reps: "8 em cada lado", como: "De quatro apoios, estenda o braço direito e a perna esquerda ao mesmo tempo, segure 2 segundos e troque." },
  ],
 },
 academia: {
  A: [
   { nome: "Leg press", reps: "10 a 12", como: "Pés na largura dos ombros no meio da plataforma. Desça até os joelhos formarem cerca de 90 graus, sem tirar o quadril do banco." },
   { nome: "Supino na máquina", reps: "10 a 12", como: "Costas apoiadas, empurre até quase estender os cotovelos e volte devagar." },
   { nome: "Remada sentada", reps: "10 a 12", como: "Peito apoiado ou coluna reta, puxe levando os cotovelos para trás e aproxime as escápulas." },
   { nome: "Mesa flexora", reps: "10 a 12", como: "Dobre os joelhos trazendo o rolo em direção aos glúteos e volte controlando." },
   { nome: "Prancha", reps: "20 a 30 segundos", como: "Antebraços no chão, corpo reto. Com joelhos no chão se a versão completa ainda não sair." },
  ],
  B: [
   { nome: "Agachamento com halter junto ao peito", reps: "10 a 12", como: "Segure um halter na vertical junto ao peito, desça como se fosse sentar e suba. Pode ser feito até um banco." },
   { nome: "Puxada na frente (pulley)", reps: "10 a 12", como: "Puxe a barra até a altura do queixo, cotovelos apontando para baixo, e volte devagar." },
   { nome: "Desenvolvimento de ombros na máquina", reps: "10 a 12", como: "Empurre para cima sem travar os cotovelos e desça até a altura das orelhas." },
   { nome: "Elevação pélvica", reps: "10 a 12", como: "Costas apoiadas no banco, peso sobre o quadril, suba até alinhar tronco e coxas e desça devagar." },
   { nome: "Panturrilha na máquina", reps: "12 a 15", como: "Suba o máximo, segure 1 segundo, desça alongando." },
  ],
 },
};

window.GUIA = [
 { titulo: "Como o remédio age", corpo: [
  "A tirzepatida (Mounjaro) imita dois hormônios do intestino, GIP e GLP-1. Na prática: a fome diminui, a saciedade chega antes e o estômago esvazia mais devagar.",
  "É esse esvaziamento lento que explica a maior parte dos efeitos no estômago e no intestino, e ele é mais forte nas primeiras semanas de cada dose.",
 ]},
 { titulo: "Doses: como sobem", corpo: [
  "Início com 2,5 mg uma vez por semana, por 4 semanas. Essa dose serve para o corpo se acostumar.",
  "Depois o médico pode subir de 2,5 em 2,5 mg, com pelo menos 4 semanas em cada dose: 5, 7,5, 10, 12,5 e no máximo 15 mg.",
  "Não há obrigação de chegar a 15 mg. Quem decide se sobe, mantém ou reduz é o médico, olhando resultado e efeitos colaterais.",
  "O diário deste app mostra há quantas semanas ela está na dose atual, para levar à consulta.",
 ]},
 { titulo: "Aplicação", corpo: [
  "Uma vez por semana, sempre no mesmo dia, em qualquer horário, com ou sem comida.",
  "Locais: abdômen, coxa ou parte de trás do braço (no braço, aplicada por outra pessoa). Troque o ponto a cada semana; o diário sugere o próximo.",
  "Dá para mudar o dia da semana, desde que haja pelo menos 3 dias (72 horas) entre duas aplicações.",
  "O passo a passo da caneta vem no folheto da embalagem e varia conforme a apresentação. Na primeira vez, vale aplicar com o farmacêutico ou com o médico olhando.",
 ]},
 { titulo: "Esqueci a dose", corpo: [
  "Até 4 dias (96 horas) depois do horário previsto: aplicar assim que lembrar e seguir o dia habitual na semana seguinte.",
  "Mais de 4 dias: pular a dose esquecida e aplicar a próxima no dia habitual. Não aplicar duas doses para compensar.",
  "Se ficar várias semanas sem aplicar, falar com o médico antes de retomar: pode ser preciso recomeçar numa dose menor.",
 ]},
 { titulo: "Como guardar", corpo: [
  "Na geladeira, entre 2 °C e 8 °C, dentro da embalagem original (protege da luz). Não congelar; se congelou, não usar.",
  "Fora da geladeira, abaixo de 30 °C, o prazo citado nas bulas é de até 21 dias no total. Confira a bula da apresentação que ela comprou, porque o prazo depois do primeiro uso pode ser diferente.",
  "Em viagem: bolsa térmica, sem encostar a caneta direto no gelo.",
 ]},
 { titulo: "Enjoo", corpo: [
  "É o efeito mais comum e costuma aparecer nos dias seguintes à aplicação e depois de cada aumento de dose.",
  "O que costuma ajudar: café da manhã pequeno, refeições pequenas a cada 3 ou 4 horas, comer devagar e parar ao primeiro sinal de estômago cheio.",
  "Nos primeiros dias depois da aplicação, evitar comida gordurosa, fritura e refeições grandes. Comida fria ou em temperatura ambiente tem menos cheiro.",
  "Chá de gengibre ou de hortelã. Líquidos em goles pequenos, de preferência entre as refeições.",
  "Álcool piora enjoo e refluxo.",
  "Use o \"Dia de enjoo\" na aba Plano. Se o enjoo impedir de comer ou beber, o médico pode prescrever remédio ou segurar o aumento de dose.",
 ]},
 { titulo: "Intestino preso, diarreia e refluxo", corpo: [
  "Intestino preso: água ao longo do dia, fibra da comida (feijão, aveia, linhaça, mamão, ameixa seca, verduras) aumentada aos poucos e caminhada diária. Se não resolver, o médico pode indicar magnésio, fibra em pó ou laxante.",
  "Diarreia: refeições menores e com menos gordura, repor líquidos (água, água de coco, soro caseiro). Se durar mais de 2 ou 3 dias, avisar o médico.",
  "Refluxo e arroto: não deitar nas 2 ou 3 horas depois de comer, jantar pequeno, evitar álcool, fritura e bebida com gás.",
 ]},
 { titulo: "Sinais de alerta", alerta: true, corpo: [
  "Procurar atendimento sem esperar a consulta se aparecer:",
  "• Dor forte e contínua na barriga, que pode ir para as costas, com ou sem vômito (pode ser pâncreas).",
  "• Dor no alto da barriga do lado direito, febre, pele ou olhos amarelados (pode ser vesícula).",
  "• Vômito ou diarreia que não param, boca seca, urina escura e pouca, tontura ao levantar (desidratação, que pode afetar os rins).",
  "• Inchaço no rosto, lábios ou garganta, falta de ar, coceira intensa pelo corpo (reação alérgica).",
  "• Se também usa insulina ou sulfonilureia: tremor, suor frio, confusão (hipoglicemia).",
  "• Caroço ou inchaço no pescoço, rouquidão que não passa, dificuldade para engolir.",
  "• Mudança na visão, em quem tem diabetes.",
  "• Tristeza intensa ou pensamentos de se machucar.",
  "• Suspeita de gravidez.",
 ]},
 { titulo: "Anticoncepcional e gravidez", corpo: [
  "A tirzepatida pode reduzir o efeito da pílula anticoncepcional, porque atrasa a absorção no estômago.",
  "A orientação da Febrasgo e da bula americana do remédio: quem usa pílula deve somar um método de barreira (camisinha) por 4 semanas depois da primeira dose e por 4 semanas depois de cada aumento de dose, ou trocar por um método que não seja oral (DIU, implante, injeção, adesivo).",
  "O remédio não é usado na gravidez nem na amamentação. Quem planeja engravidar combina com o médico quando parar.",
 ]},
 { titulo: "Comer pouco, mas comer bem", corpo: [
  "Com menos fome, o risco deixa de ser comer demais e passa a ser comer de menos. Abaixo de cerca de 1.200 kcal por dia (mulheres) fica difícil atingir vitaminas e minerais.",
  "Proteína primeiro: em cada refeição, comece pela carne, ovo, peixe, queijo ou iogurte. A faixa usada para quem está emagrecendo com esse tipo de remédio é de 1,2 a 1,6 g por kg por dia, ou 80 a 120 g por dia.",
  "Não pular refeição por falta de fome: refeições pequenas em horários fixos funcionam melhor do que esperar o apetite.",
  "Água: o remédio também reduz a sede. A meta de água do app serve de lembrete.",
  "Menos açúcar, refrigerante e farinha branca; mais comida de verdade e fibra.",
 ]},
 { titulo: "Músculo e osso", corpo: [
  "Em qualquer emagrecimento rápido, parte do peso perdido é músculo. Duas coisas reduzem essa perda: proteína suficiente e treino de força.",
  "A referência é treino de força pelo menos 3 vezes por semana e 150 minutos semanais de atividade aeróbica moderada, como caminhada rápida.",
  "Cálcio, vitamina D e proteína também protegem os ossos.",
 ]},
 { titulo: "Vitaminas e minerais para acompanhar", corpo: [
  "Os que mais ficam abaixo do necessário em quem come pouco: ferro, cálcio, magnésio, zinco e vitaminas A, D, E, K, B1, B12 e C.",
  "A aba Plano mostra quanto o cardápio entrega de cada um. No nível de calorias do tratamento, ferro, vitamina D e vitamina E costumam ficar abaixo da meta só com comida.",
  "Suplemento (polivitamínico, vitamina D, ferro, B12, cálcio) é decisão do médico ou do nutricionista, de preferência com exame de sangue antes. Ferro e vitamina A em excesso também fazem mal.",
  "Exames que valem a conversa: hemograma, ferritina, vitamina B12, vitamina D, além dos que o médico já pede.",
 ]},
 { titulo: "Cirurgia, endoscopia e anestesia", corpo: [
  "Como o estômago esvazia mais devagar, pode haver comida nele mesmo depois do jejum. Avisar o médico, o dentista e o anestesista que usa tirzepatida antes de qualquer procedimento com sedação ou anestesia. Eles dizem se é preciso pausar e por quanto tempo.",
 ]},
 { titulo: "Perguntas para levar ao médico", corpo: [
  "• Qual é a dose-alvo no meu caso, e em que situação a gente para de subir?",
  "• Por quanto tempo devo usar? Existe plano para manter o peso depois?",
  "• Preciso de algum suplemento? Quais exames vamos repetir, e quando?",
  "• Uso pílula anticoncepcional: mantenho, somo camisinha ou troco de método?",
  "• Os outros remédios que tomo precisam de ajuste?",
  "• O que faço se o enjoo não passar? Posso ter um remédio de reserva?",
  "• Com quais sintomas devo ligar ou ir ao pronto-socorro?",
 ]},
 { titulo: "E depois?", corpo: [
  "Nos estudos, a maior parte das pessoas recupera peso quando para o remédio. O tempo de tratamento serve para montar o que fica: rotina de refeições, proteína, treino de força e sono.",
  "Parar, reduzir ou manter uma dose de manutenção é uma decisão para tomar com o médico, não sozinha.",
 ]},
 { titulo: "De onde vêm estas informações", corpo: [
  "Doses, aplicação, dose esquecida e armazenamento: bula do Mounjaro (Eli Lilly) e Lilly Medical Brasil.",
  "Alimentação, proteína, micronutrientes, atividade física e manejo dos sintomas: \"Nutritional priorities to support GLP-1 therapy for obesity\" (2025), documento conjunto de quatro sociedades médicas americanas (ACLM, ASN, OMA e TOS).",
  "Anticoncepcional: bula e recomendação da Febrasgo.",
  "Composição dos alimentos: TACO, 4ª edição (NEPA/Unicamp). Vitaminas B12, D, E, K e folato não constam na TACO e vêm do USDA SR Legacy.",
  "Metas de vitaminas e minerais: DRIs (Institute of Medicine / NASEM) para adultos.",
  "Este app organiza informação e registros. Ele não substitui o médico nem o nutricionista, e as metas podem ser trocadas pelas que eles definirem (aba Perfil).",
 ]},
];
