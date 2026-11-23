# Acessibilidade: contraste e leitor de tela (22/11/2026)

## Conclusão

- **Texto: nada abaixo do mínimo AA**, no claro e no escuro, em todas as telas medidas. Foram 4.198 trechos de texto (2.099 por modo), com a cor computada pelo navegador contra o pixel real do fundo. Isso inclui as cores novas (rosa, azul, violeta, degradê do topo), o cartão da vesícula, os botões secundários, os textos `.sub` e a refeição marcada com `var(--suave)` (commit cb9f833): 5,45:1 no claro e 6,62:1 no escuro.
- **Uma falha de componente, corrigida:** o contorno dos campos de texto (peso, data, PIN, metas, listas de escolha) tinha 1,26:1 contra o cartão no claro e 1,23:1 no escuro. O mínimo da WCAG 1.4.11 é 3:1. Agora: 3,42:1 e 3,63:1.
- **Leitor de tela: duas falhas, corrigidas.** A caixa de texto do Relatório não tinha nome. A folha que sobe de baixo (por exemplo, "Dor na barriga: o que fazer") não tinha nome e não recebia o foco. Agora tem nome e o foco entra nela, no botão Fechar.
- **Foco com teclado:** visível em todas as paradas de Tab das 9 telas, nos dois modos. A exceção é o campo de data: o contorno do campo não aparece, mas o Chromium destaca o pedaço (dia, mês ou ano) em edição. Não mexi.
- A identidade visual não mudou. Só uma variável de cor nova, `--borda-campo`, usada nos campos.

Ramo: `worktree-agent-ac784e874768b397e`. Commits:
1. `Campos de texto com contorno visível (contraste 3:1)`
2. `Folha e relatório com nome para o leitor de tela`
3. este relatório

## Como foi medido

- Navegador sem janela (Chromium do Playwright), 440 px de largura, modo claro e escuro (`prefers-color-scheme`).
- Perfil de teste com vesícula, fígado, cirurgia e plano da nutricionista ligados, uma refeição marcada em Hoje, pesos e aplicações de teste. Nenhum dado real.
- Telas: Hoje (com a refeição marcada), folha "Dor na barriga", Semana, Diário (Aplicações, Peso, Sintomas, Relatório), Painel, Plano (com o plano da nutricionista e com o cardápio de reserva), Caminhos, Mover, Guia (artigos abertos), Perfil (blocos abertos), diálogo de confirmação, primeira tela.
- Para cada trecho de texto: cor computada (com a opacidade dos pais), depois a página é capturada com todo o texto transparente e o fundo é lido no pixel, debaixo do texto. Assim o degradê do topo e os fundos translúcidos entram com a cor real. Vale a mediana de 15 amostras por linha de texto.
- Texto grande (24 px, ou 18,66 px em negrito) precisa de 3:1; o resto, 4,5:1.
- Componentes (bordas, ícones): razão calculada das variáveis de cor.
- Rótulos: árvore de acessibilidade do Chromium. Todo botão, link, campo e caixa de marcar precisa ter nome.
- Foco: 80 toques de Tab por tela, conferindo o contorno do elemento focado.

Os scripts ficaram fora do projeto (pasta temporária). O que vale guardar virou teste: `testes/fluxo-acessibilidade.js`.

## Texto: as razões mais baixas (todas passam)

| Onde | Claro | Escuro |
|---|---|---|
| `.sub` sobre `--cor-clara` (cartão de destaque: Semana atual, Mover) | 4,64 | 5,87 |
| Título vermelho do alerta sobre `--alerta-fundo` (vesícula, "Ligue 192 agora") | 4,93 | 7,13 |
| `.sub` sobre o fundo da página | 5,03 | 7,4 ou mais |
| Selo "Só com a equipe" e letra D em `--falta` (Caminhos) | 5,02 | 11,78 |
| `.sub`, rótulos, refeição marcada, aba inativa sobre o cartão | 5,45 | 6,62 |
| Botão "Dor na barriga" e "Apagar todos os dados" (`--alerta` sobre o cartão) | 5,46 | 7,25 |
| Botões secundários (`--cor` sobre o cartão) | 7,1 | 6,96 |
| Texto sobre o degradê do topo de Hoje | 10,5 ou mais | 7,5 ou mais |

