# Plano da nutricionista conferido com as regras de vesícula e fígado

Engenheiro de app (plano da nutricionista), 22/11/2026. Plano prescrito em 04/11/2026, cadastrado em `app/planonutri.js`.
São observações para ela levar à nutricionista. Não corrigem o plano: quem decide é a nutricionista.

## Conclusão

1. **Energia do dia: de 1.009 a 1.392 kcal. Proteína: de 91 a 146 g.** O mínimo é a combinação de opções mais leve, sem a ceia; o máximo, a mais farta, com a ceia. Média das 1.125 combinações: 1.212 kcal e 119 g de proteína.
2. **Nenhuma refeição passa dos limites de cima**: nenhuma tem mais de 15 g de gordura (a maior é o almoço com patinho, 14,9 g), mais de 500 kcal (a maior é o almoço com patinho, 484 kcal) ou mais de 10 g de azeite (o almoço tem 5 ml). Não há fritura nem açúcar no plano.
3. **O que foge das regras da pesquisa fica do lado de baixo**: gordura mínima por refeição (R3), gordura do dia (R3 e R4) e fibra (R12). Detalhes abaixo.
4. A conta do app **não inclui o óleo** dos ovos mexidos, da omelete e dos legumes refogados, porque o plano não diz quanto. Se ela usa óleo ou azeite nesses preparos, a gordura real é maior que a calculada, e parte das observações 1 a 3 da próxima seção pode não valer.

## O que o conferidor apontou

Conferidor: `conferirRegras` de `dados/conferir_cardapio.js`, com as regras de `REGRAS_CARDAPIO` (`app/cardapio.js`), números da seção 5 de `pesquisa-vesicula-figado.md`. Cada combinação de opções (5 cafés × 3 almoços × 5 lanches × 5 jantares × sem ceia, kiwi ou iogurte = 1.125) foi conferida como um dia.

| # | Observação | Regra | Força |
|---|---|---|---|
| 1 | **Café da manhã com pouca gordura** nas opções 2, 4 e 5 (3,4 a 4,2 g). A regra proposta pede pelo menos 7 g em café, almoço e jantar. As opções 1 (10,6 g) e 3 (13,6 g) passam. | R3 | M, precisa de aval |
| 2 | **Jantar com pouca gordura** nas opções 1, 3 e 5 (2,9 a 4,5 g). As opções 2 (9,9 g) e 4 (10,8 g) passam. | R3 | M, precisa de aval |
| 3 | **Dia sem nenhuma refeição com 10 g de gordura ou mais**: 216 das 1.125 combinações (19%). Estudos pequenos mostram que uma refeição com cerca de 10 g esvazia a vesícula ao máximo. | R3 | M, precisa de aval |
| 4 | **Gordura do dia abaixo de 30 g**: 420 combinações (37%); a menor tem 17 g. Abaixo de 25% da energia: 622 combinações (55%); a menor, 13%. O plano é, no geral, de pouca gordura. | R3, R4 | M e P, precisa de aval |
| 5 | **Fibra abaixo de 25 g**: 909 combinações (81%); vai de 16,5 a 30 g. O almoço traz a maior parte (12 g, do feijão, do arroz integral e dos legumes). | R12 | M |
| 6 | **Dia abaixo de 1.200 kcal**: 479 combinações (43%). O app usa 1.200 kcal como piso do cardápio dele; a pesquisa trata isso como cautela para a vesícula (R2). Com a nutricionista acompanhando, o número é dela. | R2 | M |
| 7 | **Peixe**: aparece em duas opções (almoço com peixe e jantar 3). A meta de 2 vezes por semana (R11) depende do que ela escolher. | R11 | F |

O que passou em todas as combinações: gordura por refeição até 15 g (alvo) e até 20 g (teto), azeite até 10 g por refeição, refeição até 500 kcal, sem fritura, sem açúcar adicionado, refeições a cada 3 a 4 horas (7h30, 13h, 16h30, 20h; R7). O intervalo entre o jantar das 20h e o café das 7h30 é de 11h30, dentro do limite de 12 horas (R7).

