# Cardápio de reserva vegetariano (auditoria 3, I1)

## Conclusão
Com a restrição "vegetariana" no Perfil, o cardápio de reserva agora passa em todas as regras de vesícula e fígado do próprio
projeto (`REGRAS_CARDAPIO`). O perfil parecido com o dela foi conferido sozinho, com lactose e com ovo, e outros 11 perfis
também. Nenhuma refeição passa de 500 kcal nem de 20 g de gordura, e nenhum dia passa de 35% de gordura. A proteína fica perto
da meta: 105 g para uma meta de 108 g, dentro dos 3% que o app aceita.

Continua: 13 refeições entre 15 e 19,4 g de gordura. Isso está acima do alvo de 15 g, mas abaixo do teto de 20 g (detalhe abaixo).
O cardápio principal (o plano da nutricionista) não mudou. Também não mudou o cardápio de reserva de quem não marca "vegetariana".

Conferência: `node dados/conferir_cardapio.js --perfil sexo=F,altura=158,peso=120,idade=45,atividade=1.2,naoCome=vegetariana`

## Antes e depois (perfil parecido: mulher adulta com obesidade, sedentária; meta 1.650 kcal e 108 g de proteína)

| | Antes | Depois |
|---|---|---|
| Problemas do conferidor | 23 | 0 |
| Refeição mais pesada | 614 kcal (almoço de terça) | 500 kcal |
| Refeições acima de 500 kcal | 5 | 0 |
| Maior gordura numa refeição | 27,9 g | 19,4 g (lanche de quinta: 4 ovos) |
| Refeições acima de 20 g de gordura | 11 | 0 |
| % de gordura do dia | 37 a 40% | 31 a 34% |
| Proteína média | 120 g | 105 g |
| Energia média | 1.650 kcal | 1.649 kcal |
| Fibra por dia | 33 a 57 g | 47 a 57 g |
| Acima do alvo de 15 g (não é erro) | 7 | 13 |

Exemplo: no almoço de terça, antes o patinho virava 250 g de soja (27,9 g de gordura). Agora vira 140 g de soja e
80 g de lentilha (18,5 g de gordura no prato, 499 kcal).

## Por que quebrava
A troca automática punha um único alimento no lugar da carne: soja, tofu ou ovo, até 250 g. Eles têm proteína e também
gordura. Como eles trazem menos proteína que a carne, o fator de proteína subia até o máximo (1,75). Com isso, os ovos do café
iam a 200 g. Só a gordura e o carboidrato do prato encolhiam, a proteína nunca.

## O que mudou
1. `app/cardapio.js`: cada carne, ave ou peixe de segunda a domingo tem a sua troca vegetariana escrita (`semCarne`), em vez
   da troca automática. Ela usa soja em porção moderada e mais feijões (lentilha, grão-de-bico, ervilha). O tofu fica só no
   jantar de domingo. Onde saiu peixe gorduroso (sardinha na segunda, salmão na sexta), entra um pouco de azeite, para a
   refeição não ficar sem a gordura mínima que faz a vesícula esvaziar (R3). Só entram alimentos que já estão em
   `app/alimentos.js`, e `alimentos.js` não foi editado.
2. `app/nutricao.js`:
   - `resolverDia` usa essa troca quando "vegetariana" está marcada. Se outra restrição vetar algum dos alimentos, volta a
     troca automática de antes.
   - `fatorDaRefeicao` ganhou um passo 3: se a refeição ainda passa do teto de gordura (20 g) ou de 500 kcal depois de
     encolher gordura e carboidrato, a porção de proteína desce até caber. Nos perfis sem restrição isso não acontece: os
     testes de antes passam iguais.
3. Testes:
   - `testes/unidade/regras-cardapio.js`: dois perfis vegetarianos na lista de perfis. Teste novo com o perfil parecido
     vegetariano, sozinho, com lactose e com ovo.
   - `testes/unidade/cardapio.js`: a tabela de trocas só usa alimentos que existem, sem carne, e fora dos exclusivos do plano
     da nutricionista.

## O que fica em aberto
- **Acima do alvo:** 13 refeições ficam entre 15 e 19,4 g de gordura, quase todas com ovo ou soja. A frase da tela Plano
  ("cerca de 15 g de gordura no prato") vale para o cardápio sem restrição. Para a vegetariana, o número mais certo é "até
  20 g". A frase não foi mudada.
- **Ovos nos lanches:** o lanche de terça e o de quinta chegam a 200 g de ovo (4 unidades). Passa nas regras, mas é muito ovo
  para um lanche. Isso vem do fator de proteína alto, que a busca da escala continua escolhendo.
- **Título e preparo:** continuam falando da carne (por exemplo, "Patinho grelhado..."). A tela mostra cada troca como
  "no lugar de Patinho".
- **Dia de enjoo:** a canja segue com a troca automática (tofu até 250 g). Ela já passava nas regras e não foi mexida.
- **Perfis de 1.200 a 1.250 kcal:** a semana vegetariana fica acima da meta de energia (cerca de 1.450 kcal). Os feijões não
  encolhem abaixo da porção de base, e o app já avisa com "as porções chegaram ao limite". Esses perfis não são o dela.
- **Avaliação profissional:** as porções foram escolhidas pela conferência automática, não por avaliação clínica. Os números
  das regras (alvo de 15 g, teto de 20 g, 500 kcal) são proposta da equipe e precisam do aval da nutricionista. Também não
  sabemos se ela é vegetariana.
