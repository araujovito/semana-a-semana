# Semana a Semana

App Android para acompanhar o tratamento com tirzepatida (Mounjaro). Feito para uma usuária só: uma mulher adulta, acompanhada por médico e por nutricionista, com pedra na vesícula e gordura no fígado.
O app organiza o plano alimentar dela, o treino e os registros. Não prescreve dose, remédio nem suplemento.

Por dentro, é uma página em HTML, CSS e JavaScript puro, aberta por uma WebView. Não usa biblioteca externa nem internet.
O manifesto não pede permissão de INTERNET.

Este arquivo é para quem vai manter o projeto. Guias de entrega:
- `empresa/ENTREGA-instalacao.md`: instalação no celular dela (Xiaomi), para o familiar.
- `empresa/ENTREGA-primeiros-passos.md`: uso, para ela.
- `empresa/PARA-O-MEDICO.md`: o que depende de aval clínico, para levar à consulta.

Os dados pessoais dela não ficam no código: ela preenche no Perfil. Os PDFs pessoais da raiz estão fora do git (`.gitignore`).

## O que o app faz

Conferido no código de `app/` no ramo `main` em 22/11/2026. O primeiro uso está descrito pelo ramo `onda2-uso`, que entra em `main` em seguida.

**Primeiro uso** (nesta ordem)
1. **PIN.** "Crie um PIN de 6 dígitos", digitado duas vezes. Depois aparece, uma vez só, o código de recuperação (4 grupos de 5 letras e números). Para seguir, ela redigita um grupo sorteado.
2. **Antes de começar.** Para quem o app serve e quando falar com o médico antes: menos de 18 anos, gravidez ou amamentação, transtorno alimentar, pancreatite, câncer medular de tireoide ou NEM2.
3. **Bem-vinda** (uma tela só, ramo `onda2-uso`): ano de nascimento, altura, peso no começo do tratamento e três perguntas em botões Sim / Não / Não sei: pedra na vesícula (se Sim, aguardando cirurgia), gordura no fígado, segue plano de nutricionista. As três são obrigatórias; "Não sei" conta como resposta e não liga avisos. Botão Começar.
   - Na mesma tela, o cartão "Já usava o app?" restaura uma cópia exportada, sem preencher nada.
   - Sexo, atividade, metas do médico, o que não come, diabetes, pílula e gravidez ficam em Perfil, em "Completar depois". Até lá o app usa feminino, sedentária, metas próprias e nenhuma restrição.
   - Quem já tinha perfil antigo vê em Hoje uma faixa "O app ganhou três perguntas", com "Responder agora" e "Agora não" (auditoria 3, I7). Essa faixa ainda não tinha commit no ramo quando este texto foi escrito.

**Barra de baixo:** Hoje · Semana · Comer · Mover · Guia. O ícone de Perfil fica no topo.
Quando a aba tem mais de uma tela, aparecem sub-abas: Semana · Diário · Painel (aba Semana) e Plano · Caminhos (aba Comer).

- **Hoje**
  - Topo: dia, semana do tratamento, dose, semana nesta dose, próxima aplicação (em dia, hoje, atrasada com "pode aplicar hoje", ou pular), local sugerido, "Por quê (bula)" dobrável. Ao lado, proteína do dia com "Faltam X g" e o alvo.
  - Alvo de proteína único em Hoje, Painel e relatório: com o plano da nutricionista em uso, é o começo da faixa do plano dela; sem ele, a meta do app.
  - "Plano da sua nutricionista": as 5 refeições (café 7h30, almoço 13h, lanche 16h30, jantar 20h, ceia opcional). Em cada uma, a opção prescrita (lista de escolha) e quanto comeu: tudo, metade, um pouco, nada. Com pedra na vesícula, a frase "Gordura na medida".
  - "+ 10 g de proteína fora do plano", água em copos (+1 copo, +500 ml, −1 copo), botão "Dia de enjoo" (troca para as refeições leves do cardápio do app).
  - "Como está hoje?": Bem, Enjoo leve, Enjoo forte, Sem fome, Dor na barriga. Grava no registro de sintomas do dia. "Enjoo forte" pergunta se troca pelas refeições leves. "Dor na barriga" grava a dor e abre os sinais em três níveis (192, pronto-socorro hoje, avisar o médico).
  - Com pedra na vesícula: cartão curto com o botão "Dor na barriga: o que fazer".
  - Atalhos: Comida, Água, Como estou, Aplicação, Dor na barriga, Para a consulta, Painel, Peso.
  - "Ainda hoje": próxima refeição do plano e caminhada opcional.
  - Navegação por dia: até 60 dias para trás.
  - Calorias, peso, marcas de 5/7/10% e vitaminas não aparecem em Hoje.
