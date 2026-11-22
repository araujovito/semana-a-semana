# Auditoria 1: versão do commit inicial (874a279)

20/11/2026. Auditoria independente, para a direção geral.

## Conclusão

**Como está, não recomendo entregar na segunda.** Dois achados barram a entrega:

1. **O cartão "Próxima aplicação" dá instrução de dose errada em casos reproduzíveis**: manda pular uma dose que a bula permite aplicar e, depois de meses sem registro, manda aplicar a dose antiga numa data, sem falar em médico (achado 1).
2. **O app nunca diz para quem ele não serve e nunca para de pedir déficit**: calcula "gasto menos 500 kcal" para IMC 19,5, para 16 anos, para 75 anos, para quem usa insulina, sem um aviso (achado 2).

Os dois têm conserto pequeno (um dia de trabalho somados). Com eles corrigidos e os achados 3 a 8 tratados, a entrega na segunda é viável, **desde que a lista de melhorias seja cortada** (parte final). A lista atual, de 16 itens, não cabe em dois dias junto com as correções.

O que está bom e eu conferi: o gerador reproduz `alimentos.js` byte a byte; as unidades (µg, mg, RAE, folato em DFE) estão certas; o APK compila, instala, guarda os dados entre aberturas, abre o seletor de data e o compartilhamento; não há rolagem horizontal a 320 px; o contraste do modo claro e do escuro passa de 4,5:1 no texto; aspas e HTML digitados nos campos não quebram nada; a conta das metas bate com a minha conta à mão.

### O que eu não verifiquei
- **Os textos de saúde contra a fonte primária.** Comparei com o que sei da bula; não abri a bula brasileira nem o documento das sociedades americanas. Isso é da pesquisa.
- **Qual apresentação do Mounjaro ela comprou** (caneta de dose única ou de várias doses). Muda o texto de armazenamento e o item "controle da caneta".
- **Um celular de verdade.** Só o emulador (Android 14, WebView 113, em inglês). Não sei o modelo nem o Android do celular dela.
- **Se o backup do Google envia mesmo os dados** (achado 7): vi a permissão ligada, não vi o envio.
- **Leitor de tela (TalkBack)**: não testei.

### Material
Tudo em `empresa/relatorios/auditoria/`: `quebrar.js` (roteiros Playwright), `conferir_fontes.py` (TACO x USDA campo a campo), `app-inicial/` (cópia do commit 874a279, porque a engenharia já repartiu `app.js`), `capturas/` (47 do navegador, 20 do emulador, prefixo `emu-`).
As linhas citadas são de `app/app.js` **do commit inicial**.

Rodar: `node empresa/relatorios/auditoria/quebrar.js <playwright-core> <chromium> [metas,dose,viradaDia,entradas,restaurar,injecao,armazenamento,telas]`

---

## Achados que barram a entrega

### 1. Instrução errada de dose atrasada na tela Hoje — BARRA — verificado
**Onde:** `app.js` 115-125 (`situacaoDose`) e 144-148 (`telaHoje`).
**Como reproduzir:** `quebrar.js dose`, com hoje = sexta 20/11.

| Última aplicação registrada | O que o app diz | O que a bula diz |
|---|---|---|
| 05/11 (dia habitual seguinte: 12/11 e 19/11) | "atrasada 8 dias. Passou de 4 dias: [...] pular essa dose e aplicar a próxima no dia habitual (26/11)" | A dose de 19/11 está 1 dia atrasada: pode aplicar hoje. O app manda esperar 6 dias à toa. |
| 02/11 (atraso de 11 dias) | pular e aplicar em 23/11 | A dose de 16/11 está com 4 dias: ainda pode aplicar. |
| 06/11 (atraso de 7) | "atrasada 7 dias [...] aplicar a próxima no dia habitual (20/11)" | Certo, mas 20/11 é hoje e o texto não diz "hoje". |
| 15/08, dose 10 mg (97 dias) | "atrasada 90 dias [...] aplicar a próxima no dia habitual (21/11)" | O próprio Guia do app diz: várias semanas sem aplicar, falar com o médico, pode ser preciso recomeçar em dose menor. A tela principal manda aplicar 10 mg amanhã. |

Causa: o atraso é contado sempre a partir da última dose + 7, e não da dose prevista mais recente. A janela de 4 dias vale para cada dose prevista.

