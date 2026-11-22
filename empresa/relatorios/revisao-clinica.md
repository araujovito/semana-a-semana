# Revisão clínica: completa (22/11/2026)

**Aviso:** esta revisão foi feita **sem profissional de saúde habilitado**. Quem escreve é um modelo de linguagem no papel de revisora: não é médica nem nutricionista e não tem registro profissional. O documento faz uma triagem para preparar a validação de um profissional e não substitui essa validação.

**Status:** completa para o que a direção pediu. Lidos em main (commit b985ed8): `app/conteudo.js`, `tratamento.js`, `perfil.js`, `hoje.js`, `consumo.js` (regras dos avisos), `peso.js`, `nutricao.js` (`metas()` e escala das porções), `cardapio.js`, `plano.js`, `treino.js` e `sintomas.js`. Rodei `dados/conferir_cardapio.js` e simulei `metas()` e o tamanho dos pratos para cinco perfis de exemplo, com o carregador dos testes e sem tocar no código. As fontes marcadas "conferida" foram abertas em 22/11. As outras estão marcadas "não conferida".

O que ainda falta:
- O texto oficial da bula brasileira no Bulário da Anvisa: o site não abriu por acesso automático. Conferi a bula americana (Lilly, PDF), o resumo europeu (EMA) e, para o Brasil, só fontes secundárias.
- O texto original da Febrasgo: confirmei a recomendação por matérias que citam o posicionamento de 03/07/2025, e não pela página da Febrasgo.
- O aviso de ritmo de perda de peso está no ramo `onda1-peso` e **não está em main**. Revisei o texto, mas ele não entra na entrega como está.

---

## Conclusão

1. **Dois pontos barram a entrega**, ambos só de texto (detalhes na seção "Barra a entrega"):
   - **B1.** Os sinais de alerta (`conteudo.js:91-102`) põem no mesmo nível uma emergência (alergia grave), um caso de pronto-socorro (pancreatite, desidratação) e algo que espera dias. Usam critério vago ("vômito que não para") e não incluem dois avisos da bula: intestino parado ou obstruído e perda súbita de visão num olho. Uma leiga pode demorar a ligar para o 192.
   - **B2.** O aviso de hipoglicemia (`tratamento.js:124` e `conteudo.js:97`) lista três sinais, mas não diz o que fazer na hora. Para quem usa insulina ou sulfonilureia, saber o que fazer é o que evita a hipoglicemia grave.
2. As regras de dose estão **corretas** e conferem com a bula: dose esquecida até 4 dias, pular depois de 4, 72 h entre doses, escalonamento, anticoncepcional, guarda de 21 dias para as canetas de uso único vendidas no Brasil e aviso antes de sedação.
3. As metas (`metas()`) estão **corretas** nos números de referência: Mifflin-St Jeor, déficit de 500, piso de 1.200 e 1.800 kcal, proteína de 1,2 a 1,6 g/kg e DRIs. Os pontos a discutir com uma nutricionista não barram a entrega: fibra fixa, carboidrato abaixo de 130 g e água fixa.
4. **Cardápio:** a simulação mostrou que, para mulheres mais pesadas, a escala dobra arroz, feijão e gordura. O almoço chega a cerca de 640 g e o dia a cerca de 1,9 kg de comida. Isso vai contra a saciedade precoce do remédio. Não barra, porque o guia manda parar ao primeiro sinal de estômago cheio, mas é o ponto mais importante depois dos dois que barram.
5. **Treino:** conservador e coerente com o documento conjunto de 2025. Faltam avisos de respiração e de chão. A frase de hipoglicemia no treino está correta.
6. **Gravidez e amamentação:** "não é usado na amamentação" é mais restritivo que a bula. É impreciso, mas não perigoso.

---

## BARRA A ENTREGA (pode causar dano)

