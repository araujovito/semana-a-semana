# Revisão clínica da onda 2 (22/11/2026)

**Aviso:** esta revisão foi feita **sem profissional de saúde habilitado**. Quem escreve é um modelo de linguagem no papel de revisora. Não é médica nem nutricionista e não tem registro profissional. O documento faz uma triagem para preparar a validação do médico e da nutricionista dela. Não substitui essa validação.

**O que li:** em main, `git diff a74bc53..main` de `app/perfil.js`, `app/conteudo.js`, `app/peso.js`, `app/plano.js`, `app/hoje.js`, `app/cardapio.js` (REGRAS_CARDAPIO), `app/caminhos.js` (inteiro), os textos de `app/semana.js` e de `app/painel.js`, e o texto visível de `.copias/o2-visual/prototipo/{hoje,caminhos,painel,semana}.html`. Não abri os PDFs pessoais da raiz. Não editei nada no código, não fiz commit, não usei o emulador e não rodei testes.

**Fontes conferidas hoje (abertas em 22/11):**
- bula americana do Mounjaro (PDF da Lilly, texto extraído): seção 5.8;
- bula americana do Zepbound: seção 5.4 (vesícula);
- NIDDK, "Symptoms & Causes of Gallstones";
- Manual MSD profissional, "Cholelithiasis";
- EASL-EASD-EASO 2024, resumo executivo no PMC;
- Diretriz SBEM/SBH/Abeso 2023 no SciELO, recomendações 22, 24, 26 e 31 a 34.

Os estudos de Gebhard, Festi, Stokes e Weinsier e o método do prato da ADA **não** foram reabertos: uso o que diz `pesquisa-vesicula-figado.md`.

Legenda: **C** correto · **I** impreciso · **E** errado · **SF** sem fonte.

---

## Conclusão

1. **Dois pontos barram a entrega.**
   - **B1. Os critérios da crise de vesícula fazem esperar mais do que a fonte manda.** Estão em `conteudo.js:107,109,115` e `perfil.js:87-88`.
     - O app manda ao pronto-socorro só se a dor "não passa em cerca de 6 horas".
     - Uma crise que "passou sozinha em algumas horas" fica para "os próximos dias".
     - O NIDDK manda procurar médico **na hora** nestes casos, durante ou depois da crise: dor que dura algumas horas ("several hours"), **enjoo e vômito**, **qualquer febre, mesmo baixa**, ou calafrio, pele amarela, urina cor de chá ou fezes claras.
     - O Manual MSD diz que a dor da cólica costuma ser forte o bastante para levar ao pronto-socorro. Os "menos de 6 horas" do MSD descrevem quanto a cólica costuma durar. Não são um prazo de espera.
     - "Pele amarela, **com** urina escura **e** fezes claras" pode ser lido como se fossem precisos os três sinais juntos.
     - Para quem já tem pedra e usa tirzepatida (risco de pancreatite na bula), isso pode atrasar o atendimento.
   - **B2. O protótipo repete "pouca gordura" como regra da vesícula.** Estão em `hoje.html:307,308,341` e `caminhos.html:253`. A própria pesquisa da equipe e as regras do app (R3) dizem o contrário: refeição com gordura quase zero deixa a vesícula parada e favorece pedra nova durante a perda de peso. O que protege é **gordura moderada**, nem muita de uma vez nem quase nenhuma. Se esse texto entrar no app como está, ele ensina o oposto do que o cardápio faz.
2. **O que está correto e confere com a fonte:**
   - o cartão do fígado: 5%, 7 a 10% e 10% ou mais, bebida açucarada, ultraprocessados, álcool e 150 min de atividade;
   - o aviso de ritmo de peso, com a fonte já corrigida para o Zepbound;
   - a frase da bula sobre vesícula no cartão;
   - os números de proteína do painel;
   - os textos da visão semanal, que só repetem o que ela registrou.