**Outros erros da mesma função, todos verificados:**
- **Aplicou atrasada, o dia habitual muda sozinho.** Habitual segunda, aplicou quinta 19/11: o app diz "próxima: quinta 26/11". O Guia do app (e a bula) dizem para voltar ao dia habitual, se houver 72 h. O app não guarda dia habitual nenhum.
- **"Já são 4 semanas nesta dose"** conta aplicações, não semanas. Quatro registros em 10 dias (dias 0, 3, 6, 9) disparam a frase sem nenhum aviso; quem pulou doses passa de 4 semanas sem ver a frase.
- **Data errada vira a semana do tratamento.** Uma dose com ano 2025 mostra "Semana 54"; ano "0026" (digitável em teclado) mostra "Semana 5218". Dose futura vinda de restauração mostra "Semana -4".
- **Salto de dose sem pergunta.** 2,5 mg seguida de 10 mg, ou de 15 mg, grava direto.
- **72 horas contadas em dias de calendário.** Segunda 22h e quinta 8h são 58 horas e passam sem aviso.

**O que eu faria:** (a) calcular a dose prevista mais recente e contar o atraso a partir dela; (b) acima de 14 dias sem aplicação, trocar todo o texto por "faz N semanas sem registro: fale com o médico antes de retomar", sem data e sem dose; (c) guardar o dia habitual (o da primeira dose, editável) e usá-lo; (d) contar semanas na dose por data; (e) pedir confirmação quando a dose escolhida não é a mesma nem a seguinte; (f) recusar data mais de 60 dias antes da última ou anterior a 2022. Cada linha da tabela acima vira um caso de teste com relógio fixo.

### 2. O app não tem limite de segurança para quem não deveria seguir este plano — BARRA — verificado (ausência) 
**Onde:** `app.js` 71-98 (`metas`), 434-447 (`FORM.perfil`), `conteudo.js` inteiro.
**A conta (minha, à mão, e igual à do app em `quebrar.js metas`):**

| Perfil | Gasto estimado | Meta do app | Proteína | Fator | Observação |
|---|---|---|---|---|---|
| 1,50 m, 62 kg, 58 anos | 1.328 | 1.200 (piso) | 87 g | 0,85 | Razoável. Déficit real de 128 kcal. |
| 1,75 m, 140 kg, 30 anos | 2.619 | 2.100 | 129 g | 1,45 | Meta razoável; o cardápio escalado não (achado 9). |
| 1,60 m, 70 kg, 25 anos | 1.697 | 1.200 | 98 g | 0,85 | Razoável. Proteína do cardápio 84 a 103 g. |
| 1,60 m, 50 kg, IMC 19,5 | 1.427 | 1.200 | 70 g | 0,85 | **Peso normal recebe plano de déficit, sem aviso.** |
| 1,55 m, 58 kg, 75 anos | 1.215 | 1.200 | 81 g | 0,85 | Sem nenhum aviso para idosa (perda de músculo). |
| 16 anos | 1.751 | 1.250 | 98 g | 0,85 | **Aceito.** Fórmula e remédio são de adulto. |

Para os três perfis pedidos, **os números em si não são perigosos**. O perigo é o que falta:
- Ela vai emagrecer. Quando chegar a IMC 22, 20, 18, o app continua igual: mesma meta, mesma barra, "Variação −X kg" em destaque. Não existe piso de IMC.
- **Diabetes com insulina ou sulfonilureia**: comer 1.200 kcal (ou 859 no dia de enjoo) com tirzepatida e sem ajuste do outro remédio é o cenário clássico de hipoglicemia. O app só cita isso numa linha no meio da lista de alerta do Guia.
- **Gravidez, amamentação**: uma linha no Guia; o plano de déficit segue.
- **Histórico de transtorno alimentar**: o app mostra kcal por refeição, kcal do dia, percentuais e variação de peso em todas as telas, e não há como esconder. Para essa pessoa, remédio que tira a fome somado a contador de calorias faz mal. O app não pergunta e não oferece saída.
- **Meta informada de 800 kcal** é aceita sem comentário (o campo aceita 800 a 4.000).