### B1. Sinais de alerta sem grau de urgência e incompletos
**Onde:** `app/conteudo.js:91-102`. Também repetem o critério vago `app/hoje.js:41` e `app/sintomas.js:27`.
**Texto atual:** "Procurar atendimento sem esperar a consulta se aparecer:", seguido de uma lista única com alergia, pâncreas, vesícula, "Vômito ou diarreia que não param...", hipoglicemia, caroço no pescoço, visão, tristeza e gravidez.
**Classificação:** impreciso. Mistura graus de urgência e deixa de fora dois eventos da bula.
**Texto sugerido:**
> **Ligue 192 (SAMU) agora se:**
> • Inchaço no rosto, nos lábios ou na garganta, ou falta de ar.
> • Desmaio, ou confusão que não passa.
>
> **Vá ao pronto-socorro hoje se:**
> • Dor forte e contínua na barriga, que pode ir para as costas, com ou sem vômito.
> • Dor no alto da barriga, do lado direito, com febre ou com pele e olhos amarelados.
> • Barriga inchada e dura, sem fazer cocô nem soltar gases, com vômito.
> • Você vomita tudo o que bebe, mesmo água em goles pequenos, ou quase não urina e a urina está escura.
> • Perda de visão de repente em um olho, sem dor.
>
> **Fale com o médico nos próximos dias se:**
> • Caroço ou inchaço no pescoço, rouquidão que não passa ou dificuldade para engolir.
> • Mudança na visão, se você tem diabetes.
> • Suspeita de gravidez.
>
> **Tristeza intensa ou pensamentos de se machucar:** fale com o médico. Se precisar conversar agora, ligue 188 (CVV, 24 horas).

Em `hoje.js:41` e `sintomas.js:27`, trocar "Vômito que não para" por "Vomitar tudo o que bebe, mesmo água" e apontar para "Sinais de alerta do Guia".
**Fonte (conferida):** bula americana do Mounjaro, seções 5.2 (pancreatite: "persistent or severe abdominal pain (sometimes radiating to the back)"), 5.4 (anafilaxia e angioedema), 5.5 (lesão renal por desidratação), 5.8 (vesícula), 5.9 (NAION: "acute, painless decreased vision… in one eye") e 6.2 (íleo e obstrução intestinal no pós-comercialização): https://pi.lilly.com/us/mounjaro-uspi.pdf. A separação entre 192, PS e consulta é proposta minha, sem fonte formal, e precisa do aval de um médico. CVV 188: serviço nacional.

### B2. Hipoglicemia sem o que fazer
**Onde:** `app/tratamento.js:124` ("Sinais: tremor, suor frio, confusão.") e `app/conteudo.js:97`.
**Classificação:** impreciso e incompleto. A bula manda "educate them on the signs and symptoms of hypoglycemia". Para quem usa insulina ou sulfonilureia, a parte que protege é o que fazer na hora.
**Texto sugerido (tratamento.js:124, no lugar da linha "Sinais"):**
> Sinais: tremor, suor frio, coração acelerado, fome de repente, visão embaçada, confusão.
> Se tiver aparelho, meça. Se der abaixo de 70, ou se não tiver como medir, tome algo com açúcar que age rápido: 1 colher de sopa de açúcar na água ou meio copo de suco ou de refrigerante comum (não diet). Espere 15 minutos e meça de novo. Se continuar baixo, repita. Depois, avise o médico.
> Se a pessoa desmaiar ou não conseguir engolir, ligue 192 e não dê nada pela boca.

Em `conteudo.js:97`, tirar o item da lista de alerta e pôr uma linha: "Se você usa insulina ou glibenclamida, gliclazida ou glimepirida: veja o quadro Risco de hipoglicemia no alto do Guia". Ou repetir o texto acima.
**Observação:** isto é primeiro socorro padrão. Não é dose de remédio. Não diz quanto reduzir a insulina, o que continua sendo do médico.
**Fonte:** bula americana, 5.3 (conferida): https://pi.lilly.com/us/mounjaro-uspi.pdf. ADA, regra 15-15 (conferida pela página da ADA): https://professional.diabetes.org/sites/dpro/files/2025-05/hypoglycemia-hcp-5-27-25.pdf. ADA Standards of Care 2025, seção 6: https://pubmed.ncbi.nlm.nih.gov/39651981/.

