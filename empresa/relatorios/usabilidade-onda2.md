# Usabilidade, onda 2: avaliação heurística e percurso cognitivo

Pesquisadora de usabilidade, 22/11/2026. Só leitura: nada no código foi mexido, nenhum commit, sem emulador.

## Conclusão: as 10 mudanças mais importantes, em ordem

1. **Primeiro uso numa tela só, e vesícula/fígado fora do "opcional".** Hoje são 2 telas e 16 toques, mais 3 números digitados. Pedra na vesícula, aguardando cirurgia e gordura no fígado ficam dentro de uma sanfona fechada chamada "Saúde (opcional)". Quem salva sem abrir a sanfona (5 toques) chega a uma tela Hoje **sem nenhum aviso de vesícula**. Opção: uma tela com 1 frase de "para quem é o app" (a lista de contraindicações fica num "ver mais"), ano, altura, peso, e três perguntas visíveis em botões Sim/Não/Não sei: pedra na vesícula, gordura no fígado e "tem plano da nutricionista?". O resto (pílula, diabetes, o que não come, metas) fica para depois, no Perfil. Meta: 9 toques ou menos.
2. **Hoje: o que ela faz todo dia na primeira tela e meia.** No app atual, o "comi tudo" do café está a 1.679 px do topo (2,1 telas de rolagem, 3,7 telas no total, 410 palavras). Ordem proposta: (a) topo com semana, dose e próxima aplicação; (b) proteína de hoje; (c) "Marcar o dia" com as 5 refeições do plano da nutricionista, uma linha por refeição, com as quatro opções de um toque; (d) "Como está hoje?"; (e) o alerta curto da vesícula; (f) a grade de atalhos; (g) "Ainda hoje". **Sair de Hoje:** calorias (vão para o Painel), peso, progresso até 10% com "faltam X kg", vitaminas e minerais, "treinos 0 / 3" e "dica do dia".
3. **Um caminho só para "dor na barriga".** Hoje são dois lugares: o cartão da vesícula com "Sinais de crise" e o Guia, onde "Sinais de alerta" é o 8º de 16 itens. No protótipo, a "dica do dia" aparece antes do alerta. Opção: botão "Dor na barriga" dentro de "Como está hoje?" e na grade. Um toque abre os sinais divididos em 192 / pronto-socorro hoje / avisar o médico, e já registra a dor. O cartão fixo de Hoje fica com 2 linhas e um botão. O parágrafo da bula com "confirme com ele antes de começar" sai de Hoje depois que ela marcar "meu médico sabe" (ou depois das primeiras semanas).
4. **Juntar "enjoo" num gesto só.** No app atual, "Dia de enjoo" (troca o cardápio, em Hoje) e "Enjoo moderado" (sintoma, em Diário > Sintomas, 4 toques no fim da página) não se conversam. Opção: tocar "Enjoo forte" em Hoje registra o sintoma e pergunta "Trocar as refeições de hoje pelas leves?". Com isso ligado, a tela Hoje encolhe: refeições leves, água em goles e sinais de alerta, sem números de calorias. Hoje, no dia de enjoo, ela continua vendo 376 palavras e kcal.
5. **Proteína dita como "quanto falta", com um alvo só.** O app atual mostra "18 g / meta 107 g" e deixa a conta para ela. O protótipo mostra "meta 90 g" em Hoje e "faixa 80 a 110 g" no Painel: são dois alvos diferentes para a mesma coisa. Opção: "Faltam 38 g hoje" e um exemplo concreto tirado do plano dela, com um alvo único em Hoje, no Painel e no relatório. Calorias saem de Hoje. No Painel o nome é "calorias", e a opção "não mostrar calorias" continua valendo.
6. **Tirar o que vira placar ou cobrança.** O protótipo promete "sem cobrança", mas mostra um calendário de 30 dias pintado "na faixa / abaixo", "4 de 6 dias na faixa", uma fileira de checks na Semana com um círculo vazio, e o peso em Hoje com "−0,5 kg desde terça". O app atual tem "Treinos de força na semana 0 / 3" e "faltam 9,7 kg" em Hoje. Opção: médias neutras só no Painel e no relatório, dia sem registro sem cor e sem marca, peso fora de Hoje. Na Semana, "sem sinal de alerta" vira "nenhum sinal de alerta registrado", porque o app não sabe o que ela não registrou.
7. **Abas: aceitar Hoje · Semana · Comer · Mover · Guia, mas dar casa ao que era do Diário.** A barra em aplicação pelo designer tira o Diário. Sem decisão, o relatório, a cópia de segurança, o histórico de aplicações e o peso ficam sem lugar. Opção recomendada: o relatório vira "Para a consulta" no fim da Semana e também na grade; o histórico de aplicações e o de peso abrem pelos atalhos; a cópia de segurança vai para o Perfil (ícone do topo) com o rótulo "Guardar cópia dos meus dados". Painel e Semana hoje só abrem digitando #painel e #semana: ninguém chega lá.
8. **Atalhos na ordem do uso e do risco, com nomes do dia a dia.** Ordem proposta: linha 1, Comida · Água · Como estou · Aplicação; linha 2, Dor na barriga (ou "Sinais de alerta") · Para a consulta · Painel · Peso. "Sintomas" vira "Como estou". "Caminhada" sai da grade e fica no "Ainda hoje" e na aba Mover. "Guia" já está na barra, não precisa repetir.
9. **Relatório e cópia em 2 toques, legíveis.** Hoje o relatório fica em Diário > chip Relatório. O Diário volta na última sub-aba usada, então às vezes abre em Sintomas. São 3 toques, com texto de 13 px numa caixa de texto. A cópia fica escondida embaixo do relatório: "Exportar tudo" compartilha um texto técnico, e restaurar exige colar esse texto inteiro. Opção: no relatório, primeiro o que o médico pergunta (sinais de alerta, enjoo, vômito, aplicações, ritmo de peso), e a lista de vitaminas em % vai para o fim, marcada como estimativa. Na cópia, um botão que gera um arquivo com nome e data, a frase "última cópia: nunca" ou a data, e restauração a partir do arquivo.
10. **Letra, jargão e textos de remédio mais curtos.** O protótipo tem de 29 a 42 textos de 11–12 px por tela (rótulos dos números, selos, legendas). Opção: 14 px no mínimo para tudo o que ela lê e 13 px só em legenda de gráfico. "kcal" vira "calorias" no texto, e IMC, Mifflin-St Jeor, DRIs, µg e "peso ajustado" ficam só dentro de "Como o app calcula". A aplicação atrasada hoje ocupa 50 palavras. Opção: "Atrasada 2 dias. Pode aplicar hoje. A próxima continua na quarta, 25/11." com "por quê (bula)" dobrável. O protótipo ainda não desenhou os estados atrasada, pular e falar com o médico.

