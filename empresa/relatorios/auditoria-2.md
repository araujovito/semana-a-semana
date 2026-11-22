# Auditoria 2: entrega (main em b985ed8)

22/11/2026. Auditoria independente, para a direção geral. Só leitura: nada foi editado em `app/`, `testes/`, `android/` ou `dados/`, e não usei o emulador.

## Conclusão

**Como está em main, não recomendo entregar.** Um defeito barra, e ele é parte do achado 2 que barrava na auditoria 1:

1. **O cardápio não entrega a energia sem redução para quem tem IMC abaixo de 25.** A meta calculada está certa (gasto estimado, sem os −500), mas a escala das porções não chega nela. A proteína é escolhida primeiro e, nas mulheres mais leves, a proteína já passa da meta com o menor fator possível. Aí a energia fica travada no fator mínimo (0,50). Resultado, conferido em `metas()` e em `planoDoDia()`:

   | Perfil | IMC | Meta de energia | Cardápio entrega | Falta |
   |---|---|---|---|---|
   | 1,70 m, 52 kg, atividade leve | 18,0 | 1.750 kcal | 1.205 kcal (69%) | 545 kcal/dia |
   | 1,60 m, 50 kg, sedentária | 19,5 | 1.400 kcal | 1.205 kcal (86%) | 195 kcal/dia |
   | 1,60 m, 45 kg, sedentária | 17,6 | 1.350 kcal | 1.205 kcal (89%) | 145 kcal/dia |
   | 1,65 m, 65 kg, atividade leve | 23,9 | 1.850 kcal | 1.646 kcal (89%) | 204 kcal/dia |
   | 1,70 m, 70 kg, moderada | 24,2 | 2.250 kcal | 1.703 kcal (76%) | 547 kcal/dia |
   | 1,60 m, 60 kg, sedentária | 23,4 | 1.500 kcal | 1.508 kcal (101%) | nenhuma |

   A pessoa com baixo peso recebe um déficit maior (545 kcal) do que o "gasto − 500" que o app aplica a quem tem obesidade. A tela Plano diz "multiplica arroz, pães, feijões, azeite e castanhas por 0,50, para completar a sua energia" e depois "as porções chegaram ao limite do app". As duas frases não são verdade nesse caso: a energia está no fator mínimo, não no limite.
   **Onde:** `app/nutricao.js:176-178` (a escolha aceita só as combinações com a proteína a até `max(minP, 3%)` da meta; quando a proteína mínima já passa da meta, sobra uma combinação só). **Teste que deixou passar:** `testes/unidade/nutricao.js:18-40` confere a meta (`kcalCalc`), não o que o cardápio entrega.
   **Conserto pequeno possível:** aceitar proteína acima da meta até a faixa máxima do próprio app (`protMax`, 1,6 g/kg ajustado) e, entre essas, escolher a energia mais perto da meta. É uma regra numa linha, mas mexe em todos os números: precisa rodar de novo os testes de escala e acrescentar um caso por linha da tabela acima.
   **Quando ela sente isso:** a usuária provavelmente começa com IMC acima de 27 (a indicação do remédio para peso começa aí), então no primeiro dia o defeito talvez não apareça. Ele aparece quando ela cruzar o IMC 25 emagrecendo, que é exatamente quando o limite de segurança deveria agir. Se ela já começar abaixo de 25, aparece no primeiro dia. Por isso classifico como barra; a decisão é da direção.

O resto do A1 e do A2 está resolvido ou parcial sem risco grave (detalhe abaixo). **Não achei nenhum caso em que o cartão de dose dê instrução contrária à bula.** Achei um caso em que ele se contradiz de um dia para o outro (A1, resíduo 1).

Fora o que barra, a entrega depende de três coisas que **não estão em main** e que eu não auditei, porque estão sendo feitas agora nas cópias de trabalho:
- `onda1-peso`: modo discreto na aba Peso, "Como ela está" em Sintomas, correção de pesagem e de sintoma, alerta de sintoma sem `alert()` nativo.
- `onda1-android`: tema escuro, botão voltar, teclado do lado Android, texto verdadeiro da cópia de segurança, diálogos de "Restaurar" e "Apagar todos os dados" sem `confirm()` nativo.
- APK novo compilado de main depois das junções. O APK que existe hoje não tem o A1 nem o A2.

