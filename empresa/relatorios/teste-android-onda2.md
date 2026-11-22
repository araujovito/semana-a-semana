# Teste no Android 14 virtual: onda 2

Testador Android, 22/11/2026. Código testado: `main` em d676cf2, compilado numa cópia em /tmp com `bash montar-apk.sh` (APK 1.1, versionCode 2, assinado com a chave do projeto). Emulador: Android 14 (AOSP, userdebug), Pixel 5 (1080x2340, 440 dpi, 393 dp de largura), WebView 113. Dados apagados antes (`pm clear`) para começar como usuária nova. Perfil de exemplo: mulher, 1985, 165 cm, 98,5 kg, com pedra na vesícula, gordura no fígado e esperando cirurgia, sem diabetes. Não são os dados reais dela.

## Conclusão

**Nenhum defeito que barre a entrega.** O app abre, o perfil salva, as contas batem (conferi proteína e calorias na mão), os registros gravam, o alerta de dor forte aparece, exportar e restaurar devolvem os dados idênticos byte a byte, o botão voltar se comporta como o planejado e nada transborda da tela, nem na medida do Xiaomi com fonte 1,5.

Encontrei **4 defeitos importantes**. Três são de produto: o painel e a semana não têm botão; o aviso de ritmo e o alerta de dor não se ajustam a quem tem vesícula, e o aviso de ritmo não aparece no Hoje; restaurar uma cópia exige criar um perfil antes. O quarto: no Hoje, os números de proteína e energia ficam abaixo de uma tela inteira de rolagem. Há ainda **7 defeitos menores**.

Abertura a frio: **0,9 a 1,8 s** até a janela aparecer (`am start -W`, TotalTime, 7 medições), e o primeiro conteúdo da página é pintado **1,5 a 2,0 s** depois de a WebView começar a carregar. O emulador desenha por software (swiftshader), então no celular real tende a ser mais rápido; vale como número indicativo, não como medição do aparelho dela.

Observação: a `main` testada ainda tem o visual antigo (verde, abas Hoje/Plano/Treino/Diário/Guia). O visual laranja e a nova barra (Hoje, Semana, Comer, Mover, Guia) não estavam juntados e não foram testados. Também não testei o plano da nutricionista (ramo onda2-nutri, fora da main).

## Defeitos

### Barra a entrega
Nenhum.

### Importante

**I1. Painel e Semana não têm como ser abertos pela usuária.** Não há botão nem link para `#painel` e `#semana` em nenhuma tela. A Activity não aceita endereço vindo de fora: `adb shell am start -a VIEW -d "file:///android_asset/index.html#painel"` entrega a intenção, mas a página continua onde estava. Testei as duas telas mudando o endereço pela ferramenta de depuração da WebView (o emulador é userdebug); no celular dela isso não existe. O código já avisa ("navegação fica para o redesenho"); fica registrado que, sem esse redesenho, ela não vê as duas telas.
- Reproduzir: abrir o app e procurar Painel ou Semana em todas as abas e no Perfil.
- Capturas das telas abertas pelo endereço: `android-o2-09-painel.png`, `android-o2-10-painel-30dias.png`, `android-o2-11-semana.png`, `android-o2-19-semana-com-registros.png`.

**I2. O aviso de ritmo de perda só aparece em Diário > Peso, e o alerta de dor forte é o mesmo para quem tem vesícula.**
- Ritmo: com perfil de vesícula, registrei 102 kg em 01/11, 99,4 kg em 15/11 e 97,2 kg em 22/11. O cartão "Ritmo de perda" (1,6% por semana em 21 dias) aparece só em Diário > Peso (`android-o2-28-peso-aviso-ritmo.png`). Não aparece no Hoje, que é onde ela olha todo dia, nem em #semana (lá só "-2,2 kg na semana"). O briefing pede o ritmo em destaque para ela.
- Detalhe: o ritmo só é calculado com uma pesagem de 14 a 28 dias antes. Na primeira e na segunda semana de tratamento não há aviso, por mais rápida que seja a perda (`ritmoPerda` devolveu null com pesagens de 15/11 e 22/11). Pode ser de propósito; a decisão é da chefia.
- Dor forte: em Diário > Sintomas, marquei "Dor forte na barriga" e salvei. O alerta (`android-o2-16-sintomas-alerta-dor.png`) traz só o texto geral (dor contínua para as costas, vômito, 192). Não fala dos sinais da vesícula que o cartão de vesícula e o Guia trazem: dor do lado direito, cerca de 6 horas, febre, pele amarela. O texto é fixo em `app/sintomas.js:60` e não olha `perfil.vesicula`. Depois de salvar, o Hoje também não lembra que houve dor forte nesse dia.
- Reproduzir: perfil com vesícula = Sim, Diário > Sintomas, marcar Dor forte, Salvar.