---

## Como foi feito

- **App atual (main, d676cf2).** Navegador sem janela do playwright do briefing, a partir de `testes/apoio.js`: 390 × 800 px, relógio fixo em sexta, 20/11/2026, 10h.
  - Perfil de exemplo inventado (1980, 160 cm, 115 kg, vesícula sim, aguardando cirurgia sim, fígado sim), não os dados reais.
  - Para as tarefas 2 a 8, um histórico de exemplo: aplicações às quartas (última em 11/11, portanto 2 dias de atraso), 2 pesos e 6 dias de refeições.
  - Script e capturas na pasta temporária da sessão, fora do projeto: `/tmp/claude-1000/-home-usuario/eab8a608-0652-4bd0-affd-347d6dd4318d/scratchpad/us/` (percurso.js, proto.js, medir.js, cap/*.png). Essa pasta pode ser apagada pelo sistema.
- **Protótipo** (`.copias/o2-visual/prototipo/*.html`, versão rosa/lilás/azul, commit 65af8c2). As páginas são estáticas e os toques não fazem nada, então as contagens de toques do protótipo são **estimativas** a partir do desenho. Medidas automáticas: altura, tamanhos de letra, alvos, contraste dos textos sobre fundo liso.
- **Limites.** Ninguém real foi observado: é inspeção por especialista, não teste com a usuária. Não testei em 320 px nem com letra do sistema aumentada. Não vi o app no celular. O plano da nutricionista ainda não está em main (ramo onda2-nutri em andamento), então o percurso usou o cardápio próprio do app. O contraste sobre os degradês do topo não foi medido por mim: usei o valor declarado pelo designer em identidade.md (texto sobre o degradê ≥ 9,97:1).

## Percurso cognitivo: toques por tarefa

Contagem de toques sem as digitações. "Rolagem" é a distância até o alvo numa tela de 800 px de altura.

| Tarefa | App atual (medido) | Protótipo (estimado) | Onde ela trava |
|---|---|---|---|
| 1. Primeiro uso até ver Hoje | 2 telas, **16 toques** + 3 números. Sem abrir "Saúde", 5 toques, mas sem aviso de vesícula | Não desenhado | "Saúde (opcional)" fechado: o mais importante para ela parece dispensável. As perguntas são listas de seleção (2 toques cada). O texto de boas-vindas fala de cópia do Google antes de ela usar o app |
| 2. Marcar o café | 1 toque, **rolagem de ~1.080 px** (alvo a 1.679 px) | 1 toque, mas só no cartão "Próxima refeição" (a ~1.150 px). O café passado precisa do atalho Comida (2 toques ou mais) | Tratamento e vesícula ocupam a primeira tela inteira. No protótipo, quem marca o café às 11h já vê "próxima: almoço" |
| 3. Aplicação atrasada 2 dias | **2 toques** (botão no cartão → Salvar; data, dose e local já vêm preenchidos). Se aplicou outro dia, mais 3–4 toques no calendário | Atalho Aplicação + formulário: ~2–3 toques. O estado "atrasada" não existe no desenho | Texto de 50 palavras sobre a bula antes do botão. "Local sugerido: Abdômen esquerdo" fica em letra de 13 px cinza |
| 4. Registrar enjoo | **4 toques + rolagem de ~1.800 px** até "Registrar > Sintomas" no fim de Hoje (ou Diário, mas ele abre na última sub-aba) | **1 toque** ("Como está hoje? Enjoo leve/forte") | Dois conceitos com o mesmo nome. O registro do sintoma não liga o "dia de enjoo" |
| 5. Quanto falta de proteína | 0 toques, rolagem de ~300 px, e a subtração fica com ela (107 − 18) | 0 toques, no topo, mesma subtração | Alvos diferentes (meta 90 em Hoje, faixa 80–110 no Painel). "g" sozinho, sem exemplo de comida |
| 6. O que fazer com dor na barriga | 1 toque ("Sinais de crise e o que fazer" no cartão da vesícula) ou Guia (o item aberto fica a ~850 px, depois de 7 itens fechados) | 0–1 toque (alerta fixo em Hoje + "Ver todos os sinais") | No protótipo, o alerta vem depois da "dica do dia". No app, o cartão vermelho todo dia é um parágrafo de bula: com o tempo ela para de ler |
| 7. Relatório para a consulta | **3 toques** (Diário → Relatório → Compartilhar) | 2 toques + rolagem (aba Semana → "Montar" no fim) | No app, a 1ª linha útil para o médico (sintomas) vem depois de tratamento e peso. A lista de 10 vitaminas em % ("Vitamina D 14%") pode assustar e virar culpa |
| 8. Cópia dos dados | **3 toques** e achar o cartão escondido embaixo do relatório | Não desenhado | Ninguém procura cópia de segurança dentro de "Relatório". "Exportar tudo" gera um texto que ela não entende. Restaurar exige colar esse texto |

## Avaliação heurística (Nielsen, adaptada a ela: [idade], enjoo, consulta com médico e nutricionista)

### App atual (main)

| # | Achado | Heurística | Gravidade (0–4) |
|---|---|---|---|
| A1 | Vesícula, cirurgia e fígado escondidos em "Saúde (opcional)". Pular a sanfona = nenhum aviso da vesícula no app inteiro | Prevenção de erro | **4** |
| A2 | Hoje tem 3,7 telas e 410 palavras. A primeira tela é toda tratamento + parágrafo da vesícula. Registrar sintoma está no fim (~2.600 px) | Estética e minimalismo; flexibilidade | **3** |
| A3 | "Dia de enjoo" e "enjoo" no registro de sintomas não se ligam. No dia de enjoo a tela fica do mesmo tamanho, com kcal | Correspondência com o mundo real | **3** |
| A4 | Painel e Semana existem, mas só abrem digitando o endereço (#painel, #semana) | Visibilidade | **3** |
| A5 | Cópia de segurança dentro de Diário > Relatório; exporta texto técnico; restaurar = colar | Reconhecer em vez de lembrar; recuperação de erro | **3** |
| A6 | Diário abre na última sub-aba usada: quem vai ao relatório cai em Sintomas | Consistência | 2 |
| A7 | Cartão da vesícula em Hoje repete todo dia "Confirme com ele antes de começar" e "faltam 9,7 kg" (o modo discreto esconde os kg, mas é opt-in) | Cobrança; minimalismo | 2 |
| A8 | Jargão: kcal em Hoje e no Plano; IMC, "fórmula de Mifflin-St Jeor", "DRIs", "peso ajustado" no Perfil; µg e mg no Plano; "sulfonilureia" no Guia (aparece só em contexto de diabetes) | Correspondência com o mundo real | 2 |
| A9 | Plano: 8,1 telas, 1.257 palavras, 523 textos em 13–14 px | Minimalismo; legibilidade | 2 |
| A10 | Caixas de marcar de 22 × 22 px (sintomas, o que não come, modo discreto). O rótulo também é clicável, mas a caixa em si é alvo pequeno | Alvo de toque | 1 |
| A11 | "Treinos de força na semana 0 / 3" e botão "Concluí o treino A" em Hoje | Cobrança | 1 |
| A12 | Barra de abas com rótulos em 12 px | Legibilidade | 1 |

O que está bom e deve ficar: as 4 opções de refeição (tudo, metade, um pouco, nada) com 80 × 52 px. Todos os botões de Hoje passam de 44 px, e o contraste dos textos de Hoje é ≥ 4,5:1 (medido). O formulário de aplicação já vem preenchido (2 toques). "Nada" tem a mesma cor das outras opções, sem julgamento. Diálogos próprios. Registrar dor dispara o alerta de pronto-socorro.

### Protótipo (rosa/lilás/azul)

| # | Achado | Gravidade |
|---|---|---|
| P1 | Calendário de 30 dias "na faixa / abaixo / sem registro", "Dias na faixa 4 de 6", checks da Semana com o dia vazio: funcionam como placar, contra a promessa "sem cobrança" | **3** |
| P2 | Peso em Hoje, com "−0,5 kg desde terça": para quem tem pedra na vesícula e deve perder **sem pressa**, celebrar a perda diária conflita com o aviso de ritmo | **3** |
| P3 | Faltam estados: primeiro uso, aplicação atrasada / pular / falar com o médico, dia de enjoo, relatório, cópia, perfil | **3** |
| P4 | Letra de 11–12 px em rótulos de número, selos e legendas (Hoje 29, Painel 63, Semana 53 textos) | 2 |
| P5 | Meta de proteína diferente em Hoje (90 g) e no Painel (faixa 80–110 g) | 2 |
| P6 | "Dica do dia" acima do sinal de alerta | 2 |
| P7 | "Para a consulta: … sem sinal de alerta" afirma o que o app não sabe | 2 |
| P8 | Caminhos: "Escolher" um caminho pode competir com o plano prescrito pela nutricionista. A decisão de 22/11 diz que o cardápio é o plano dela | 2 |
| P9 | Anel "4/7 dia" no topo: ela precisa adivinhar que é o dia do ciclo da aplicação | 1 |
| P10 | "Próxima refeição" esconde as refeições que já passaram e não foram marcadas | 1 |

O que está bom e deve ficar: o topo com semana, dose e próxima aplicação. "Como está hoje?" de um toque. "Sem fome" como opção. "O que você não marcar fica em branco, sem cobrança". O "Por quê" curto em cada refeição. A forma única do alerta (borda, triângulo, rótulo). O texto de ritmo de peso com fonte na Semana. "Ver como tabela". "Para a consulta" no fim da Semana.

## Detalhe das recomendações

### Tela Hoje (reorganização)

1. **Topo (sem rolar):** semana do tratamento, dose e "Aplicação: em 4 dias (terça)". Quando atrasada: "Atrasada 2 dias · pode aplicar hoje" + botão "Registrei a aplicação". Ao lado, a proteína: "52 g · faltam 38 g".
2. **Marcar o dia:** as 5 refeições do plano da nutricionista, cada uma numa linha (nome curto, as opções da nutricionista num "trocar", e as quatro marcas). A já marcada encolhe. Água em copos (+1 copo, −1). Nada de "x de y" em vermelho.
3. **Como está hoje?** Bem · Enjoo leve · Enjoo forte · Sem fome · Dor na barriga. "Enjoo forte" oferece as refeições leves. "Dor na barriga" abre os sinais de alerta.
4. **Alerta da vesícula curto** (2 linhas + "o que fazer com dor na barriga"). O parágrafo da bula vai para o Guia e o Perfil.
5. **Atalhos** (ordem do item 8 da conclusão).
6. **Ainda hoje:** próxima refeição, caminhada opcional.

O que sai de Hoje: calorias, peso, marcas de 5/7/10%, vitaminas e minerais, contagem de treinos, dica do dia (pode ir para o Guia ou para a Semana).

### Nomes das abas

- **Hoje · Semana · Comer · Mover · Guia** (o que o designer está aplicando): os nomes são claros.
  - Risco: o Diário some. As casas propostas para o que ele tinha estão no item 7 da conclusão.
  - "Comer" deve abrir no **plano da nutricionista**, com Caminhos como "entender o porquê", não como escolha que troca o plano. O botão "Mostrar esta comparação na consulta" já vai nessa direção.
- **Alternativa:** trocar Mover por "Eu" (perfil, cópia, relatório, histórico) e levar o treino para dentro de Comer ou do Guia. Faz sentido se o treino for pouco usado no começo. Não há dado de uso para decidir: fica com a direção.

### Primeiro uso em menos telas

- **Tela 1 (única):**
  - "Este app acompanha o tratamento com tirzepatida. Não substitui o médico." + "Quando conversar com o médico antes" (dobrável).
  - Campos: ano, altura, peso.
  - Botões Sim/Não/Não sei: pedra na vesícula (se sim: aguardando cirurgia?), gordura no fígado, tem plano da nutricionista.
  - Botão "Começar".
- Estimativa: 3 números + 4 a 5 toques de resposta + 1 = **8 a 9 toques**, contra 16.
- **Depois, em Hoje:** um cartão que some sozinho, "Complete quando quiser: pílula, diabetes, o que você não come, metas da nutricionista". O aviso sobre a cópia do Google sai da boas-vindas e vai para o Perfil, junto da cópia.

### Texto e jargão

| Hoje | Opção |
|---|---|
| kcal / "Energia" | "calorias" (só no Painel) |
| IMC, Mifflin-St Jeor, DRIs, peso ajustado | só em "Como o app calcula" |
| "Até 4 dias depois do dia previsto, a orientação da bula é…" | "Pode aplicar hoje. A próxima continua na quarta, 25/11." + "por quê" |
| "Sintomas" | "Como estou" |
| "Exportar tudo" / "Restaurar: cole aqui o texto exportado" | "Guardar cópia dos meus dados" / "Trazer dados de uma cópia" |
| "sem sinal de alerta" | "nenhum sinal de alerta registrado" |
| "Cálcio 43%, Ferro 31%…" no relatório | no fim, com o título "estimativa do que foi marcado; a nutricionista interpreta" |

Não apareceu a palavra "macronutriente" em nenhuma tela visível. As vitaminas aparecem como "Vitaminas e minerais", o que está bom.

### Letra, alvos e contraste

- App atual: alvos de Hoje ≥ 44 px e contraste ≥ 4,5:1 (medido). Exceções: caixas de marcar de 22 px, rótulos das abas em 12 px e rótulos de refeição em 12 px maiúsculo.
- Protótipo: piso de 14 px para texto lido. Os números grandes estão bons (30–34 px). Medir de novo em 320 px e com a fonte do Android em 130%, porque grade de 4 colunas e cartões em duas colunas tendem a cortar texto.

## O que não foi feito

- Não houve teste com a usuária nem com outra pessoa: as gravidades são julgamento de especialista.
- Os toques do protótipo são estimados (páginas estáticas).
- Não testei leitor de tela, 320 px, fonte aumentada nem o aparelho real.
- O plano da nutricionista não estava em main: o percurso das refeições usou o cardápio do app.