---

## Ponto por ponto

Legenda: **C** correto · **I** impreciso · **E** errado · **SF** sem fonte.

### Guia (`app/conteudo.js`)
| Linha | Ponto | Nota | Fonte e sugestão |
|---|---|---|---|
| 53-54 | Como age (GIP/GLP-1, esvaziamento) | C | Bula EUA 12.2 (conferida). |
| 57-59 | 2,5 mg por 4 semanas, +2,5 mg com ≥4 semanas, máximo 15 mg | C | Bula EUA 2.1 (conferida). |
| 63-65 | Uma vez por semana, locais, 72 h para mudar o dia | C | Bula EUA 2.1/2.2 (conferida). |
| 69-71 | Até 4 dias aplicar, mais de 4 pular, sem dose dupla, "várias semanas" falar com o médico | C | Bula EUA 2.1; EMA 4.2 (conferidas): https://www.ema.europa.eu/en/documents/product-information/mounjaro-epar-product-information_en.pdf. A bula não define "várias semanas". O corte de 14 dias do código (`tratamento.js:12`) é SF, mas é conservador. |
| 74-76 | 2 a 8 °C, até 21 dias abaixo de 30 °C, "confira a bula" | C | Bula EUA 16.2: 21 dias vale para a caneta de uso único. No Brasil a embalagem é de 4 canetas preenchidas de 0,5 ml (fontes secundárias, ex.: https://www.panvel.com/panvel/mounjaro-25mg-tirzepatida-05ml-4-canetas-injetaveis-geladeira/89179/bula). Se um dia vier a KwikPen, o prazo é outro (30 dias). O "confira" cobre isso. |
| 79-82 | Enjoo: refeições pequenas a cada 3-4 h, devagar, evitar gordura, gengibre/hortelã | C | Documento conjunto 2025 (conferido): https://pmc.ncbi.nlm.nih.gov/articles/PMC12125019/. |
| 81 | "Comida fria ou em temperatura ambiente tem menos cheiro" | SF | Não está no documento de 2025. Prática comum. Pode ficar como dica, sem atribuir à fonte. |
| 81 | Falta "evitar comida com muita fibra nos primeiros dias" | I | O documento de 2025 diz "avoiding fatty or high fiber foods during the first few days". Sugestão: "Nos primeiros dias depois da aplicação, evitar fritura, comida gordurosa, refeição grande e muita fibra de uma vez (feijão, linhaça, repolho)." |
| 87 | Intestino preso; magnésio, fibra ou laxante pelo médico | C | Documento 2025. Não prescreve. |
| 88 | "soro caseiro" | I | Sugestão: "água, água de coco ou soro de reidratação oral da farmácia". O soro caseiro feito errado pode ter sal ou açúcar demais. SF formal (Ministério da Saúde não conferido). |
| 91-102 | Sinais de alerta | I, **barra** | Ver B1. |
| 97 | Hipoglicemia | I, **barra** | Ver B2. |
| 104-105 | Pílula: barreira por 4 semanas no início e a cada aumento, ou método não oral; Febrasgo | C | Bula EUA 7.2/8.3 (conferida). Febrasgo, posicionamento de 03/07/2025 (conferido só por matérias, ex.: https://portal.afya.com.br/endocrinologia/tirzepatida-e-anticoncepcionais-orais-novas-recomendacoes). |
| 106 | "não é usado na gravidez nem na amamentação" | I | Gravidez: correto. Amamentação: a EMA diz "could be considered for use during breast-feeding" e a bula EUA manda pesar benefício e risco. Sugestão: "Na gravidez, o remédio não é usado. Quem planeja engravidar para o remédio pelo menos 1 mês antes, combinado com o médico. Na amamentação, quem decide é o médico." Fonte: EMA 4.6 (conferida); Febrasgo, 1 mês (matérias). Repetir em `perfil.js:19`. |
| 109 | Abaixo de cerca de 1.200 kcal fica difícil atingir micronutrientes | C | Documento 2025 ("<1200 kcal/d for females"). |
| 110 | 1,2 a 1,6 g/kg ou 80 a 120 g/dia | C | Documento 2025 (as duas faixas aparecem). Acrescentar "por kg de peso ajustado, que o app calcula" e "Se você tem doença nos rins, a meta de proteína é do médico". |
| 112 | O remédio reduz a sede | SF | Não achei na bula. Sugestão: "Com menos fome, muita gente bebe menos também. A meta de água do app serve de lembrete." |
| 116-117 | Força ≥3 vezes por semana e 150 min de aeróbico | C | Documento 2025 ("at least 3 times weekly"). |
| 121-124 | Micronutrientes, suplemento é do médico | C | Documento 2025; DRIs. |
| 127 | Avisar antes de sedação ou anestesia | C | Bula EUA 5.10 (conferida). Pode acrescentar: "Diga também se estiver com enjoo, vômito ou barriga estufada nos dias antes." |
| 139 | "a maior parte das pessoas recupera peso quando para" | C | SURMOUNT-4 (JAMA 2024): com placebo, +14% de peso em 52 semanas; só 16,6% mantiveram 80% da perda: https://jamanetwork.com/journals/jama/fullarticle/2812936 (conferida pelo resumo). |
| 130-136 | Perguntas ao médico | C | Pode acrescentar: "Tenho ou tive pancreatite, pedra na vesícula, doença nos rins, retinopatia, ou há na família câncer medular de tireoide (NEM2)?" Fonte: bula EUA 4 e 5 (conferida). |
| 143-148 | De onde vêm | C | Acrescentar "ADA" (hipoglicemia) se B2 entrar. |

### Treino (`app/conteudo.js:2-48`, `app/treino.js`)
| Linha | Ponto | Nota | Fonte e sugestão |
|---|---|---|---|
| 4-6 | Fases por "repetições de sobra" (2-3 séries, progressão quando sobra) | C | Prática de treino para iniciantes (ACSM). SF específica conferida, mas é conservador. |
| 9-12 | 3 vezes por semana alternado, descanso de 60-90 s, aquecimento, caminhada até 150 min | C | Documento 2025. |
| 13 | Comer 1-2 h antes; jejum aumenta tontura | SF | Prudente. Sem fonte específica. |
| 14 | "No dia da aplicação ou em dia de enjoo" | I | O enjoo costuma vir nos dias seguintes (`conteudo.js:79`). Sugestão: "Nos dias de enjoo ou logo depois da aplicação, vale fazer só a caminhada ou reduzir a carga." |
| 15 | Parar com dor no peito, falta de ar, tontura forte | C | — |
| falta | Respiração e chão | I | Acrescentar: "Solte o ar no esforço e não prenda a respiração, principalmente na prancha." "Se descer e subir do chão for difícil, faça a ponte e o perdigueiro na cama firme." SF formal (ACSM não conferido). |
| treino.js:23 | Coração, articulações, coluna: falar com o médico | C | Pode acrescentar "pressão alta sem controle". |
| tratamento.js:122 | "Exercício também baixa o açúcar no sangue: tenha algo doce por perto" | C | ADA Standards, seção 5 (não conferida nesta rodada); bula 5.3. |

### Textos novos de 22/11
| Arquivo:linha | Ponto | Nota | Fonte e sugestão |
|---|---|---|---|
| tratamento.js:5-13, 55-65 | Regras: 4 dias, pular de 5 a 6, 72 h, >14 dias = médico | C | Bula EUA 2.1. O corte de 14 dias é SF, mas conservador. |
| tratamento.js:98-100 | "Depois de várias semanas sem aplicar, fale com o médico… pode ser preciso recomeçar numa dose menor" | C | A bula não traz isso. A frase é prudente e não dá dose. |
| tratamento.js:106, 108 | Textos de atrasada e pular | C | Bula EUA 2.1. |
| tratamento.js:164, 166 | Salto de dose e 72 h | C | Bula EUA 2.1. |
| tratamento.js:124 | Hipoglicemia | I, **barra** | Ver B2. |
| perfil.js:10-14 | Tela de entrada (<18, gravidez/amamentação, transtorno alimentar) | C | Pode acrescentar: "tem ou teve câncer medular de tireoide (ou alguém na família), NEM2 ou pancreatite". Fonte: bula EUA 4 e 5.2. |
| perfil.js:19 | Gravidez e amamentação | I | Mesmo ajuste de `conteudo.js:106`. |
| perfil.js:25 | Acima de 65: mais perda de músculo, combinar energia e proteína | C | PROT-AGE (Bauer, JAMDA 2013): 1,0-1,2 g/kg em idosos saudáveis, mais na doença. A faixa do app (1,2-1,6) fica dentro ou acima. Link não conferido: https://pubmed.ncbi.nlm.nih.gov/23867520/ |
| perfil.js:30 | IMC <18,5, sem redução de calorias | C | Classificação de IMC da OMS. |
| perfil.js:133 | Recusa de menores de 18 | C | — |
| perfil.js:137, 155-156 | Meta <1.200 aceita só com confirmação; mínimo de 800 | C | Documento 2025 (piso). Abaixo de 800 o app recusa, o que está certo. |
| perfil.js:86 | "acima do IMC 25 o peso real superestima a necessidade" | C | Documento 2025 diz que o peso real "can overestimate needs" e que não há consenso sobre qual peso usar. |
| hoje.js:35-41 | Cartão "Assunto para o médico" (3 dias de enjoo, vômito em 2 dias, <800 kcal em 3 dias) | C | Os limites são decisão de engenharia (SF), mas neutros. Ajustar o critério de vômito como em B1. |
| sintomas.js:7 | Título "Como ela está" | — | Não é clínico, mas fala em terceira pessoa: "Como você está". |
| peso.js (main) | Não há texto de ritmo de perda | — | O aviso está só em `onda1-peso:app/peso.js:112` ("Perda rápida aumenta a perda de músculo"): SF. Se entrar, sugestão: "Você perdeu em média X% do peso por semana. Perder peso rápido aumenta a chance de pedra na vesícula. É um assunto para a próxima consulta." Fonte: bula EUA 5.8 (vesícula). |

### Metas (`app/nutricao.js:215-254`)
| Ponto | Nota | Comentário |
|---|---|---|
| Mifflin-St Jeor (`:219`) | C | Fórmula certa (−161 mulher, +5 homem). |
| Fatores de atividade 1,2 / 1,375 / 1,55 | C | Valores usuais. |
| Déficit de 500 (`:226`), sem déficit com IMC <25 ou gravidez | C | Prática padrão. O limite de segurança está correto. |
| Piso de 1.200 e 1.800 (`:221`) | C | Documento 2025. |
| Proteína 1,4 × peso ajustado (IMC 25 + 25% do excesso) (`:231-232`) | C | Dentro de 1,2-1,6 g/kg. Na simulação, de 93 a 132 g, perto dos 80-120 g do documento. |
| Gordura 30%, carboidrato resto (`:234-235`) | I | Com 1.250 kcal, o carboidrato sobra em 125 g, abaixo da RDA de 130 g. Avisar ou pedir aval de nutricionista. |
| Fibra 25 / 21 g fixa (`:243`) | I | É a AI da DRI para a idade, mas a base dela é 14 g por 1.000 kcal (cerca de 17 g com 1.200 kcal). No começo do remédio, muita fibra piora o desconforto. Sugestão de texto: "Suba a fibra aos poucos." |
| Água 2.000 ml fixa (`:244`) | I | Sugestão de texto: "Em dia de calor, de treino, de vômito ou de diarreia, beba mais. O médico pode definir outro valor." |
| Micronutrientes (`:247-252`) | C | Conferem com as DRIs para mulheres (Ca 1.000/1.200, Fe 18/8, Mg 310/320, Zn 8, K 2.600, A 700, C 75, D 15/20, E 15, K 90, B12 2,4, folato 400, B1 1,1). |

### Cardápio (`app/cardapio.js`, `dados/conferir_cardapio.js`)
- **Base:** média de 1.435 kcal, 112 g de proteína e 1.437 g de comida por dia. Ferro em 49%, vitamina D em 47% e vitamina E em 50% da meta. O guia já diz isso (`conteudo.js:122`).
- **I. Volume com a escala:** na simulação, uma mulher de 130 kg e 165 cm teria meta de 1.850 kcal e fator de energia 2. O almoço de segunda teria arroz 150 g e feijão 160 g, a maior refeição 641 g e o dia até 1.914 g. Uma mulher de 160 kg chega ao teto (plano de 1.935 kcal para meta de 2.700). Com saciedade precoce, é muito volume por prato. Sugestões: na tela Plano, "Se o prato não couber, coma primeiro a proteína e guarde o resto para um lanche"; no código (decisão da engenharia), limitar o fator por refeição ou distribuir o excesso em lanches.
- **I. Fibra e brássicas:** linhaça, aveia e feijão quase todo dia; brócolis, couve-flor e repolho. Ver a sugestão de `conteudo.js:81`.
- **Gordura:** está moderada. Os pratos de sardinha e salmão são os mais gordos, mas é gordura boa e a porção não é grande. Não há fritura. **C.**
- **I. Dia de enjoo (`cardapio.js:55-61`):** 1.003 kcal e 67 g de proteína. Faz sentido para um ou dois dias. Canja "bem cozida" e ovo mexido têm cheiro forte. Sugestão: "Pode comer morna ou em temperatura ambiente; quente tem mais cheiro." No jantar, oferecer ovo cozido frio ou frango desfiado frio. Em `plano.js:62`, acrescentar: "Hoje, beber vale mais que comer: goles pequenos de água, água de coco ou soro da farmácia ao longo do dia."
- **Segurança para quem toma tirzepatida:** nenhum alimento contraindicado. O whey fica fora das trocas (`nutricao.js:64`), o que está certo.

---

## O que só um profissional de verdade deve validar antes de ela usar
- A separação entre 192, PS e consulta em B1, e os critérios sem números de horas.
- O texto de primeiro socorro da hipoglicemia (B2), se ela tiver diabetes.
- A meta de proteína e o piso de energia no caso dela, principalmente se houver doença renal, diabetes ou uso de insulina.
- O volume por refeição nas primeiras semanas, e se ela pode seguir o cardápio (alergias, intolerâncias).
- A liberação para o treino, se houver doença cardiovascular ou articular, e os remédios que ela já usa (interações).

## Fontes abertas nesta rodada
- Bula americana do Mounjaro (Lilly): https://pi.lilly.com/us/mounjaro-uspi.pdf
- Resumo europeu (EMA): https://www.ema.europa.eu/en/documents/product-information/mounjaro-epar-product-information_en.pdf
- Documento conjunto 2025 (ACLM/ASN/OMA/TOS): https://pmc.ncbi.nlm.nih.gov/articles/PMC12125019/
- SURMOUNT-4: https://jamanetwork.com/journals/jama/fullarticle/2812936
- ADA, hipoglicemia (regra 15-15): https://professional.diabetes.org/sites/dpro/files/2025-05/hypoglycemia-hcp-5-27-25.pdf · ADA Standards 2025, seção 6: https://pubmed.ncbi.nlm.nih.gov/39651981/
- Febrasgo 03/07/2025, por fonte secundária: https://portal.afya.com.br/endocrinologia/tirzepatida-e-anticoncepcionais-orais-novas-recomendacoes
- Lilly Medical Brasil (página da bula, sem o texto): https://medical.lilly.com/br/products/respostas/bula-profissional-de-sa-de-271557

Os arquivos baixados (PDFs) ficaram fora do projeto, na pasta temporária da sessão. Nenhum foi executado.