**I3. Restaurar a cópia de segurança exige criar um perfil antes.** O campo "Restaurar" fica só em Diário > Relatório, e o Diário só abre depois que o perfil existe. Quem troca de celular ou reinstala o app cai na tela "Antes de começar" e no perfil, sem opção de restaurar. Contornei preenchendo um perfil qualquer (1990, 170 cm, 80 kg) e restaurando por cima: os dados voltaram idênticos aos exportados (comparei o JSON inteiro antes e depois: igual).
- Reproduzir: Diário > Relatório > Exportar tudo > Copiar; Apagar todos os dados > Apagar tudo; procurar onde colar a cópia.
- Capturas: `android-o2-20-exportar-escolher.png`, `android-o2-21-restaurar-colado.png`.

**I4. No Hoje, proteína e energia ficam a mais de uma tela de distância.** Com vesícula e fígado marcados, o cartão vermelho da vesícula tem o texto da bula, "Sinais de crise", o parágrafo da cirurgia e a barra até 10% do peso. Isso empurra o cartão "Proteína hoje" para 859 px do topo numa tela de 694 px úteis (Pixel 5, fonte 1,0): ela precisa rolar mais de uma tela inteira para ver os números. O dono pediu "números a um toque" (`android-o2-04-hoje-topo.png`, `android-o2-18-hoje-apos-registros.png`). Talvez o redesenho resolva; fica o registro de como a main está.

### Menor

**M1. Trocar para "Dia de enjoo" no meio do dia tira do total o que ela já comeu.** Marquei o café ("comi tudo") e o almoço ("metade") no cardápio normal: 50 g e 551 kcal. Ao tocar em "Dia de enjoo", o total caiu para 10 g e 0 kcal (só os 10 g extras). Ao voltar ao normal, os números voltam. Nada é apagado (o código guarda as marcas em `comido` e `comidoEnjoo`), mas o total do dia conta só o cardápio que está aberto. Quem toma café normal e enjoa à tarde vê um total menor que o real. Captura: `android-o2-06-hoje-dia-de-enjoo.png`.

**M2. Título "Refeições de hoje de enjoo"** no dia de enjoo soa estranho (`app/hoje.js:79`). Sugestão de texto para quem decide: "Refeições do dia de enjoo".

**M3. Em Peso, a tecla Enter do teclado salva antes do campo Cintura.** Depois de digitar o peso, o Enter (seta do teclado) grava o registro na hora, sem passar para "Cintura (cm, opcional)". No Perfil, o Enter passa para o campo seguinte. Quem quer anotar a cintura precisa tocar no campo antes de apertar Enter.

**M4. Abas que passam da largura da tela, sem sinal de que dá para arrastar.** Os botões do Diário (Aplicações, Peso, Sintomas, Relatório) e os dias do Plano (Seg a Dom, Enjoo) ficam numa faixa que rola para o lado. Com fonte 1,3 no Pixel 5, e também com 1,5 na medida do Xiaomi, "Relatório" aparece cortado. No Plano, "Enjoo" fica fora da tela desde a fonte 1,0 na medida do Xiaomi, e "Dom" e "Enjoo" ficam fora com 1,3. Dá para arrastar, mas nada indica isso. Capturas: `android-o2-f130-diario.png`, `android-o2-xiaomi-f15-diario.png`, `android-o2-f130-plano.png`.

