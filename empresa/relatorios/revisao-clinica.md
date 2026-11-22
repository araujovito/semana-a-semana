# Revisão clínica: INCOMPLETA

**Status: incompleta.** A direção mandou parar por fim do limite de uso da conta. Este relatório registra só o que eu já tinha lido. Não fiz nenhuma pesquisa na internet. As fontes abaixo vêm do que eu já sabia e **nenhum link foi conferido**. Antes de colar qualquer texto no app, alguém tem de checar cada fonte.

Quem escreve é um modelo de linguagem fazendo o papel de revisora. Não sou médica, nem nutricionista, nem tenho registro profissional. Isto é uma triagem para preparar a validação de um profissional, e não substitui essa validação.

## Conclusão

- O guia (`app/conteudo.js`) está, no geral, prudente e alinhado à bula: escalonamento de dose, dose esquecida (96 h), intervalo mínimo de 72 h entre aplicações, anticoncepcional oral (barreira por 4 semanas no início e a cada aumento) e aviso antes de sedação. Não achei nenhum erro grosseiro de dose ou de conduta.
- O problema clínico mais sério está nos **sinais de alerta**. Eles põem no mesmo nível uma emergência (alergia grave), um quadro de pronto-socorro (pancreatite, desidratação) e algo que pode esperar alguns dias (caroço no pescoço). Também usam critérios vagos ("vômito que não para"). Uma leiga pode demorar a ligar para o 192 ou ir ao PS tarde demais.
- O **cardápio** tem volume e fibra altos para quem está com saciedade precoce, principalmente nas primeiras semanas e quando as porções são multiplicadas por até 1,5. O **dia de enjoo** faz sentido no conjunto, mas contradiz o próprio guia em dois pontos (canja quente, ovo mexido).
- O **treino** é conservador e adequado no volume. Faltam avisos sobre prender a respiração, sobre descer e subir do chão e sobre hipoglicemia.
- As **metas** usam números defensáveis (piso de 1.200 kcal, 1,4 g/kg de peso ajustado, DRIs). Os pontos que uma nutricionista discutiria: água fixa em 2 L, fibra de 25 g com 1.200 kcal, carboidrato residual baixo e o fato de a meta de proteína não deixar claro que é "por kg de peso ajustado".

## O que foi lido e o que não foi

- Lido inteiro: `app/conteudo.js`, `app/cardapio.js`, `app/nutricao.js` (função `metas`) e `app/plano.js`, no estado da branch main em 20/11.
- **Não lido:** os textos de `inicio.js`, `perfil.js`, `sintomas.js`, `tratamento.js`, `hoje.js`, `treino.js`, `peso.js` e `diario.js`, e os relatórios `auditoria-1.md`, `pesquisa-boas-praticas.md` e `pesquisa-concorrentes.md`. Por isso, alguns itens abaixo podem repetir o que já foi apontado ou já ter sido corrigido.

---

## ERROS

### 1. Sinais de alerta sem grau de urgência (grave)
**Onde:** `conteudo.js`, GUIA, "Sinais de alerta": "Procurar atendimento sem esperar a consulta se aparecer:", seguido de uma lista única.
**Problema:** alergia grave com falta de ar pede o 192 na hora. Caroço no pescoço pede consulta em poucos dias. Na lista atual os dois têm o mesmo peso. Isso pode atrasar a resposta a uma emergência ou mandar a pessoa ao PS sem necessidade.
**Proposta (para colar):**
> **Ligue 192 (SAMU) agora se:**
> • Inchaço no rosto, nos lábios ou na garganta, ou falta de ar.
> • Desmaio, ou confusão que não passa.
>
> **Vá ao pronto-socorro hoje se:**
> • Dor forte e contínua na barriga, que pode ir para as costas, com ou sem vômito.
> • Dor no alto da barriga, do lado direito, com febre ou com pele e olhos amarelados.
> • Barriga inchada e dura, sem fazer cocô nem soltar gases, com vômito.
> • Nenhum líquido para no estômago por mais de 12 horas, ou você urina muito pouco e escuro durante um dia inteiro.
>
> **Fale com o médico nos próximos dias se:**
> • Caroço ou inchaço no pescoço, rouquidão que não passa ou dificuldade para engolir.
> • Mudança na visão, se você tem diabetes.
> • Suspeita de gravidez.
>
> **Tristeza intensa ou pensamentos de se machucar:** fale com o médico e, se precisar conversar agora, ligue 188 (CVV, 24 horas).