Se essas junções entrarem, cada uma precisa de uma passada curta de auditoria antes do APK final.

### O que eu verifiquei e como
- `bash testar.sh` em main (b985ed8, numa cópia estável em pasta temporária): **TUDO VERDE**.
- A1: 89 situações montadas à mão em `situacaoDoseEm` (relógio dado como argumento), conferidas uma a uma contra a bula citada no código (`app/tratamento.js:5-10`).
- A2: 13 perfis (IMC de 17,6 a 61,7, de 25 a 75 anos, homem, gestante, metas informadas de 800 e 3.000 kcal, três combinações de restrição) em `metas()`, `planoDoDia()` e `fraseEscala()`; navegador sem janela para o modo discreto, campo vazio e diálogos.
- Desempenho: tempo da primeira `metas()` em Node e abertura do app no Chromium sem janela com a CPU desacelerada 4, 6 e 10 vezes.
- Os scripts estão em `/tmp/claude-1000/auditoria-2/scripts/` (`dose.js`, `desempenho.js`, `semdeficit.js`, `porcoes.js`, `cpu.js`, `cpu2.js`, `vazio.js`). A pasta é temporária: se forem úteis, a engenharia copia para `testes/`.

### O que eu não verifiquei
- Celular de verdade e emulador: não usei. A medida de desempenho é uma aproximação (CPU desacelerada no computador, não um celular fraco).
- Os textos de saúde contra a bula brasileira em PDF: conferi contra o que o código cita e contra o que sei da bula. Não abri a fonte primária.
- Os ramos `onda1-peso` e `onda1-android` (só olhei se as pendências estão lá).
- Leitor de tela, fonte grande do sistema, backup do Google.

---

## Situação de cada achado aceito pela direção

Referências de linha: main em b985ed8. "Teste" = nome do caso em `testes/`.