3. **Dez pontos imprecisos se corrigem só com texto** (tabela abaixo). Os mais importantes:
   - o protótipo diz "pouco álcool" (para gordura no fígado, o próprio app diz "não beber");
   - o protótipo cita a fonte errada no ritmo de peso ("bula do Mounjaro (Anvisa)");
   - o protótipo escreve "sem sinal de alerta" no resumo para a consulta, o que pode tranquilizar sem base;
   - o protótipo diz que "o cardápio segue o caminho escolhido", o que contraria a decisão de 22/11 (o cardápio é o plano da nutricionista);
   - a frase da cirurgia liga as marcas de 7 a 10% à data da cirurgia, o que é critério do cirurgião.
4. **Precisam do aval do médico ou da nutricionista dela:** a lista está na última seção. Os pontos centrais são todos os números de gordura e de kcal por refeição (força P ou M), a divisão entre 192, pronto-socorro e médico, e o caminho D.

---

## BARRA A ENTREGA (pode causar dano)

### B1. Crise de vesícula: prazo de 6 horas e "próximos dias"

**Onde e texto atual:**
- `app/conteudo.js:107`: "Dor forte no alto da barriga, do lado direito ou na boca do estômago, que não passa em cerca de 6 horas, ou que volta várias vezes no mesmo dia (pode ser vesícula)."
- `app/conteudo.js:108`: "Essa dor com febre ou calafrio (pode ser vesícula inflamada)."
- `app/conteudo.js:109`: "Pele ou olhos amarelados, com urina escura como chá-mate e fezes claras (pode ser pedra no canal da bile)."
- `app/conteudo.js:115`: "Teve uma crise de dor no alto da barriga, depois de comer, que passou sozinha em algumas horas, sem febre e sem pele amarela (pode ser cólica da vesícula). Anote quando foi e o que comeu."
- `app/perfil.js:87`: "Pronto-socorro hoje se a dor não passar em cerca de 6 horas ou voltar várias vezes no mesmo dia, se vier com febre ou calafrio, ou se aparecer pele ou olhos amarelados, urina escura e fezes claras. […]"
- `app/perfil.js:88`: "[…] Avise o médico nos próximos dias se teve uma crise que passou sozinha, sem febre e sem pele amarela."

**Classificação:** I, com risco de atraso. O prazo de 6 horas vem da duração típica da cólica no MSD ("usually < 6 hours, but occasionally up to 12"). O comentário do próprio código diz que é "escolha conservadora da equipe". Mas isso não é conservador: o NIDDK manda ver um médico na hora com dor de algumas horas, enjoo e vômito, ou qualquer febre. Faltam também enjoo e vômito durante a crise.

**Texto sugerido para `conteudo.js:107-109`:**
> • Dor forte no alto da barriga, do lado direito ou na boca do estômago, que dura mais de 1 ou 2 horas, ou que vem com enjoo e vômito. Se a dor for muito forte, não espere: vá logo.
> • Essa dor com febre, mesmo baixa, ou calafrio (pode ser vesícula inflamada).
> • Pele ou olhos amarelados. Ou urina escura como chá-mate, ou fezes claras (pode ser pedra no canal da bile).

**Para `conteudo.js:115`** (o item fica em "Fale com o médico", mas o prazo encurta):
> • Teve uma dor no alto da barriga que passou sozinha em menos de 1 ou 2 horas, sem febre, sem vômito e sem pele amarela: avise o médico no mesmo dia ou no dia seguinte. Depois de uma crise, outras costumam vir. Anote quando foi e o que comeu.

**Para `perfil.js:87-88`:** usar a mesma lista. Sugestão curta:
> **Pronto-socorro** se a dor durar mais de 1 ou 2 horas, vier com enjoo e vômito, febre (mesmo baixa) ou calafrio, ou se aparecer pele ou olhos amarelados, urina escura ou fezes claras. Dor forte e contínua que vai para as costas também (pode ser pâncreas). Dor muito forte: vá logo, sem esperar.
> **Ligue 192** se a dor vier com febre e pele amarela e houver confusão, desmaio ou muita fraqueza.
> **Avise o médico no mesmo dia ou no seguinte** se teve uma crise curta que passou sozinha, sem febre, sem vômito e sem pele amarela.