**Fonte (a conferir):** bula do Mounjaro/Zepbound, seções de advertências: pancreatite, doença da vesícula, lesão renal aguda por desidratação, hipersensibilidade e, no pós-comercialização, íleo. Os prazos de "12 horas" e "um dia" são proposta minha e precisam do aval de um médico.

### 2. Faltam no alerta a obstrução intestinal e um critério concreto de desidratação
**Onde:** mesma seção: "Vômito ou diarreia que não param...".
**Problema:** "Que não param" não diz quando agir. O íleo (intestino parado) consta da bula americana como evento pós-comercialização e não aparece no app.
**Proposta:** já incluída no item 1.
**Fonte (a conferir):** bula americana (Zepbound/Mounjaro), seção 6.2.

### 3. O dia de enjoo contradiz o próprio guia
**Onde:** `cardapio.js`, `nausea`. Almoço: "Canja... Bem cozida". Jantar: "Ovos mexidos com purê de batata".
**Problema:** o guia diz "Comida fria ou em temperatura ambiente tem menos cheiro". Canja quente e ovo mexido têm cheiro forte, e o ovo é um gatilho comum de náusea.
**Proposta:**
- Almoço, preparo: "Pode comer morna ou em temperatura ambiente; quente tem mais cheiro. Se não couber tudo, coma primeiro o frango."
- Jantar: trocar o ovo por frango desfiado frio ou ricota. Se o ovo ficar, usar o preparo: "Ovo cozido frio cheira menos que ovo mexido."

**Fonte (a conferir):** documento conjunto de 2025 (ACLM/ASN/OMA/TOS), parte sobre manejo de sintomas gastrointestinais.

### 4. O dia de enjoo não dá prioridade à hidratação nem diz quando parar de insistir
**Onde:** `plano.js`: "O dia de enjoo é leve de propósito e fica abaixo das metas. Serve para um ou dois dias, não como rotina."
**Problema:** num dia de enjoo, o risco principal é a desidratação, e o rim sofre com ela. O texto atual não fala disso.
**Proposta:**
> Hoje, beber vale mais que comer. Tome goles pequenos de água, água de coco ou soro de reidratação da farmácia ao longo do dia. Se nenhum líquido parar no estômago por mais de 12 horas, procure o pronto-socorro.

**Fonte (a conferir):** bula, advertência sobre lesão renal aguda.

---

## PODE MELHORAR (do mais ao menos importante)

### 5. Hipoglicemia descrita de um jeito difícil de reconhecer
**Onde:** "Se também usa insulina ou sulfonilureia: tremor, suor frio, confusão (hipoglicemia)."
**Proposta:**
> Se você usa insulina ou remédio para diabetes do tipo glibenclamida ou gliclazida, a glicose pode cair demais. Sinais: tremor, suor frio, coração acelerado, fome súbita, visão embaçada, confusão. Se tiver aparelho, meça. Coma ou beba algo doce (meio copo de suco ou uma colher de sopa de açúcar), espere 15 minutos e meça de novo. Avise o médico, que pode ajustar os outros remédios.

**Fonte (a conferir):** bula (hipoglicemia com secretagogos e insulina); diretriz SBD, manejo da hipoglicemia (regra dos 15).

### 6. Interações e remédios de uso comum
**Onde:** falta no guia. Hoje só existe a pergunta "Os outros remédios que tomo precisam de ajuste?".
**Proposta:** acrescentar ao guia um tópico "Outros remédios":
> O esvaziamento mais lento do estômago pode mudar a absorção de remédios tomados pela boca. Avise o médico se você usa:
> • varfarina ou outro anticoagulante (pode ser preciso exame mais frequente);
> • levotiroxina (o TSH pode precisar ser revisto);
> • remédio para pressão (com a perda de peso, a pressão pode cair e dar tontura ao levantar);
> • remédio para diabetes;
> • pílula anticoncepcional (veja o tópico próprio).

**Fonte (a conferir):** bula americana, seção 7 (remédios orais de índice terapêutico estreito). Sobre a levotiroxina, há um relato de aumento da exposição na bula do Mounjaro, a confirmar.