**O que eu faria (pequeno):**
- Uma tela de entrada, antes do perfil, em primeira pessoa: o que o app é, o que não é, e "se você tem diabetes e usa insulina ou glibenclamida/gliclazida/glimepirida, está grávida ou amamentando, tem menos de 18 anos, ou já teve transtorno alimentar: mostre este plano ao médico antes de seguir".
- IMC abaixo de 25: o app para de calcular déficit (meta = gasto estimado) e diz por quê. Abaixo de 18,5: cartão fixo "fale com o médico".
- Idade mínima 18. Acima de 65: frase sobre músculo e sobre conversar a meta com o médico.
- Chave no perfil "não mostrar calorias" (ficam proteína, água, refeições feitas). Barata: é esconder textos.
- Meta informada abaixo de 1.200 (1.800 homens): aceitar, mas com confirmação "foi o médico ou o nutricionista que passou?".

---

## Achados importantes

### 3. O app fala dela em terceira pessoa — importante — verificado
**Onde:** `app.js` 142 ("Quando ela fizer a primeira aplicação, registre aqui"), 276 ("Como ela está"); `conteudo.js` 60 ("há quantas semanas ela está"), 75 ("a apresentação que ela comprou"). No mesmo app: "Bem-vinda", "mandando para você mesma".
Captura: `capturas/emu-05-hoje.png` (é o primeiro cartão que ela vê depois do perfil).
O briefing diz que quem usa é ela, sozinha. O texto foi escrito para outra pessoa operar. Lido por ela, soa como app de vigilância.
**O que eu faria:** passar tudo para "você". Revisar também `decisoes.md` ("o familiar acompanha pelo relatório"): o relatório é dela, e ela compartilha se quiser. O app não deve sugerir destinatário.

### 4. O app aberto de um dia para o outro mostra o dia de ontem — importante — verificado
**Onde:** `app.js` 136 (`hoje()` só é lido ao desenhar), 474-477; `MainActivity.java` (sem `onResume`).
**Como reproduzir:** `quebrar.js viradaDia`. Segunda 23:58, marco café e almoço. Oito horas depois, sem tocar: a tela ainda diz "Refeições de segunda", 2 marcadas, 63 g de proteína. Toco no "jantar" que vejo (sardinha, de segunda): grava como jantar de **terça** e a tela troca inteira para terça com o jantar (frango) marcado.
No Android o app fica dias na memória; é o caso normal, não o raro.
**O que eu faria:** redesenhar em `visibilitychange`/`focus` e no `onResume`, e conferir a data antes de gravar uma marcação.

### 5. Comer muito pouco, enjoo seguido e vômito repetido não geram reação — importante — verificado (ausência)
**Onde:** `app.js` 112, 416, 462-467; `cardapio.js` 55-61.
- **O piso de 1.200 kcal não é respeitado pelo próprio cardápio.** Com fator 0,85 (toda mulher com meta de 1.200): quarta = 1.121 kcal; dia de enjoo = **859 kcal e 57 g de proteína**. Com fator 1,0: enjoo = 1.003 kcal.
- O "Dia de enjoo" pode ser ligado todo dia, para sempre. O texto diz "um ou dois dias"; o app não conta.
- O alerta de sintoma só dispara com "dor forte" ou "vômito + enjoo forte" no mesmo registro. Vômito com enjoo moderado por cinco dias seguidos responde "Registrado." cinco vezes. "Vômito que não para" é sinal de alerta no Guia do próprio app.
- Ela marca uma refeição de cinco por vários dias: nada acontece. Num remédio cujo risco alimentar é comer de menos, o app só tem reação para comer "tudo" (barra verde).

**O que eu faria:** três regras simples sobre dados que já existem: (a) 3º dia de enjoo em 7: cartão "enjoo que impede de comer é assunto para o médico; ele pode tratar ou segurar a dose"; (b) vômito em 2 dias seguidos, ou vômito + tontura: o mesmo aviso de procurar atendimento; (c) 3 dias seguidos com menos de metade da proteína: cartão neutro, sem bronca, com as opções (porção menor mais vezes, proteína primeiro, falar com o médico). E não escalar o dia de enjoo para cima (achado 9).

### 6. Ligar o "Dia de enjoo" apaga o que ela já marcou — importante — verificado
**Onde:** `app.js` 416 (`r.feitas = []`).
**Como reproduzir:** `quebrar.js entradas`: 25 g de proteína marcados, liga o enjoo, 0 g; desliga, continua 0 g. Enjoo costuma aparecer depois do café ou do almoço.
**O que eu faria:** manter as marcações (guardar por refeição o que foi comido, não o índice).