**Fontes:**
- NIDDK (conferida): "See a doctor right away if you are having these symptoms during or after a gallbladder attack: pain in your abdomen lasting several hours; nausea and vomiting; fever—even a low-grade fever—or chills; yellowish color of your skin or whites of your eyes; tea-colored urine and light-colored stools". Também: "If you've had one gallbladder attack, more attacks will likely follow". https://www.niddk.nih.gov/health-information/digestive-diseases/gallstones/symptoms-causes
- Manual MSD profissional (conferida): a dor fica intensa em 15 min a 1 h e dura em geral menos de 6 h; a dor "may radiate into the back or down the arm"; a dor "usually severe enough to send patients to the emergency department". https://www.msdmanuals.com/professional/hepatic-and-biliary-disorders/gallbladder-and-bile-duct-disorders/cholelithiasis
- Bula do Mounjaro 5.8 (conferida): "If cholelithiasis is suspected, gallbladder diagnostic studies and appropriate clinical follow-up are indicated."

O limite de "1 ou 2 horas" é **proposta minha, sem número em diretriz**. A fonte diz "several hours" para "ver um médico na hora". Pus um prazo menor porque ela já tem pedra e o remédio aumenta o risco de pancreatite. **Precisa do aval do médico dela.** A outra opção é não dar número: "dor forte que não melhora: vá ao pronto-socorro". Também precisa de aval.

### B2. "Pouca gordura" no protótipo

**Onde e texto atual:**
- `prototipo/hoje.html:307`: selo "pouca gordura" no almoço;
- `prototipo/hoje.html:308`: "Por quê: pouca gordura de uma vez pesa menos na vesícula; a proteína primeiro segura a fome.";
- `prototipo/hoje.html:341`: selo "pouca gordura" no lanche;
- `prototipo/caminhos.html:253`: "Refeições menores, pouca gordura de uma vez".

**Classificação:** I, e contrário à regra do app. A primeira metade da ideia está certa: refeição grande e gordurosa pode disparar a cólica. Mas o selo e a frase dizem só "pouca gordura". Para quem está perdendo peso, refeição quase sem gordura deixa a vesícula parada e favorece pedra nova (Gebhard 1996; Festi 1998; Stokes 2014). Isso está em `REGRAS_CARDAPIO.gordMinPrincipal` e no próprio `caminhos.js:24`: "refeição sem gordura deixa a vesícula parada".

**Texto sugerido:**
- `hoje.html:307` e `341`: trocar o selo por "gordura na medida".
- `hoje.html:308`: "Por quê: um pouco de gordura em cada refeição ajuda a vesícula a esvaziar, e muita de uma vez pode trazer cólica. Começar pela proteína garante que ela não fique para trás quando a fome acaba."
- `caminhos.html:253`: "Refeições menores, com um pouco de gordura em cada uma (nem muita, nem nenhuma)".

**Fonte:** `pesquisa-vesicula-figado.md`, seção 2 e R3 e R4 (Gebhard RL et al., Hepatology 1996;24:544; Festi D et al., Int J Obes 1998;22:592; Stokes CS et al., Clin Gastroenterol Hepatol 2014), que não reabri. MSD (conferida): "biliary colic can follow a heavy meal".

---

## Ponto por ponto