- **Semana > Semana:** uma linha por semana do tratamento (aplicação no dia previsto ou não, peso, sintomas, enjoo, comida). No ramo `onda2-uso`, cada aplicação é medida pelo dia habitual que valia na época dela.
- **Semana > Diário:** sub-abas Aplicações, Peso, Sintomas e Relatório.
  - Aplicações: registrar, histórico, "Mudei o dia da aplicação".
  - Peso: peso e cintura, gráfico, aviso de ritmo de perda acima de 1% por semana.
  - Relatório: texto dos últimos 30 dias com Compartilhar e Copiar, e embaixo a cópia de segurança.
- **Semana > Painel:** proteína e calorias de hoje em anéis; gráficos de 7 ou 30 dias (tocar ou arrastar o dedo mostra o dia; "Ver como tabela"); médias e dias na faixa.
- **Comer > Plano:** interruptor "Usar o plano da minha nutricionista" (ligado por padrão); faixa do dia dela (1.009 a 1.392 kcal, 91 a 146 g de proteína, estimativa do app); as opções de cada refeição; cartões da vesícula e do fígado. Abaixo, o cardápio do app de segunda a domingo e o dia de enjoo, como reserva.
- **Comer > Caminhos:** o plano da nutricionista no topo, "Em uso". Abaixo, os caminhos A a E (mediterrânea brasileira, prato dividido, menos açúcar e farinha branca, redução do fígado antes da cirurgia, dia leve), com prós, contras e cuidados com a vesícula. Não trocam o plano: o que ela marcar entra no relatório da consulta.
- **Mover:** treino em casa ou na academia, treinos A e B, fases pela semana, "Concluí hoje".
- **Guia:** artigos fixos de `app/conteudo.js`, inclusive "Sinais de alerta" em três níveis.
- **Perfil** (topo): as três perguntas, dados, "Completar depois", modo "Não mostrar calorias nem peso em destaque", peso do começo do tratamento (bloco próprio, com confirmação), alimentos de que não gosta, "Pôr no calendário" (só no APK), "Trocar PIN".
  - Com pedra na vesícula: cartão com a frase da bula, os sinais da crise e, se aguarda cirurgia, a frase do fígado com o progresso até 5, 7 e 10%.
  - Com gordura no fígado: cartão do fígado (5, 7 a 10, 10% ou mais; bebida açucarada; álcool; 150 min).