**M5. Texto do Plano que não bate com as quantidades.** Café de domingo: a lista diz "Ovo cozido: 100 g", e o preparo diz "ovos mexidos". O azeite do café aparece como "3 g (½ × colher de sopa)", e o preparo diz "1 colher de chá de azeite".

**M6. O relatório para o médico não diz quando foi a dor forte nem que ela tem vesícula e fígado.** Ele mostra "Dor forte na barriga: 1", sem data, e não cita as condições do perfil (pedra na vesícula, gordura no fígado, aguardando cirurgia). Para o médico, a data da crise conta. Cabe à chefia decidir se entra.

**M7. Painel sem registros mostra uma frase sem contexto:** "1.200 kcal é o mínimo por dia que o cardápio do app usa. Se isso se repetir, vale levar ao médico..." aparece mesmo com "Nenhum dia com registro nesse período", e "isso" fica sem referência.

**Visto uma vez, não reproduzido:** numa sequência Guia > abrir "Esqueci a dose" > voltar (foi para Hoje) > voltar, o app não saiu. Ao reabrir, a tela estava em Plano. Repeti a mesma sequência mais duas vezes: o app saiu normalmente e reabriu em Hoje. Pode ter sido o tempo entre os comandos do adb. Fica anotado, sem classificação.

## O que funcionou (passo a passo)