### `app/perfil.js`
| Linha | Texto | Nota | Comentário e sugestão |
|---|---|---|---|
| 63 | "5% do peso já reduz a gordura, de 7 a 10% melhora a inflamação e 10% ou mais melhora a fibrose" | C | EASL 2024: LoE 2, forte (conferida). |
| 64 | bebida açucarada, ultraprocessados, "não beber álcool, porque não há quantidade segura estabelecida", mais de 150 min | C | EASL 2024 (conferida); Brasil rec. 31, 32 e 34 (conferida). Opcional: acrescentar "e treino de força 3 vezes por semana" (Brasil rec. 24, I-A). |
| 65 | "Exames e metas do fígado são combinados com o seu médico." | C | — |
| 84 | "A bula da tirzepatida lista problemas de vesícula (pedra e inflamação)… e perder peso rápido aumenta esse risco." | C | Mounjaro 5.8 e Zepbound 5.4: "Acute gallbladder events were associated with weight reduction" (conferidas). |
| 84 | "O seu médico sabe que você tem pedra na vesícula? Confirme com ele antes de começar." | I | O cartão fica fixo também depois que ela já começou. Sugestão: "Se ainda não contou, conte ao médico que receitou o remédio que você tem pedra na vesícula. A bula pede exames e acompanhamento da vesícula nesse caso." Fonte: Mounjaro 5.8. |
| 86 | "Crise de vesícula: dor forte no alto da barriga, do lado direito ou na boca do estômago, muitas vezes depois de comer." | I | Correto, mas incompleto. Sugestão: acrescentar "Pode ir para as costas ou para o ombro direito, e muitas vezes vem à noite." Fontes: MSD (dor vai para as costas ou para o braço) e NIDDK (crises à noite, depois de refeição pesada). |
| 87-88 | Pronto-socorro, 192, avisar o médico | I, **barra** | Ver B1. |
| 91 | "A sua cirurgia depende de o fígado diminuir. Perder de 7 a 10% do peso reduz a gordura e a inflamação do fígado; o app mostra o seu progresso até essas marcas. Quem decide a data é o cirurgião." | I | (a) A frase aparece para qualquer pessoa que marque "aguardando cirurgia", mas a condição do fígado vale só para o caso dela. (b) As marcas de 7 a 10% são da diretriz de fígado, não um critério de cirurgia. Junto da barra de progresso, a frase pode estimular pressa, o que é ruim para a vesícula. Sugestão: "Se o seu cirurgião disse que a cirurgia depende de o fígado diminuir: perder peso reduz a gordura do fígado (5% já ajuda; de 7 a 10% melhora a inflamação). O app mostra o seu progresso até essas marcas. Sem pressa: perder mais de 1% do peso por semana aumenta o risco de crise de vesícula. A data e o critério são do cirurgião." Fontes: EASL 2024; Zepbound 5.4; Weinsier 1995. |
| 47-49 | Barra "Perda desde o início, até a marca de 10%" e "Peso dos 5%: … kg" | C | Só conta, sem prescrever. Não grava peso no código. |
| 133-136 | Perguntas: pedra, aguardando cirurgia, gordura no fígado | C | Opcional: a resposta "Já tirei a vesícula" evita mostrar o cartão sem necessidade. Opcional: "Já teve pancreatite?" (bula 5.2). |

### `app/conteudo.js` (sinais de alerta)
| Linha | Texto | Nota | Comentário |
|---|---|---|---|
| 92-101 | Comentário com as seções da bula | C | A numeração confere com o PDF: 5.7 retinopatia, 5.8 vesícula, 5.9 perda de visão, 5.10 aspiração. |
| 104 | 192: "Dor na barriga com febre alta e pele amarela, junto com confusão, desmaio ou muita fraqueza." | C, com aval | Corresponde ao quadro grave de infecção do canal da bile. Os casos com febre de qualquer grau já estão no item do pronto-socorro. A divisão em níveis é da equipe e precisa de aval. |
| 107-109 | dor de 6 horas, febre e calafrio, amarelão | I, **barra** | Ver B1. |
| 110 | pâncreas: dor contínua que vai para as costas | C | Bula 5.2. |
| 115 | crise que passou sozinha: médico nos próximos dias | I, **barra** | Ver B1. |

### `app/peso.js`
| Linha | Texto | Nota | Comentário |
|---|---|---|---|
| 44-50 | Comentário: limite de 1%, Weinsier 1995 | C | 1% de [peso] = 1,2 kg por semana, abaixo de 1,5 kg (referência extrapolada de pessoas sem pedra; ver pesquisa). |
| 111-115 | Fonte: Zepbound para a ligação entre perda de peso e vesícula | C | Conferida: Zepbound **5.4** (o comentário diz "seção de doença aguda da vesícula", o que está certo; vale anotar o número). |
| 118-119 | "…Perda de peso rápida aumenta o risco de pedra na vesícula. É um assunto para levar ao seu médico. Se tiver dor na barriga, veja os sinais de alerta no Guia." | C | Não manda comer mais nem mexer na dose. A exceção do modo discreto para quem tem pedra está certa como segurança. |

