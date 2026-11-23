# Dia de enjoo com o plano da nutricionista

Teste de 22/11/2026, no navegador sem janela (Chromium do Playwright), a 440 px, relógio fixo em sexta, 20/11, 10h. Plano da nutricionista ligado, perfil com vesícula e fígado. Não usei o emulador nem o celular.

## Conclusão

**Antes da correção, ligar o Dia de enjoo depois de marcar refeições fazia sumir do total o que ela já tinha comido.** As marcas ficavam guardadas, mas Hoje, Painel, Semana e relatório deixavam de contá-las enquanto o enjoo estivesse ligado. Se ela deixasse ligado até o fim do dia, que é o uso esperado, o dia ficava registrado como se ela quase não tivesse comido. Isso também podia disparar o aviso "Assunto para o médico" (menos de 800 kcal em 3 dias) sem motivo.

Corrigido em três commits, com testes. Depois da correção: nada se perde, o total junta as duas listas, e as quatro telas mostram o mesmo número. **Atenção:** isso muda uma regra antiga. Antes, a soma usava só o cardápio que estava na tela. A regra está explicada em "Decisão para o chefe", abaixo.

## O que encontrei (antes da correção)

Roteiro: café "comi tudo" e almoço "metade" do plano dela, +10 g de proteína e +500 ml de água. Depois liguei o enjoo, marquei refeições leves, desliguei, e repeti num dia anterior.

| # | Achado | Gravidade | Situação |
|---|---|---|---|
| 1 | Com o enjoo ligado, a proteína de Hoje caiu de 49 g para 10 g e as calorias de 475 para 0. O Painel, a Semana ("energia média de 0 kcal") e o relatório repetiam o erro. Desligado o enjoo, as refeições leves marcadas saíam do total do mesmo jeito. | Alta | Corrigido |
| 2 | No dia de enjoo, Hoje diz "Dia leve: o que der, em porções pequenas", mas o Painel dizia "Faltam 81 g de proteína para a meta de hoje". | Média | Corrigido |
| 3 | Um dia só com proteína avulsa (por exemplo, enjoo ligado, nada marcado e +10 g) aparecia como "energia média de 0 kcal" na Semana. No relatório, entrava como 0 kcal e 0% de todos os micronutrientes. O Painel já tratava esse dia direito, desde a auditoria 3 (I3). | Média | Corrigido |

O que já funcionava e continua igual:
- As marcas nunca foram apagadas: `comidoNutri` e `comidoEnjoo` ficam separados. Água, proteína avulsa e caminhada atravessam a troca.
- Ao ligar o enjoo, as refeições leves aparecem sem marca e "Gordura na medida" some. Ao desligar, as marcas do plano dela voltam com a opção escolhida. Vale para hoje e para dias anteriores.
- O alvo de proteína (91 g, começo da faixa do plano dela) é o mesmo em Hoje, Painel, Semana e relatório. O relatório conta "Dias de enjoo" certo.

## O que mudou

1. `6bca032` **Dia de enjoo ligado no meio do dia não tira do total o que já foi comido.** O total do dia (`consumoDoDia`) soma as marcas do plano normal e as do dia de enjoo. A tela continua mostrando só o cardápio em vigor, e uma linha nova avisa: "Também conta no total do dia: 2 refeições marcadas no plano da nutricionista (39 g de proteína)". Ao desligar, a linha fala das refeições leves. O formato dos dados não mudou, e o dado antigo (enjoo com as marcas em `comido`) continua contado uma vez só.
2. `fa43586` **Painel no dia de enjoo não cobra a falta de proteína.** Usa a mesma frase de Hoje.
3. **Dia só com proteína avulsa não vira 0 kcal na Semana nem no relatório.** A energia e os micronutrientes contam só os dias com refeição marcada, e o texto diz em quantos dias.
4. Teste novo `testes/fluxo-enjoo-nutri.js`, com 18 verificações: o roteiro inteiro em Hoje, Painel, Semana e relatório, a 440 px, e a conferência do registro gravado.

`bash testar.sh`: TUDO VERDE antes de cada commit.

## Decisão para o chefe

A soma que usava só o cardápio da tela vinha da correção da auditoria 1 (item 6, "dia de enjoo apagava marcações"). Troquei essa regra porque a marca registra o que ela comeu, não o cardápio que estava aberto. O risco da regra nova: se ela marcar a mesma refeição nos dois cardápios, por exemplo o almoço do plano e depois a canja, as duas contam. A linha "Também conta no total do dia" deixa isso à vista, e tocar de novo na marca desfaz. Se a direção preferir a regra antiga, basta reverter `6bca032`. Os commits 2 e 3 não dependem dele.

## O que não testei

- Celular real, emulador e letra grande neste roteiro.
- Ligar o enjoo pelo "Enjoo forte" de "Como está hoje?". Usa a mesma gravação do botão, mas não repeti o teste com o plano dela.
- Desligar o interruptor do plano da nutricionista com o enjoo ligado: só olhei o código, não testei.
- O aviso de comer pouco com o total novo: a regra é a mesma, apenas recebe o número certo.