## Estrutura

    app/                    o app (vira assets/ do APK)
      index.html            página única: política de segurança (CSP), ícones, barra de abas, ordem dos scripts
      nucleo.js             constantes, formato dos dados (comentário no topo = contrato), carregar/salvar, migrar()
      cifra.js              PIN, cifra AES-GCM, bloqueio por inatividade e por segundo plano
      inicio.js             telas por endereço (#hoje, #semana...), grupos de abas e sub-abas, diálogos, folha, botão voltar. Carrega por último.
      hoje.js               tela Hoje
      semana.js painel.js   visão semanal e painel (registram-se em TELAS ao carregar)
      plano.js planonutri.js      cardápio do app (reserva) e plano da nutricionista (dados e contas)
      caminhos.js caminhostela.js caminhos de alimentação: dados e tela
      diario.js tratamento.js peso.js sintomas.js   Diário, sub-abas e trechos do relatório
      nutricao.js consumo.js      metas, escala das porções, trocas, contas do que foi comido
      perfil.js             entrada, primeiro uso, perfil, cartões de vesícula e fígado
      treino.js guia.js conteudo.js     Mover e Guia (textos em conteudo.js)
      aparelho.js           calendário, cópia de segurança (restaurar, apagar tudo), restaurar na primeira tela
      seguranca.js          aviso de dados de saúde, lembrete de cópia, cópia com SHA-256
      pwa.js sw.js manifest.webmanifest   versão web instalável (só roda por http/https)
      cardapio.js           cardápio base e REGRAS_CARDAPIO (gordura por refeição etc.)
      alimentos.js          GERADO por dados/gerar_alimentos.py; não editar à mão
      caneta.js compras.js saude.js     encaixes vazios
      estilo*.css  fontes/ (Zilla Slab, licença OFL)  icone-*.png
    android/                AndroidManifest.xml, java/.../MainActivity.java (WebView + ponte), res/ (ícone, cores, regras de backup), chave.keystore
    dados/                  gerar_alimentos.py (TACO + USDA), conferir_cardapio.js (soma e confere regras), gerar_icones.py
    testes/                 unidade.js e testes/unidade/*.js; fluxo.js roda os testes de ponta a ponta fluxo-*.js
    prototipo/              protótipo visual aprovado (HTML estático)
    testar.sh               roda todos os testes
    montar-apk.sh           compila o APK
    ferramentas-android.sh  baixa JDK e ferramentas do Android para ~/Android (já feito nesta máquina)
    emulador.sh             celular virtual para testar o APK
    empresa/                briefing, decisões, diário de bordo, relatórios e guias de entrega
    .copias/                cópias de trabalho (worktrees); fora do git; não é a versão oficial

## Testar

    bash testar.sh

Roda sintaxe de todos os `.js`, unidade (`node testes/unidade.js`) e ponta a ponta (`node testes/fluxo.js`, navegador sem janela, 19 arquivos `fluxo-*.js`). Termina com "TUDO VERDE" ou "HÁ FALHAS".
Em `main`, em 22/11 às 18h50: TUDO VERDE, 174 testes de unidade.

- Usa o `playwright-core` de outro projeto da máquina e o Chromium do cache do Playwright. Troque com `PLAYWRIGHT=... CHROMIUM=... bash testar.sh`.
- `CAPTURAS=/pasta bash testar.sh` grava as telas.
- Relógio fixo: sexta, 20/11/2026, 10h. Um `alert()` ou `confirm()` nativo conta como erro.
- Os testes antigos rodam sem PIN (`window.cifTesteSemPin` antes de carregar). O PIN tem os seus: `testes/unidade/cifra.js` e `testes/fluxo-cifra.js`.
- Há testes a 440 px (largura do celular dela), com letra grande (`fluxo-letra-grande.js`) e da versão web (`fluxo-pwa.js`, `fluxo-seguranca-pwa.js`).
- Regra do projeto: commit só com teste verde; quem muda comportamento acrescenta verificação.

Para olhar no computador: abra `app/index.html` no navegador.

## Compilar o APK

    bash montar-apk.sh            # gera semana-a-semana.apk na raiz

Sem Gradle: aapt2, javac, d8, zipalign e apksigner, build-tools 34, alvo Android 14 (API 34), mínimo Android 8 (API 26). O APK e `build/` não entram no git.

**Antes de entregar uma versão nova:**
1. Suba `VERSAO_APP` em `app/sw.js` (ano.mês.dia-n; hoje `2026.11.22-2`). O cache da versão web leva esse nome. Sem a troca, a versão web instalada continua com os arquivos antigos.
2. Suba `android:versionCode` e `android:versionName` em `android/AndroidManifest.xml` (hoje 2 e 1.1). O número precisa ser maior que o do APK já instalado no celular. O APK de 22/11 já saiu com 2: a próxima entrega precisa de 3.
3. `bash testar.sh` verde.
4. `bash montar-apk.sh`. Ele imprime o certificado e lembra o `VERSAO_APP`.
5. Confira o APK: `unzip -l semana-a-semana.apk` deve listar `assets/cifra.js` e `assets/planonutri.js`. O `semana-a-semana.apk` da raiz, de 22/11 às 16h27, ainda não tem o PIN nem o plano da nutricionista: precisa ser compilado de novo.

## Chave de assinatura (importante)

`android/chave.keystore` assina o APK. A senha está escrita em `montar-apk.sh`.

- O Android só instala por cima, mantendo os registros, um APK assinado com a mesma chave.
- Sem a chave, a única saída é desinstalar e instalar de novo. Desinstalar apaga os registros sem cópia.
- A chave está no `.gitignore`: um clone não a traz.
- Se o arquivo sumir, `montar-apk.sh` **para com erro** (não cria chave nova sozinho). Só `NOVA_CHAVE=1 bash montar-apk.sh` gera outra, para um projeto que nunca foi instalado.
- Quem tiver o arquivo da chave consegue assinar um app que instala por cima do dela e lê os registros.

Guarde uma cópia fora desta máquina (pendrive, cofre de senhas), junto com a senha. A direção guardou uma segunda cópia fora da pasta do projeto, mas na mesma máquina.

## Emulador

    bash emulador.sh ligar | instalar | foto tela.png | toque X Y | texto "abc" | voltar | log | desligar

WebView 113. Por isso o código fica em JavaScript e CSS de até 2022. Um engenheiro por vez usa o emulador.
O emulador roda Android puro: não simula MIUI/HyperOS.

## Dados

- Formato versão 2, descrito no topo de `app/nucleo.js` (contrato; só o chefe de engenharia muda). `migrar()` aceita versão 1 e 2.
- Com PIN, os registros ficam cifrados na chave `semana-a-semana.cifrado` do `localStorage` da WebView. Na migração, o texto antigo (`semana-a-semana.v1`) só é apagado depois de o cifrado ser relido e conferido.
- Dado ilegível ou de versão desconhecida nunca é sobrescrito: o app mostra tela própria e guarda o antigo à parte.
- Gravação que falha deixa uma faixa vermelha fixa no topo.
- Cópia manual: Semana > Diário > Relatório > "Exportar tudo". Restaurar: no mesmo cartão, ou na primeira tela ("Já usava o app?").
- `allowBackup` ligado (decisão de 20/11). A cópia do Google leva só o `localStorage` da WebView. Não foi testado se volta num app instalado por arquivo.
- Desinstalar o app ou "Limpar dados" nas configurações apaga os registros.

## Segurança

Resumo de `empresa/relatorios/seguranca.md` e `empresa/relatorios/cifra.md`. Nada disso foi testado num celular de verdade; o PIN foi testado no navegador e no emulador.

**O que protege**
- Sem internet: sem permissão de INTERNET, nada carregado de fora. Os dados só saem por Compartilhar/Exportar ou pela cópia do Google.
- **CSP** em `index.html`: a página só roda os próprios arquivos. Exceções: o atributo `style` e um evento embutido liberado por hash (busca de "não gosto" no Perfil). Se esse texto mudar em `perfil.js`, a busca para e o teste acusa.
- **WebView com menor privilégio** (`MainActivity.java`): sem acesso a arquivos, `content://` ou localização; não navega para fora; depuração desligada; sem tráfego sem cifra. A ponte expõe só compartilhar, copiar e calendário.
- **PIN e cifra:** chave AES-GCM de 256 bits, embrulhada pelo PIN e pelo código de recuperação (PBKDF2-SHA256, 600 mil a 10 milhões de iterações, calibradas no aparelho para cerca de 0,75 s). PIN e código nunca são gravados. Bloqueia ao abrir, ao voltar de outro app e depois de 5 minutos parado. Depois de 5 erros seguidos, espera de 30 s, 1 min e depois 5 min.
- **Cópia com SHA-256:** a exportação leva versão e código de verificação. Texto cortado ou alterado é recusado e nada muda. Depois de exportar, o app relê a cópia antes de dizer "Cópia pronta e conferida".
- Aviso de dados de saúde antes de exportar ou compartilhar o relatório. Lembrete discreto de cópia depois de 14 dias sem exportar.

**O que não protege**
- Quem copia o armazenamento do app pode testar todos os PINs fora dele (1 milhão de combinações), sem as esperas.
- **Sem PIN e sem código de recuperação, os dados não voltam.** Ninguém da equipe consegue abrir. Só uma exportação feita antes salva.
- O código SHA-256 não é assinatura: quem quiser alterar de propósito recalcula.
- O texto exportado é legível por quem receber, e o app de mensagens guarda cópia.
- Acima de 250 mil caracteres o Android não passa o texto adiante. O app avisa, mas não há saída em arquivo.
- As esperas do PIN dependem do relógio do celular.
- Ninguém de fora revisou a cifra.

## Versão web

Pronta (`pwa.js`, `sw.js`, `manifest.webmanifest`), **não publicada** (decisão do dono de 22/11). Só roda servida por `https` (ou `localhost`).
Versão nova aparece como "Versão nova pronta. Toque para atualizar". Os dados ficam no navegador: limpar os dados do navegador apaga tudo.

## O que ficou de fora e por quê

Decisões de 20/11 (detalhes em `empresa/decisoes.md`):

| Item | Motivo |
|---|---|
| Otimizar o cardápio para ferro, vitamina D e E | Não fecha só com comida nesse nível de calorias. O app mostra a falta. |
| Lembretes de água e de refeição | Viram cobrança para quem está enjoada. |
| Notificação nativa da dose | Trocada pelo botão "Pôr no calendário" (Perfil, só no APK). |
| Cópia automática em arquivo | Fica a exportação manual por texto. |
| Carga e repetições no treino, resumo de sintomas por dia, suplementos e exames | Cortados. |
| Controle da caneta | "Dias fora da geladeira" daria segurança falsa. |
| Registro de alimentos avulsos | Transformaria o app em contador de calorias. Ficam a porção parcial e o botão de proteína. |

Adiados: medidas caseiras de tabela publicada, leitor de tela.
Os caminhos B e C citam no código recursos que não existem ("prato dividido", "contador de bebida"), mas esse campo não aparece na tela.

## Pendências conhecidas em 22/11 à noite

Conferidas no código de `main` contra `auditoria-3.md`, `revisao-clinica-onda2.md`, `teste-android-onda2.md` e `usabilidade-onda2.md`.

**Antes da entrega**
- Compilar o APK de novo, com `versionCode` 3 (ver "Compilar").
- Juntar o ramo `onda2-uso` (primeiro uso numa tela, histórico do dia habitual, faixa das perguntas novas) com testes verdes.

**Dependem de aval clínico** (lista em `empresa/PARA-O-MEDICO.md`): divisão 192 / pronto-socorro / médico e o limite de "1 ou 2 horas"; aviso de ritmo de 1% por semana; frase do fígado e da cirurgia; números de gordura por refeição. Ninguém com formação clínica revisou os textos. A bula brasileira não foi conferida.

**Já corrigido desde os relatórios:** meta de proteína informada respeitada (auditoria 3, B1); Painel, Semana e Caminhos com caminho na barra (B2); crise de vesícula sem "6 horas" e sem "próximos dias" (revisão clínica, B1); dia só com proteína avulsa não vira dia de 0 kcal (I3); cache da versão web com a versão no nome (I5); restaurar na primeira tela; Hoje com aplicação e proteína no topo.

**Ainda abertos**
- Aviso de ritmo de perda só em Diário > Peso e no relatório, não em Hoje. Só aparece com uma pesagem de 14 a 28 dias antes.
- O alerta de Diário > Sintomas (dor forte) usa o texto geral, sem os sinais da vesícula. O botão "Dor na barriga" de Hoje já usa os três níveis.
- O relatório mostra quantos dias de dor forte, mas não as datas, e não cita vesícula, fígado nem cirurgia.
- Cardápio de reserva vegetariano: `conferir_cardapio.js` ainda acusa almoços acima de 500 kcal e gordura do dia acima de 35% (auditoria 3, I1). Não se sabe se ela é vegetariana.
- Plano da nutricionista: café e jantar de algumas opções com pouca gordura, fibra abaixo de 25 g na maioria das combinações, óleo dos preparos fora da conta (`empresa/relatorios/plano-nutricionista-conferido.md`). São perguntas para a nutricionista, não erro do app.
- Dia de enjoo ligado no meio do dia: o total do dia passa a contar só as refeições leves (nada é apagado).
- Sub-abas do Diário e dias do Plano podem cortar com letra grande, sem sinal de que dá para arrastar.
- Desempenho: com CPU 10 vezes mais lenta, cerca de 2 s depois de registrar peso. Não medido no celular dela.

**Não testado**
- Nada no Xiaomi Redmi Note 13 Pro real nem em MIUI/HyperOS: WebView da Xiaomi, limpador do sistema, tema escuro forçado, economia de bateria.
- Atualização por cima de uma versão instalada com dados, no aparelho dela.
- Restauração pela cópia do Google.
- Instalação por arquivo com a regra de verificação de desenvolvedores (desde 30/09/2026 no Brasil). Ver `empresa/ENTREGA-instalacao.md`.
- Ninguém representou a usuária nos testes: a usabilidade é avaliação de especialista.
