# Identidade visual "Hortelã" (protótipo, revisão 2)

**Conclusão:** a revisão segue o pedido do dono depois do primeiro protótipo. Saíram a serifa e o caderno cor de ameixa ("fonte de IA"). Entrou a linguagem dos apps chineses atuais de saúde e dia a dia: um topo colorido que já mostra o essencial, uma grade de atalhos com ícones coloridos, números grandes em negrito, cartões em duas colunas, selos e "marcar o dia" com um toque. A semana do tratamento continua no centro: semana 6, anel de 7 dias e próxima aplicação aparecem antes de qualquer outra coisa. Nada foi aplicado em `app/`. São quatro páginas estáticas em `prototipo/` para o dono aprovar.

## Conceito

- **Inspiração na linguagem, sem cópia.** A referência é a gramática dos apps de saúde e de serviços (Boohee, Keep, Meituan, Alipay, Xiaohongshu): muita informação organizada em blocos pequenos, cor viva e números grandes. Não usei marca, logotipo, ilustração nem tela de nenhum deles. Ícones, pratos e gráficos foram desenhados à mão para este app.
- **O essencial no topo.** O gradiente de hortelã já traz a semana do tratamento, a dose, a proteína de hoje em número grande, o anel do ciclo (dia 4 de 7, com a aplicação marcada em laranja), a próxima aplicação e a água. Ela abre o app e já sabe onde está.
- **Atalhos antes de menus.** Uma grade 4×2 leva a tudo o que ela registra ou consulta: Comida, Água, Peso, Aplicação, Sintomas, Caminhada, Painel e Guia. Cada atalho tem uma cor fixa, que se repete na tela Semana.
- **Marcar o dia (打卡) sem cobrança.** Refeições, copos de água e aplicação ganham um selo de feito quando ela marca. Não existe sequência de dias, contagem de "dias seguidos", mensagem de que ela "perdeu" algo, nem sermão. O texto diz: "O que você não marcar fica em branco, sem cobrança. Dá para marcar depois."
- **Alerta inconfundível.** O aviso de vesícula e pâncreas se diferencia pela forma (borda grossa à esquerda), pelo ícone de triângulo e pelo rótulo "SINAL DE ALERTA", e o vermelho fica reservado para ele. A cor principal é verde, e as dicas usam laranja num cartão sem borda, com ícone de lâmpada.

## Paleta (tokens)

Pares de texto conferidos pela fórmula de contraste WCAG 2.1. O mínimo AA é 4,5:1 para texto normal e 3:1 para texto grande e marcas de gráfico.

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--fundo` | `#f5f6f8` | `#111214` | fundo cinza bem claro / quase preto |
| `--cartao` | `#ffffff` | `#1c1d21` | cartões |
| `--texto` | `#1d2129` | `#e9eaec` | texto principal |
| `--suave` | `#646a73` | `#9ea3ab` | texto secundário |
| `--cinza` | `#f2f3f5` | `#25272c` | fundo de botão neutro e de blocos internos |
| `--pri` | `#087f5b` | `#38d9a9` | verde hortelã: botões, links, aba ativa |
| `--sobre-pri` | `#ffffff` | `#04241b` | texto sobre `--pri` |
| `--pri-clara` | `#e6fcf5` | `#12342b` | selo verde, botão leve |
| `--topo-a / b / c` | `#38d9a9 / #96f2d7 / #fff3bf` | `#0e5a47 / #134e4a / #2b2a1a` | gradiente do topo |
| `--sobre-topo` | `#0b3d2e` | `#e9fbf3` | texto no topo |
| `--dado` | `#0ca678` | `#63e6be` | barras e anéis de proteína (só gráfico) |
| `--dado2` | `#e8590c` | `#ffa94d` | linha de calorias (só gráfico) |
| `--laranja` / `--laranja-clara` | `#b54708` / `#fff4e6` | `#ffb366` / `#2b2017` | dica do dia, selos de atenção |
| `--alerta` / `--alerta-clara` | `#c92a2a` / `#fff0f0` | `#ff8787` / `#2c1a1c` | **só** sinais de alerta |

Cores dos atalhos (gradiente sob o ícone branco; o ícone sempre tem o nome escrito embaixo): comida laranja, água azul, peso roxo, aplicação verde, sintomas rosa, caminhada ciano, painel amarelo, guia índigo.

Contraste medido:

| Par | Claro | Escuro |
|---|---|---|
| texto × fundo | 14,9 | 15,6 |
| suave × cartão | 5,5 | 6,6 |
| suave × fundo | 5,0 | 7,4 |
| sobre-pri × pri (botão) | 5,0 | 9,2 |
| pri × cartão (link) | 5,0 | 9,4 |
| pri × pri-clara (selo verde) | 4,7 | 7,5 |
| sobre-topo × topo (pior ponto do gradiente) | 6,8 | 7,6 |
| laranja × laranja-clara (selo, dica) | 5,0 | 9,0 |
| alerta × alerta-clara | 4,9 | 7,1 |
| alerta × cartão | 5,5 | 7,3 |
| dado × cartão (marca de gráfico) | 3,1 | 10,9 |
| dado2 × cartão (marca de gráfico) | 3,6 | 8,9 |
| branco × capas dos caminhos (azul, verde, laranja) | ≥ 5,0 | iguais |

O escuro foi escolhido à parte: o topo vira verde-garrafa com texto claro, e os botões passam a hortelã clara com texto escuro.

## Tipografia

