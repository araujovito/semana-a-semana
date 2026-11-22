# Vesícula com pedra, gordura no fígado e tirzepatida: o que a alimentação do app precisa respeitar

Pesquisadora de nutrição clínica, 22/11/2026. Só leitura no código: nada em `app/`, `dados/`, `testes/` ou `android/` foi alterado.

## Conclusão

1. As duas condições dela puxam em direções em parte opostas, e o cardápio precisa ficar no meio:
   - **fígado**: o que tem evidência forte é perder peso (5% já reduz a gordura do fígado; 7 a 10% melhora a inflamação; 10% ou mais melhora a fibrose), seguir um padrão parecido com a dieta mediterrânea, cortar bebida açucarada e ultraprocessados, não beber álcool e fazer atividade física;
   - **vesícula com pedra**: perder peso rápido demais e comer quase sem gordura deixam a vesícula parada e favorecem pedra nova; refeição grande e pesada pode disparar a cólica. A saída prática é perder peso **em ritmo moderado**, **sem refeições com gordura quase zero e sem refeições muito gordurosas**, com **refeições regulares**.
2. O cardápio atual não tem fritura nem açúcar adicionado e já tem gordura em todas as refeições. O problema está na **escala das porções**: para o perfil dela o app multiplica o azeite por 1,65 (8 g viram 13 g por refeição). Com isso a gordura do dia fica em 58 a 70 g (31% a 40% da energia) e sete refeições passam de 17 g, duas delas de 20 g. As mudanças estão na seção 7.
3. O que **precisa do aval do médico ou do nutricionista dela** antes de virar regra no app: o teto de gordura por refeição (não há número com evidência; o proposto é prática), qualquer dieta pré-operatória de redução do fígado, o uso de ácido ursodesoxicólico (aqui só como fato) e a divisão entre 192, pronto-socorro e consulta nos sinais de alerta.
4. Dois erros de referência no código: os comentários de `app/conteudo.js` (linha 92) e de `app/peso.js` (linha 108) citam "seção 5.7 (vesícula)". Na bula americana atual do Mounjaro a vesícula é a **5.8** (5.7 é retinopatia, 5.9 é perda de visão, 5.10 é aspiração na anestesia). E o texto da 5.8 do Mounjaro não fala em "perda rápida"; a frase que liga os eventos da vesícula à perda de peso está na bula do Zepbound (mesma molécula, indicação para obesidade).

## 5. Regras concretas para o cardápio e para os avisos

Legenda da força: **F** = diretriz com recomendação forte ou meta-análise consistente; **M** = estudos pequenos ou extrapolados de outra situação; **P** = prática comum ou proposta da equipe, sem número com evidência. "Aval" = precisa do médico ou nutricionista dela antes de virar texto definitivo.

