# Teste final do APK 2.0 no Android virtual

Testador Android, 22/11/2026, das 19h27 às 20h10. APK testado: `semana-a-semana.apk` da raiz (versão 2.0, versionCode 3, compilado de 281b1d4), sem recompilar. Versão anterior: commit 9062ae9 (1.1, versionCode 2), compilada numa cópia temporária com a chave do projeto (cópia já removida). Emulador: Android 14 (AOSP, userdebug), Pixel 5 (1080x2340, 440 dpi), WebView 113. Dados de exemplo inventados (perfis "Teste", 1979/162 cm/110,4 kg e 1983/160 cm/112 kg). PIN de teste: 246810. PINs errados de propósito: 2468 (curto) e 246811 (errado/diferente). Os códigos de recuperação que aparecem nas capturas A12 e B04 são de teste e já não existem (o app foi desinstalado e o emulador desligado).

## Conclusão

**Pode entregar? Sim, com ressalvas.** Nenhum defeito impede o uso ou perde dados. O ponto mais importante passou: a 1.1 com registros, atualizada por cima pelo APK 2.0, manteve tudo (perfil, 2 aplicações, 2 pesos com cintura, sintomas com dor forte e anotação, refeições marcadas, água, enjoo). O app pediu o PIN, mostrou o código de recuperação, conferiu um grupo do código, cifrou os dados e mostrou a faixa das perguntas novas. Usuária nova, bloqueio, PIN errado, "Esqueci o PIN", exportar com aviso e "Cópia pronta e conferida", restaurar, voltar, teclado, medida do Redmi com letra 1,0 e 1,3 e modo escuro: tudo funcionou.

Deixo 3 defeitos **importantes** para a chefia decidir antes de segunda. Nenhum barra a entrega pelo critério de "funciona e não perde dados". O I1, porém, contradiz o plano da nutricionista na tela de que o dono pediu para acompanhar calorias, e pode ser considerado barra por quem decide:
- **I1.** O Painel e o relatório comparam as calorias com a meta do app (1.550 kcal) e marcam "abaixo de 1.200 kcal, vale levar ao médico", mesmo com o plano da nutricionista em uso (faixa dela: 1.009 a 1.392 kcal).
- **I2.** Depois da migração, os registros antigos continuam legíveis em texto puro no arquivo de armazenamento da WebView, que também entra na cópia do Google.
- **I3.** Tocar em "Dor na barriga" em "Como está hoje?" grava "dor forte na barriga", e o relatório da consulta lista esse dia entre as datas de dor forte.

Há também 8 defeitos menores.

Tempos medidos no emulador (desenho por software, vale como indicação): abertura a frio de **0,57 a 0,77 s** (`am start -W`, TotalTime, 6 medições) e tela do PIN pintada em cerca de 1,5 a 2 s. Desbloqueio com o PIN certo: a tela Hoje aparece em **1,0 a 2,0 s** depois do toque em Entrar (4 medições por captura de tela; a captura tem intervalo de cerca de 0,4 s).

## Defeitos

### Barra a entrega
Nenhum.

### Importante

**I1. Calorias do Painel e do relatório ignoram o plano da nutricionista.** Com "Usar o plano da minha nutricionista" ligado, o Plano mostra "Energia 1.009 a 1.392 kcal" (`final-B27-plano-metas-nutri.png`). O Painel, porém, mostra "meta 1.550 kcal" no anel e no gráfico (`final-B23-painel.png`). O relatório diz "referência 1550 kcal". Marquei em 21/11 o plano inteiro dela (opção 1 de cada refeição, "comi tudo"): deu 1.170 kcal. O Painel contou "Abaixo de 1.200 kcal: 1 de 1" e repete "1.200 kcal é o mínimo por dia que o cardápio do app usa. Se isso se repetir, vale levar ao médico ou ao nutricionista" (`final-B24-painel-abaixo-1200.png`). Ou seja: quem segue o plano dela à risca recebe aviso de que comeu pouco. A proteína está certa (alvo 91 g, o mesmo em Hoje, Painel, Semana e relatório). Pela leitura do código, `app/painel.js` usa `m.kcal` e `m.pisoDia`, as metas do app, e não a faixa do plano.
- Reproduzir: usuária nova com nutricionista = Sim, marcar todas as refeições de um dia como "comi tudo", abrir Semana > Painel no dia seguinte.