### 7. Vômito logo depois da pílula
**Onde:** "Anticoncepcional e gravidez".
**Proposta:**
> Se vomitar até 3 ou 4 horas depois de tomar a pílula, conte como pílula esquecida e siga a bula da sua pílula.

**Fonte (a conferir):** bulas de anticoncepcionais orais combinados; recomendações da Febrasgo/OMS. Também é preciso confirmar se a Febrasgo de fato recomenda o que o app atribui a ela.

### 8. Queda de cabelo, tontura ao levantar e cálculo na vesícula
**Onde:** faltam no guia.
**Proposta:**
> Na perda de peso rápida, é comum o cabelo cair mais por alguns meses. Costuma voltar a crescer. Comer proteína ajuda; se a queda for grande, vale pedir ao médico ferritina e outros exames.
>
> Tontura ao levantar: levante devagar e beba água. Se acontecer todo dia, avise o médico, principalmente se você toma remédio para pressão.
>
> Perder peso rápido aumenta a chance de pedra na vesícula. Os sinais estão em Sinais de alerta.

**Fonte (a conferir):** SURMOUNT-1 (NEJM 2022), queda de cabelo mais frequente com tirzepatida do que com placebo; bula, colelitíase.

### 9. Álcool, jejum e viagem
**Onde:** o álcool aparece só ligado ao enjoo. Jejum e viagem (além da bolsa térmica) não aparecem.
**Proposta:**
> Álcool: com pouca comida no estômago, o efeito vem mais rápido. Em quem usa remédio para diabetes, aumenta o risco de glicose baixa.
>
> Jejum religioso ou intermitente: somado à fome menor, fica difícil chegar à proteína e à água do dia. Combine com o médico antes.
>
> Viagem: leve a caneta na bagagem de mão, com a receita. Mudança de fuso: mantenha pelo menos 3 dias entre duas aplicações.

**Fonte (a conferir):** bula (72 h entre doses); documento conjunto de 2025.

### 10. Volume e fibra do cardápio para quem tem saciedade precoce
**Onde:** `cardapio.js`. Exemplo: almoço de segunda, com frango 120 g, arroz 75 g, feijão 80 g, brócolis 75 g, tomate 80 g e azeite (mais de 430 g no prato antes do fator, que pode chegar a 1,5 em `fatorDe`). Linhaça, aveia e feijão aparecem quase todo dia. Há brássicas (brócolis, couve-flor, repolho) e jantares pesados, como lentilha com carne moída na quarta.
**Problema:** pratos grandes e muita fibra somada pioram empachamento, gases e refluxo nas primeiras semanas de cada dose.
**Proposta:**
- Regra no código: quando o fator passar de 1, aumentar o número de lanches em vez de aumentar o prato; ou limitar cada refeição a cerca de 350 a 400 g.
- Texto na tela: "Se o prato não couber, coma primeiro a proteína e guarde o resto para o lanche."
- Fibra: subir aos poucos nas primeiras semanas. Texto: "Se der gases ou estufamento, troque brócolis e repolho por abobrinha, cenoura ou chuchu."

**Fonte (a conferir):** documento conjunto de 2025, recomendações sobre refeições pequenas e fibra gradual.

### 11. Metas que uma nutricionista contestaria
**Onde:** `nutricao.js`, `metas()`.
- **Água** `p.metaAgua || 2000` fixa. Proposta: manter como lembrete e escrever na tela: "Em dia de calor, de treino, de vômito ou de diarreia, beba mais. Sua médica pode definir outro valor." (Para comparar, a DRI de água total para mulheres é cerca de 2,7 L por dia, contando a água dos alimentos.)
- **Fibra 25 g** fixa por sexo e idade, enquanto a base da DRI é 14 g por 1.000 kcal (cerca de 17 g com 1.200 kcal). Proposta: `fibra = round(14 * kcal / 1000)`, ou mostrar 25 g como teto e não como meta.
- **Carboidrato residual:** com 1.200 kcal, proteína de 120 g e 30% de gordura, sobram cerca de 90 g, abaixo dos 130 g da RDA. Proposta: avisar quando `carb < 130` ou baixar a gordura para 25% nesse caso. Isso precisa de aval de nutricionista.
- **Proteína:** o guia diz "1,2 a 1,6 g por kg por dia", mas o código usa peso ajustado quando o IMC é 30 ou mais (fator 0,25). Proposta de texto: "por kg de peso ajustado (o app calcula)". Acrescentar: "Se você tem doença nos rins, a meta de proteína é definida pelo médico."
- **Micronutrientes:** as metas seguem a RDA/AI das DRIs e conferem para mulheres adultas. Não existe checagem de limite superior (UL). Isso só importa se ela tomar suplemento, que o app não prescreve. O texto "Ferro e vitamina A em excesso também fazem mal" cobre o essencial.
- **Não conferido:** se `p.metaKcal` aceita um valor abaixo de 1.200 sem aviso (perfil.js não foi lido). A idade é calculada só pelo ano de nascimento: erro de até um ano, sem efeito clínico relevante.