### `app/caminhos.js`
| Linha | Texto | Nota | Comentário e sugestão |
|---|---|---|---|
| 12 | A, como funciona | C | EASL 2024 (padrão parecido com o mediterrâneo, forte). |
| 13 | "É o padrão com evidência mais forte para o fígado, inclusive sem perda de peso." | I | O que tem mais evidência para o fígado é perder peso. A parte "sem perda de peso" vem da diretriz brasileira, rec. 26, que é classe IIa, B (não "forte"). Sugestão: "É o jeito de comer mais estudado para o fígado e melhora a gordura do fígado mesmo sem perder peso." |
| 13 | "Não é pobre em gordura, o que ajuda a vesícula a esvaziar." | C | Força M (Gebhard, Festi). |
| 15 | "pelo menos 7 a 10 g nas refeições principais e no máximo 1 colher de sopa de azeite por refeição" | C, com aval | Números M e P: precisam de aval. |
| 16 | Fonte: "recomendação forte" | I | Vale para a EASL. A rec. 26 brasileira é IIa-B. Escrever "EASL… forte; Brasil rec. 26, IIa-B". |
| 21-24 | B, prato dividido | C | Divisão ½, ¼ e ¼ do método da ADA (página não reaberta). A linha 24 diz que "refeição sem gordura deixa a vesícula parada", o que está certo. |
| 30-33 | C | C | Brasil rec. 31 e 32 (conferidas). A ressalva de "não é low carb" está certa. |
| 39 | D: "800 a 1.200 kcal por 2 a 4 semanas… às vezes com shakes, para diminuir o volume do fígado" | C | Obes Surg 2021 (pela pesquisa; não reaberta). |
| 40 | D, pró: "Usada para facilitar a cirurgia." | I | A evidência vem sobretudo de cirurgia bariátrica. Para a retirada da vesícula, a meta-análise de 2024 chama a evidência de limitada. Sugestão: "Usada principalmente antes de cirurgia bariátrica. Para a cirurgia da vesícula, os estudos são poucos." |
| 41-44 | D, contras, vesícula, "o app não monta essa dieta" | C | Bom. Precisa de aval para existir como opção visível (ver a lista de aval). |
| 48-51 | E, dia leve | C | "Manter pelo menos uma refeição com cerca de 10 g de gordura" é M e precisa de aval. |
| 8 | "Converse com sua nutricionista antes de mudar de caminho." | C | — |

### `app/cardapio.js` (REGRAS_CARDAPIO)
| Chave | Nota | Comentário |
|---|---|---|
| gordMinPrincipal 7 g, M | I | O estudo usou 10 g numa refeição. O 7 é extrapolação, então a força está mais para P. Sugestão: força "P (a partir de M)". Aval. |
| gordMinUmaRefeicao 10 g, M | C | Gebhard 1996. Aval. |
| gordMinDia 30 g, M | C | Gebhard 1996 (900 kcal e 30 g: 0 de 7). Aval. |
| gordAlvoRefeicao 15 g, gordTetoRefeicao 20 g, azeiteMaxRefeicao 10 g, kcalMaxRefeicao 500, P | C | Marcados como proposta, sem estudo, e com aval. Está honesto. |
| pctGordDia 25 a 35%, P | C | A faixa de 20 a 35% é das DRIs; o 25 é escolha da equipe. Aval. |
| fibraMinDia 25 g, M | C | DRI para mulher de 19 a 50 anos. |
| peixeMinSemana 2, F | C | É F para o padrão. O número 2 vem do padrão mediterrâneo, não de uma recomendação numérica da EASL. |
| semFritura, P | C | — |
| semAcucarAdicionado, F | I | F vale para bebida açucarada (EASL). Zero de açúcar adicionado é escolha da equipe, mais rígida que a OMS (menos de 10%). Sugestão: "F (bebida açucarada); zero no cardápio é escolha da equipe". |
| enjooGordUmaRefeicao 9 g, M | I | A fonte diz cerca de 10 g. O 9 parece escolhido para o jantar atual (9,7 g) passar. Força P. Aval. |
| enjooGordMinDia 15 g, M | I | É proposta do relatório: força P. Aval. |

