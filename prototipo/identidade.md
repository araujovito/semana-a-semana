# Identidade visual "Ciclo de sete" (protótipo para aprovação)

**Conclusão:** a proposta troca a cara de "contador de calorias" (verde-água, números grandes no topo) por um caderno da semana de tratamento. O centro de cada tela passa a ser o ciclo de 7 dias entre uma aplicação e a próxima. Calorias e proteína continuam no app, a um toque, num painel próprio. Nada disto foi aplicado em `app/`: são quatro páginas estáticas em `prototipo/` para o dono aprovar ou recusar a direção.

## Conceito

- A vida dela no tratamento anda de aplicação em aplicação: dose, enjoo nos dias seguintes, apetite que volta, véspera da próxima. O nome do app já diz isso. A identidade desenha essa unidade: **um anel de 7 partes**, com a aplicação marcada no alto e o dia de hoje em destaque. O anel aparece na tela Hoje e vira o ícone da aba Semana.
- Ela tem [idade], faz um tratamento longo e está esperando uma cirurgia. O visual é de **caderno de papel**: fundo cor de papel, títulos com serifa, cor de tinta ameixa. Fica longe do visual de academia ou de hospital. É sóbrio, adulto e sem tom infantil.
- Os números não julgam. Ficar abaixo da meta aparece em tom mais claro da mesma cor, nunca em vermelho. Vermelho fica só para os **sinais de alerta** (vesícula e pâncreas), que assim não se perdem no meio da tela.
- Ordem da tela Hoje: em que ponto da semana ela está, como está se sentindo, o que comer agora e por quê. Só depois vêm os números.

## Paleta (tokens)

Todos os pares de texto conferidos pela fórmula de contraste WCAG 2.1. O mínimo AA é 4,5:1 para texto normal e 3:1 para texto grande ou elementos gráficos.

| Token | Claro | Escuro | Uso |
|---|---|---|---|
| `--fundo` | `#f6f1ea` | `#16121a` | papel da tela |
| `--cartao` | `#fffdfa` | `#211b25` | cartões |
| `--texto` | `#2b2230` | `#f2ebf0` | texto principal |
| `--suave` | `#685d6b` | `#b4a8b6` | texto secundário |
| `--linha` | `#e6ddd4` | `#352c39` | bordas, divisórias |
| `--cor` | `#6d3b5e` | `#dcaacb` | ameixa: ação, aba ativa, dados |
| `--sobre-cor` | `#ffffff` | `#2a1525` | texto sobre `--cor` |
| `--cor-clara` | `#efe2ea` | `#38243a` | fundo de destaque, "por quê" |
| `--acento` | `#a8481f` | `#f0a57a` | terracota: só aplicação e caneta |
| `--alerta` | `#b42318` | `#f59a8e` | só sinais de alerta |
| `--alerta-clara` | `#fbe9e7` | `#3a1f1d` | fundo do cartão de sinais |
| `--ok` | `#3d6f4f` | `#8fc8a2` | reservado, pouco uso |
| `--dado-suave` | `#c9a9bf` | `#6e4a64` | dia já passado no anel, "abaixo da faixa" |
| `--faixa` | `#e9dfe5` | `#2f2533` | faixa da meta nos gráficos |
| `--vazio` | `#e6ddd4` | `#3a313e` | trilho vazio, dia que ainda não chegou |

Contraste medido:

| Par | Claro | Escuro |
|---|---|---|
| texto × fundo | 13,6 | 15,8 |
| texto × cartão | 15,1 | 14,4 |
| suave × fundo | 5,6 | 8,1 |
| suave × cartão | 6,1 | 7,4 |
| suave × cor-clara | 5,0 | 6,2 |
| cor × cartão (links, botão secundário) | 8,5 | 8,5 |
| sobre-cor × cor (botão) | 8,6 | 8,7 |
| cor × cor-clara (botão leve, aba ativa) | 6,9 | 7,2 |
| acento × cartão | 5,7 | 8,3 |
| alerta × cartão | 6,5 | 7,9 |

O escuro foi escolhido à parte, não é a inversão automática do claro: a ameixa clareia para rosa-ameixa e o terracota para pêssego, para manter o contraste sobre o fundo escuro.

## Tipografia

- **Títulos:** `"Noto Serif", "Droid Serif", Georgia, serif`. A Noto Serif já vem no Android, então não vai arquivo de fonte junto com o app. Nas capturas deste computador aparece a DejaVu Serif no lugar, que é um pouco mais larga. No celular o título fica um pouco mais estreito.
- **Texto:** `system-ui, Roboto` (a fonte do Android).
- Tamanhos: título da tela 27 px, título de cartão 19 px, texto 16 px, secundário 14 px. Números com algarismos de largura fixa (`tabular-nums`).
- Rótulos pequenos em caixa alta com espaçamento ("SEXTA, 20 DE NOVEMBRO", "PRÓXIMA") marcam a seção sem pesar.