- **Entrada e Perfil**: tela "Antes de começar" e Continuar (`01`). O teclado numérico abre em ano, altura e peso. Vírgula decimal aceita ("98,5"). Enter passa para o campo seguinte. O campo em foco fica visível acima do teclado e a barra de abas some (`02`). As listas de escolha abrem a lista nativa do Android (`03`). A pergunta da cirurgia aparece só depois de vesícula = Sim. A de insulina/sulfonilureia fica escondida com diabetes = Não. "Perfil salvo." e ida para Hoje.
- **Hoje**: cartão de vesícula com "Sinais de crise", parágrafo da cirurgia e marcas de 5/7/10% (93,6 / 91,6 / 88,7 kg, conferido). "Comi tudo" no café + "metade" no almoço + 10 g extras deram 50 g e 551 kcal (18 + 22,5 + 10; 349 + 202, conferido). Água: 2 copos = 0,4 L. Depois da aplicação: "Semana 1 do tratamento, 2,5 mg, próxima em 29/11, local sugerido abdômen direito". As metas se recalculam com o peso novo (106→105 g, 1.500→1.450 kcal), coerentes entre Hoje, Painel, Semana e Relatório.
- **Plano**: cartões da vesícula (crise, pronto-socorro em cerca de 6 h, 192) e do fígado (5/7/10%, álcool, bebida açucarada, 150 min) aparecem (`07`, `08`). Cardápio do dia, metas e micronutrientes também.
- **Painel** (aberto pelo endereço): anéis 48% / 37%, barras de 7 e 30 dias, toque numa barra mostra "Hoje (em andamento): 50 g", sem rolagem lateral.
- **Semana** (aberto pelo endereço): sem aplicação mostra o convite; com registros mostra aplicação "no dia previsto", peso, sintomas, enjoo, comida.
- **Treino**: "Concluí hoje" registra o treino A, o contador vai a 1 de 3 e o próximo passa a ser o B. "Na academia" troca os exercícios.
- **Diário**: aplicação com o seletor de data nativo e a observação, salva com Enter. Peso com cintura. Peso com data apagada pelo botão "Clear" do seletor: o app avisa "Preencha o campo: Data." e põe o foco nela (`27`). Peso fora da faixa: "Confira o peso em kg." Sintomas com o alerta (`16`). Relatório em texto com Compartilhar (abre a folha do Android, `17`) e Copiar. Exportar tudo abre a folha do Android, e o botão Copiar dela leva o texto. Restaurar (colado com o teclado) pede confirmação e devolve os dados idênticos. Apagar todos os dados pede confirmação.
- **Guia**: 16 seções recolhíveis. Os sinais de alerta incluem vesícula (6 h, febre, pele amarela), pâncreas, 192, 188.
- **Botão voltar**: com o teclado aberto, fecha o teclado. Com uma confirmação aberta ("Apagar todos os dados"), fecha a confirmação sem apagar. De Guia, Diário e Semana, volta para Hoje. Em Hoje, sai do app.
- **Modo escuro** (`cmd uimode night yes` com o app aberto): a página troca na hora, sem recarregar. O fundo fica escuro, o topo turquesa com texto escuro (contraste conferido nas cores calculadas: texto #06201d sobre #2dd4bf) e os cartões de vesícula em vermelho escuro legível (`23`, `24`, `25`).
- **Fonte grande 1,3** (Pixel 5): textos crescem (16→20,8 px), nada sai da largura da página, as abas de baixo não cortam. Exceção: M4.
- **Erros**: nenhum erro de JavaScript nem queda no logcat durante o percurso.

## Medida do celular dela (Xiaomi Redmi Note 13 Pro)

Simulei a tela com `wm size 1220x2712` e `wm density 440` (444 dp de largura na página) e percorri Hoje, Plano, #painel, #semana, Diário e Guia com fonte 1,0, 1,3 e 1,5. Em nenhuma combinação a página ficou mais larga que a tela, as abas de baixo cortaram ou um texto vazou de um cartão. O que aparece:
- Plano: o botão "Enjoo" fica fora da faixa de dias desde 1,0. Com 1,3 e 1,5, "Dom" também (M4).
- Diário com 1,5: "Relatório" cortado na faixa de botões (M4).
- Painel: os percentuais dentro dos anéis não crescem com a fonte (ficam em 22,5 unidades do desenho). Os números grandes embaixo crescem. Continua legível.
- Altura das páginas com 1,0 → 1,5: Hoje de 2409 para 3387 px, Plano de 5709 para 8646 px. O problema do I4 piora com a fonte grande.
- Capturas: `android-o2-xiaomi-f10-*.png`, `android-o2-xiaomi-f13-*.png`, `android-o2-xiaomi-f15-*.png`.

**Limite:** o emulador roda Android 14 puro. Não há como simular a interface MIUI/HyperOS: a WebView da Xiaomi (versão e atualização pela loja), o teclado, a economia de bateria que fecha apps em segundo plano, as permissões e o tema escuro forçado pela MIUI, que pode escurecer páginas por conta própria. A medida de tela e de fonte foi simulada; o comportamento do sistema da Xiaomi não.

## O que não consegui testar ou testei só em parte

- **Abrir Painel e Semana como a usuária**: impossível, não há caminho (I1). Testei pelo endereço via depuração.
- **Celular real e MIUI/HyperOS**: só emulador (ver Limite acima). O tempo de abertura no aparelho dela não foi medido.
- **Idioma do sistema**: o emulador está em inglês, então o seletor de data aparece em inglês ("Clear/Cancel/Set") e o campo de data mostra 11/22/2026. No celular dela, em português, deve aparecer 22/11/2026, mas não testei com o sistema em pt-BR.
- **Compartilhar de verdade** (WhatsApp, e-mail): o emulador não tem esses apps. Conferi que a folha do Android abre com o texto e que "Copy" copia.
- **Calendário** (botão de criar o evento semanal): não exercitado nesta rodada.
- **Atualização por cima de uma versão já instalada com dados** (manter registros): não testada nesta rodada, porque comecei limpo.
- **Modo discreto**, perfil com diabetes/insulina e o aviso de hipoglicemia: não percorridos.
- **Virada do dia com o app aberto**: não testada.
- **Visual novo e plano da nutricionista**: não estão na main testada.

## Como foi feito

Cópia estável da `main` com `git worktree` em /tmp e a chave copiada para lá sem entrar no git. APK montado com `montar-apk.sh` e instalado com `emulador.sh instalar`. Toques e digitação reais pelo `adb shell input` (teclado do Android, listas nativas, seletor de data nativo). Para achar a posição dos botões, ler os números da tela e abrir #painel/#semana, usei a depuração da WebView pelo adb (disponível porque o emulador é userdebug). No fim: fonte 1,0, modo claro, `wm size/density reset`, emulador desligado, cópia removida. O `android/chave.keystore` original não foi tocado. Nenhum arquivo de `app/`, `testes/` ou `android/` foi editado e não houve commit.