### `app/plano.js:8`
"Azeite e castanhas têm limite por refeição (até 10 g de azeite e cerca de 15 g de gordura no prato), e nenhuma refeição passa de cerca de 500 kcal"
- **Nota:** C, como descrição do que o app faz.
- **Fonte:** P, com aval.
- **Observação:** depois da decisão de 22/11, o cardápio do app é a reserva, e o plano da nutricionista vale antes dele. Sugestão: começar a frase com "No cardápio de reserva do app…".

### `app/painel.js:84-108`
| Texto | Nota | Comentário |
|---|---|---|
| "Faltam X g de proteína para a meta de hoje." / "Faixa de proteína: X a Y g por dia." | C | — |
| "1200 kcal é o mínimo por dia que o cardápio do app usa. Se isso se repetir, vale levar ao médico ou ao nutricionista." | C | Documento conjunto 2025 (piso de 1.200 kcal para mulheres). Opcional, para quem tem pedra: "Comer muito pouco por vários dias também deixa a vesícula parada." Fonte: NIDDK; Gebhard. |

### `app/semana.js`
| Linha | Texto | Nota | Comentário |
|---|---|---|---|
| 103-104 | "o enjoo foi maior nos 2 dias depois da aplicação…" | C | Só descreve o que ela registrou. |
| 131 | "dor forte na barriga em N dias" | I | É um fato, mas aparece sem caminho. O alerta aparece na hora do registro (`sintomas.js:60`), o que reduz o risco. Sugestão: quando houver, acrescentar "Dor forte na barriga: veja os sinais de alerta e conte ao médico." |
| 184 | "Esta tela só junta o que você registrou. Para entender o que os números significam para você, leve à consulta." | C | — |

