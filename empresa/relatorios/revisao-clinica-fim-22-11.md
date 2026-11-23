# Revisão clínica do fim de 22/11/2026 (onda 2 e ajustes da noite)

**Aviso:** esta revisão foi feita **sem profissional de saúde habilitado**. Quem escreve está no papel de revisor clínico de texto para paciente. Não é médico nem nutricionista e não tem registro profissional. Tudo aqui é triagem para o médico e a nutricionista dela. **Nada substitui o aval clínico.**

**Base:** main em `cb9f833`. Comparei com `revisao-clinica.md` e `revisao-clinica-onda2.md`. Li `app/hoje.js`, `sintomas.js`, `semana.js`, `diario.js`, `perfil.js`, `peso.js`, `painel.js`, `planonutri.js`, `consumo.js`, `conteudo.js` (Sinais de alerta), `LEIAME.md`, `empresa/PARA-O-MEDICO.md` e `empresa/ENTREGA-primeiros-passos.md`. Não abri os PDFs pessoais. Não mudei código do app.

**O que rodei:** um script no Node com `testes/carregar-app.js` para conferir o que o toque em "Bem" faz com a dor registrada (resultado em B1). Não usei o emulador nem a suíte de testes.

**Fontes conferidas hoje:**
- NIDDK, "Symptoms & Causes of Gallstones": a lista de "ver um médico na hora" continua igual à da revisão da onda 2.
- Bula americana do Zepbound (PDF da Lilly, texto extraído), seção 5.4 e tabela da seção 6.1. A dor abdominal aparece em 9 a 10% de quem usa tirzepatida e em 5% de quem usa placebo.
- NIH National Task Force on the Prevention and Treatment of Obesity, "Very low-calorie diets", JAMA 1993;270:967 (https://pubmed.ncbi.nlm.nih.gov/8345648/). Dieta de muito poucas calorias (VLCD) é a que tem cerca de 800 kcal por dia ou menos.
- Material antigo do NIDDK/WIN ("Dieting and Gallstones", 2002, cópia arquivada). Pedra na vesícula é o efeito sério mais comum da VLCD, com 10 a 25% de quem faz VLCD nos estudos citados. A página atual do NIDDK fala só em "certain kinds of dieting".

A EASL 2024 não foi reaberta: uso o que a revisão da onda 2 já conferiu.

---

## Conclusão

1. **Um ponto barra a entrega, na minha avaliação.** Ele vem do comportamento do app, não de redação.
   - **B1. Tocar em "Bem" apaga a dor forte já registrada no mesmo dia.** Leva junto a anotação "Dor na barriga." e o vômito.
   - Com isso, o relatório passa a dizer "Dor forte na barriga: nenhum registro no período", e a Semana diz "nenhuma dor forte registrada".
   - Confirmei no Node: depois de "Dor na barriga", "Foi dor forte" e "Bem", o registro do dia fica com `dor: false` e nota vazia.
   - É um caso provável: crise de manhã, "Bem" à noite. O médico perderia justamente a data da crise, que o próprio app trata como a primeira coisa a mostrar.
   - Se o chefe decidir que não barra, fica como o primeiro item importante.
2. **Importantes** (corrigir antes, se der; senão, registrar como limitação):
   - **I1.** "Dor na barriga" sem marcar forte some do bloco PARA COMEÇAR e da Semana. Ali aparece "nenhum registro" e "nenhuma dor forte registrada". É literalmente verdade, mas tranquiliza demais: ela anotou dor.
   - **I2.** O corte de 800 kcal está **sem fonte anotada**. O código diz só "decisão do chefe de engenharia". Além disso, o Painel diz "conversar com a sua nutricionista" e a tela Hoje diz "Assunto para o médico" para o mesmo corte. O número é defensável (é a fronteira das dietas de muito poucas calorias, ligadas a pedra na vesícula), mas precisa de fonte no código, de texto único e de aval da nutricionista. Também não está em `PARA-O-MEDICO.md`.
   - **I3.** A folha "Dor na barriga" não diz nada sobre a dor leve, que é efeito comum do remédio. Quem toca no botão com dor leve só vê os três níveis de dor forte. Isso pode assustar, ou deixá-la sem saber o que fazer.
3. **O que está correto e com fonte:**
   - os três níveis (192, pronto-socorro hoje, médico no mesmo dia ou no seguinte) são iguais em Hoje, no Guia, no cartão da vesícula e em `PARA-O-MEDICO.md`, sem "6 horas" e sem "próximos dias" (B1 da onda 2 resolvido);
   - "basta um desses" aparece no amarelão;
   - o aviso de ritmo em Hoje e na Semana repete o texto do Peso, com fonte (Zepbound 5.4 e Weinsier 1995), e não manda comer mais nem mexer na dose;
   - a frase da cirurgia já tem "sem pressa" e "não é critério de cirurgia";
   - as marcas de 5, 7 e 10% conferem com a EASL 2024.
   - A divisão em níveis e o "1 ou 2 horas" continuam **sem aval médico**, como o próprio código e `PARA-O-MEDICO.md` dizem.
4. **Menores:** cinco ajustes de redação e documentação, listados no fim.

---

## BARRA A ENTREGA

### B1. "Bem" apaga a dor forte do dia

**Onde:** `app/hoje.js`, `AC.como`, ramo `k === "bem"`: `s.enjoo = 0; s.dor = false; s.vomito = false; tirarSemFome(); tirarDor();`. O comentário logo acima diz que a dor "só se corrige no Diário", mas o "Bem" a apaga.

**Teste feito:** no estado com vesícula marcada, rodei "Dor na barriga", "Foi dor forte" e "Bem". O resultado foi `"dor":false,"nota":""`, e `relDorForte` passou a devolver "Dor forte na barriga: nenhum registro no período."

**Por que importa:** com pedra na vesícula, a NIDDK diz que depois de uma crise outras costumam vir. A bula pede acompanhamento da vesícula (Zepbound 5.4, Mounjaro 5.8). O relatório e a Semana passariam ao médico uma informação falsa e tranquilizadora.

**Sugestão** (decisão de engenharia, sem texto novo de saúde):
- "Bem" não mexe em `dor`, `vomito` nem na anotação "Dor na barriga." de hoje. Muda só o enjoo e o "sem fome".
- Se houver dor ou vômito no dia, pode aparecer este aviso: "Registrado: bem agora. A dor de hoje continua no registro; para apagar, use Diário > Sintomas."

---

## IMPORTANTE

### I1. Dor anotada sem "forte" some do PARA COMEÇAR e da Semana

**Onde:**
- `sintomas.js`, `relDorForte`: só conta `s.dor`;
- `semana.js:137-140`: "nenhuma dor forte registrada";
- `semana.js:168`: o caminho para o Guia só aparece com `s.dor`.

A anotação "Dor na barriga." sai só na lista de notas da seção SINTOMAS do relatório, mais abaixo.

**Correto?** É literalmente verdade. **Assusta ou tranquiliza?** Tranquiliza demais: quem lê o topo do relatório entende que não houve dor.

**Redação sugerida:**
- No PARA COMEÇAR, depois da linha da dor forte, quando houver: "Dor na barriga anotada (sem marcar como forte) em: 20/11/2026, 21/11/2026."
- Na Semana, quando houver só a anotação: "dor na barriga em 1 dia (não marcada como forte)". Nesse caso, trocar "nenhuma dor forte registrada" por "nenhuma marcada como forte".
- **Fonte:** não se aplica. O texto só repete o que ela registrou.

### I2. Corte de 800 kcal com o plano da nutricionista

**Onde:**
- `consumo.js:22`: `KCAL_POUCO = 800`, com o comentário "decisão do chefe de engenharia";
- `planonutri.js:143-148`: `alvoEnergia`, `notaPiso`;
- Painel: "Abaixo de 800 kcal";
- `hoje.js:34-42`: aviso "Assunto para o médico".

**Texto atual (Painel):** "800 kcal é o ponto em que o app sugere conversar com a sua nutricionista. Se isso se repetir, leve à consulta."

**É razoável?** Em parte.
- **A favor:**
  - Comparar com 1.200 kcal estava errado com o plano dela, que vai de 1.009 a 1.392 kcal. 43% das combinações do plano ficam abaixo de 1.200 (`plano-nutricionista-conferido.md`), e o app mandava levar ao médico um dia em que ela seguiu o plano inteiro.
  - 800 kcal é a fronteira das dietas de muito poucas calorias (NIH Task Force 1993), e pedra na vesícula é o efeito sério mais comum dessas dietas (NIDDK/WIN 2002). Para quem já tem pedra, é um ponto com base.
- **Contra:**
  - **A fonte não está anotada** (regra 9 do briefing).
  - Entre 800 e 1.009 kcal ela fica abaixo do plano por dias sem nenhum sinal. A faixa no gráfico só aparece se ela abrir o Painel.
  - O número diz respeito ao que foi **marcado**. Um dia com uma refeição só marcada conta como dia de pouca comida (`motivoComerPouco` exige só `refeicoes > 0`), e isso pode dar alarme falso.
  - O texto do Painel diz "nutricionista"; o aviso de Hoje, para o mesmo corte, diz "Assunto para o médico". A frase "ponto em que o app sugere conversar com a sua nutricionista" não confere com o que a tela Hoje mostra.

**Redação sugerida:**
- **Painel (`notaPiso`, com o plano):** "Abaixo de 800 kcal por dia, o app sugere conversar com a sua nutricionista ou o seu médico. O plano dela começa em [mínimo da faixa] kcal."
- **Se quiserem dar o porquê para quem tem pedra:** "Comer muito pouco por vários dias aumenta o risco de problemas na vesícula."
  - Fonte: NIH Task Force, JAMA 1993;270:967; NIDDK/WIN, Dieting and Gallstones.
  - Essa frase pode assustar: só com aval.
- **Hoje (`cartaoComerPouco`):**
  - título "Assunto para o médico ou a nutricionista";
  - `TEXTO_POUCO.energia`: "Nos últimos 3 dias com registro, a comida marcada ficou abaixo de 800 kcal.";
  - frase seguinte: "Se o enjoo ou a falta de fome impedirem de comer, converse com eles: o médico pode prescrever remédio para o enjoo ou segurar o aumento de dose."
- **Comentário em `consumo.js:22`:** anotar a fonte, por exemplo: "800 kcal = limite das dietas de muito poucas calorias (NIH Task Force, JAMA 1993;270:967; PubMed 8345648), ligadas a pedra na vesícula; abaixo do plano dela (mínimo de 1.009 kcal); PRECISA DE AVAL DA NUTRICIONISTA."
- **`PARA-O-MEDICO.md`:** acrescentar um item com a pergunta para a nutricionista: "Abaixo de quanto o app deve sugerir conversar com a senhora? Hoje: 800 kcal em 3 dias com registro."

### I3. A folha "Dor na barriga" não fala da dor leve

**Onde:** `hoje.js`, `htmlSinaisDor`. Com o botão gravando só a anotação, a folha abre com "Registrado no seu dia: dor na barriga." e mostra só os três níveis de dor forte.

**Correto?** Os três níveis estão corretos. Mas a dor abdominal leve é efeito comum da tirzepatida: 9 a 10% contra 5% com placebo (Zepbound, tabela da seção 6.1). Sem essa linha, quem tem dor leve pode ir ao pronto-socorro sem precisar, ou ficar sem saber o que fazer.

**Redação sugerida:** um quarto bloco, depois do "Avise o médico", com o mesmo estilo e mais discreto.
> **Dor leve, sem nenhum desses sinais:** dor na barriga leve é um efeito comum do remédio, mais nas primeiras semanas e depois de aumentar a dose. Fica anotada para a consulta. Se piorar, durar mais de 1 ou 2 horas ou vier com algum sinal acima, siga o que está acima.

**Fonte:** bula americana do Zepbound, seção 6.1, https://pi.lilly.com/us/zepbound-uspi.pdf. O trecho "primeiras semanas e depois de aumentar a dose" vale para os efeitos gastrointestinais em geral (seção 6.1 das bulas). Precisa de aval do médico, porque toca na divisão dos níveis.

---

## Ponto por ponto (os quatro temas pedidos)

### 1. Dor na barriga e "dor forte"

| Texto | Onde | Correto? | Fonte | Risco | Classe |
|---|---|---|---|---|---|
| Botão "Dor na barriga" grava só "Dor na barriga." e abre a folha | `hoje.js` (COMO, NOTA_DOR) | Sim. Ela não marca "forte" sem querer | — | Some do topo do relatório (I1) | Importante (I1) |
| "Foi dor forte: registrar assim" | `hoje.js` (htmlSinaisDor) | Sim. Depois do toque, a folha diz "Registrado no seu dia: dor forte na barriga." | — | Nenhum | Ok |
| "Bem" depois da dor | `hoje.js` (AC.como) | Não: apaga a dor | — | Tranquiliza demais o médico | **Barra (B1)** |
| 192: "Dor com febre e pele amarela e também confusão, desmaio ou muita fraqueza. Inchaço no rosto, lábios ou garganta, ou falta de ar." | `hoje.js`, `perfil.js`, `conteudo.js` | Sim | Mounjaro 5.4 (alergia); quadro grave do canal da bile (equipe) | Divisão sem aval | Aval |
| Pronto-socorro: 1 ou 2 horas, enjoo e vômito, febre mesmo baixa, amarelão "basta um", não segurar água | os três lugares | Sim, e mais cauteloso que o NIDDK ("several hours") | NIDDK; MSD; Mounjaro 5.2 e 5.8 | O "1 ou 2 horas" não vem de diretriz (já dito em `PARA-O-MEDICO.md`) | Aval |
| Médico: "no mesmo dia ou no seguinte", crise curta que passou sozinha | os três lugares | Sim | NIDDK ("more attacks will likely follow") | — | Ok |
| Título do Guia: "Fale com o médico (no mesmo dia ou nos próximos dias) se:" | `conteudo.js:118` | O item da vesícula diz "no mesmo dia ou no seguinte", e o título diz "próximos dias" | — | Pode ser lido como "pode esperar" | Menor (M1) |
| Folha da Hoje sem "Desmaio, ou confusão que não passa" sozinhos no 192 (o Guia tem) | `hoje.js` | Incompleto | Guia | Pequeno | Menor (M2) |

### 2. Aviso de comer pouco (800 kcal)
Ver I2. Não barra porque o plano é acompanhado pela nutricionista e os avisos de vômito e de enjoo continuam independentes.

### 3. Ritmo de perda rápida em Hoje e na Semana

| Texto | Correto? | Fonte | Risco | Classe |
|---|---|---|---|---|
| Hoje: "Ritmo de perda: Perda média de 1,3% do peso por semana, acima de 1%." + "ver" | Sim | `peso.js` (Zepbound 5.4; Weinsier 1995) | Sem o porquê na linha, mas o "ver" abre o texto inteiro | Ok |
| Folha e Semana: "...Perda de peso rápida aumenta o risco de pedra na vesícula. É um assunto para levar ao seu médico. Se tiver dor na barriga, veja os sinais de alerta no Guia." | Impreciso para quem **já tem** pedra. A bula fala de "eventos agudos de vesícula" (crise, inflamação), e o cartão da vesícula diz "risco de crise" | Zepbound 5.4: "Acute gallbladder events were associated with weight reduction" | Pode confundir ("já tenho pedra") | Menor (M3) |
| Modo discreto: sem números, mantém o aviso | Sim | — | — | Ok |

**Redação sugerida para M3** (`peso.js`, `textoRitmo`, quando `vesicula`): "Perder peso rápido aumenta o risco de crise de vesícula e de pedra nova. É um assunto para levar ao seu médico." Sem vesícula, o texto atual pode ficar.

### 4. Bloco "PARA COMEÇAR" e marcas de 5, 7 e 10%

| Texto | Correto? | Fonte | Risco | Classe |
|---|---|---|---|---|
| "Condições informadas no perfil: pedra na vesícula: sim; ..." | Sim. Só repete o Perfil. "Não sei" fica de fora | — | — | Ok |
| "Dor forte na barriga registrada em: ..." / "nenhum registro no período" | Sim, mas incompleto | — | Ver I1 e B1 | Importante |
| "Marcas de perda de peso da diretriz de fígado: perda de X% ... 5% (… kg), faltam … kg; 7% ...; 10% ..." | Sim. As marcas são da EASL 2024 | EASL 2024 | Para o médico, ok. Sugiro nomear a diretriz: "(EASL 2024)" | Menor (M4) |
| Cartão do fígado: "5% do peso já reduz a gordura, de 7 a 10% melhora a inflamação e 10% ou mais melhora a fibrose" | Confere com a EASL | EASL 2024 | Afirma resultado (regra 8) e pode sugerir que ela tem fibrose | Menor (M5) |
| Ritmo de perda fora do PARA COMEÇAR (está na seção PESO) | — | — | Para quem tem pedra, o ritmo é central (briefing) | Menor (M4) |

**Redação sugerida:**
- **M4:**
  - "Marcas de perda de peso da diretriz de fígado (EASL 2024): ..."
  - com vesícula marcada e ritmo acima de 1%, acrescentar ao PARA COMEÇAR: "Ritmo de perda das últimas semanas acima de 1% do peso por semana (ver PESO)."
- **M5:** "Nos estudos, perder 5% do peso já reduz a gordura do fígado; de 7 a 10% melhora a inflamação; e 10% ou mais pode melhorar a fibrose (cicatriz), quando ela existe." Fonte: EASL 2024 (https://pmc.ncbi.nlm.nih.gov/articles/PMC11519095/).

---

## MENORES (redação e documentação)

- **M1:** `conteudo.js:118`: trocar o título por "Fale com o médico se:" e deixar o prazo em cada item.
- **M2:** na folha da Hoje, acrescentar ao 192: "Desmaio, ou confusão que não passa."
- **M3 a M5:** ver as tabelas acima.
- **Documentação desatualizada** (texto que chega ao dono e à usuária):
  - `LEIAME.md:36` e `ENTREGA-primeiros-passos.md:22` dizem que "Dor na barriga" "grava a dor" e "também registra a dor". Hoje o botão grava só a anotação, e a dor forte é marcada com "Foi dor forte: registrar assim". Sugestão: "grava a anotação 'Dor na barriga' e abre o que fazer; se foi dor forte, toque em 'Foi dor forte: registrar assim'".
  - `LEIAME.md:203-205` ("Limitações") ainda diz que o ritmo não aparece em Hoje e que o relatório não mostra as datas da dor forte nem cita vesícula e fígado. As duas coisas já mudaram.

## Precisa de aval clínico (acrescenta à lista de `PARA-O-MEDICO.md`)
1. **Nutricionista:** o corte de 800 kcal e o texto que acompanha (I2).
2. **Médico:** a linha da dor leve como efeito comum (I3). Ela mexe na divisão dos níveis.
3. **Médico:** continuam pendentes o "1 ou 2 horas", a divisão em 192, pronto-socorro e médico, e o ritmo de 1% por semana.

## O que não foi feito
- Não vi as telas rodando: li o código e fiz uma conferência no Node, só do B1.
- A bula brasileira (Anvisa) não foi conferida.
- A página atual do NIDDK não traz o número de 800 kcal. O número vem da Task Force de 1993 e de material antigo do NIDDK (cópia arquivada).
- Não reabri a EASL 2024 nem os estudos de gordura.