### 7. "Fica só neste celular" não é verdade no APK — importante — verificado em parte
**Onde:** `AndroidManifest.xml` linha 5 (`android:allowBackup="true"`); textos em `app.js` 287 e 367; comentário do manifesto; `decisoes.md`.
No emulador: `dumpsys package` mostra `ALLOW_BACKUP` e o pacote aparece na fila do gerenciador de backup. Num celular com backup do Google ligado (o padrão), a pasta da WebView, onde está o localStorage, entra no backup automático do Google Drive. **Não vi o envio acontecer** (o emulador tem o backup desligado).
São duas escolhas possíveis, as duas defensáveis; a atual é a única incoerente:
- `allowBackup="false"`: a promessa vira verdade; trocar de celular depende da exportação manual.
- Manter ligado: ela ganha restauração ao trocar de aparelho (não garantida entre versões da WebView), e o texto muda para "ficam neste celular e no backup do Google da sua conta, se estiver ligado".

### 8. Falha ao salvar é escondida por "salvo" — importante — verificado
**Onde:** `app.js` 21 e 445, 453, 460.
**Como reproduzir:** `quebrar.js armazenamento`. Com o armazenamento recusando a gravação, salvar aplicação mostra "Aplicação registrada." e salvar peso mostra "Peso registrado."; ao reabrir, 0 doses. Com localStorage indisponível, "Perfil salvo." e o app segue como se nada fosse. O aviso de erro existe, mas a mensagem de sucesso escreve por cima no mesmo instante.
Probabilidade baixa (os dados são pequenos), consequência alta (perde registro de dose achando que gravou).
**O que eu faria:** `salvar()` devolve verdadeiro ou falso; sem sucesso, não mostra "registrado" e deixa um cartão fixo no topo.

### 9. O fator multiplica o que não deveria — importante — verificado
**Onde:** `app.js` 42, 49-53, 65.
- **Proteína fora da faixa do próprio app.** 140 kg: faixa 111 a 148 g, cardápio entrega 145 a **174 g**. 180 kg (fator no teto, 1,5): faixa 112 a 149 g, cardápio 151 a **180 g**, e a energia fica em 79 a 93% da meta. No outro extremo, 1,60 m e 76,8 kg: meta 108 g, cardápio de segunda 84 g (78%).
- **O dia de enjoo é escalado para cima.** Com 1,45: canja com 145 g de frango e 145 g de arroz, 3 ovos no jantar, 1.464 kcal. É o contrário do que um dia de enjoo pede.
- **Porções que ninguém serve.** Fator 0,85: "Ovo cozido: 85 g (1½ × unidade)", "Brócolis: 65 g (2½ × ramo médio)", sardinha 70 g de uma lata de 84.
- **O texto mente quando há meta informada.** Meta de 800 kcal: "Porções multiplicadas por 0,85 para chegar perto da sua energia", com todos os dias a 140-166% da meta.

A direção já listou "escalar só carboidrato e gordura": concordo, é correção e não melhoria. Acrescento: não escalar o dia de enjoo acima de 1,0; arredondar ovo, lata, fatia e unidade para inteiros e escalar o resto.

### 10. A meta de proteína dá um salto de 13 g quando ela cruza o IMC 30 — importante — verificado
**Onde:** `app.js` 80-82.
1,60 m: com 76,7 kg (IMC 29,96) a meta é **107 g**; com 77,0 kg (IMC 30,08) é **94 g**. Ela perde 300 g e a meta sobe 13 g de um dia para o outro, sem explicação. Vai acontecer com qualquer usuária que comece acima de IMC 30 e emagreça.
**O que eu faria:** usar a mesma fórmula de peso ajustado a partir do IMC 25 (em 25 ela coincide com o peso real, então não há degrau).

### 11. Não dá para corrigir nada, só apagar — importante — verificado (ausência)
Dose com data errada, peso digitado errado, sintoma de ontem com campo trocado: só apagando e refazendo. Refeição, água e caminhada de ontem não podem ser marcadas de jeito nenhum (`app.js` 413-416 e 476 gravam sempre em `hoje()`). Quem esquece de marcar à noite perde o dia, e o relatório para a consulta sai com médias erradas. A direção já listou; mantenho como importante.