Pontos que pedem cuidado se a paleta mudar:
- `.sub` sobre `--cor-clara` no claro está a 4,64: pouca folga. Clarear `--cor-clara` ou `--suave` derruba abaixo de 4,5.
- O vermelho do alerta sobre `--alerta-fundo` no claro está a 4,93.
- `--ok` sobre `--cor-clara` no claro (o "✓" dos Caminhos): 4,53.

O botão "Seguinte ›" da barra de dias, desativado em hoje, fica com 1,8:1 (opacidade .35). Controle desativado é isento na WCAG; não mudei.

## Componentes (WCAG 1.4.11, 3:1)

| Item | Antes | Depois |
|---|---|---|
| Contorno de campo de texto e lista contra o cartão (claro / escuro) | 1,26 / 1,23 | 3,42 / 3,63 |
| Contorno contra o fundo do próprio campo (claro / escuro) | 1,16 / 1,38 | 3,15 / 4,07 |
| Borda dos botões secundários, das quatro marcas da refeição e do Sim/Não/Não sei (`--cor`) | 7,1 / 6,96 | igual |
| Contorno de foco das marcas (`--texto`) e do gráfico do Painel (`--cor`) | 7 ou mais | igual |

Botões com texto dentro (sub-abas do Diário, "Como está hoje?") têm borda clara (`--linha`), mas o texto já mostra o que é o botão; a WCAG não exige borda nesse caso.

Ícones brancos dos atalhos de Hoje sobre o degradê colorido: de 1,3:1 (Painel, amarelo) a 3,1:1 (Peso). Não é falha porque o nome vai escrito embaixo de cada um, em `--texto`. Se algum dia o nome sair, o amarelo e o verde-claro precisam escurecer.

## Leitor de tela

O que já estava certo:
- Botão do Perfil (só ícone): `aria-label="Perfil e metas"`. Ícones da barra de baixo com `aria-hidden` e o nome escrito.
- Setas da barra de dias: "Dia anterior" e "Dia seguinte".
- Marcas da refeição: grupo "Quanto comeu de ...". Lista de opção do plano: "Opção do plano para ...".
- Gráficos do Painel e do Peso com `aria-label` e "Ver como tabela".
- Todos os campos do Perfil, Diário e PIN dentro de `<label>`.
- Diálogo de confirmação com `role="alertdialog"`, texto ligado por `aria-describedby` e foco no primeiro botão.
- Faixa de erro de gravação com `role="alert"`, aviso curto com `role="status"`.

O que foi corrigido:
- A caixa de texto do Relatório não tinha nome: agora `aria-label="Texto do relatório"`.
- A folha (`role="dialog"`) não tinha nome: agora `aria-labelledby` aponta para o título dela.
- Ao abrir a folha, o foco ficava no botão que a abriu, atrás dela. Com leitor de tela, ela não ouvia nada. Agora o foco vai para o botão Fechar da folha.

O que ficou aberto (não corrigi, para mudar o mínimo antes da entrega):
- Ao fechar a folha ou o diálogo, o foco não volta ao botão que abriu: vai para o começo da página.
- Os botões "editar" e "apagar" das listas (peso, sintomas, aplicações, treinos) dizem só "editar" e "apagar". O leitor lê a linha antes, mas um nome como "Apagar peso de 20/11" seria mais claro.
- O código de recuperação do PIN usa espaços escondidos entre os grupos; não testei como o TalkBack soletra.
- As telas do PIN não entraram na medição automática de contraste. Usam só `--texto`, `--suave`, `--alerta` e `--cor` sobre o cartão, que estão na tabela acima.

## Não testado

- TalkBack de verdade, no Xiaomi ou no emulador. Tudo aqui é pela árvore de acessibilidade do Chromium.
- Tema escuro forçado do MIUI/HyperOS, que pode trocar as cores por conta própria.
- Letra grande muda o tamanho, não a cor; não medi separado.
- Não mexi no layout da faixa de dias do Plano nem das sub-abas do Diário (outro agente).
