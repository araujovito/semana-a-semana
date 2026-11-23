# Usabilidade: a primeira semana dela, dia a dia (22/11, noite)

Pesquisador de usabilidade. Código de `main` no commit `cb9f833`. Nenhuma linha do app foi mudada.

## Conclusão

A semana inteira dá para fazer sem travar. Os caminhos do dia a dia são curtos:
- 1ª aplicação: 2 toques, com data, dose e local já certos.
- Refeição: 1 toque.
- Dor na barriga: 1 toque registra e já mostra o que fazer.
- Peso: 3 toques.
- Relatório: 1 toque a partir de Hoje.

Com letra 1,3 nada cortou nem passou da largura de 440 px.

O problema está no que o app conclui no fim da semana. **Refeição que ela não marcou conta como zero.** Isso aconteceu no dia da instalação (ela começou às 19h e só marcou o jantar) e no dia da dor (marcou café e almoço e esqueceu o resto). Por causa disso:
- o Painel diz "Abaixo de 800 kcal: 4 de 5" e "Se isso se repetir, leve à consulta";
- no 5º dia, à noite, depois de ela marcar todas as refeições, aparece "Assunto para o médico: você marcou pouca comida";
- o relatório para a nutricionista leva "Média de energia: 532 kcal".

Não é o que ela comeu na simulação. A tela promete "o que você não marcar fica em branco, sem cobrança", mas o resultado vira cobrança.

O segundo ponto pesa por causa da vesícula: **a dor leve some no resumo.** O relatório abre com "Dor forte na barriga: nenhum registro no período", e a Semana diz "nenhuma dor forte registrada". A dor de 26/11 só aparece numa linha solta, mais abaixo.

Os 10 achados abaixo estão em ordem de impacto vezes facilidade. Seis deles são só troca de texto.

## Como foi feito

- Navegador sem janela (playwright-core e Chromium do briefing), aberto por `file://` como nos testes. Viewport de 440 × 900 px, `hasTouch` e `isMobile`, todos os toques com `tap()`.
- Relógio controlado, um "abrir o app" por dia (recarrega, pede o PIN):

| Dia | O que ela faz |
|---|---|
| seg 23/11, 19h | instala; PIN; código de recuperação; Bem-vinda; 1ª aplicação de 2,5 mg; marca o jantar |
| ter 24/11, 13h30 e 21h | "Enjoo leve"; café metade, almoço um pouco, 2 copos de água; lanche nada, jantar metade |
| qua 25/11, 20h30 | "Sem fome"; troca o almoço para peixe; café um pouco, almoço metade, lanche nada, jantar um pouco |
| qui 26/11, 15h | "Dor na barriga" (leve); fecha a folha; café tudo, almoço metade; confere Diário > Sintomas |
| sex 27/11, 21h | "Bem"; as 4 refeições "comi tudo"; 2 × 500 ml; + 10 g de proteína |
| sáb 28/11, 8h | peso 119,1 kg pelo atalho Peso |
| dom 29/11, 20h | Painel, Semana, Relatório, Compartilhar |

- Dados inventados no formato do briefing: [ano removido], [altura], peso no começo [peso], Sim para vesícula, cirurgia, fígado e nutricionista. PIN inventado: 583920.
- Letra 1,3: simulada com `zoom: 1.3` na página. O APK usa o `textZoom` da WebView, que aumenta só o texto. O zoom aumenta tudo, então é um teste mais duro que o real para a largura e não é igual ao celular.
- O roteiro ficou fora do repositório (pasta temporária). As capturas estão em `empresa/relatorios/capturas/usab-fim-*.png`. As telas inteiras mostram a barra de abas e os avisos no meio da imagem: isso é efeito da captura de página inteira.

## Toques por passo

Contei os toques em botão, campo e opção. Os dígitos digitados ficam à parte.

| Passo | Toques | Digitação |
|---|---|---|
| Criar o PIN, ver o código, conferir um grupo | 7 | 6 + 6 + 5 |
| Antes de começar e Bem-vinda (3 campos e 4 perguntas) | 9 | 4 + 3 + 5 |
| 1ª aplicação, a partir de Hoje | 2 (+1 para voltar a Hoje) | — |
| Abrir o app em cada dia | 2 | 6 |
| Dia com enjoo leve (sintoma, 4 refeições, 2 copos) | 7 | — |
| Dia sem fome, trocando a opção do almoço | 6 (a lista conta como 1; na prática são 2) | — |
| Dor na barriga leve | 1 registra e abre a folha, +1 para fechar | — |
| Dia bem (sintoma, 4 refeições, água, proteína) | 8 | — |
| Peso | 3 (+1 para voltar) | 5 |
| Painel / Semana / Relatório, a partir de Hoje | 1 / 2 / 1 | — |
| Compartilhar o relatório | 2 (aviso de dados de saúde e Seguir) | — |

## Os 10 achados