### Protótipo (`.copias/o2-visual/prototipo/`)
| Arquivo:linha | Texto | Nota | Sugestão e fonte |
|---|---|---|---|
| hoje.html:284 | "Comece o prato pela proteína: ajuda a manter os músculos enquanto o peso cai." | I | O que mantém músculo é comer proteína suficiente e fazer treino de força. A ordem do prato só garante que a proteína não sobre. Sugestão: "Comece o prato pela proteína: com pouca fome, assim ela não fica para trás. Proteína suficiente e treino de força ajudam a manter os músculos." Fonte: documento conjunto 2025 (https://pmc.ncbi.nlm.nih.gov/articles/PMC12125019/, conferido na revisão de 22/11). |
| hoje.html:290 | "Dor forte no alto da barriga que não passa ou vai para as costas, febre, pele ou olhos amarelados: procure atendimento hoje." | I | "Procurar atendimento" é vago: pode ser entendido como marcar consulta. Sugestão: "Dor forte no alto da barriga ou que vai para as costas, com vômito, febre ou pele amarela: vá ao pronto-socorro. Com confusão ou desmaio: ligue 192." Fontes: NIDDK; bula 5.2. |
| hoje.html:307, 308, 341 | "pouca gordura" | I, **barra** | Ver B2. |
| hoje.html:342 | "Sopa de legumes com ovo · leve" | C | — |
| caminhos.html:244 | "Você escolhe um e troca quando quiser; o cardápio segue o caminho escolhido." | I | Contraria a decisão de 22/11 (o plano da nutricionista é o cardápio). Sugestão: "O plano da sua nutricionista continua valendo. Os caminhos explicam o porquê das escolhas e ajudam na conversa com ela." |
| caminhos.html:253 | "Refeições menores, pouca gordura de uma vez" | I, **barra** | Ver B2. |
| caminhos.html:255 | "Pouco açúcar, refrigerante e álcool" | I | Para gordura no fígado, não há quantidade segura de álcool estabelecida (Brasil rec. 34; EASL desaconselha). O próprio app diz "não beber álcool". Sugestão: "Pouco açúcar, nada de refrigerante e nada de álcool". |
| caminhos.html (bloco "Vale em todos") | "Perder peso sem pressa, no ritmo do médico" | C | Zepbound 5.4; Weinsier. |
| caminhos.html (Mediterrâneo) | "Um dos mais estudados para gordura no fígado"; "Azeite e castanhas em porções pequenas, por causa da vesícula" | C | EASL 2024. |
| caminhos.html (Prato dividido) | "Prato menor combina com o apetite do tratamento"; "fritura e molho gorduroso pesam na vesícula" | C | MSD (refeição pesada); NIDDK. |
| caminhos.html:308 | "Açúcar em excesso alimenta a gordura no fígado" | I | Sugestão: "Açúcar e bebida açucarada em excesso aumentam a gordura do fígado." Fonte: Brasil rec. 31; EASL; Chiu 2014 (o efeito vem do excesso de energia). |
| caminhos.html:309 | "Menos picos de fome" | SF | Não achei fonte nas diretrizes lidas. Tirar, ou trocar por "Pão e massa integrais têm mais fibra" (Guia Alimentar). |
| caminhos.html (Menos açúcar) | "Não é cortar todo carboidrato: em dia de enjoo, pão e arroz ajudam" | C | — |
| caminhos.html (fim) | "Converse com sua nutricionista. Ela ajusta qualquer caminho…" | C | — |
| semana.html:288 | "Perder peso muito rápido aumenta a chance de pedra na vesícula. O ritmo certo para você é o médico quem combina. Fonte: bula do Mounjaro (Anvisa)." | E (fonte) | A frase está certa, mas a fonte não. A bula do Mounjaro (EUA, 5.8) não liga a vesícula à perda de peso. Quem liga é a do Zepbound (5.4). A bula brasileira não foi conferida. Sugestão: "Fonte: bula do Zepbound (tirzepatida, EUA), seção 5.4; Weinsier 1995." |
| semana.html:335 | "Para a consulta: 3 dias com enjoo · proteína 78 g/dia · sem sinal de alerta" | I | O app não sabe se houve sinal de alerta: sabe só o que foi marcado. Pode tranquilizar o médico sem base. Sugestão: "nenhuma dor forte registrada". |
| painel.html:304 | "Quarta, dia seguinte à aplicação, teve menos comida e mais enjoo. Costuma acontecer; se virar vários dias seguidos, é assunto para o médico." | C | Bula (enjoo frequente no início e nos aumentos de dose). |

---

## Precisa do aval do médico ou da nutricionista dela

1. **Médico:** os critérios de tempo da crise de vesícula ("1 ou 2 horas" proposto aqui, ou nenhum número) e a divisão entre 192, pronto-socorro e médico (`conteudo.js:102-118`, `perfil.js:86-88`).
2. **Médico:** o aviso de ritmo acima de 1% do peso por semana como gatilho para quem já tem pedra (referência extrapolada de Weinsier, em pessoas sem pedra).
3. **Cirurgião ou médico:** a frase que liga as marcas de 7 a 10% à cirurgia (`perfil.js:91`), e qual é o critério real de "fígado diminuir".
4. **Nutricionista:** todos os números de REGRAS_CARDAPIO marcados com aval:
   - gordura mínima de 7 e 10 g por refeição e de 30 g por dia;
   - alvo de 15 g e teto de 20 g por refeição;
   - azeite até 10 g;
   - 500 kcal por refeição;
   - 25 a 35% da energia em gordura;
   - dia de enjoo com 9 g numa refeição e 15 g no dia.
5. **Nutricionista:** se os caminhos A a E aparecem para ela e como eles convivem com o plano prescrito em 04/11, e se o caminho D (dieta antes da cirurgia) deve aparecer.
6. **Nutricionista ou médico:** o selo e a frase de "gordura na medida" que substituem "pouca gordura" (B2).

## O que não foi feito
- Não reabri Gebhard, Festi, Stokes, Weinsier, Obes Surg 2021, a meta-análise de 2024 nem a página da ADA. Uso o que a pesquisa de 22/11 registrou.
- A bula brasileira (Anvisa) não foi conferida.
- Não vi as telas rodando: só li o código e o HTML do protótipo.
