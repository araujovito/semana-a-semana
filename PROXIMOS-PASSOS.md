# Próximos passos (retomada de 23/11/2026)

Situação na madrugada de 23/11: a versão 2.0 do APK foi testada no emulador ("pode entregar, com ressalvas"). Depois disso, correções entraram em `main` e uma rodada de 20 agentes trabalhou em ramos separados. O trabalho foi parado a pedido do dono antes de juntar tudo e compilar a 2.1.

## Trabalhar em outro computador

- **Repositório público, com histórico reescrito.** Altura, peso, ano de nascimento, bioimpedância, a relação familiar e o caminho da pasta pessoal foram retirados de todo o histórico. As capturas de tela (`empresa/relatorios/capturas/`) não estão no repositório público, porque algumas usam perfis de teste parecidos com o real. Os relatórios que citam capturas ficam com o link quebrado.
- **Fora do repositório, de propósito:** os PDFs de saúde e a chave de assinatura `android/chave.keystore`. Sem a chave não dá para gerar um APK que instale por cima do que está no celular dela. Compile o APK final só no computador de casa.
- **Testes:** `bash testar.sh` precisa do `playwright-core` e do Chromium headless. Em outra máquina:
  `npm i playwright-core && npx playwright install chromium-headless-shell`, e depois
  `PLAYWRIGHT=$(pwd)/node_modules/playwright-core CHROMIUM=<caminho do chrome-headless-shell> bash testar.sh`.
  A rodada inteira leva de 5 a 10 minutos.
- **Voltando para casa:** o repositório de casa ainda tem o histórico antigo, sem limpeza. Para continuar do que foi feito no trabalho, sem misturar os dois históricos:
  `git fetch origin && git checkout -B main origin/main`. Os PDFs e a chave continuam na pasta, porque o git os ignora.

## 1. Juntar os ramos prontos em `main` (testes verdes em cada um)

Cada ramo saiu do mesmo ponto (cb9f833) e foi testado sozinho. Junte um de cada vez e rode `bash testar.sh` depois de cada um, porque alguns mexem nos mesmos arquivos (`app/hoje.js`, `app/planonutri.js`, `testes/`, `LEIAME.md`). Ordem sugerida, dos isolados para os que mais cruzam:

| Ramo | O que faz |
|---|---|
| `onda3/pronto-revisao-codigo` | Só relatório: 3 importantes e 12 menores da revisão de código |
| `onda3/pronto-contraste-acessibilidade` | Contorno dos campos (contraste 3:1); folha e relatório com nome para o leitor de tela |
| `onda3/pronto-letra-1-5` | Botão ao lado de texto não é espremido com letra grande; teste com letra 1,5 |
| `onda3/pronto-m4-dias-plano-subabas` | Dias do Plano e sub-abas do Diário inteiros em 440 px |
| `onda3/pronto-m4-texto-ovo` | "Ovo mexido" e "Ovo batido" em vez de "Ovo cozido" nas receitas certas |
| `onda3/pronto-m6-copia-conferida` | Linha fixa "Última cópia conferida" no cartão de cópia |
| `onda3/pronto-ponte-android-calendario` | Copiar e compartilhar avisam quando o Android recusa o texto; try/catch no Java |
| `onda3/pronto-escala-cifrada` | Com PIN, as metas calculadas vão cifradas (saem do texto puro) |
| `onda3/pronto-m1-perfil-antigo` | Perfil antigo sem resposta fica no cardápio do app até dizer se tem nutricionista |
| `onda3/pronto-textos-enjoo-proteina` | "Cardápio leve" em vez de "Dias de enjoo"; nota da proteína reescrita |
| `onda3/pronto-documentacao-2-1` | LEIAME, guias de entrega e PARA-O-MEDICO atualizados (conferir depois das junções) |

**Incompletos**: o agente foi parado. O último commit de cada um diz "INCOMPLETO", e os testes não rodaram depois dele.

| Ramo | Estado |
|---|---|
| `onda3/incompleto-avisos-peso-gravidez-hoje` | 2 commits, sem relatório final. Rodar os testes e conferir na tela |
| `onda3/incompleto-dia-de-enjoo` | 2 commits bons e um parcial (consumo, semana, relatório `dia-de-enjoo-plano-nutri.md`) |
| `onda3/incompleto-pin-caminhos` | 2 correções boas; testes novos do PIN e o relatório pela metade |
| `onda3/incompleto-desempenho` | Escala calculada sob demanda e mudança no painel; sem medição final |
| `onda3/incompleto-cardapio-vegetariano` | Ajuste de porções do cardápio reserva vegetariano, pela metade |