| # | Regra | Número mensurável | Força | Fonte | Aval |
|---|---|---|---|---|---|
| R1 | Ritmo de perda | Aviso quando a média de 2 a 4 semanas passar de **1% do peso por semana** (já existe em `app/peso.js`). Para quem pesa [peso], 1% = 1,2 kg, abaixo do limite de 1,5 kg/semana da literatura | M | Weinsier 1995 (risco cresce muito acima de 1,5 kg/semana) | Não (é só aviso para levar ao médico) |
| R2 | Não comer pouco demais | Dia planejado nunca abaixo de 1.200 kcal (já existe). **Novo aviso**: se o registrado ficar abaixo de 800 kcal por 3 dias seguidos, "fale com o médico" (800 kcal é a faixa das dietas de muito baixa caloria em que os estudos de pedra foram feitos) | M | Gebhard 1996; Festi 1998; NIDDK | Sim (o número de dias) |
| R3 | Gordura mínima | Café, almoço e jantar com **pelo menos 7 a 10 g de gordura** cada; **pelo menos uma refeição do dia com 10 g ou mais**; dia com **30 g ou mais** (dia de enjoo: pelo menos 15 a 20 g) | M | Gebhard 1996 (refeição com 10 g esvazia a vesícula ao máximo; 30 g/dia: 0 de 7 com pedra; menos de 2 g/dia: 4 de 6); Festi 1998 (12,2 g/dia: 0 de 11; 3 g/dia: 6 de 11); Stokes 2014 (meta-análise: dieta com mais gordura reduziu pedra, RR 0,09, intervalo largo) | Sim |
| R4 | Gordura máxima por refeição | **Até 15 g por refeição como alvo e 20 g como teto**; azeite **até 1 colher de sopa (8 a 10 g) por refeição**; gordura do dia entre **25% e 35% da energia** | P | Não há estudo que dê um teto por refeição. Base: refeição pesada pode disparar cólica (Manual MSD); a tirzepatida atrasa o esvaziamento do estômago e refeição gordurosa piora enjoo e refluxo (já no guia do app). Faixa de 20 a 35% das DRIs já usada no app | Sim |
| R5 | Tamanho da refeição | **Até cerca de 500 kcal por refeição** | P | Mesmo motivo de R4 (refeição grande dispara cólica; apetite baixo com o remédio) | Sim |
| R6 | Fritura | **Zero** no cardápio. Preparo grelhado, assado, cozido, no vapor, refogado com pouco óleo | P | NIDDK ("evite gorduras como as de sobremesas e frituras"); prática | Não |
| R7 | Horários | 3 refeições principais e 1 ou 2 lanches, **a cada 3 a 4 horas**; **não pular o café da manhã**; jejum da noite **até 12 horas** | P (observacional) | NIDDK (três refeições em intervalos regulares, citado por hospital); estudo de 1991 com mulheres (jejum noturno longo e mais internação por pedra); NHANES 2017–2020 (pular café associado a mais pedra, transversal); o guia do app já fala em 3 ou 4 horas | Não |
| R8 | Açúcar adicionado | Cardápio com **0 g**. Aviso educativo: abaixo de **10% da energia** (cerca de 40 g num dia de 1.600 kcal), e menos de 5% (cerca de 20 g) é melhor. **Bebida açucarada: nenhuma** (refrigerante, suco de caixinha, chá pronto). Suco natural conta como açúcar livre | F (bebida açucarada no fígado); F (OMS, menos de 10%) | EASL-EASD-EASO 2024 (evitar bebida açucarada, LoE 2, forte); Diretriz brasileira 2023 rec. 31; OMS 2015 | Não |
| R9 | Ultraprocessados | Cardápio sem ultraprocessados (embutidos, biscoito recheado, salgadinho, congelado pronto, margarina) | F | EASL-EASD-EASO 2024 (limitar ultraprocessados, LoE 2, forte); Diretriz brasileira 2023 rec. 32 | Não |
| R10 | Tipo de gordura | Preferir azeite, peixe, castanhas e sementes; laticínio desnatado ou semidesnatado quando a gordura do dia passar de 30%. O app **não mede gordura saturada** hoje | F para o padrão; P para o detalhe | EASL 2024 (padrão mediterrâneo; ultraprocessados "ricos em açúcar e gordura saturada"); AASLD 2023 (gordura insaturada, menos saturada, segundo resumo); NIDDK (azeite e óleo de peixe) | Não |
| R11 | Peixe | 2 ou mais vezes por semana (o cardápio tem sardinha, tilápia, atum, salmão, merluza: 5) | F para o padrão | EASL 2024 (mediterrânea) | Não |
| R12 | Fibra | **25 g ou mais por dia** (meta já no app), subindo aos poucos | M | Diretrizes de fígado (resumo AASLD 2023: dieta rica em fibra); NIDDK (vesícula); estudo de 1991 (fibra, efeito pequeno) | Não |
| R13 | Álcool | O app **não inclui** álcool e diz: "não existe quantidade segura estabelecida para quem tem gordura no fígado" | F | EASL 2024 (desaconselhar álcool, LoE 3, forte); Diretriz brasileira 2023 rec. 34 | Não |
| R14 | Café | Pode aparecer como **opção** (1 a 3 xícaras por dia, sem açúcar), nunca como meta | M (observacional) | Diretriz brasileira 2023 rec. 33 (IIb); EASL 2024 (associação, LoE 4); meta-análise 2015 (menos pedra com mais café). Atenção: café também contrai a vesícula; quem sente cólica depois do café observa e conta ao médico | Sim, para virar texto |
| R15 | Metas de perda | Mostrar marcos de **5%, 7 a 10% e 10%** do peso inicial (calculados do perfil, sem gravar o peso dela no código) com o que cada um faz no fígado | F | EASL 2024 (LoE 2, forte); Diretriz brasileira 2023 rec. 22 (mais de 7%) | Não |
| R16 | Atividade | 150 min/semana de atividade moderada (ou 75 vigorosa) e força 3 vezes por semana (já no app) | F | EASL 2024 (LoE 1, forte); Diretriz brasileira 2023 rec. 24 (I, A) | Não |
| R17 | O que o app não faz | Não indica ácido ursodesoxicólico, suplemento nem dieta de muito baixa caloria; não decide a data da cirurgia | — | Regra 9 do briefing | — |