| Achado (auditoria 1) | Situação | Evidência |
|---|---|---|
| 1. Próxima dose (barrava) | **Resolvido**, com 4 resíduos que não barram (abaixo) | `app/tratamento.js:28-67`; `testes/unidade/tratamento.js` (todas as linhas da tabela da auditoria 1 viraram caso); minha grade de 89 situações |
| 2. Limites de segurança (barrava) | **Parcial, com 1 defeito que barra** | ver Conclusão e a seção A2 |
| 3. Terceira pessoa | **Parcial** | `app/sintomas.js:7` ainda diz "Como ela está". O conserto está em `onda1-peso`, fora de main |
| 4. Virada do dia | **Resolvido** | `app/inicio.js:43-45`, `app/hoje.js:20-24`; teste "toque depois da meia-noite não grava em dia nenhum". Lado Android (`onResume`) não está em main; o `visibilitychange` da página cobre o caso |
| 5. Reação a comer pouco | **Resolvido no essencial** | `app/consumo.js:97-107`, `app/hoje.js:34-43`; testes "3º dia seguido de enjoo", "vômito em 2 dias seguidos", "3 dias com pouca energia". Diferença da proposta: enjoo conta 3 dias seguidos, não 3 em 7; vômito com tontura não dispara |
| 6. Enjoo apagava marcas | **Resolvido** | `comidoEnjoo`, `app/hoje.js:141`; teste "ligar de novo traz a marca feita no dia de enjoo" |
| 7. Texto da cópia de segurança | **Não resolvido em main** | `app/aparelho.js:9`: "Os registros ficam só neste celular", contra a decisão de 20/11 (allowBackup ligado, texto corrigido). O Perfil (`app/perfil.js:51`) já tem o texto certo. O conserto está em `onda1-android` |
| 8. Falha ao salvar escondida | **Resolvido** | `app/nucleo.js:91-97,116`; teste "falha ao salvar mostra a faixa de erro" |
| 9. Fator multiplica o que não deveria | **Resolvido** (dois fatores, unidade inteira, enjoo ≤ 1), **mas gerou o defeito que barra** | `app/nutricao.js:119-182`; ovo, pão francês e lata saem inteiros ou em meia lata nos perfis que conferi |
| 10. Degrau de proteína no IMC 30 | **Resolvido** | `app/nutricao.js:231`; teste "a proteína não dá salto quando o IMC cruza 25 nem 30" |
| 11. Corrigir registros | **Parcial** | Refeição, água e caminhada de até 60 dias atrás: resolvido (`app/hoje.js:11-17`). Aplicação: só apagar e refazer. Peso e sintoma: o conserto está em `onda1-peso`. O guia de primeiros passos diz "toque em apagar", o que bate com main |
| 12/13. Cópia da chave de assinatura | Não verificável por mim (é ação da direção fora do projeto) | `decisoes.md` chama de "achado 12" o que é o achado 13 |
| 14. Composição dos alimentos | **Resolvido** nos quatro pontos | batata-doce vitamina A 0, feijão carioca folato 91 µg (era 172), queijo minas vitamina D 0,7 µg, sardinha drenada. O gerador rodou na minha cópia e não mudou `alimentos.js` (o arquivo bate com o gerador). Whey (58 g de proteína) e bebida de soja (dado americano) seguem pendentes, como anotado |
| 15. Teclado cobrindo campos | **Parcial** | lado da página resolvido (`app/inicio.js:134-141`; teste "barra de abas some com campo de texto em foco"); lado Android em `onda1-android` |
| 16. Campo vazio sem aviso | **Resolvido** | conferi no navegador: peso vazio mostra "Preencha o campo: Peso (kg)."; teste "data vazia mostra mensagem e não salva" |
| 17. Diálogos nativos | **Parcial** | Ainda nativos em main: `app/aparelho.js:18` (Restaurar), `app/aparelho.js:21` (Apagar todos os dados) e `app/sintomas.js:27` (`alert` do sinal de alerta: dor forte, vômito com enjoo forte). Conferi no navegador: "Apagar todos" abre `confirm()` nativo. Os três têm conserto nos ramos fora de main. Os testes não pegam porque nenhum teste toca nesses três botões |
| 18, 19, 29. Defeitos vistos no aparelho (tema escuro, fonte grande, paisagem) | **Não resolvidos em main** | `android/res/values/valores.xml:6` ainda é `Theme.Material.Light`; `configChanges` sem `fontScale`. Tema escuro está em `onda1-android` |
| 20. Restauração sem conferir tipos | **Resolvido** | `app/nucleo.js:39-77` (ids limpos para `[A-Za-z0-9_-]`, datas conferidas, `diaPlano` fora da faixa sai) |
| 21. Dado ilegível sobrescrito | **Resolvido** | `app/nucleo.js:80-89,93`; teste "dado ilegível: o app avisa em vez de abrir vazio" |
| 22. Botão voltar | **Resolvido** do lado da página | testes "trocar de aba não empilha histórico", "voltar na aba Hoje sai do app" |

---

## A1: próxima aplicação (`app/tratamento.js`, `situacaoDoseEm`)

**Regras da bula citadas no código** (`tratamento.js:5-10`): uma vez por semana no dia habitual; até 4 dias de atraso, aplicar e voltar ao dia habitual; mais de 4 dias, pular e aplicar no dia habitual seguinte; não aplicar duas doses para compensar; pelo menos 72 horas entre duas aplicações. A regra "mais de 14 dias sem registro: falar com o médico" é do app (a bula não fixa número de dias; o Guia diz "várias semanas").