### 12. "Peso inicial" no Perfil convida ao erro — importante — parte verificada, parte suspeita
**Onde:** `app.js` 371, 269-270, 444.
Verificado: a variação e o gráfico usam sempre `perfil.peso` como ponto de partida, mesmo que exista pesagem com data anterior (pesagem de 01/10 com 95 kg e inicial 90 kg: o gráfico começa em 90 e depois mostra 95). Verificado: salvar o Perfil de novo regrava o peso inicial.
Suspeita (comportamento de usuária, não testável): o Perfil é onde ela digitou o peso pela primeira vez; é onde ela vai voltar para "atualizar o peso", e aí a linha de base some.
**O que eu faria:** o peso do perfil vira a primeira pesagem, com data; depois disso o campo some do Perfil. Gráfico com eixo de tempo real (hoje os pontos são espaçados por ordem, não por data).

### 13. A chave de assinatura só existe nesta máquina — importante — verificado
**Onde:** `android/chave.keystore`, criada 20/11 12:25, no `.gitignore`, sem cópia.
Se esse arquivo se perder, nenhuma versão nova instala por cima; só desinstalando, e desinstalar apaga os registros dela. Haverá versão nova: a lista de melhorias não cabe na de segunda.
**O que eu faria:** copiar a chave para um segundo lugar do dono hoje e anotar no LEIAME onde está. Subir `versionCode` a cada APK entregue.

### 14. Números de composição com casamento ruim — importante para dois, menor para o resto — verificado
Saída de `conferir_fontes.py`. As unidades estão certas. Os problemas são de casamento:
- **Batata-doce: vitamina A 787 µg/100 g.** A TACO traz o campo vazio e o gerador cai em silêncio no USDA, que é a batata-doce alaranjada americana. A batata-doce comum no Brasil (branca, roxa) quase não tem. Efeito: segunda e quinta ganham 630 µg cada; a média semanal cai de 1.002 para 822 µg (e para 699, no limite da meta, com fator 0,85). A tela "Onde está cada nutriente" vai listar batata-doce como fonte de vitamina A. É afirmação falsa para o alimento que ela vai comprar.
- **Feijões, lentilha, batata: folato, E e K emprestados de um alimento com o dobro de matéria seca.** Feijão carioca TACO 76 kcal/100 g, USDA 143. O folato (172 µg) vem inteiro do USDA. Corrigindo pela razão de energia, o folato médio cai de 496 para 413 µg (351 com fator 0,85, ou 88% da meta em vez de 105%). A conclusão "folato sobra" não se sustenta.
- **Sardinha "drenada" com dados de não drenada.** Nome e medida dizem drenada; os valores da TACO (285 kcal, 15,9 g de proteína, 24 g de gordura) são do produto com óleo. Drenada, no USDA: 208 kcal, 24,6 g de proteína. Subestima a proteína do jantar de segunda em uns 7 g.
- **Whey: 58 g de proteína por 100 g**, produto americano fortificado. Isolado vendido aqui tem 80 a 90. A tabela de trocas manda 43 g ("1½ scoop") para 25 g de proteína; o certo é perto de 1 scoop. Só aparece nas trocas.
- **Queijo minas com 2,7 µg de vitamina D** (queso fresco americano, leite fortificado). Menor: a média cai de 7,8 para 7,0.
- **Espinafre**: TACO é o da Nova Zelândia, USDA é o comum. Couve manteiga casada com kale. Menores.
- **Mandioca e cuscuz** sem par no USDA: folato, E e K entram como zero, não como "sem dado". Menor.
- "Tr" (traço) da TACO é tratado como "sem dado" e busca o USDA. Menor.

**O que eu faria:** o gerador imprime um aviso para cada campo de macro ou micronutriente que caiu no USDA sendo o alimento da TACO, e para cada par com energia diferindo mais de 25%. Batata-doce: vitamina A = 0 com nota. Feijões e lentilha: escalar os campos do USDA pela razão de energia. Sardinha: usar o USDA para macro ou tirar "drenada". Whey: fora da lista ou valor de rótulo.

Medidas caseiras: plausíveis nos 15 que conferi (ovo 50 g, arroz colher cheia 25 g, pão de forma 25 g, banana-prata 70 g, iogurte 170 g, azeite 8 g, castanha-do-pará 4 g, laranja 130 g, queijo fatia 30 g, leite 200 g, aveia 15 g, linhaça 10 g, pão francês 50 g, feijão concha pequena 80 g, frango filé 100 g). Duvido de duas: brócolis "ramo médio" 25 g e abacate "colher de sopa cheia" 30 g. Nenhuma tem fonte anotada.