**I2. Texto puro dos registros antigos continua no disco depois da migração para o PIN.** Com acesso root ao emulador (userdebug), copiei a pasta `app_webview/Default/Local Storage/leveldb` antes e depois da atualização. Depois do PIN, as chaves vivas são só `semana-a-semana.cifrado` e `semana-a-semana.escala`: a migração apagou a chave em texto como planejado. Mas o arquivo `000003.log` do LevelDB ainda contém as gravações antigas, legíveis. Por exemplo `"data":"2026-11-15","kg":108.9` e a anotação de sintoma "dor depois do jantar". Elas continuaram lá depois de fechar e reabrir o app (o LevelDB só descarta isso quando compacta, o que com estes volumes pode levar muito tempo). As regras de backup (`android/res/xml/regras_backup.xml`) mandam exatamente essa pasta para a cópia do Google e para a transferência entre celulares. Na usuária nova (sem versão anterior) não há texto puro: conferi.
- Quem é afetado: só quem já usava a 1.0 ou a 1.1 com registros antes de atualizar. Ler esse arquivo exige root, extrair o backup ou ter acesso físico com ferramentas. O relatório `cifra.md` diz que a ausência do texto puro foi conferida só no navegador.
- Detalhe menor: a chave `semana-a-semana.escala` fica em texto e guarda as metas calculadas (ex.: 1.550 kcal e 107 g). Dá para estimar o peso a partir delas.
- Não tenho captura de tela: a prova é o arquivo. Reproduzir: instalar a 1.1, registrar, atualizar, criar o PIN, `adb root` e procurar o peso registrado no `000003.log`.

**I3. "Dor na barriga" em "Como está hoje?" vira "dor forte na barriga" no registro e no relatório.** Em Hoje, toquei no botão "Dor na barriga" (o botão não diz "forte"). A folha de sinais abriu certa (`final-B14-dor-toggle.png`). Mas em Diário > Sintomas o dia aparece como "Enjoo leve, intestino normal, dor forte na barriga". O relatório diz "Dor forte na barriga registrada em: 19/11/2026, 22/11/2026", e o 22/11 veio desse botão (`final-B32-relatorio.png`). Para o médico, "dor forte" e as datas contam. Cabe à chefia decidir se o botão deve dizer "dor forte" ou se o registro deve ser outro.
- Reproduzir: Hoje > Como está hoje? > Dor na barriga; fechar a folha; abrir Semana > Diário > Sintomas ou o Relatório.

### Menor

**M1. Antes de responder as perguntas novas, o perfil antigo já usa o alvo da nutricionista.** Logo após a atualização, a Hoje mostra "alvo do plano da nutricionista: 91 g", e o Painel e a Semana também, embora ela ainda não tenha dito que tem nutricionista. A lista de refeições continua sendo o cardápio do app (`final-A13-hoje-apos-migracao.png`, `final-A14-hoje-rolado.png`). Depois de responder "Não" ao plano da nutricionista, volta para "meta 107 g" (`final-A21-hoje-apos-perguntas.png`). Para ela, que tem nutricionista, o resultado final é o certo; para quem não tem, o alvo muda depois de responder.

**M2. Ao marcar quanto comeu, o seletor "Opção do plano" some e a tela pula cerca de 150 px para cima.** O dedo que ia tocar na refeição de baixo cai em outro lugar (aconteceu comigo: o "metade" do almoço não marcou na primeira tentativa). Também não fica claro como trocar de opção depois de marcar. Capturas: `final-B11-refeicoes-plano.png` (antes) e `final-B12-refeicoes-marcadas.png` (depois).

**M3. "Todos os sinais no Guia" abre o Guia no topo.** A seção "Sinais de alerta" fica aberta, mas fora da tela, abaixo de 7 seções fechadas (`final-B21-guia-sinais.png`). Ela precisa rolar para achar.

**M4. A faixa de dias do Plano continua cortando "Enjoo"** na medida do Redmi com letra 1,0 (`final-C-f10-plano2.png`), como no teste anterior. Também continua o texto do cardápio reserva com "Ovo cozido: 100 g" e preparo "ovos mexidos" (`final-B26-comer-figado.png`).

**M5. Enter no campo Altura do formulário curto mostra o aviso "Preencha o campo: Peso no começo do tratamento"** antes de ela digitar o peso. O foco vai certo para o peso, mas o aviso parece erro (`final-B07-teclado-peso.png`).

