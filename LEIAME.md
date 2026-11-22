# Semana a Semana

App Android para acompanhar o tratamento com tirzepatida (Mounjaro). Feito para uma mulher adulta acompanhada por médico.
O app organiza cardápio, treino e registros. Não prescreve dose, remédio nem suplemento.

Por dentro, é uma página em HTML, CSS e JavaScript puro, aberta por uma WebView. Não usa biblioteca externa nem internet.
O manifesto não pede permissão de INTERNET.

Este arquivo é para quem vai manter o projeto. Os guias de entrega estão em `empresa/ENTREGA-instalacao.md` (instalação) e `empresa/ENTREGA-primeiros-passos.md` (uso).

## O que o app faz

Conferido no código de `app/` no ramo `main` em 22/11/2026.

**Primeiro uso**
- Tela de entrada ("Antes de começar"): diz para quem o app serve e quem deve falar com o médico antes (menos de 18 anos, gravidez ou amamentação, transtorno alimentar). Botão Continuar.
- Perfil: nome (opcional), sexo, ano de nascimento, altura, peso inicial, atividade física. O app recusa idade abaixo de 18 anos.
- Blocos opcionais no Perfil: saúde (gravidez ou amamentação, diabetes, insulina ou sulfonilureia, pílula), o que não come (lactose, ovo, peixe, carne vermelha, porco, glúten, vegetariana), metas passadas pelo médico (energia, proteína, água) e a chave "Não mostrar calorias nem peso em destaque".
- Toda pergunta de saúde aceita "Prefiro não responder".

**Abas** (barra de baixo, mais o botão Perfil no topo)
- **Hoje**: navegação por dia (até 60 dias para trás); cartão do tratamento (semana, dose, próxima aplicação, local sugerido); proteína e energia do que foi marcado; água (+200 ml, +500 ml, −200 ml); botão "+10 g de proteína fora do plano"; refeições do dia com quatro opções (comi tudo, metade, um pouco, nada); botão "Dia de enjoo", que troca para um cardápio leve; movimento (treinos na semana, minutos de caminhada); atalhos para registrar peso, sintomas e aplicação. Mostra avisos quando ela come pouco por vários dias e o aviso de hipoglicemia quando se aplica.
- **Plano**: metas do dia; cardápio de segunda a domingo e o dia de enjoo, com porções em gramas e medida caseira; trocas automáticas pelo que ela não come; macro e micronutrientes do dia; média da semana; tabela de trocas; onde está cada nutriente.
- **Treino**: em casa ou na academia; treinos A e B; fase pela semana de treino (1 a 2, 3 a 6, 7 a 12); botão "Concluí hoje"; histórico.
- **Diário**: quatro sub-abas.
  - Aplicações: registrar (data, dose de 2,5 a 15 mg, local, observação); histórico com apagar; dia habitual da aplicação. Pergunta antes de gravar quando há outra aplicação a menos de 3 dias ou quando a dose pula mais de um degrau.
  - Peso: registrar peso e cintura; gráfico; histórico com apagar. Um peso por data (o novo substitui o do mesmo dia).
  - Sintomas: enjoo (nenhum a forte), intestino, vômito, refluxo, tontura, cansaço, dor forte na barriga, anotação. Dor forte, ou vômito com enjoo forte, mostra o aviso de procurar atendimento.
  - Relatório: texto dos últimos 30 dias (tratamento, peso, sintomas, alimentação e água, exercício), com Compartilhar e Copiar. Logo abaixo, a cópia de segurança (ver "Dados").
- **Guia**: artigos fixos de `app/conteudo.js` (como o remédio age, doses, aplicação, dose esquecida, como guardar, enjoo, intestino, sinais de alerta, anticoncepcional, alimentação, músculo e osso, vitaminas, cirurgia, perguntas para o médico, depois do tratamento, fontes).

**O que não existe** (não confundir com o formato de dados, que já tem espaço reservado): lembretes e notificações, controle da caneta, suplementos e exames, carga e repetições no treino, lista de compras, edição de registro (só apagar e registrar de novo), botão "pôr no calendário". `app/aparelho.js`, `app/caneta.js`, `app/compras.js` e `app/saude.js` são encaixes vazios.