### 15. Teclado e barra de abas no Android — importante — verificado no emulador
Capturas `emu-02-teclado.png` e `emu-04-peso-teclado.png`. Com o teclado aberto, a barra de abas fixa sobe para cima do teclado e sobra uma faixa de uns 4 cm de conteúdo. No perfil, ao passar para Altura e Peso, **o campo com foco fica atrás da barra de abas e a tela não rola**: digitei 165 e 90 sem ver.
**O que eu faria:** esconder a barra de abas enquanto um campo de texto tem foco e chamar `scrollIntoView` no foco.

---

## Achados menores

16. **Campo obrigatório vazio não avisa nada na WebView** — verificado (`emu-10-data-vazia.png`). O seletor de data tem botão "Limpar"; com a data vazia, "Salvar aplicação" não faz nada e não mostra mensagem (a WebView não desenha o balão de validação). Vale também para peso vazio. Conserto: validar no JavaScript e usar `aviso()`.
17. **Diálogos com título 'The page at "file://" says:'** — verificado (`emu-09-confirm.png`). Em celular em português sai 'A página em "file://" diz'. Feio e estranho num aviso de saúde. Conserto: diálogo próprio dentro da página (resolve também o 16).
18. **Modo escuro não funciona no APK** — verificado. O CSS escuro existe e passa no contraste (conferi por captura e por conta: texto suave 6,6:1, botão 9,2:1, alerta 5,7:1), mas com o sistema em modo noturno o app continua claro (`emu-16-escuro.png`). Causa: tema `Theme.Material.Light`; a WebView segue o tema do app. Ou trocar para tema DayNight, ou aceitar e tirar o CSS morto.
19. **Fonte grande do sistema**: a WebView aplica a escala (verificado, `emu-17`). Simulação a 320 px com fonte 130%: as tabelas de histórico de doses e de peso passam da largura (367 e 337 px) e o "apagar" sai da tela (`320-fonte130-diario-doses.png`). Com 200% quase todas as telas rolam para o lado. Mudar a fonte com o app aberto reinicia a tela (falta `fontScale|density|screenLayout|smallestScreenSize` em `configChanges`).
20. **Restauração aceita qualquer JSON com `v:1` e `perfil`** — verificado (`quebrar.js restaurar`). `doses: null` deixa Hoje e Diário em branco para sempre (o botão "Apagar todos os dados" fica no Diário, inacessível); `perfil: {}` enche as telas de "NaN"; `ui.diaPlano: 99` derruba Plano e Treino. HTML dentro de `id` ou `data` de um registro é executado (`quebrar.js injecao`): os campos digitados são escapados, os ids e datas não (`app.js` 245, 261, 271, 282). Risco real baixo (ela cola o próprio texto). Conserto: validar tipos na restauração e escapar tudo.
21. **Dado ilegível ou de versão desconhecida é tratado como app vazio e sobrescrito** — verificado. `app.js` 16-19: com `v: 2` ou JSON quebrado no armazenamento, abre "Bem-vinda"; ao preencher o perfil, os dados antigos são apagados. Passou a importar hoje: a engenharia criou o formato 2. Se uma versão 2 for instalada e depois voltarem para a 1, a 1 apaga tudo. Conserto: nunca gravar por cima de dado que não se conseguiu ler; guardar numa chave à parte.
22. **Botão voltar** percorre todo o histórico de abas antes de sair (verificado: 3 toques depois de 2 telas; cresce sem limite). Conserto: `location.replace` na troca de aba.
23. **Relatório**: "1 aplicações no total", "(1 aplicações nesta dose)" (verificado, `emu-19`). Os dias passados são recalculados com o fator e o peso de hoje, então o relatório do mesmo período muda depois de uma pesagem (lido no código, 342-346).
24. **Água sem teto**: 40 toques marcam 20,0 L sem reação (verificado). Meta fixa de 2,0 L para qualquer peso; quem tem restrição de líquido (coração, rim) não recebe aviso.
25. **Treino**: a fase é contada desde o primeiro treino da vida (`app.js` 128-132). Parou dois meses e voltou: cai em "Semanas 7 a 12", 3 séries e progressão de carga. Depois da semana 12 o rótulo fica "Semana 30 de treino · Semanas 7 a 12".
26. **`ferramentas-android.sh` termina com erro mesmo quando deu certo** — verificado o mecanismo (`yes | cmd` com `pipefail` devolve 141; testei com `yes | head -1`). A linha "Pronto" não aparece. Não afeta o APK.
27. **Textos pequenos**: "Meia goiaba cobre a vitamina C do dia" (85 g dão 68 mg de 75; com fator 0,85, 56 mg). Chá de hortelã é sugerido para enjoo no mesmo Guia que trata refluxo (hortelã costuma piorar refluxo; suspeita, sem fonte conferida). "Suspeita de gravidez" está na lista de "procurar atendimento sem esperar a consulta", junto de pancreatite: assusta sem necessidade; cabe em "avisar o médico logo".
28. **Peso sem conferência com o anterior**: 59 no lugar de 89 é aceito e muda as metas na hora (verificado). Uma confirmação quando a diferença passa de 5 kg resolve.
29. **Paisagem**: funciona, mas cabeçalho e abas ocupam um terço da altura (`emu-19-paisagem.png`). Travar em retrato é mais simples.
30. **Data no formato americano no emulador** (11/20/2026): é o idioma do emulador. Num celular em inglês, 03/04 fica ambíguo. Só registro.