**M6. O aviso "Cópia pronta e conferida" some atrás da folha de compartilhar do Android.** Ele aparece por menos de 1 s e a folha cobre a tela. Só vi o aviso numa captura feita logo depois do toque (`final-B35-copia-conferida.png`). Quem não reparar fica sem saber que a cópia foi conferida.

**M7. Depois de restaurar, a Hoje abriu em "Ontem"** (o dia que estava aberto antes). Ao ver um dia passado, o cartão diz "Chegou ao alvo de hoje", embora seja de outro dia.

**M8. Mudar o tamanho da letra do sistema ou a densidade da tela recarrega o app e pede o PIN de novo.** Isso acontece porque `fontScale` e `density` não estão em `configChanges`. O modo escuro, que está na lista, não recarrega. Raro no uso normal; registrado porque ela pode aumentar a letra com o app aberto.

Também observado, sem classificação: "Dias de enjoo: nenhum marcado" na Semana e "Dias de enjoo: 0" no relatório, ao lado de "enjoo em 1 dia", confundem. Um se refere ao botão "Dia de enjoo" do cardápio, o outro ao sintoma. O texto "As refeições sem marca do plano têm cerca de 121 g" em Hoje é difícil de entender.

## Roteiro A: atualização por cima com dados

1. 1.1 instalada limpa. Perfil, aplicações em 08/11 e 15/11 (com observação), pesos de 108,9 kg em 15/11 e 107,6 kg com cintura de 118 cm em 22/11, sintomas em 18/11 (enjoo moderado, cansaço, dor forte e anotação) e em 22/11 (enjoo leve, refluxo), refeições de 22/11 (51 g e 817 kcal), 2 copos de água (`final-A01` a `final-A05`).
2. `adb install -r` com o APK 2.0: "Success", versionCode 3. Ao abrir: "Crie um PIN de 6 dígitos" (`final-A10`), confirmação, código de recuperação (`final-A12`) e conferência do grupo 3.
3. Hoje depois da migração (`final-A13`): semana 3, 2,5 mg, próxima aplicação hoje, local sugerido Coxa esquerda, 51 g, faixa "O app ganhou três perguntas" com "Responder agora" e "Agora não". Refeições marcadas, água de 0,4 L e enjoo leve preservados (`final-A14`).
4. Semana: semanas 1, 2 e 3 com aplicações "no dia previsto", pesos e dor forte (`final-A15`). Diário: as 2 aplicações (com a observação), os 2 pesos (com a cintura) e os 2 sintomas (com a anotação) (`final-A16`). Painel com 51 g e 817 kcal (`final-A17`).
5. "Responder agora": vesícula Sim, cirurgia Sim, fígado Sim, nutricionista Não, Salvar. A faixa sumiu e a meta voltou para 107 g. O relatório começa por "PARA COMEÇAR", com as condições, "Dor forte na barriga registrada em: 18/11/2026" e as marcas de 5, 7 e 10% (`final-A18` a `final-A22`).
6. Armazenamento: chave de dados em texto apagada, dados em `semana-a-semana.cifrado`. Ver I2 sobre o resto no arquivo.
7. Fechar à força e abrir: pede o PIN (`final-A23`) e desbloqueia com os dados.

## Roteiro B: usuária nova