**O que conferi e está certo:**
- Habitual segunda, última na segunda 16/11, hoje de 16/11 a 02/12: em dia até 22/11; "hoje" em 23/11; atrasada de 1 a 4 dias (24 a 27/11) mandando aplicar; pular em 28 e 29/11 com próxima em 30/11; "hoje" em 30/11; médico a partir de 01/12.
- Aplicou atrasada na sexta (4 dias): a próxima continua na segunda, 3 dias depois. Nunca menos de 3 dias em dias de calendário, para qualquer dia habitual (o teste confere os 49 pares).
- Aplicou adiantada (sábado ou domingo para segunda): a próxima fica na segunda da outra semana, 8 ou 9 dias depois. Seguro.
- As quatro linhas da tabela da auditoria 1 dão hoje a resposta certa (05/11 só: médico com 15 dias; 06/11 só: "hoje" com 14 dias; 15/08 com 10 mg: médico, sem dose nem data).
- Dia habitual trocado em "Mudei o dia da aplicação": para os 7 dias possíveis, a próxima fica de 1 a 7 dias à frente e nunca a menos de 3 dias da última.
- Doses fora de ordem: ordenadas antes da conta. Dose futura (só vem por restauração) e data inválida (30/02): ignoradas na conta. Salto 2,5 para 10 mg: pede confirmação; 2,5 para 5 mg: não.
- Data aceita de 1 ano atrás até hoje (`tratamento.js:71-75`).

**Resíduos (não barram):**
1. **"Pular" promete uma data que no dia vira "fale com o médico".** Habitual segunda, última aplicação adiantada no domingo 15/11. Em 28 e 29/11 o cartão diz "Próxima aplicação: Seg, 30/11 [...] pular essa dose e aplicar a próxima no dia habitual". Em 30/11 (15 dias desde a última) o cartão troca para "fale com o médico antes de retomar: pode ser preciso recomeçar numa dose menor". Com a última no sábado 14/11, a troca vem em 29/11, um dia antes da data prometida. A instrução de 30/11 não é perigosa (falar com o médico é o lado conservador), mas o app desdiz o que disse na véspera. **Onde:** `tratamento.js:55` contra `:65`. **Conserto de uma linha:** no estado "pular", se `entre(ult.data, s.seguinte) > 14`, mostrar já o texto do médico.
2. **72 e 96 horas contadas em dias de calendário.** Aplicou atrasada na sexta às 23h; na segunda o cartão diz "Próxima aplicação: hoje" e, às 8h, são 57 horas. O mesmo vale para "até 4 dias": quinta à noite pode já ter passado de 96 horas. O app não pergunta a hora, e o texto do cartão não lembra das 72 horas nesse caso. Risco baixo; uma frase no estado "hoje" quando a última foi há 3 dias resolve.
3. **O dia habitual implícito muda sozinho.** Sem "Mudei o dia" preenchido, o dia habitual é o da primeira aplicação registrada. Registrar uma aplicação antiga (quarta 28/10) antes das de segunda muda o dia habitual para quarta e a próxima de 23/11 para 25/11, sem aviso. Apagar a primeira tem o mesmo efeito. Também: a data do formulário vem preenchida com hoje; quem aplica na segunda e registra na terça sem mexer na data fica com terça de dia habitual. **Onde:** `tratamento.js:21-25`. Conserto barato: gravar `E.diaDose` na primeira aplicação.
4. **"Já são 4 semanas nesta dose"** aparece no dia da 4ª aplicação, com 3 semanas completas (`tratamento.js:111`, `semanaNaDose >= 4`). O rótulo "4ª semana" está certo; a frase adianta uma semana. Não prescreve nada ("assunto para a consulta"); é só impreciso.

---

## A2: limites de segurança (`app/perfil.js`, `app/nutricao.js`, `app/plano.js`)