### O que eu esperava que falhasse e não falhou
- Build: `resources.arsc` sem compressão, assinatura, ícone adaptativo: certo.
- localStorage com `file://`: persiste depois de fechar à força.
- `input type=date` na WebView: abre o seletor nativo e bloqueia datas futuras.
- Virada de ano, fuso e horário de verão: contas de dias corretas (o arredondamento em `entre()` segura a hora a mais ou a menos).
- Dois pesos no mesmo dia: o segundo substitui. Dupla aplicação no mesmo dia: pede confirmação.
- Rodízio de local: nunca sugere o braço sozinho (que exige outra pessoa).
- Tamanho do texto no compartilhamento: um ano de uso dá uns 50 mil caracteres; não estoura o limite do Android. Estoura o de uma mensagem de WhatsApp (65 mil) por volta de um ano e meio, e aí a cópia chega cortada e a restauração recusa. Não é problema de segunda.

---

## A lista de melhorias da direção

Critério: segunda ela recebe um app que não a engana e não a trata mal. O resto pode vir numa versão 1.1, que instala por cima (achado 13).

**Fazer antes de tudo, e não está na lista:** achados 1 a 8, 10 e 15; tela de entrada dizendo o que o app é e para quem não serve; chave "não mostrar calorias"; teste num celular de verdade; instruções de instalação (APK fora da loja, aviso do Play Protect); cópia da chave.

| Item da direção | Parecer |
|---|---|
| Perguntar diabetes e pílula no perfil | **Fazer**, mas definindo o que o app faz com a resposta. Perguntar e não mudar nada é pior do que não perguntar. Diabetes: perguntar também insulina/sulfonilureia; se sim, cartão fixo de hipoglicemia e nenhum incentivo a comer menos. Faltam na pergunta: gravidez/amamentação. |
| Aviso do anticoncepcional por 4 semanas | **Fazer.** Barato, fonte clara, os dados já existem. Depende do conserto da contagem por data (achado 1). |
| Escalar só carboidrato e gordura | **Fazer.** É a correção do achado 9. Mexe em todos os números: precisa de teste por perfil. |
| Editar dias passados e corrigir registros | **Fazer** (achado 11). |
| Alertar perda acima de 1% por semana | **Fazer só o alerta**, com cuidado: média de pelo menos 2 a 3 semanas, nunca uma pesagem só (a primeira semana é água). Marcar trocas de dose no gráfico é enfeite: depois. |
| Registrar o que comeu de fato | **Metade.** Porção parcial (nada, metade, tudo) é barata e é o caso real: ela vai comer menos que o prato. "Outro alimento" com busca e gramas transforma o app em contador de calorias: cortar agora, e pensar duas vezes depois (achado 2). |
| Trocar alimentos e marcar restrições | **Metade.** Marcar restrições e destacar no cardápio o que ela não come, com a troca equivalente ao lado: fazer. 17 das 35 refeições têm laticínio, 21 têm carne, peixe ou ovo, 1 tem porco; sem isso, quem tem intolerância a lactose ou é vegetariana não tem cardápio. Troca livre com recálculo de 18 nutrientes: depois. |
| Lista de compras | **Se sobrar tempo.** Útil e de baixo risco (só leitura). Mas a engenharia já começou por ela ("setor do mercado") antes das correções: prioridade invertida. |
| Medidas caseiras de tabela publicada | **Depois**, ou só para os cerca de 45 alimentos do cardápio. O ganho maior é arredondar ovo, fatia e lata para inteiros (achado 9). |
| Otimizar o cardápio para ferro, D e E | **Cortar.** Com 1.200 a 1.400 kcal, 18 mg de ferro e 15 µg de vitamina D não saem de comida comum; o texto atual já diz isso com honestidade. Mexer no cardápio a dois dias da entrega invalida toda a conferência. E os números de partida têm os erros do achado 14. |
| Lembretes de dose, água e refeição | **Cortar água e refeição**: para alguém enjoada é cobrança, e a regra 8 proíbe sermão. Lembrete de dose exige código Android novo (alarme, permissão de notificação no Android 13+, reinício do aparelho, economia de bateria), impossível de testar bem até domingo. Alternativa de uma hora: botão "pôr no calendário" que abre o calendário do celular com evento semanal, sem permissão nenhuma. |
| Cópia de segurança automática em arquivo | **Cortar o "automática".** Arquivo na pasta do app some na desinstalação (o caso que se quer cobrir); fora dela exige código Android novo. Para segunda: decidir o achado 7 e mostrar "última exportação há N dias". |
| Carga e repetições por exercício | **Cortar.** Semana 1 de iniciante é aprender o movimento. |
| Gráfico de sintomas por dia após a aplicação | **Cortar.** Sem dados nas primeiras semanas. |
| Registro de suplementos e exames | **Cortar.** Sem uso no começo e encosta em prescrição. |
| Controle da caneta | **Cortar** até a pesquisa dizer qual apresentação ela usa. "Dias fora da geladeira" contado por app dá segurança falsa: o app não sabe a temperatura. |