## 1. Ritmo de perda de peso

- **Fato**: o risco de formar pedra cresce de forma curva com a velocidade de perda e dispara acima de **1,5 kg por semana**; os autores sugerem não passar dessa média. O dado vem de dietas de muito baixa caloria, em pessoas sem pedra no início. Fonte: Weinsier RL et al., Am J Med 1995 — https://pubmed.ncbi.nlm.nih.gov/7847427/
- **Fato**: remédios do grupo GLP-1 aumentam doença de vesícula e vias biliares (risco relativo 1,37; 2,29 nos estudos de obesidade); dose maior e uso mais longo pesam. He L et al., JAMA Intern Med 2022 — https://pubmed.ncbi.nlm.nih.gov/35344001/ (números já levantados em `pesquisa-literatura.md`).
- **Fato**: bula americana do Mounjaro, seção 5.8: nos estudos controlados, doença aguda da vesícula (pedra, cólica, retirada da vesícula) em 0,6% com tirzepatida e 0% com placebo; "se houver suspeita de pedra, exames da vesícula e acompanhamento". Seção 5.2: pancreatite, com "dor abdominal persistente ou forte (às vezes indo para as costas)". https://pi.lilly.com/us/mounjaro-uspi.pdf (texto extraído e conferido nesta pesquisa). Bula do Zepbound: pedra 1,1% contra 1,0%, colecistite 0,7% contra 0,2%, "eventos agudos da vesícula foram associados à redução de peso" — https://pi.lilly.com/us/zepbound-uspi.pdf (conferido em `pesquisa-literatura.md`).
- **Risco específico dela**: ela já tem pedra. Nessa situação o risco principal não é só formar pedra nova; é a pedra que já existe causar cólica, colecistite, pedra no canal (coledocolitíase) ou pancreatite. Não achei estudo que dê um ritmo "seguro" para quem já tem pedra e usa tirzepatida. O limite de 1,5 kg/semana é a referência disponível, extrapolada.
- **Opção que o app já usa**: aviso acima de 1% do peso por semana, na média de 2 a 4 semanas (a primeira semana é água). Para ela isso é mais conservador que 1,5 kg. Na média dos estudos de tirzepatida a perda foi de cerca de 0,6 kg/semana nas primeiras 36 semanas (conta em `pesquisa-literatura.md`).
- **O que fazer se passar**: o app só mostra o número e encaminha: "É um assunto para levar ao seu médico. Se tiver dor na barriga, veja os sinais de alerta." Não sugerir comer mais, mudar dose nem tomar remédio por conta. Quem decide se segura o aumento de dose, se pede ultrassom ou se indica ácido ursodesoxicólico é o médico.
- **Fato, não indicação**: o ácido ursodesoxicólico reduziu a formação de pedra durante perda de peso (RR 0,33, 13 estudos; Stokes 2014 — https://pubmed.ncbi.nlm.nih.gov/24321208/); a diretriz europeia de 2016 diz que ele pode reduzir o risco em perda rápida e tem valor limitado para dissolver pedra que já existe (EASL 2016 — https://easl.eu/wp-content/uploads/2016/10/EASL-CPG-Gallstones.pdf). Isso é decisão médica; o app não menciona como opção de tratamento.

## 2. Gordura na dieta e a vesícula

- **Fato (estudos pequenos)**: com 520 kcal e menos de 2 g de gordura por dia, a vesícula esvaziou 35%; uma refeição com 10 g de gordura esvaziou ao máximo (66%). Pedra em 4 de 6 com quase zero de gordura e em 0 de 7 com 900 kcal e 30 g de gordura por dia; o estudo foi interrompido por razão ética. Gebhard RL et al., Hepatology 1996 — https://read.qxmd.com/doi/10.1002/hep.510240313
- **Fato (estudo pequeno)**: duas dietas de muito baixa caloria, 3 g contra 12,2 g de gordura por dia: pedra em 6 de 11 contra 0 de 11. Festi D et al., Int J Obes 1998 — https://www.nature.com/articles/0800634
- **Fato (meta-análise)**: dietas com mais gordura reduziram pedra em quem perdia peso (RR 0,09; intervalo de confiança muito largo, 0,01 a 0,61). Stokes 2014, acima.
- **Leitura**: há evidência de que **um mínimo de gordura por refeição** mantém a vesícula esvaziando, e o número mais citado é cerca de **10 g numa refeição**. É evidência de estudos pequenos, em dietas muito mais restritas do que o cardápio do app. Não há número validado de "gordura mínima por refeição" para cada refeição do dia.
- **Para a cólica**: o Manual MSD diz que uma refeição pesada pode disparar a cólica, mas gordura não é causa específica, e gases, estufamento e enjoo não são sintomas específicos de vesícula — https://www.msdmanuals.com/en-in/professional/hepatic-and-biliary-disorders/gallbladder-and-bile-duct-disorders/cholelithiasis . Fontes de divulgação (Harvard Health) dizem que as crises são comuns depois de refeição gordurosa e depois de quebrar jejum com refeição muito grande — https://www.health.harvard.edu/a-to-z/biliary-colic-a-to-z (página não aberta, só o trecho da busca).
- **Alimentos que costumam desencadear cólica (prática, não evidência)**: fritura (pastel, coxinha, batata frita, salgado de padaria), feijoada e carnes gordas (cupim, costela, linguiça, bacon, torresmo), embutidos, molhos cremosos e com maionese, pizza, queijos amarelos em quantidade, doces com creme e chocolate, e qualquer refeição muito grande, sobretudo depois de muitas horas sem comer.
- **Síntese**: nem gordura quase zero (vesícula parada) nem refeição gordurosa e grande (cólica). Gordura moderada e espalhada pelo dia, de preferência azeite, peixe e castanhas. Números em R3 e R4.

## 3. O que reduz gordura no fígado

| Fator | O que diz | Força | Fonte |
|---|---|---|---|
| Perda de peso | 5% ou mais reduz a gordura do fígado; 7 a 10% melhora a inflamação; 10% ou mais melhora a fibrose | Forte (LoE 2) | EASL-EASD-EASO 2024, resumo executivo, Diabetologia 2024;67:2375 — https://pmc.ncbi.nlm.nih.gov/articles/PMC11519095/ |
| Perda de peso (Brasil) | Mais de 7% para melhorar esteato-hepatite sem piorar fibrose (IIa, A) | Forte | Diretriz brasileira SBEM/SBH/Abeso, Arch Endocrinol Metab 2023;67(6), doi 10.20945/2359-4292-2023-0123 — https://scielo.br/j/aem/a/PxtCH9CkDfDcKKh8vN4kpLg/?lang=en |
| Padrão alimentar | Qualidade parecida com a mediterrânea (EASL, forte); mediterrânea melhora a esteatose mesmo sem perda de peso (Brasil, IIa, B) | Forte | as duas acima |
| Açúcar e frutose | Evitar bebida açucarada (EASL, forte); frutose em excesso, como açúcar livre e bebida açucarada, não recomendada (Brasil, rec. 31). Meta-análise: frutose em troca de outro carboidrato com as mesmas calorias não aumentou gordura do fígado; com calorias a mais aumentou — o efeito parece vir do excesso de energia | Forte para bebida açucarada; moderada para frutose isolada | Chiu S et al., Eur J Clin Nutr 2014;68:416 — https://pmc.ncbi.nlm.nih.gov/articles/PMC3975811 |
| Ultraprocessados | Limitar (EASL, forte); não recomendados (Brasil, rec. 32) | Forte | acima; Guia Alimentar para a População Brasileira (Ministério da Saúde, 2014) segue a mesma linha |
| Álcool | Desaconselhado (EASL, forte); parar de vez com fibrose avançada; não há quantidade segura estabelecida (Brasil, rec. 34) | Forte | acima |
| Café | Associado a menos lesão no fígado (EASL, LoE 4, sem recomendação); 1 a 3 xícaras por dia "podem ser consideradas" (Brasil, rec. 33, IIb) | Fraca a moderada | acima |
| Atividade física | Mais de 150 min/semana moderada ou 75 vigorosa (EASL, LoE 1, forte); aeróbico e força 3 vezes por semana (Brasil, I, A) | Forte | acima |
| Tirzepatida | A diretriz europeia diz que remédios do grupo GLP-1 não são, hoje, tratamento dirigido ao fígado, mas são seguros e se espera benefício com perda grande de peso. Estudos: redução relativa de até cerca de 47% na gordura do fígado em 52 semanas (SURPASS-3 MRI, diabetes tipo 2); resolução de esteato-hepatite em 44% a 62% contra 10% com placebo (SYNERGY-NASH, fase 2, NEJM 2024) | Moderada | https://investor.lilly.com/news-releases/news-release-details/lillys-tirzepatide-led-greater-improvements-liver-fat-content ; https://pubmed.ncbi.nlm.nih.gov/38856224/ |

Ligação com a cirurgia: em pessoas com obesidade, fígado grande e gorduroso atrapalha afastar o fígado na videolaparoscopia. Estudos pequenos com dieta de muito baixa caloria antes da colecistectomia mostraram cirurgia um pouco mais rápida e dissecção mais fácil; uma meta-análise de 2024 chama a evidência de limitada (https://pubmed.ncbi.nlm.nih.gov/38240381/ ; ensaio DOLCE, ISRCTN61630192 — https://www.isrctn.com/ISRCTN61630192). Isso explica, em termos gerais, por que o cirurgião pode condicionar a data à redução do fígado; a decisão e o critério são dele.

## 4. Caminhos de alimentação que o app pode oferecer como opções

Todos respeitam R1 a R17. O app explica o porquê, mostra prós e contras e ela escolhe; o cardápio de 7 dias continua como exemplo pronto.

### A. Mediterrânea do jeito brasileiro (padrão)
- **O que é**: feijão, arroz (de preferência integral), verduras e legumes em quase toda refeição, fruta inteira, peixe 2 ou mais vezes por semana, azeite como gordura principal, castanhas em pouca quantidade, iogurte e queijo branco; pouca carne vermelha e nada de embutido.
- **Prós**: é o padrão com evidência mais forte para o fígado, inclusive sem perda de peso; não é pobre em gordura, o que ajuda a vesícula a esvaziar; usa comida comum no Brasil.
- **Contras**: é fácil exagerar no azeite e nas castanhas (muita energia em pouco volume) e passar do teto por refeição.
- **Para quem**: ponto de partida para quase todo mundo.
- **No app**: é o cardápio atual com as correções da seção 7 (azeite com teto, gordura espalhada).
- **Fontes**: EASL-EASD-EASO 2024; Diretriz brasileira 2023 rec. 26.

### B. Prato dividido (montar sem pesar)
- **O que é**: metade do prato com verduras e legumes, um quarto com proteína (carne magra, frango, peixe, ovo), um quarto com arroz, feijão, batata ou mandioca; 1 colher de chá a 1 colher de sopa de azeite; a proteína primeiro.
- **Prós**: não exige balança nem receita; funciona em restaurante, na casa de parente e no trabalho; controla o tamanho da refeição (bom para a cólica).
- **Contras**: menos preciso para calorias e proteína; com pouco apetite, a metade de vegetais pode encher antes da proteína. Por isso "proteína primeiro".
- **Para quem**: quem não quer seguir cardápio fechado ou come fora com frequência.
- **No app**: uma tela com o desenho do prato e uma lista de trocas por grupo (o app já tem os grupos em `GRUPOS`, `app/nutricao.js`); no diário, marcar "comi um prato dividido" em vez dos itens.
- **Fontes**: método do prato da Associação Americana de Diabetes (https://diabetes.org/food-nutrition/diabetes-plate, link não aberto nesta pesquisa); Guia Alimentar para a População Brasileira (comida de verdade).

### C. Menos açúcar e menos farinha branca
- **O que é**: nenhuma bebida açucarada, doce no máximo de vez em quando, pão e massa de preferência integrais, fruta inteira em vez de suco, sem ultraprocessados.
- **Prós**: mira direto o que as diretrizes de fígado mais citam (bebida açucarada, ultraprocessados); simples de entender.
- **Contras**: se a pessoa corta carboidrato demais e compensa com carne gorda e queijo amarelo, a refeição fica muito gordurosa (ruim para a cólica). Não é dieta "low carb".
- **Para quem**: quem tem refrigerante, suco ou doce na rotina, ou tem diabetes ou pré-diabetes (ainda não sabemos se ela tem).
- **No app**: o mesmo cardápio (já sem açúcar adicionado) e um contador opcional de "bebida açucarada / doce" no diário, sem gramas.
- **Fontes**: EASL 2024; Diretriz brasileira 2023 rec. 31 e 32; OMS 2015 (https://www.ncbi.nlm.nih.gov/books/NBK285538/); Chiu 2014.

### D. Dieta pré-operatória de redução do fígado (só com a equipe dela)
- **O que é**: dieta de baixa caloria (800 a 1.200 kcal) por 2 a 4 semanas antes da cirurgia, às vezes com shakes, usada sobretudo antes de bariátrica para diminuir o volume do fígado (redução de 12% a 27% no volume em revisão sistemática).
- **Prós**: efeito rápido no tamanho do fígado; usada para facilitar a cirurgia.
- **Contras e riscos para ela**: é perda rápida, com risco de cólica e pedra nova em quem já tem pedra; com a tirzepatida tirando a fome, a proteína pode cair muito; abaixo de 800 kcal (dieta de muito baixa caloria) é a situação dos estudos de formação de pedra.
- **Para quem**: só quando o cirurgião ou o nutricionista indicar, com data e metas dadas por eles.
- **No app**: o app **não monta** essa dieta. Mostra o que ela é e, se a equipe indicar, ela digita as metas (o perfil já aceita `metaKcal` e `metaProt`, e meta do médico abaixo de 1.200 kcal já vira o piso). O aviso de ritmo continua ligado.
- **Fontes**: Revisão sistemática em Obes Surg 2021 (LCD de 800 a 1.200 kcal por 2 a 4 semanas preferível à VLCD) — https://pubmed.ncbi.nlm.nih.gov/33140292/ ; Obes Rev 2024 — https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11884969/ ; colecistectomia: https://pubmed.ncbi.nlm.nih.gov/38240381/

### E. Dia leve (já existe como "Dia de enjoo")
- Pouca gordura e refeições pequenas para os dias ruins. Para ela, manter pelo menos uma refeição com cerca de 10 g de gordura (o jantar atual tem 9,7 g) e não usar vários dias seguidos sem avisar o médico (R2).

## 6. Sinais de alerta para ela (texto proposto, coerente com `app/conteudo.js`)

O guia hoje só cobre a vesícula quando há **febre ou pele amarela**. Para quem já tem pedra falta a cólica sem febre, a dor que não passa e as fezes claras. Proposta (a divisão entre 192, pronto-socorro e consulta é da equipe e precisa de aval médico):

**Ligue 192 (SAMU) agora se:**
- Dor na barriga com febre alta e pele amarela **e** confusão, desmaio ou muita fraqueza.
- (Os itens que já estão no guia: alergia grave, desmaio, confusão que não passa.)

**Vá ao pronto-socorro hoje se:**
- Dor forte no alto da barriga, do lado direito ou na "boca do estômago", que **não passa em cerca de 6 horas**, ou volta várias vezes no mesmo dia.
- Essa dor com **febre ou calafrio** (pode ser vesícula inflamada).
- **Pele ou olhos amarelados**, urina escura como chá-mate ou refrigerante de cola, **fezes claras** (cor de massa de vidraceiro), coceira no corpo (pode ser pedra no canal da bile).
- Dor forte e contínua na barriga que vai para as costas, com ou sem vômito (pode ser pâncreas; pedra da vesícula é uma das causas).

**Fale com o médico nos próximos dias se:**
- Teve uma crise de dor no alto da barriga depois de comer que **passou sozinha** em algumas horas, sem febre e sem amarelão (pode ser cólica biliar). Anote quando foi e o que comeu.
- O app avisou que você está perdendo mais de 1% do peso por semana.
- Está comendo muito pouco há vários dias (abaixo de 800 kcal registradas).

Base: bula do Mounjaro 5.2 e 5.8 (acima); Manual MSD profissional (cólica atinge o máximo em 15 min a 1 h, dura em geral menos de 6 horas, às vezes até 12; mais de 12 horas, sobretudo com vômito ou febre, sugere colecistite ou pancreatite; febre e calafrio sugerem colecistite); Manual MSD versão para a família (icterícia, urina escura e fezes claras aparecem juntas na obstrução da saída da bile; a urina escura pode vir antes do amarelão) — https://www.msdmanuals.com/pt/casa/doen%C3%A7as-hep%C3%A1ticas-e-da-ves%C3%ADcula-biliar/dist%C3%BArbios-da-ves%C3%ADcula-biliar-e-dutos-biliares/c%C3%A1lculos-biliares (só trechos da busca; a página não abriu). O limite de "6 horas" para ir ao pronto-socorro é escolha conservadora da equipe a partir do MSD, não regra de diretriz.

Atenção de texto: "urina escura" já aparece no guia como sinal de desidratação. No item da vesícula, juntar com "pele amarela" e "fezes claras" evita confusão.

## 7. Conferência do cardápio atual

Como conferi: `node dados/conferir_cardapio.js` (porção base, soma por dia) e um script meu, só de leitura, fora do projeto, que carrega `alimentos.js`, `cardapio.js` e `nutricao.js` e calcula a gordura de cada refeição com a escala de um perfil igual ao dela (mulher adulta com obesidade, sedentária, sem restrições). Resultado da escala: meta de 1.650 kcal e 108 g de proteína; fator de proteína 0,75 e fator de energia 1,65 em todos os dias. O fator de energia multiplica carboidrato, leguminosa **e o grupo gordura** (azeite, linhaça, gergelim, castanhas).

### Gordura por refeição (g), cardápio escalado para esse perfil

| Dia | Café | Lanche manhã | Almoço | Lanche tarde | Jantar | Dia (g) | % da energia |
|---|---|---|---|---|---|---|---|
| Segunda | 11,1 | 12,8 | 17,7 | 12,3 | 11,6 | 65 | 36% |
| Terça | 12,4 | 9,5 | 16,2 | 7,1 | **18,6** | 64 | 37% |
| Quarta | 16,4 | 6,4 | 16,3 | 10,8 | 9,0 | 59 | 33% |
| Quinta | 9,0 | 8,7 | 13,7 | 10,0 | **20,1** | 61 | 30% |
| Sexta | 17,8 | 13,8 | 7,3 | 12,2 | 19,3 | 70 | **40%** |
| Sábado | 13,9 | 4,9 | **20,7** | 13,0 | 5,8 | 58 | 33% |
| Domingo | 18,8 | 12,0 | 14,9 | 10,8 | 5,0 | 61 | 31% |
| Dia de enjoo | 7,6 | 0,6 | 2,5 | 0,2 | 9,7 | 21 | 20% |

Na porção base (sem escala) a maior refeição tem 19,5 g (jantar de sexta) e o dia médio 56 g.

### O que está de acordo
- **Fritura**: nenhuma. Preparos grelhados, assados, cozidos; a tilápia já diz "sem fritura".
- **Açúcar adicionado**: nenhum item de açúcar, doce ou bebida açucarada; a vitamina de abacate diz "sem açúcar, ou com adoçante".
- **Ultraprocessados e embutidos**: nenhum (sardinha e atum em lata são conserva simples).
- **Gordura mínima**: nos 7 dias, todas as refeições principais têm 5 g ou mais e todo dia tem pelo menos uma refeição com 10 g ou mais. O dia de enjoo tem 21 g e o jantar com 9,7 g.
- **Peixe**: 5 vezes na semana. **Fibra**: média de 27 g na porção base. **Álcool**: nenhum.

### O que precisaria mudar (para a equipe de engenharia e de conteúdo; nada foi editado)
1. **Azeite escalado**: com fator 1,65 o azeite vai de 8 g para 13 g por refeição (mais de 1 colher de sopa). Opções: (a) tirar o grupo `gordura` do fator de energia em `fatorDoGrupo` (`app/nutricao.js`, linha 131) e pôr a energia que falta em carboidrato e leguminosa; (b) manter a escala mas com teto de 10 g de azeite por refeição; (c) teto de gordura por refeição (R4) como verificação no teste. A escolha é da engenharia; qualquer uma muda a soma da semana e precisa de teste.
2. **Refeições acima de 17 g** (escaladas): sábado almoço 20,7 g (lombo + 13 g de azeite), quinta jantar 20,1 g (atum em óleo + grão-de-bico + 13 g de azeite), sexta jantar 19,3 g (salmão + azeite), domingo café 18,8 g (2 ovos + queijo + 100 g de pão), terça jantar 18,6 g (espinafre **já refogado** + 13 g de azeite: gordura em dobro), sexta café 17,8 g (ovos + queijo + espinafre refogado), segunda almoço 17,7 g. Mudanças simples: azeite com teto; no jantar de terça tirar o azeite cru ou usar espinafre cozido sem óleo; no café de sexta e de domingo, ovo **ou** queijo, ou meio queijo; no jantar de sexta tirar o azeite (o salmão já tem gordura).
3. **Gordura do dia acima de 35% da energia**: sexta (40%), terça (37%), segunda (36%). Os ajustes do item 2 resolvem a maior parte.
4. **Refeições grandes** (acima de cerca de 500 kcal, R5): sábado almoço 629 kcal, domingo café 551 kcal (100 g de pão francês), segunda e terça almoço 543 e 542 kcal, quinta jantar 511 kcal. Para quem tem pedra e pouco apetite, pode valer passar parte para o lanche.
5. **Gordura saturada não é medida**: o app não tem o campo. Leite integral, iogurte integral e queijo minas frescal (20 g de gordura por 100 g) aparecem quase todo dia. Opções: acrescentar gordura saturada em `dados/gerar_alimentos.py` (a TACO tem a coluna) ou trocar parte para desnatado quando a gordura do dia passar de 30%.
6. **Dia de enjoo**: está dentro (21 g, jantar com 9,7 g), mas no limite. Se o app for sugerir vários dias leves seguidos, ligar ao aviso R2.
7. **Sinais de alerta**: acrescentar cólica sem febre, dor que não passa e fezes claras (seção 6).
8. **Referência da bula**: corrigir "5.7 (vesícula)" para "5.8" nos comentários de `app/conteudo.js` (linha 92, que também desloca 5.8 retinopatia → 5.7 e 5.9 aspiração → 5.10) e de `app/peso.js` (linha 108); e, no comentário do peso, citar a bula do Zepbound para a ligação entre perda de peso e vesícula.
9. **Horários**: o cardápio não tem horário. Se a visão do dia ganhar horários, usar intervalos de 3 a 4 horas (R7).

Observação lateral, fora do pedido: para esse perfil a escala reduz as fontes de proteína (fator 0,75) e aumenta carboidrato e gordura (1,65). Não conferi se a proteína média chega a 108 g depois das trocas; vale a engenharia olhar junto com o item 1.

## O que não foi feito ou não foi conferido
- Não abri o texto integral da diretriz europeia de 2024 (li o resumo executivo no PMC), nem o da AASLD 2023 (só resumos secundários: o que está atribuído a ela vem de resumo), nem a diretriz da SBH isolada (a brasileira citada é conjunta SBEM/SBH/Abeso, lida no SciELO até a parte das recomendações).
- Gebhard, Festi, Stokes, Weinsier e os estudos de jejum e café: só resumos.
- Páginas do Manual MSD em português, da Harvard e da ADA: não abriram ou não foram abertas; uso apenas trechos da busca e marquei isso.
- Não achei diretriz que dê teto de gordura por refeição, nem ritmo de perda específico para quem já tem pedra e usa tirzepatida.
- Não usei o emulador nem rodei o teste de ponta a ponta (não mexi no código).