**Fonte (a conferir):** DRIs (NASEM): água, fibra, carboidrato, proteína. Peso ajustado: prática corrente em nutrição clínica.

### 12. Treino: respiração, chão e hipoglicemia
**Onde:** `conteudo.js`, TREINO.regras e os exercícios de chão (ponte, prancha, perdigueiro).
**Proposta (regras novas):**
> • Solte o ar no esforço e não prenda a respiração, principalmente na prancha.
> • Se descer e subir do chão for difícil, faça a ponte e o perdigueiro na cama firme.
> • Dor no joelho na subida do degrau: use um degrau mais baixo ou troque por sentar e levantar.
> • Se você usa insulina ou glibenclamida/gliclazida, tenha algo doce à mão durante o treino.
> • Se você tem doença do coração, diabetes com complicação ou pressão alta sem controle, converse com o médico antes de começar.

Ajuste menor: "No dia da aplicação ou em dia de enjoo". O enjoo costuma aparecer de 1 a 3 dias depois da aplicação. Proposta: "Nos dias de enjoo, ou nos dias seguintes à aplicação, vale fazer só a caminhada ou reduzir a carga."
**Fonte (a conferir):** ACSM, triagem pré-participação e treino de força para iniciantes com obesidade.

### 13. Sedação e endoscopia
**Onde:** "Cirurgia, endoscopia e anestesia". O texto já é prudente.
**Pode melhorar:**
> Diga também se você estiver com enjoo, vômito ou barriga estufada nos dias antes do exame.

**Fonte (a conferir):** orientação multissocietária de 2024 (ASA, AGA e outras) sobre agonistas de GLP-1 no período perioperatório.

### 14. Diarreia: soro caseiro
**Onde:** "repor líquidos (água, água de coco, soro caseiro)".
**Proposta:**
> repor líquidos (água, água de coco ou soro de reidratação oral da farmácia)

**Motivo:** o soro caseiro preparado errado pode ter sal ou açúcar demais.
**Fonte (a conferir):** Ministério da Saúde, terapia de reidratação oral.

### 15. Perguntas ao médico: contraindicações
**Proposta:** acrescentar em "Perguntas para levar ao médico":
> • Tenho ou tive pancreatite, pedra na vesícula, doença nos rins ou retinopatia, ou há na família câncer medular de tireoide (NEM2)? Isso muda algo?

**Fonte (a conferir):** bula, contraindicação (carcinoma medular de tireoide, NEM2) e advertências.

---

## Não consegui conferir
- Nenhum link: todas as fontes estão "a conferir". Pontos específicos: o prazo fora da geladeira da apresentação KwikPen vendida no Brasil; a recomendação da Febrasgo sobre pílula; a faixa "80 a 120 g por dia" no documento de 2025; o dado de levotiroxina na bula.
- Os textos dos outros arquivos de `app/` e os relatórios anteriores (auditoria e pesquisas).
- O valor real de `BASE.kcal` e quanto o fator 0,85 a 1,5 muda os pratos na prática.

## O que só um profissional de verdade deve validar antes de ela usar
- Os limites de tempo no alerta (12 horas sem conseguir manter líquidos, um dia de urina escassa) e a separação entre 192, PS e consulta.
- A meta de proteína e o piso de energia no caso dela, principalmente se houver doença renal, diabetes ou uso de insulina.
- Se ela pode seguir o cardápio como está (alergias, intolerância à lactose, outras restrições) e se o volume por refeição serve nas primeiras semanas.
- A liberação para o treino, se houver doença cardiovascular ou articular.
- Todos os remédios que ela já usa, para checar interações.