Resumo: dos 16, faria 5 inteiros e 3 pela metade, e cortaria 8.

---

## A própria empresa: por onde o erro passa

1. **O teste verde não prova quase nada.** Rodei: 16 de 16 passam, com todos os achados acima presentes. Ele cobre um caminho feliz, um perfil, e usa a data real da máquina (o resultado depende do dia da semana em que roda). A regra 11 (só fazer commit com teste verde) dá conforto falso. Pedir relógio fixo e um caso por linha da tabela do achado 1 e do achado 2.
2. **A engenharia começou a construir antes de a auditoria e a pesquisa entregarem.** Em 10 minutos houve 6 commits, `app.js` foi repartido e o formato de dados mudou. Os erros desta versão (lógica de dose, fator, textos) foram carregados para os arquivos novos, e as minhas referências de linha já não batem. A primeira onda incluiu lista de compras antes de qualquer correção.
3. **Ninguém com formação clínica lê os textos.** A regra 9 exige fonte para afirmação *nova*; os textos que já existiam ficaram isentos. A pesquisa confere contra a literatura, e eu contra o que sei, mas nenhum de nós é médico nem nutricionista. O app deveria dizer isso na entrada, e o dono deveria saber que a primeira consulta dela é o lugar de mostrar o plano.
4. **Ninguém representa a usuária.** Não há uma pessoa de verdade usando o app antes da entrega. O texto em terceira pessoa (achado 3) passou por todos.
5. **A direção julga a própria lista.** A lista de melhorias é da direção, a decisão sobre os achados é da direção, e o "pode barrar" da auditoria é recomendação. Proposta: cada achado desta auditoria recebe uma linha em `decisoes.md` (aceito, recusado ou adiado, e por quê). O dono lê esse arquivo.
6. **O calendário não tem dia para consertar.** Domingo é congelamento, auditoria final e APK ao mesmo tempo. O que a auditoria final achar não tem quando ser corrigido. Proposta: congelar funcionalidade no sábado à noite; domingo só correção.
7. **"Não perguntar nada ao dono" tem um custo que ninguém anotou.** Não sabemos o celular dela, a versão do Android, a apresentação do remédio, se tem diabetes. O app pergunta o que pode; o modelo do celular e a apresentação da caneta ele não tem como perguntar a tempo de testar.
8. **`alimentos.js` é "gerado, não editar à mão"**, e há um commit novo que acrescenta campos a ele. Na próxima rodada confiro se foi pelo gerador; se não foi, a próxima geração apaga o trabalho.
9. **Um emulador só, compartilhado, com dados de teste de todos.** Deixei nele um perfil (1990, 165 cm, 90 kg) e uma aplicação de hoje; fonte, tema e rotação voltaram ao padrão.