| Ponto | Situação | Evidência |
|---|---|---|
| Tela de entrada | **Feito** | `perfil.js:9-15`; teste "primeira abertura mostra a tela de entrada". Lista: menos de 18, gravidez ou amamentação, transtorno alimentar. Insulina e sulfonilureia não estão nela; entram pela pergunta do Perfil |
| Idade mínima 18 | **Feito**, com folga de um ano | `perfil.js:133`. Só se pergunta o ano: quem nasceu em 2008 passa em 2026 mesmo com 17 anos. Uma restauração com ano 2012 também passa (`nucleo.js:50` aceita 1900 a 2100). Menor |
| Acima de 65 | **Feito** | `perfil.js:21-26` (fonte PROT-AGE anotada); aparece em Perfil e Plano |
| IMC < 25 sem redução | **Meta feita; cardápio não entrega** | **barra**, ver Conclusão |
| IMC < 18,5: cartão "fale com o médico" | **Parcial** | `perfil.js:28-31`; aparece só em Perfil e Plano (`perfil.js:52`, `plano.js:40`). A tela Hoje, a que ela abre todo dia, não mostra (`hoje.js:55-60`), embora o comentário de `perfil.js:16` diga "Perfil, Plano e Hoje". O texto diz "o app não calcula redução de calorias", e com meta informada pelo médico o app usa a meta informada; o texto fica impreciso nesse caso |
| Gravidez ou amamentação | **Feito** | `nutricao.js:225`; cardápio entrega 100% do gasto no perfil que conferi (1,60 m, 62 kg). Mesmo problema de só aparecer em Perfil e Plano |
| Meta < 1.200 (1.800 homem) com confirmação | **Feito** | `perfil.js:154-157`; teste unitário "meta de energia abaixo de 1.200 só é gravada depois de confirmar". Com a meta confirmada, ela vira o piso do dia (`nutricao.js:237`). Com 800 kcal, o cardápio fica em 1.176 kcal (147%), porque a proteína manda; a tela avisa que está no limite |
| Aviso de hipoglicemia | **Feito** | `tratamento.js:115-125`, fonte anotada (bula; ADA, seção 5, para o treino). Fixo em Plano, Perfil, Treino e Guia; na tela Hoje só em dia de enjoo ou com pouca comida marcada (`consumo.js:116-120`). O app continua calculando a redução de 500 kcal para quem usa insulina; o cartão manda conversar com o médico antes. A auditoria 1 propunha "nenhum incentivo a comer menos"; a direção ficou com o aviso |
| Modo sem calorias: tela Hoje | **Feito** | `hoje.js:29-30,62-64`; teste "modo discreto: tela Hoje sem kcal" |
| Modo sem calorias: relatório | **Feito** para energia | `hoje.js:113`. O relatório mantém o peso e o IMC (`peso.js:40`), o que faz sentido para a consulta |
| Modo sem calorias: Plano e Perfil | **Feito** | `plano.js:6-16,41-73`, `perfil.js:78-88` |
| Modo sem calorias: **aba Peso** | **Não feito em main** | `peso.js:11-12` mostra inicial, atual, variação em kg e em % e o gráfico, com o modo ligado (conferi no navegador). A caixa do Perfil promete "nem peso em destaque", e o guia de primeiros passos (`empresa/ENTREGA-primeiros-passos.md`) repete a promessa. O conserto está em `onda1-peso` |

**Textos de saúde novos: fonte e prescrição.** Os textos novos de `perfil.js`, `tratamento.js` (hipoglicemia) e `hoje.js` (comer pouco) têm a fonte anotada em comentário: Guia ou bula, OMS para o IMC, PROT-AGE, ADA. Nenhum diz dose nem remédio. "Tenha algo doce por perto durante o treino" é orientação de segurança (ADA), não prescrição. Dois pontos para a pesquisa conferir na fonte primária:
- "O remédio não é usado na gravidez nem na amamentação" (`perfil.js:19`, `conteudo.js:106`). Pelo que sei da bula, na amamentação ela manda o médico pesar os riscos; não proíbe. O texto do app é mais restritivo que a bula, mas termina em "fale com o seu médico".
- Os sinais de hipoglicemia (tremor, suor frio, confusão) vêm do Guia, sem fonte própria.

---

## Desempenho de `calcularEscala`