## Estrutura

    app/                    o app (vira assets/ do APK)
      index.html            página única; carrega os scripts na ordem
      nucleo.js             constantes, formato dos dados, carregar/salvar, utilidades. Carrega antes das telas.
      inicio.js             escolhe a tela pelo endereço (#hoje, #plano...), diálogos, folha, botão voltar. Carrega por último.
      hoje.js plano.js treino.js diario.js guia.js perfil.js     uma tela cada
      tratamento.js peso.js sintomas.js                          sub-abas do Diário e trechos do relatório
      nutricao.js consumo.js                                     metas, escala das porções, trocas, contas do que foi comido
      aparelho.js           cópia de segurança (exportar, restaurar, apagar tudo)
      cardapio.js           cardápio base;  conteudo.js: guia e treino
      alimentos.js          GERADO por dados/gerar_alimentos.py; não editar à mão
      estilo*.css
    android/                casca Android: AndroidManifest.xml, MainActivity.java (WebView + ponte compartilhar/copiar), res/, chave.keystore
    dados/                  gerar_alimentos.py (TACO + USDA SR Legacy, em dados/fontes/), conferir_cardapio.js (soma nutrientes por dia)
    testes/                 unidade.js e testes/unidade/; fluxo.js roda os testes de ponta a ponta fluxo-*.js
    testar.sh               roda todos os testes
    montar-apk.sh           compila o APK
    ferramentas-android.sh  baixa JDK e ferramentas do Android para ~/Android (uma vez)
    emulador.sh             celular virtual para testar o APK
    empresa/                decisões, diário de bordo, relatórios e guias de entrega
    .copias/                cópias de trabalho (worktrees) dos engenheiros; fora do git; não é a versão oficial

## Testar

    bash testar.sh

Roda, nesta ordem: checagem de sintaxe de todos os `.js`, testes de unidade (`node testes/unidade.js`) e ponta a ponta (`node testes/fluxo.js`, navegador sem janela). Termina com "TUDO VERDE" ou "HÁ FALHAS" e sai com erro se algo falhar.

- Usa o `playwright-core` de outro projeto da máquina e o Chromium do cache do Playwright. Caminhos padrão no topo do script; troque com `PLAYWRIGHT=... CHROMIUM=... bash testar.sh`.
- `CAPTURAS=/pasta bash testar.sh` grava as telas.
- Os testes de ponta a ponta usam relógio fixo (sexta, 20/11/2026, 10h). Um `alert()` ou `confirm()` nativo durante o teste conta como erro.
- Regra do projeto: só fazer commit com o teste verde; quem muda comportamento acrescenta verificação ao teste.

Para olhar o app no computador, abra `app/index.html` no navegador. Funciona sem internet.

## Compilar o APK

    bash ferramentas-android.sh   # uma vez; baixa ~500 MB para ~/Android (já feito nesta máquina)
    bash montar-apk.sh            # gera semana-a-semana.apk na raiz

O build não usa Gradle: aapt2, javac, d8, zipalign e apksigner, com build-tools 34 e alvo Android 14 (API 34). Mínimo: Android 8 (API 26).
O APK e a pasta `build/` não entram no git.

Antes de entregar uma versão nova:
1. Suba `android:versionCode` (e `versionName`) em `android/AndroidManifest.xml`. Está em 1. O script não faz isso sozinho.
2. Suba `VERSAO_APP` em `app/sw.js` (ano.mês.dia-n). O cache da versão web instalável leva esse nome: sem a troca, quem usa a versão instalada continua com os arquivos antigos e a faixa "Versão nova pronta" não aparece.
3. Rode `bash testar.sh` e depois `bash montar-apk.sh`.
4. Confira que o APK é novo: `unzip -l semana-a-semana.apk` deve listar `assets/nucleo.js`, `assets/inicio.js` etc. Um APK com `assets/app.js` é da versão anterior à divisão do código.

## Chave de assinatura (importante)

`android/chave.keystore` assina o APK. A senha está escrita em `montar-apk.sh`.

- O Android só instala uma versão nova por cima da antiga, mantendo os registros, se ela vier assinada com a mesma chave.
- Sem a chave, a única saída é desinstalar o app e instalar outro. Desinstalar apaga os registros que não tiverem cópia.
- A chave está no `.gitignore`: um clone do repositório não a traz.
- Se o arquivo sumir, `montar-apk.sh` cria uma chave nova sem avisar. O APK sai assinado com ela e não atualiza o app instalado.
- Se um dia o app for registrado na verificação de desenvolvedores do Android, o registro também pede esta chave.

Guarde ao menos uma cópia fora desta máquina (pendrive, outro computador, cofre de senhas), junto com a senha. A direção guardou uma segunda cópia fora da pasta do projeto, mas ainda na mesma máquina.

## Emulador

    bash emulador.sh ligar            # cria (na primeira vez) e liga um Android 14 sem janela
    bash emulador.sh instalar         # instala semana-a-semana.apk por cima e abre o app
    bash emulador.sh foto tela.png    # captura a tela
    bash emulador.sh toque X Y | texto "abc" | voltar | log
    bash emulador.sh desligar

O emulador tem WebView 113. Por isso o código fica em JavaScript e CSS de até 2022. Um engenheiro por vez usa o emulador.

## Dados

Tudo fica no `localStorage` da WebView, na chave `semana-a-semana.v1`, em JSON. O formato atual é a versão 2 (campo `v`).
A descrição completa de cada campo está no comentário do topo de `app/nucleo.js`. Ela é o contrato: só o chefe de engenharia muda esse arquivo.

- `migrar()` aceita a versão 1 e a 2, confere tipos e descarta registro sem data válida. Também é usada na restauração.
- Dado ilegível ou de versão desconhecida nunca é sobrescrito: o app mostra uma tela própria, deixa compartilhar o texto guardado e só começa do zero guardando o antigo à parte.
- Gravação que falha deixa uma faixa vermelha fixa no topo.
- Cópia manual: Diário > Relatório > "Exportar tudo" manda o JSON inteiro pelo menu de compartilhar do Android. "Restaurar" aceita esse texto colado. "Apagar todos os dados" zera tudo.
- `android:allowBackup="true"`: se a cópia de segurança do Google estiver ligada no celular, o Android pode incluir os dados na conta Google dela. Decisão da direção de 20/11. Não foi testado se a restauração funciona para um app instalado por arquivo.
- Desinstalar o app ou "Limpar dados" nas configurações do Android apaga os registros.

## O que ficou de fora desta entrega e por quê

Decisões da direção em 20/11, seguindo a auditoria 1 (detalhes em `empresa/decisoes.md`):

| Item | Motivo |
|---|---|
| Otimizar o cardápio para ferro, vitamina D e E | Não fecha só com comida nesse nível de calorias e invalidaria a conferência. O app continua mostrando a falta. |
| Lembretes de água e de refeição | Viram cobrança para quem está enjoada. |
| Notificação nativa da dose | Seria trocada por um botão "pôr no calendário". Esse botão também não entrou em `main`. |
| Cópia automática em arquivo | Cortada. Fica a exportação manual por texto. |
| Carga e repetições no treino | Cortado. O rascunho ficou fora do projeto. |
| Resumo de sintomas por dia | Cortado. |
| Suplementos e exames | Cortado. |
| Controle da caneta | Depende da apresentação, e "dias fora da geladeira" daria segurança falsa. |
| Registro de alimentos avulsos | Transformaria o app em contador de calorias, risco apontado na auditoria. Fica só a porção parcial e o botão de proteína. |

Adiados para depois da entrega: medidas caseiras de tabela publicada e leitor de tela.

Limite conhecido: ninguém com formação clínica revisou os textos, e ninguém representou a usuária nos testes.

## Pendências conhecidas em 22/11

- O `semana-a-semana.apk` da raiz é de 20/11, anterior às correções da auditoria (ainda tem `assets/app.js`). Precisa ser compilado de novo antes da entrega.
- Lado Android ainda em `main` sem as correções do engenheiro Android: tema claro fixo (o modo escuro do CSS não liga dentro do APK) e o botão voltar usa o histórico da WebView, sem chamar `window.aoVoltar()`.
- `aparelho.js` (restaurar e apagar tudo) e `sintomas.js` (aviso de dor forte) ainda usam `confirm()` e `alert()` nativos. Na WebView eles aparecem com o título "A página em file:// diz".
- O texto do cartão de cópia diz "Os registros ficam só neste celular", o que não bate com o `allowBackup` ligado (a decisão de 20/11 pedia tirar essa frase).
- O formulário de sintomas tem o título "Como ela está", em terceira pessoa.
- `versionCode` em 1.
- Instalação por arquivo no Brasil: regra nova de verificação de desenvolvedores desde 30/09/2026. Ver `empresa/ENTREGA-instalacao.md`.