## Ícones

Desenhados à mão em SVG, traço de 1,8 px, grade de 24 px, cor do texto (`currentColor`). Ficam em `prototipo/fonte/icones.svg`. Saem os emojis da barra de abas (☀ 🍽 💪 📓 📖), que mudam de desenho conforme o celular.

| Aba | Ícone |
|---|---|
| Hoje | sol nascendo sobre a linha do horizonte |
| Semana | anel de 7 pontos, o primeiro cheio (dia da aplicação) |
| Comer | tigela com vapor |
| Mover | pessoa caminhando |
| Guia | livro aberto |

Também desenhados: perfil, caneta (aplicação), balança, gota, alerta, relógio, setas, balão de conversa. A aba ativa ganha uma pílula `--cor-clara` atrás do ícone.

## Tom dos textos

Continua o do briefing: frases curtas, fatos, riscos e opções. O que muda:
- Cada sugestão traz **"por quê"** em uma frase (ex.: "pouca gordura de uma vez é mais leve para a vesícula").
- Pergunta em vez de cobrança: "Como você está hoje?", nunca "Você não bateu a meta".
- Abaixo da meta tem explicação neutra ("Quarta, dia seguinte à aplicação, teve menos comida e mais enjoo. Isso costuma acontecer...").
- Caminhos de alimentação são **opções**, cada uma com "para quem", "a favor" e "atenção", e a decisão volta para a nutricionista.

**Atenção:** os textos de saúde do protótipo são exemplos de tom. Antes de entrarem no app, cada afirmação nova precisa da fonte anotada (regra 9), sobretudo os "por quê" das refeições, a base comum dos caminhos e os prós e contras. A frase sobre perda rápida e vesícula vem da bula, já citada no briefing.

## As quatro telas

- `hoje.html`: data, "Semana 6 do tratamento", anel do ciclo (dia 4 de 7, aplicação na terça, dose, próxima), "Como você está hoje?" com um toque, próxima refeição com o porquê e as quatro opções (tudo, metade, um pouco, nada) que já existem, resumo de proteína numa linha que abre o painel, água em copos, faixa fixa de sinais de alerta, atalhos de registro.
- `painel.html`: Hoje até agora contra a faixa da meta (barra com a faixa marcada), 7 dias (média, dias na faixa, barras de proteína com linha de média, linha de calorias), 30 dias (calendário com os dias na faixa, abaixo dela ou sem registro, e média por semana). "Ver como tabela" é a saída acessível que o app vai ter.
- `semana.html`: navegação entre semanas, peso no dia de cada aplicação com a mudança de dose marcada e a frase sobre o ritmo, linha do tempo dia a dia (aplicação, peso, enjoo em 3 níveis, refeições em 5 bolinhas, sintomas, movimento), resumo para a consulta.
- `caminhos.html`: o que vale em todos os caminhos (vesícula e fígado), três cartões (mediterrâneo adaptado, prato dividido, menos açúcar e farinha) com para quem, a favor, atenção e um almoço de exemplo, o caminho atual marcado, "Converse com sua nutricionista".

Dados de exemplo inventados (pessoa fictícia de 97 kg na semana 6, dose de 5 mg). Não usam os dados reais dela.

## O que muda e o que não muda

**Muda:** cores, fontes, ícones, topo sem faixa colorida, ordem da tela Hoje, barra de abas (Hoje, Semana, Comer, Mover, Guia), e telas novas: painel, semana e caminhos.

**Não muda:** o que já é registrado e como é guardado, as contas de nutrição, as quatro opções de um toque por refeição, alvos de toque de 44 px ou mais, o modo discreto (sem calorias em destaque; no app, o painel deve esconder calorias quando ele estiver ligado), avisos clínicos e os textos com fonte, funcionamento sem internet, WebView 113.

## Como abrir e regerar

As páginas de `prototipo/*.html` abrem sozinhas no navegador. Cada uma traz o CSS e os ícones embutidos e não carrega nada de fora. Elas são geradas a partir de `prototipo/fonte/`:

```
node prototipo/fonte/montar.js     # monta as 4 páginas
node prototipo/fonte/capturar.js   # gera prototipo/capturas/*-claro.png e *-escuro.png (390 px)
```

O capturador também acusa rolagem horizontal, botão ou link com menos de 44 px e qualquer pedido para fora do arquivo. Na última rodada não acusou nada.

Limites: as páginas são estáticas e os toques não fazem nada. Os gráficos não têm toque para mostrar o valor (no app, tocar numa barra mostra o número). Elas não foram abertas num celular de verdade, só no navegador sem janela, em 390 px.