### 1. Refeição sem marca conta como zero (impacto alto; correção média)
**O que vi.** Segunda, dia da instalação, ficou com 39 g de proteína porque só o jantar foi marcado. Quinta, dia da dor, ficou só com café e almoço. Os dois entram nas médias como dias completos. Resultado:
- Painel: "Média de calorias 532 kcal", "Abaixo de 800 kcal 4 de 5", "800 kcal é o ponto em que o app sugere conversar com a sua nutricionista. Se isso se repetir, leve à consulta".
- Semana: "energia média de 532 kcal".
- Relatório: "Média de energia: 532 kcal" e "Refeições marcadas como "nada": 2 de 15 registradas".

**Por que importa.** Ela leria que está comendo pouco demais justamente na semana em que tentou seguir o plano. Quem lê o relatório não consegue separar "não comeu" de "não marcou".

**Sugestão.**
- Contar nas médias só os dias com as 4 refeições principais marcadas, ou mostrar o dia como "incompleto" com borda tracejada, como já é feito para "sem registro".
- Não contar o dia da instalação.
- No relatório, escrever: "Dias com as 4 refeições marcadas: 3. Os outros dias ficaram de fora das médias."

### 2. A dor leve some do resumo (impacto alto; fácil)
**O que vi.** "Dor na barriga" em Hoje grava a dor como nota, não como "dor forte". Onde ela aparece:
- Relatório, PARA COMEÇAR: "Dor forte na barriga: nenhum registro no período." A dor de 26/11 só aparece em SINTOMAS, como "26/11/2026: Dor na barriga.".
- Semana: "Sintomas: enjoo em 1 dia; nenhuma dor forte registrada".
- Diário > Sintomas: "Enjoo nenhum, intestino normal / Dor na barriga.".

**Por que importa.** Ela tem pedra na vesícula e aguarda cirurgia. O médico procura justamente as dores, mesmo as leves, e o texto do topo passa a ideia contrária.

**Sugestão.** No PARA COMEÇAR: "Dor na barriga: 1 dia (26/11, leve). Dor forte: nenhum registro." Na Semana: "dor na barriga em 1 dia (leve); nenhuma forte". Na folha da dor, falta dizer o que fazer com uma dor leve que passou. Os três níveis falam de crise. Texto a levar ao médico junto com os outros que dependem de aval (`PARA-O-MEDICO.md`): "Dor leve que passou: fica registrada aqui; mostre na consulta. Se voltar mais forte ou durar, veja abaixo."

### 3. O relatório cobre 30 dias quando o tratamento tem 7 (impacto médio; fácil)
**O que vi.** "Período: 31/10/2026 a 29/11/2026" e "Dias com registro do que foi comido: 5 de 30". O app foi instalado em 23/11.

**Sugestão.** Começar o período no dia da instalação ou da 1ª aplicação, o que vier antes: "Período: 23/11/2026 (início no app) a 29/11/2026. Dias com registro: 5 de 7."

### 4. Lista de 12 nutrientes "abaixo de 80%" na primeira semana (impacto médio; fácil)
**O que vi.** O relatório traz "Cálcio 17%, Ferro 20%, Magnésio 40%, Zinco 39%, … Vitamina D 12%, Vitamina E 20%…". Os números vêm de 5 dias, dois deles incompletos (achado 1). Logo abaixo vem "Cardápio planejado abaixo de 80% da meta (só com comida): Ferro 63%…". Com o plano da nutricionista em uso, não fica claro se "cardápio planejado" é o plano dela ou a reserva do app.

**Por que importa.** Para ela, é uma lista que assusta e cobra. Para a nutricionista, é ruído tirado de poucos dados.

**Sugestão.** Mostrar os micronutrientes só com 14 dias completos ou mais. Antes disso: "Vitaminas e minerais: poucos dias completos para estimar." Trocar "Cardápio planejado" por "Plano da nutricionista, se comido inteiro:" ou "Cardápio de reserva do app:", conforme o que estiver em uso.

### 5. "Assunto para o médico" num dia em que ela comeu tudo (impacto médio; fácil)
**O que vi.** Sexta, 21h, depois de 4 × "comi tudo" e 131 g de proteína ("Chegou ao alvo de hoje"), aparece em destaque no meio de Hoje: "Nos últimos 3 dias com registro, você marcou pouca comida. Se o enjoo impedir de comer ou beber, o médico pode prescrever remédio ou segurar o aumento de dose." A conta inclui a segunda incompleta. Foi o único dia "bom" da semana, e o aviso chega nele.

**Sugestão.** Não mostrar no dia em que ela já chegou ao alvo. Contar só dias completos (ver achado 1). Na semana 1, trocar "segurar o aumento de dose" por algo que não soe como castigo: "Se o enjoo atrapalhar comer ou beber, conte ao médico: há o que fazer."

### 6. Frase confusa no topo de Hoje (impacto médio; muito fácil)
**O que vi.** "alvo do plano da nutricionista: 91 g. As refeições sem marca do plano têm cerca de 121 g." "Sem marca" pode ser lido como "refeição que não fiz" ou "que não marquei"; hesitaria aqui. A frase aparece toda manhã.

**Sugestão.** "Se comer o que falta do plano hoje: cerca de 121 g." Ou tirar a segunda frase e deixar só "Faltam 91 g · alvo 91 g".