- Só sem serifa do sistema: `system-ui, -apple-system, Roboto, "Noto Sans", sans-serif`. No Android aparece a Roboto. Nenhuma fonte vai dentro do app. Nas capturas deste computador aparece a DejaVu Sans, um pouco mais larga.
- Hierarquia densa:
  - números grandes 30–34 px, peso 800;
  - números de cartão 22 px, peso 800;
  - títulos de cartão 16 px, peso 700;
  - texto 15 px;
  - rótulos e selos 11,5–13 px.
- Números com algarismos de largura fixa.

## Ícones

Todos próprios, em SVG preenchido, numa grade de 24 px, guardados em `prototipo/fonte/icones.svg`. Substituem os emojis da barra de abas.

| Aba | Ícone |
|---|---|
| Hoje | sol cheio com raios |
| Semana | calendário com os dias vazados |
| Comer | tigela com hashis |
| Mover | pessoa caminhando |
| Guia | livro aberto |

Também desenhados: água (gota), peso (balança com mostrador), aplicação (caneta), sintomas (coração), painel (barras), perfil, alerta (triângulo com exclamação), feito (círculo com visto), dica (lâmpada), conversa, setas. Aba ativa em verde `--pri`, as outras em cinza.

## Tom dos textos

Continua o do briefing: frases curtas, fatos, riscos e opções, sem "o correto é". Selos curtos nomeiam o que importa ("pouca gordura", "28 g de proteína", "prato pequeno", "5 mg", "hoje"). Cada sugestão de refeição traz um "Por quê" de uma linha. Marcar o dia nunca cobra.

**Atenção:** os textos de saúde do protótipo são exemplos de tom. Antes de entrarem no app, cada afirmação nova precisa da fonte anotada (regra 9). Isso vale para a dica do dia, os "por quê", o "vale em todos" e os prós e contras dos caminhos. A frase sobre perda rápida e vesícula vem da bula, já citada no briefing.

## As quatro telas

- `hoje.html`:
  - topo com semana, dose, proteína de hoje em número grande, anel de 7 dias, próxima aplicação e água;
  - grade de 8 atalhos;
  - dica do dia;
  - sinal de alerta da vesícula e do pâncreas;
  - "Marcar o dia" (refeições 2/5, água 4/10, aplicação feita);
  - próxima refeição com selos, o porquê e as quatro opções de um toque que o app já tem;
  - duas colunas com "Como está hoje?" e caminhada, e outras duas com peso e um atalho para o painel;
  - lista "Ainda hoje".
- `painel.html`:
  - topo com proteína e calorias de hoje contra a faixa;
  - seletor Hoje / 7 dias / 30 dias;
  - quatro números em grade (médias, dias na faixa, 30 dias);
  - barras de proteína com faixa e média, e linha de calorias com faixa;
  - nota neutra sobre o dia de enjoo e "Ver como tabela";
  - calendário de 30 dias e média por semana.
- `semana.html`:
  - topo com navegação entre semanas e peso, enjoo e proteína da semana;
  - faixa dos 7 dias com selo de dia marcado (sem sequência);
  - peso no dia de cada aplicação, com a troca de dose marcada e a frase sobre o ritmo;
  - cartões dia a dia, com ícones nas cores dos atalhos e bolinhas de refeição;
  - dias que ainda não chegaram;
  - atalho para o relatório da consulta.
- `caminhos.html`:
  - topo com o caminho atual;
  - "Vale em todos" (vesícula e fígado) em grade;
  - três cartões com capa colorida e prato desenhado: mediterrâneo adaptado, prato dividido (escolhido) e menos açúcar e farinha. Cada um tem selos, para quem, a favor (✓), atenção (!), um almoço de exemplo e os botões;
  - faixa "Converse com sua nutricionista".

Os dados de exemplo são inventados (pessoa fictícia de 97 kg, semana 6, 5 mg). Não usam os dados reais dela.

## O que muda e o que não muda

**Muda:**
- cores, fonte (sem serifa), ícones preenchidos, topo em gradiente com dados, grade de atalhos, cartões em duas colunas, selos, faixa de destaque, "marcar o dia";
- abas: Hoje, Semana, Comer, Mover, Guia;
- telas novas: painel, semana e caminhos.

**Não muda:**
- o que é registrado e como é guardado, e as contas de nutrição;
- as quatro opções por refeição;
- alvos de toque de 44 px ou mais;
- o modo discreto: no app, o topo e o painel devem esconder as calorias quando ele estiver ligado;
- avisos clínicos com fonte, funcionamento sem internet, WebView 113 (CSS até 2022: nada de `:has()` nem `color-mix()`).

## Como abrir e regerar

As páginas de `prototipo/*.html` abrem sozinhas. CSS e ícones vão embutidos, e nada é carregado de fora.

```
node prototipo/fonte/montar.js     # monta as 4 páginas a partir de prototipo/fonte/
node prototipo/fonte/capturar.js   # gera prototipo/capturas/*-claro.png e *-escuro.png (390 px)
```

O capturador acusa rolagem horizontal, botão ou link com menos de 44 px e qualquer pedido para fora do arquivo. Na última rodada não acusou nada.

**Limites:**
- As páginas são estáticas: os toques não fazem nada e os gráficos não mostram o valor ao tocar.
- Não abri as páginas num celular de verdade, só no navegador sem janela, em 390 px.
- Ainda não testei em 320 px. Com a grade de 4 atalhos e as duas colunas, telas estreitas vão precisar de ajuste quando isso for para o app.