## Gordura e proteína por refeição

| Refeição | Opção | kcal | Gordura (g) | Proteína (g) | Fibra (g) |
|---|---|---:|---:|---:|---:|
| Café da manhã (7h30) | 1. ovos, pão, mamão | 269 | 10,6 | 16,3 | 3,3 |
| | 2. iogurte proteico, aveia, morango, chia | 234 | 4,2 | 21,8 | 5,3 |
| | 3. tapioca, ovos, queijo minas | 271 | 13,6 | 16,9 | 0,1 |
| | 4. pão, frango, tomate | 228 | 3,4 | 24,4 | 3,9 |
| | 5. leite semidesnatado, banana, whey | 221 | 4,2 | 18,9 | 1,0 |
| Almoço (13h) | com frango | 412 | 9,1 | 46,2 | 12,3 |
| | com peixe | 374 | 9,3 | 39,2 | 12,3 |
| | com patinho | 484 | 14,9 | 50,9 | 12,3 |
| Lanche (16h30) | 1. iogurte proteico, banana, aveia | 189 | 1,5 | 19,4 | 1,9 |
| | 2. sanduíche de frango com creme de ricota | 243 | 4,5 | 25,8 | 3,4 |
| | 3. crepioca, queijo minas, morango | 232 | 11,1 | 12,8 | 1,8 |
| | 4. whey, leite semidesnatado, maçã | 233 | 4,4 | 18,5 | 1,5 |
| | 5. iogurte natural, chia, morango, castanhas | 223 | 13,2 | 11,3 | 5,5 |
| Jantar (20h) | 1. frango, pão sírio, salada, creme de ricota | 300 | 4,5 | 38,8 | 3,9 |
| | 2. omelete, legumes, batata-doce | 285 | 9,9 | 24,1 | 4,7 |
| | 3. peixe, purê de abóbora, legumes | 225 | 4,2 | 34,1 | 5,0 |
| | 4. patinho moído, wrap, salada | 337 | 10,8 | 40,2 | 4,4 |
| | 5. frango, mandioca, salada | 294 | 2,9 | 33,4 | 2,6 |
| Ceia (opcional) | kiwi | 38 | 0,5 | 1,0 | 2,0 |
| | iogurte natural | 57 | 3,3 | 4,5 | 0,0 |

Proteína: todas as combinações ficam entre 91 e 146 g. Para o perfil dela, a faixa que o app calcularia (1,2 a 1,6 g por kg do peso de referência) começa perto de 90 g: as combinações mais leves ficam no limite de baixo dessa faixa, as outras dentro dela. O app não aplica a meta dele enquanto o plano da nutricionista está em uso.

## Limites desta conta

- Valores da TACO e do USDA, não dos produtos que ela compra. Iogurte proteico e creme de ricota variam muito por marca e estão como estimativa.
- Quantidades que o plano não dá foram estimadas, cada uma com a regra anotada em `app/planonutri.js`: banana e pão pequenos, wrap, goma de tapioca (convertida para fécula seca), tomate e saladas "à vontade", e a mistura dos "legumes 100 g".
- "Castanhas" contam como castanha de caju; se for castanha-do-pará, o lanche 5 sobe cerca de 2 g de gordura.
- Os números das regras R3, R4 e R5 são propostas da equipe ou vêm de estudos pequenos (seção 5 da pesquisa) e precisam do aval da nutricionista ou do médico antes de virar orientação.

## Perguntas que ela pode levar à nutricionista

1. Nos dias em que eu escolher café e jantar com pouca gordura, devo pôr um fio de azeite ou incluir uma castanha, por causa da pedra na vesícula?
2. Quanto óleo ou azeite posso usar nos ovos mexidos, na omelete e nos legumes refogados?
3. A fibra do meu dia fica abaixo de 25 g em várias combinações. Vale aumentar (fruta com casca, mais legumes, chia) e em que ritmo?
4. Combinações abaixo de 1.200 kcal são esperadas no meu plano?