### 7. Semana tira conclusão de um dia só e repete "enjoo" com dois sentidos (impacto médio; fácil)
**O que vi.**
- O selo "o enjoo foi maior nos 2 dias depois da aplicação" foi tirado de um único dia de enjoo leve.
- Na mesma tela aparecem "Sintomas: enjoo em 1 dia" e "Dias de enjoo: nenhum marcado". A segunda linha fala do botão "Dia de enjoo" (cardápio leve), mas parece contradizer a primeira.

**Sugestão.** Mostrar o selo só com 2 semanas ou mais de registro, ou com 2 dias ou mais de enjoo. Renomear a linha para "Cardápio leve (dia de enjoo): não usado".

### 8. "Antes de começar" fala do "plano do app" (impacto baixo a médio; muito fácil)
**O que vi.** "Ele organiza o cardápio, o treino e os seus registros" e "Converse com o seu médico antes de seguir o plano do app se você…". Para ela, o plano é o da nutricionista, e a tela seguinte pergunta isso.

**Sugestão.** "Ele organiza o plano alimentar (o da sua nutricionista, se tiver), o treino e os seus registros" e "Converse com o seu médico antes de usar o app se você…".

### 9. Bem-vinda: "Peso no começo do tratamento" deixa dúvida, e um aviso cobre a 1ª pergunta (impacto baixo a médio; fácil)
**O que vi.**
- Ela ainda não aplicou e tem uma bioimpedância de 3 semanas antes. Qual peso ela põe? Hesitaria aqui.
- Com letra 1,3, o aviso "PIN criado." fica por cima de "Tem pedra na vesícula?" nos primeiros segundos (captura `usab-fim-25`).
- Tocar em Começar sem responder mostra "Responda: Tem pedra na vesícula? (Sim, Não ou Não sei)." Está claro.

**Sugestão.** Rótulo: "Peso de hoje, ou da última pesagem antes da 1ª dose (kg)". Não mostrar o aviso "PIN criado." quando a tela seguinte já é outra, ou mostrá-lo no alto.

### 10. Hoje tem 3 telas de rolagem e repete atalhos (impacto médio; correção média)
**O que vi.**
- Com letra 1,0, Hoje tem cerca de 2.800 px de altura, mais de 3 telas.
- "Dor na barriga" aparece 3 vezes: botão em "Como está hoje?", cartão da vesícula e atalho.
- "Água" aparece 2 vezes: o cartão e o atalho.
- "Como estou" (atalho para o Diário) fica logo abaixo de "Como está hoje?", que faz quase a mesma coisa.
- O título de cada refeição corta em 2 linhas (almoço: "…Arroz…") e a lista de opções também corta. Para ver quanto arroz e feijão, ela precisa ir a Comer.

**Sugestão.**
- Tirar da grade os atalhos que já estão na tela (Água, Dor na barriga, Como estou), ficando Comida, Aplicação, Para a consulta, Painel e Peso.
- Na refeição, deixar o título abrir inteiro com um toque, ou mostrar as quantidades em linhas curtas, sem o corte de 2 linhas.

## Observado, sem prioridade

- **PIN e código.** A tela do código é clara, e conferir só um grupo é leve. Se o papel se perder, não há como gerar um código novo ("Trocar PIN" não mostra outro). Vale uma linha no Perfil: "Perdeu o código? Troque o PIN para receber um novo." Isso exige mudança na cifra.
- **Folha da dor.** Abre com "Ligue 192 agora" mesmo para dor leve. Assusta, mas é a ordem por urgência, e o registro aparece em cima ("Registrado no seu dia: dor na barriga."). Não mexi na ordem; ver a sugestão do achado 2.
- **Painel no domingo à noite.** Os anéis de hoje em 0% são a primeira coisa da tela. O resumo da semana fica no fim. Para quem abre o Painel "no fim da semana", o resumo poderia vir primeiro aos domingos, ou ficar ao alcance de um toque.
- **"Água hoje 0 de 10 copos".** Num dia de enjoo, 10 copos pode soar como cobrança. "0,0 L de 2,0 L" seria mais neutro.
- **Aplicação.** O aviso "Aplicação registrada. Dia habitual: segunda-feira. Se não for o seu dia, mude em "Mudei o dia da aplicação"." é bom. Depois de salvar, ela fica no Diário, e voltar a Hoje é 1 toque.
- **Peso.** Em 5 dias, −1,3 kg (−1,1%) e nenhum aviso de ritmo, porque o aviso exige uma pesagem de 14 a 28 dias antes (pendência conhecida no LEIAME). Na primeira semana, isso é esperado.

## O que não foi testado

- Celular real, MIUI/HyperOS, teclado de verdade, botão voltar do Android e o bloqueio por 5 minutos parado.
- **Compartilhar.** No navegador, o resultado é "Selecione o texto e copie manualmente.", porque não há a ponte do APK. O envio pelo WhatsApp não foi visto.
- A letra 1,3 foi simulada com zoom da página, não com o `textZoom` da WebView. Também não testei 1,6.
- Ninguém representou a usuária: é avaliação de especialista seguindo um roteiro inventado.
