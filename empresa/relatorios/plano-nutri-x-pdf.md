# Plano da nutricionista no app conferido contra o PDF

Conferente do plano alimentar, 22/11/2026. Fonte: o PDF do plano alimentar (prescrito em 04/11/2026; fica fora do git) contra
`PN_REFEICOES` e `pnFaixaDia` em `app/planonutri.js` (commit cb9f833). Nenhum código do app foi alterado nesta conferência.

## Conclusão

1. **O texto do plano está fiel ao PDF.** As 5 refeições, os 4 horários (7h30, 13h, 16h30, 20h; ceia sem hora, opcional "se
   houver fome"), as 5 + 5 + 5 + 2 opções e o almoço por grupos conferem item por item. Nenhum alimento falta, nenhum sobra,
   nenhuma quantidade escrita difere e nenhuma observação do PDF foi omitida. "Canela a gosto" aparece e fica fora da conta, como deve.
2. **As diferenças estão na conta, não no texto.** Encontrei 2 importantes e 10 menores:
   - **I1. Whey:** o alimento da tabela dá 11,6 g de proteína em 20 g de pó. Rótulos de whey costumam dar bem mais. O café 5 e o
     lanche 4 aparecem com cerca de 4 g de proteína a menos cada um.
   - **I2. "Peixe" conta como tilápia, e a tela não avisa.** Com salmão, o almoço passaria de 20 g de gordura, que é o teto do app
     para a vesícula.
3. **Faixa do dia (pnFaixaDia): de 1.009 a 1.392 kcal e de 91 a 146 g de proteína.** Recalculei por fora e bate com o app e com
   `plano-nutricionista-conferido.md`. **O PDF não declara energia nem proteína** (a página 3, "Lista de compras", está vazia),
   então não há número dela para comparar. Frente ao perfil, a faixa é plausível para um plano de baixa caloria (detalhes na seção 3).
   Corrigir o whey (I1) não muda os limites da faixa: as opções com whey não são nem a mais leve nem a mais farta.

## 1. Diferenças importantes (mudam o número que ela vê)

| # | Onde | PDF | App | Efeito | Correção sugerida |
|---|---|---|---|---|---|
| I1 | Café opção 5 e lanche opção 4 | "1 dose de whey protein (20 g)", sem tipo | `whey` = USDA 173177 ("Whey protein powder isolate"): 359 kcal, **58,1 g de proteína** e 29,1 g de carboidrato por 100 g | 20 g dão 11,6 g de proteína e 5,8 g de carboidrato. Whey de mercado costuma ter de 70% a 90% de proteína, ou seja, de 14 a 18 g em 20 g (faixa de rótulos, que esta rodada não conferiu com fonte). Com 78 g de proteína por 100 g, o café 5 passaria de 18,9 para cerca de 22,8 g e o lanche 4 de 18,5 para cerca de 22,5 g. A faixa do dia não muda. | Em `dados/gerar_alimentos.py`, tratar o whey como estimativa por rótulo, do mesmo jeito que o `iogurte_proteico`: nome "Whey protein (estimativa)", com valores de rótulo anotados e fonte. Depois, regerar `alimentos.js`. No `planonutri.js`, marcar `est: true` nos dois itens de whey. O número final depende do rótulo do pó que ela usa: decisão do chefe. |
| I2 | Almoço "Com peixe" e jantar opção 3 | "Frango, peixe ou patinho magro: 120 g" e "120 g de peixe grelhado", sem espécie | `tilapia` (128 kcal e 2,6 g de gordura por 100 g), sem marca de estimativa | Para tilápia, merluza ou pescada, o número está certo. Com salmão (`salmao` da base: 243 kcal e 14,5 g de gordura por 100 g), o almoço iria de 374 para cerca de 512 kcal e de 9,3 para cerca de 23,6 g de gordura, acima do teto de 20 g por refeição. Hoje a tela mostra o número sem dizer que supõe peixe branco. | Em `pnAlmoco`, aceitar `est` e passar `true` no item "Peixe: 120 g". Marcar `est: true` em "120 g de peixe grelhado" (jantar 3). Acrescentar à nota do almoço: "A conta usa peixe branco (tilápia). Salmão e sardinha têm mais gordura." |

## 2. Diferenças menores (cosméticas ou de poucos gramas/kcal)

| # | Onde | PDF | App | Efeito | Correção sugerida |
|---|---|---|---|---|---|
| M1 | Lanche opções 3 e 5 | "1 porção de morangos", sem gramas | 100 g, **sem** `est: true` | A conta usa a porção do café (100 g), mas a tela não mostra "(quantidade estimada na conta)", ao contrário dos outros itens sem gramas no PDF | `est: true` nos dois itens "1 porção de morangos" do lanche |
| M2 | Comentário do arroz em `planonutri.js` | "Arroz integral ou branco: 70 g" | Conta o integral, o que está certo. O comentário, porém, diz que "o branco tem 3% a menos de energia" | Pela TACO, o branco cozido tem 128 kcal e o integral 124: o branco tem **3% a mais** de energia. Em fibra, o branco dá 1,1 g em 70 g e o integral 1,9 g. Só o comentário está errado; a conta não muda. | Trocar por "o branco tem cerca de 3% a mais de energia e menos fibra (1,1 contra 1,9 g em 70 g)" |
| M3 | Lanche opção 5 ("1 iogurte natural (170 g)") e ceia | Não diz se é integral ou desnatado | `iogurte` = natural integral (TACO 448: 51 kcal e 3,0 g de gordura por 100 g) | Com desnatado (TACO 449: 41 kcal e 0,3 g), o lanche 5 teria 17 kcal e 4,6 g de gordura a menos. A escolha do integral não está anotada no comentário de medidas. | Anotar no comentário: "iogurte natural conta o integral; o desnatado tem cerca de 4,6 g a menos de gordura em 170 g" |
| M4 | Café opção 5 e lanche opção 4 (leite) | "200 ml de leite semidesnatado" | USDA 172205, leite com 2% de gordura | O semidesnatado vendido no Brasil costuma ter menos gordura. Em 200 ml, a diferença é de 1 a 2 g de gordura e de 10 a 15 kcal. | Nada, ou anotar no comentário que a conta usa leite com 2% de gordura |
| M5 | Café opção 3 e lanche opção 3 | "queijo minas", sem tipo | `queijo_minas` = minas frescal da TACO (264 kcal e 20,2 g de gordura por 100 g) | Coerente com a TACO. Um minas light ou padrão muda de 1 a 2 g de gordura nos 20 a 30 g do plano. | Nada |
| M6 | Café opção 4, lanche opção 2 e jantares 1 e 5 | "frango desfiado" | `frango_peito` = peito grelhado (159 kcal, 32,0 g de proteína e 2,5 g de gordura) | O frango desfiado costuma ser o peito cozido. Pela TACO 408, o cozido sem pele tem 163 kcal, 31,5 g de proteína e 3,2 g de gordura. Em 100 g, a diferença é de 4 kcal e 0,7 g de gordura. **Não muda o valor de forma relevante.** | Nada (opcional: anotar no comentário que o cozido da TACO dá quase o mesmo) |
| M7 | Almoço "Com patinho" e jantar opção 4 | "patinho magro" e "patinho moído" | Patinho sem gordura, grelhado (TACO 377) | É a melhor entrada da base. A carne moída comprada pronta pode ter mais gordura que o bife de patinho limpo. | Nada |
| M8 | Café opção 3 e lanche opção 3 (goma) | "30 g de goma" e "20 g de goma" | Supõe goma hidratada: 22 g e 15 g de fécula seca (est.) | Se for fécula seca, são 26 e 17 kcal a mais. Já aparece como estimada na tela. | Nada (a pergunta pode ir à nutricionista) |
| M9 | Lanche opção 2 e jantar opção 1 | "1 colher de sopa de creme de ricota" | 15 g de ricota da TACO (est.) | Creme de ricota de marca e colher mais cheia podem dar de 10 a 20 kcal a mais. Já aparece como estimada. | Nada |
| M10 | Almoço | Uma lista única, com a proteína em 5º lugar | 3 opções ("Com frango", "Com peixe", "Com patinho"), com a proteína em 1º lugar e sem os pontos finais | Formato diferente, mesmo conteúdo. A nota "No plano, o almoço é por grupos…" explica a divisão. | Nada |

Já registrado em `plano-nutricionista-conferido.md` e não repetido como diferença: a conta não inclui o óleo dos ovos
mexidos, da omelete e dos legumes refogados, porque o PDF não diz quanto. Cada colher de chá de óleo soma cerca de 40 kcal e
4,6 g de gordura.

### Itens conferidos sem diferença

Café da manhã: as 5 opções, com todos os itens e quantidades (ovos 2 × 50 g, pão 25 g por fatia, mamão 150 g, iogurte proteico
170 g, aveia 20 g, morango 100 g, chia 5 g, queijo 20 g, frango 60 g, tomate est., leite 200 ml, banana pequena est., canela
fora da conta). Almoço: salada à vontade (est.), legumes 100 g (mistura est.), arroz 70 g, feijão 80 g, proteína 120 g, azeite 5 ml.
Lanche: aveia 10 g, pão 2 fatias, frango 60 g, crepioca com 1 ovo e 20 g de goma, queijo 30 g, maçã pequena, iogurte 170 g,
chia 10 g e castanhas 10 g (castanha de caju, est.). Jantar: frango 100 g, pão sírio pequeno (est.), alface, tomate e cenoura (est.),
omelete com 2 ovos e 2 claras, legumes 100 g, batata-doce 100 g, peixe 120 g, purê de abóbora 100 g (conta a abóbora
cozida, sem leite nem manteiga, que o PDF também não cita), patinho moído 100 g, wrap pequeno (est.), mandioca 100 g e salada (est.).
Ceia: 1 kiwi ou 1 iogurte natural sem açúcar de 100 a 120 g (conta 110 g).

## 3. Faixa de energia e proteína (pnFaixaDia)

Recalculei com `app/alimentos.js` e os gramas de `PN_REFEICOES`, num script fora do repositório:

| | Energia | Proteína | Gordura | Fibra |
|---|---:|---:|---:|---:|
| Mínimo (opção mais baixa de cada refeição obrigatória, sem ceia) | 1.009 kcal | 91 g | 17 g | 16,5 g |
| Máximo (opção mais alta de cada refeição, com a ceia mais alta) | 1.392 kcal | 146 g | 56 g | 30 g |

- **Igual ao app** e ao relatório anterior.
- **O mínimo é tirado nutriente por nutriente.** O dia de menor energia (café 5, almoço com peixe, lanche 1, jantar 3) não é o
  mesmo dia de menor proteína (café 1, almoço com peixe, lanche 5, jantar 2). Os dois existem como combinações reais. O alvo de
  proteína (91 g) é o menor valor possível seguindo o plano inteiro, então todo dia completo dentro do plano chega nele. É
  coerente com o rótulo da tela ("da combinação mais leve, sem a ceia, à mais farta, com a ceia").
- **O PDF não declara meta de energia nem de proteína.** Não há como dizer se o app bate com o número da nutricionista; só que é
  a soma do que ela prescreveu, pela tabela.
- **Plausibilidade frente ao perfil** ([dados removidos]). Pela equação de Mifflin-St Jeor, o gasto em repouso dá cerca
  de 1.820 kcal. Então 1.009 a 1.392 kcal é um plano de baixa caloria, com déficit grande, comum em obesidade grave com
  acompanhamento. A proteína de 91 a 146 g dá de 0,75 a 1,2 g por kg do peso atual. Isso fica dentro ou acima da faixa de 1,2 a
  1,6 g por kg do peso de referência que o app usa (o relatório anterior estimou o começo dessa faixa perto de 90 g).
  Ponto de atenção, não de correção: déficit grande somado à tirzepatida pode acelerar a perda de peso, e perda rápida é risco
  para a vesícula (BRIEFING). O app já acompanha o ritmo de perda; o número do plano é decisão da nutricionista.
- A energia real é um pouco maior que a calculada nos dias com ovos mexidos, omelete ou refogado, por causa do óleo não contado.

## Como foi feito e limites

- Li o PDF com `pdftotext` e conferi linha por linha com `PN_REFEICOES`. As imagens do PDF são só logotipo e QR, sem conteúdo do plano.
- As faixas de rótulo citadas para whey, semidesnatado e creme de ricota vêm do conhecimento geral de rótulos e **não foram
  conferidas com fonte nesta rodada**. Antes de mudar a base, vale conferir o rótulo do produto que ela usa.
- Nenhum teste do app foi rodado: não mudei código. O commit tem só este relatório.