A grade tem 26 × 31 = 806 combinações. Cada uma soma os 7 dias com arredondamento e, nos dias abaixo do piso, sobe o fator de 0,05 em 0,05 até 3,0. O resultado fica guardado só na memória (`MEMO_ESCALA`, `nutricao.js:157`), então a conta é refeita a cada abertura do app, a cada pesagem que muda a proteína ou a energia, e a cada mudança de perfil. Com restrições, a tela Plano faz uma segunda grade inteira (`quedasPorRestricao` compara com e sem restrição, `nutricao.js:205`).

| Medida | Resultado |
|---|---|
| Node, primeira `metas()`, 13 perfis | 250 a 440 ms (sem aquecimento do JavaScript) |
| Node, `metas()` repetida (memória) | 0,2 ms |
| Chromium, abrir o app na tela Hoje, CPU normal | 330 a 420 ms (sem perfil: 100 a 110 ms) |
| Chromium, CPU 4× mais lenta | Hoje 0,9 a 1,1 s; Plano com restrições 1,6 s |
| Chromium, CPU 6× mais lenta | Hoje 1,4 a 1,8 s; Plano com restrições 2,1 a 2,5 s |
| Chromium, CPU 10× mais lenta | Hoje 2,9 a 3,2 s; Plano com restrições 3,4 a 4,2 s |
| Recalcular já aquecido (pesagem nova), CPU 10× | 0,6 a 1,2 s |

Computador da medida: Ryzen 7 7735HS. Um celular de entrada (núcleos Cortex-A53) costuma ficar na faixa de 6 a 10 vezes mais lento em JavaScript; um intermediário, de 3 a 5. É estimativa, não medida em aparelho.
**Leitura:** não trava nem fecha o app, mas num celular fraco a tela fica em branco ou parada de 2 a 4 segundos a cada abertura, e perto de 1 segundo depois de registrar o peso. Não barra. Saídas baratas, se a direção quiser: guardar o resultado da escala em `E.ui` com a chave (a abertura deixa de calcular); ou procurar primeiro numa grade de 0,25 e refinar só em volta da melhor.

---

## Outros achados novos (não barram)

1. **Testes não conferem o que o cardápio entrega para os perfis de segurança.** Foi por isso que o defeito que barra passou com tudo verde. Pedir um caso por linha da tabela da Conclusão: energia do cardápio a até 7% da meta quando `semDeficit` é verdadeiro.
2. **Texto da escala contradiz os números** quando a proteína manda: "por 0,50, para completar a sua energia" com a energia em 69% (`plano.js:7-8`). Some quando o defeito que barra for consertado.
3. **Dia de enjoo ficou mais baixo para as mulheres mais leves:** 766 kcal e 43 g de proteína (perfil de 45 a 52 kg), contra 859 kcal na auditoria 1. É coerente com "nunca escalar para cima", mas com IMC abaixo de 18,5 esse dia leva o déficit mais longe. O aviso de 3 dias seguidos de enjoo cobre o uso prolongado.
4. **Porções muito pequenas com fator de proteína 0,50:** 60 g de frango, meia lata de sardinha (40 g) e meia de atum (45 g) no almoço e no jantar. Plausíveis, mas é a consequência do mesmo defeito: proteína no mínimo e energia no mínimo ao mesmo tempo.
5. **`decisoes.md` registra "achado 12 (chave de assinatura)"**; na auditoria 1 a chave é o achado 13. O achado 12 de verdade (peso inicial no Perfil regrava a linha de base) não tem decisão registrada. Em main, `peso.js:11` e `peso.js:39` ainda usam `perfil.peso` como ponto de partida, e salvar o Perfil de novo regrava esse peso.

---

## Lista para a direção, em ordem

1. **Barra:** escala que entregue a energia sem redução para IMC abaixo de 25 (`nutricao.js:176-178`), com teste por perfil.
2. Juntar `onda1-peso` e `onda1-android`, que trazem os consertos de 3, 7, 11, 15, 17, 18 e o modo discreto no Peso. Passada curta de auditoria em cada junção.
3. Uma linha no estado "pular" para não prometer data que vira "médico" (A1, resíduo 1).
4. Avisos de peso baixo e de gravidez também na tela Hoje.
5. APK novo de main, instalado no emulador e, se possível, no celular dela.