- PIN curto: "O PIN precisa ter 6 números." PINs diferentes: "Os dois PINs não são iguais. Crie de novo." (`final-B02`, `final-B03`). Código de recuperação, conferência com grupo errado ("Não confere") e grupo certo em minúsculas (aceito) (`final-B04`).
- Entrada e formulário curto: ano, altura, peso, vesícula Sim, cirurgia Sim, fígado Sim, nutricionista Sim, Começar. Há "Já usava o app? Restaurar" na primeira tela (`final-B05` a `final-B08`).
- Hoje (`final-B10` a `final-B16`): topo, "Proteína hoje" e "Faltam 91 g" na primeira tela, "Plano da sua nutricionista" com "Gordura na medida" (vesícula), 5 refeições com horário e opções. Escolhi a opção 3 do café com "comi tudo" e o almoço "metade" ("Contou: 23 g"): total de 40 g, conta conferida (17 + 23). Água, "Como está hoje?" (Enjoo leve), "Dor na barriga" (abre a folha 192 / pronto-socorro / médico; o voltar fecha a folha), cartão "Pedra na vesícula. Com dor forte..." e atalhos. Os 8 atalhos levam ao lugar certo: Comida → Plano, Como estou → Sintomas, Aplicação → Aplicações, Para a consulta → Relatório, Painel → Painel, Peso → Peso, Dor → folha, Água soma 1 copo com aviso.
- Aplicação atrasada: aplicação em 13/11 (sexta). Hoje mostra "Atrasada 2 dias (era Sex, 20/11). Pode aplicar hoje. A próxima continua Sex, 27/11." e "Por quê (bula)" (`final-B18`).
- Semana: peso de 110,2 kg (-1,6%). Sintoma de dor forte em 19/11 abre a folha "Dor na barriga: o que fazer" com "Registrado em 19/11/2026" (`final-B20`). A Semana mostra "Dor forte na barriga foi marcada nesta semana" e o botão para o Guia (`final-B22`). O Painel funciona (ver I1).
- Comer: cartões "Pedra na vesícula" e "Gordura no fígado" com a barra até 10% (1,6 / 10,0%), metas do plano da nutricionista e Caminhos com "Plano da sua nutricionista: Em uso" no topo (`final-B25` a `final-B28`).
- Mover: "Concluí hoje" passa para 1 de 3, próximo treino B (`final-B29`). Guia: 16 seções (`final-B30`). Perfil abre com o cartão da vesícula e as perguntas (`final-B31`).
- Relatório: começa pelas condições e pelas datas de dor (`final-B32`). Exportar: aviso de dados de saúde com Cancelar/Seguir, folha do Android com o texto e o sha256, "Cópia pronta e conferida" (`final-B33` a `final-B35`). Restaurar a cópia colada: pede confirmação, dados intactos (`final-B36`).
- Bloqueio: ir para a tela inicial e voltar pede o PIN (`final-B37`). Sair pelo voltar e reabrir também pede. PIN errado: "PIN errado." (`final-B38`). "Esqueci o PIN": aceitou o código digitado em minúsculas e com espaços, pediu PIN novo duas vezes e entrou com os dados (`final-B39` a `final-B41`).

## Roteiro C: medida do Redmi, letra e modo escuro

`wm size 1220x2712` e `wm density 440`. Hoje, Painel, Semana, Plano e Perfil com letra 1,0 (`final-C-f10-*`) e 1,3 (`final-C-f13-*`): nada passou da largura e a barra de baixo não cortou. Com 1,3, "comi tudo" e "um pouco" quebram em 2 linhas e continuam legíveis. "Enjoo" sai da faixa de dias do Plano (M4). Numa captura do Painel a barra aparecia cortada; era o efeito de esticar a tela ao puxar além do topo, e na captura parada ela está inteira. Modo escuro (`final-C-escuro-*`): PIN, Hoje, Painel e Plano legíveis, cartão da vesícula em vermelho escuro. Tudo voltou ao normal no fim (1080x2340, 440, letra 1,0, modo escuro desligado).

## Roteiro D: voltar, teclado e tempos

- Voltar: com o teclado aberto, fecha só o teclado. Com a folha de dor aberta, fecha a folha. De Comer, Perfil e Diário, volta para Hoje. Em Hoje, sai do app, e ao reabrir pede o PIN.
- Teclado: numérico nos campos de número, com a vírgula decimal aceita. O campo em foco fica visível acima do teclado no formulário curto e em Diário > Peso (`final-B07`, `final-B19`). A tela do PIN não abre o teclado sozinha: ela precisa tocar no campo.
- Tempos: ver a Conclusão.
- Logcat: nenhum erro de JavaScript nem queda do app. Só avisos de cache da WebView, comuns na primeira abertura.

## O que não testei ou não dá para testar aqui

- Xiaomi de verdade: a MIUI/HyperOS (avisos de instalação, economia de bateria, limpador, tema escuro forçado, WebView da Xiaomi). Só a medida de tela e de letra foi simulada.
- Inatividade de 5 minutos, troca de PIN pelo Perfil e espera depois de 5 PINs errados: não testei no emulador.
- Cópia do Google e transferência entre celulares: não testei. O I2 vem da leitura do arquivo e das regras de backup.
- Compartilhar o relatório por um app de mensagens: o emulador não tem WhatsApp. Só vi a folha do Android abrir.
- "Pôr no calendário", Dia de enjoo com o plano da nutricionista e letra 1,5: não testei nesta rodada.
- Data no formato americano (11/22/2026) nos campos de data: é o idioma do emulador (inglês), não do app.