## 2. Corrigir o que os revisores acharam (ainda sem correção)

Os relatórios ficam em `empresa/relatorios/`: `revisao-clinica-fim-22-11.md`, `seguranca-final.md`, `usabilidade-fim-22-11.md`, `plano-nutri-x-pdf.md` e, no ramo da revisão, `revisao-codigo-fim-22-11.md`.

**Antes do APK:**
1. **PIN:** a tela "Crie um PIN novo" (depois do código de recuperação) nunca bloqueia. Ao ir para segundo plano ou ao dar a inatividade, zerar `cifChaveRecuperada` e `cifCriacao` e voltar para a tela de PIN (`app/cifra.js`).
2. **Refeição não marcada conta como zero:** o Painel e o relatório acusam "abaixo de 800 kcal" em dias que ela só não marcou. As médias devem contar só os dias com as refeições marcadas e deixar de fora o dia da instalação.
3. **Dor leve no resumo:** o relatório e a Semana dizem "nenhuma dor forte" e escondem a dor anotada. Ela deve aparecer no topo.
4. **"Bem" e "Dor na barriga" acesos juntos** (`comoAtivo` em `app/hoje.js`). No ramo "bem", exigir que não haja dor, vômito nem a anotação de dor.
5. **Miniatura na tela de recentes:** `setRecentsScreenshotEnabled(false)` em `MainActivity` (Android 13+). Compilar e conferir no emulador.
6. **Corte de 800 kcal:** anotar a fonte (NIH Task Force, JAMA 1993;270:967). Usar o mesmo texto no Painel e no cartão da Hoje ("nutricionista" ou "médico", decidir um). O dia com uma refeição só não deve contar.
7. **Plano da nutricionista:** marcar whey e peixe como estimativa (`est: true`) e avisar na nota do almoço que salmão e sardinha têm mais gordura. Morango: "1 porção" entra como estimada. Corrigir o comentário do arroz.
8. **Menores de segurança:**
   - cópia editada com enjoo fora de 0 a 3 ou `ui.local` estranho quebra telas;
   - o texto colado não tem limite nem `.catch`;
   - o código de recuperação continua visível ao voltar de outro app.
9. **Densidade:** talvez faltem `smallestScreenSize|screenLayout` em `configChanges`. Só a mudança de letra foi conferida.

**Textos (usabilidade), baixo risco:**
- o relatório começa na instalação ou na 1ª aplicação, não 30 dias antes;
- a lista de 12 nutrientes "abaixo de 80%" na semana 1 deve ficar menor;
- "Assunto para o médico" aparece no dia em que ela comeu tudo;
- a Semana não deve tirar conclusão de um dia só;
- "Antes de começar" fala em "plano do app";
- o aviso "PIN criado." cobre a primeira pergunta com letra 1,3.

## 3. Fechar a versão 2.1

1. `versionCode` 4 e `versionName` 2.1 em `android/AndroidManifest.xml`; `VERSAO_APP` 2026.11.23-1 em `app/sw.js`.
2. `bash montar-apk.sh`, só no computador que tem a chave.
3. Emulador (`bash emulador.sh ligar` / `instalar`): instalação do zero, PIN e recuperação, Hoje, Painel com o plano, dor, letra 1,0 e 1,3, modo escuro, recentes e calendário (roteiro em `empresa/relatorios/ponte-android.md`).
4. Atualizar LEIAME, `empresa/ENTREGA-*.md`, diário de bordo e painel.

## 4. Fica para depois da entrega

- Hoje mais curta: os atalhos repetem o que já está na tela.
- Gerar um código de recuperação novo, se ela perder o papel.
- Bloco sobre dor leve na folha "Dor na barriga" (depende do médico).
- Texto residual da versão 1.x no armazenamento da WebView (I2), que só afeta quem atualiza por cima. Aceito, porque a instalação dela é do zero.
- O foco não volta ao botão que abriu a folha; os botões "editar" e "apagar" não dizem de qual registro são.

## 5. Depende do dono

- Instalar no Xiaomi dela. Nada foi testado num Xiaomi de verdade.
- Levar ao médico o que depende de aval: os três níveis da dor (192, pronto-socorro, médico), o "1 ou 2 horas", o aviso de ritmo, o corte de 800 kcal e o bloco de dor leve (lista em `empresa/PARA-O-MEDICO.md`).
- Ver com a nutricionista o rótulo do whey que ela usa.
- Versão web (PWA): publicar ou não.
