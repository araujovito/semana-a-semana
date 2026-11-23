# Revisão final de segurança antes da entrega

22/11/2026, revisor de segurança. Revisado o código de `main` em cb9f833. Nenhum código do app foi mudado.

## Conclusão

- **Nenhum achado de barra.** Não encontrei nada que impeça a entrega de segunda.
- **Dois achados importantes no PIN, os dois confirmados no navegador:**
  1. Se ela digita o código de recuperação e larga o app na tela "Crie um PIN novo", o app não bloqueia nem ao ir para segundo plano nem depois de 5 minutos. Quem pegar o celular depois cria um PIN e lê tudo, sem saber o código (I1).
  2. A miniatura do app na tela de apps recentes deve mostrar a última tela aberta, com dados de saúde, mesmo com o app já bloqueado. **Não testado** (sem emulador nesta rodada). É o comportamento esperado do Android, porque o app não pede para esconder a miniatura (I2).
- **Injeção de HTML: nada encontrado.** Restaurei uma cópia com HTML em todos os campos de texto, percorri as 12 telas e cliquei nas ações de 10 delas: nenhum elemento entrou na página. O relatório vai num `textarea` escapado. A CSP continua sem `unsafe-inline` e sem `unsafe-eval`. Os testes `fluxo-seguranca.js` e `fluxo-cifra.js` passam.
- **APK:** sem permissões, `debuggable` ausente, sem tráfego sem cifra, uma activity exportada (a do ícone, obrigatória), assinatura v2 e v3 com RSA 2048. O `configChanges` novo (`fontScale|density`) não abre brecha no bloqueio. Explico na seção 1.
- **Restauração:** texto colado com HTML é tratado. Uma cópia editada de propósito pode quebrar telas (Sintomas, Treino) ou deixar o app sem gravar até ser fechado. Nada se perde do que já estava gravado (M3, M4).
- O APK que está na pasta principal (`semana-a-semana.apk`, 22:46) é **anterior** aos três últimos commits: 5 arquivos de `app/` diferem. Precisa compilar de novo antes de entregar (M1).

Tabela dos achados:

| # | Gravidade | Onde | Resumo |
|---|---|---|---|
| I1 | importante | `app/cifra.js:139`, `:386-387`, `:188` | Tela "Crie um PIN novo" (depois do código) não bloqueia nunca |
| I2 | importante (não testado) | `android/java/br/semanaasemana/MainActivity.java:38-82` | Miniatura em "recentes" mostra a última tela |
| M1 | menor | `semana-a-semana.apk` da pasta principal | APK desatualizado em relação a `main` |
| M2 | menor | `app/cifra.js:316-321`, `:178-186` | PIN certo e app para segundo plano durante "Conferindo": abre em segundo plano e não pede PIN ao voltar |
| M3 | menor | `app/sintomas.js:13`, `app/treino.js:13,19`, `app/nucleo.js:58,73,82` | Cópia editada quebra telas e guarda campos desconhecidos |
| M4 | menor | `app/seguranca.js:80-93`, `app/aparelho.js:59-68` | Texto colado sem limite de tamanho; JSON muito aninhado falha em silêncio |
| M5 | menor | `app/cifra.js:255-261` | Código de recuperação continua na tela depois de voltar de outro app (antes de a cifra existir) |
| M6 | menor | `app/cifra.js:101`, `:192` | Chave de dados fica extraível na memória depois de criar o PIN ou de recuperar |

## 1. APK

Compilei com `bash montar-apk.sh` numa cópia em pasta temporária, com chave descartável (`NOVA_CHAVE=1`), só para ler o manifesto. A assinatura conferi no APK da pasta principal, que usa a chave verdadeira. Não instalei nada.

| Item | O que encontrei |
|---|---|
| Permissões | Nenhuma (`aapt2 dump badging` não lista `uses-permission`). |
| `debuggable` | Ausente no manifesto compilado, então vale falso. `WebView.setWebContentsDebuggingEnabled(false)` no código. |
| `usesCleartextTraffic` | `false`. Sem INTERNET, não teria efeito de qualquer jeito. |
| `exported` | Só `.MainActivity`, com `MAIN`/`LAUNCHER`. Precisa ser exportada para o ícone abrir. Não lê nada do Intent que a abre. |
| `allowBackup` | `true`, por decisão de 20/11. `regras_backup.xml` e `backup_antigo.xml` incluem só `app_webview/.../Local Storage/`. Com o PIN, a cópia do Google leva os registros cifrados. Vão em texto: a contagem de erros do PIN, as porções do cardápio (`semana-a-semana.escala`, que outro agente está vendo) e, se existirem, as cópias antigas `semana-a-semana.v1.guardado.*` (já citadas em `cifra.md`). |
| Assinatura | Esquemas v2 e v3 (sem v1; `minSdk` 26 não precisa dele). RSA 2048, SHA256withRSA, chave PKCS12 válida até 2054. A senha da chave está escrita em `montar-apk.sh` (já em `seguranca.md`, item 7). |
| `configChanges` | `0x400016a0` = orientation, keyboardHidden, screenSize, uiMode, density, fontScale. Confere com o manifesto. |

**Efeito do `configChanges` novo (commit 1077e30) no bloqueio:** nenhum efeito ruim encontrado.
- Antes, mudar letra ou densidade recriava a Activity. A página recarregava e pedia o PIN. Agora a página continua igual.
- O bloqueio não depende disso. Ele depende de `visibilitychange` (segundo plano) e da inatividade de 5 minutos (`cifra.js:386-397`), e os dois continuam ligados.
- Para mudar a letra ou a densidade pelas Configurações, o app vai para segundo plano e bloqueia do mesmo jeito.
- Pelo atalho da barra de notificações, a página continua aberta, como já acontece com o modo escuro (`uiMode` já estava na lista).
- Mudanças fora da lista (idioma, janela dividida) ainda recriam a Activity. A página recarrega e pede o PIN, o que é o lado seguro.
- `onSaveInstanceState`/`restoreState` guardam só o histórico de endereços da WebView (ex.: `#perfil`), não o conteúdo. Ao recriar, o JavaScript começa do zero, trancado.

## 2. WebView e CSP

- **Ponte (`MainActivity.java:135-183`):** só `compartilhar`, `copiar` e `calendario` têm `@JavascriptInterface`. Cada uma confere o argumento (tamanho até 250 mil caracteres; data `AAAA-MM-DD` com calendário não leniente). Como a página só carrega os próprios arquivos, só o código do app alcança a ponte.
- **`shouldInterceptRequest` (`:72-75`):** tudo fora de `file:///android_asset/` volta 403 vazio. **`shouldOverrideUrlLoading` (`:60-68`):** fora da pasta, só `http`/`https` saem, e para o navegador. Hoje não há nenhum link assim.
- `WebChromeClient` padrão: não concede câmera, microfone nem escolha de arquivo.
- **CSP (`index.html:5`):** `script-src 'self'` mais um hash para o `oninput` de `perfil.js:265`. Sem `unsafe-inline`, sem `unsafe-eval`, `object-src 'none'`, `base-uri 'none'`, `form-action 'none'`, imagens, fontes e conexões só da própria pasta. O único `style` liberado é o atributo (`style-src-attr`), que só muda aparência.
- **`innerHTML` com dado dela:** todos os pontos que montam HTML (`inicio.js:49,86,100`, `cifra.js:283`, `pwa.js:21`) recebem texto já passado por `esc()` (`nucleo.js:123`) ou números formatados.
  - Conferi os trechos novos pedidos: a nota "Dor na barriga." (`hoje.js:262-268`, aparece escapada em Diário > Sintomas), `rolarPara` (`inicio.js:57-60`, só ids fixos do código) e o relatório (`diario.js:12`, `esc(relatorio())` dentro de um `textarea`).
  - Teste próprio, numa pasta temporária, fora do repositório: estado com `<b class="xss">…</b>"'><i class="xss" data-ac="zerar">` em nome, local e observação da aplicação, nota, intestino, glicemia, cintura, tipo e local de treino, exercícios, itens comidos, trocas, "não come", "não gosta", caneta, suplementos, exames, lembretes e campos de `ui`. Resultado: nenhum `.xss` na página nas 12 telas (Hoje, Semana, Diário ×4, Painel, Plano, Caminhos, Treino, Guia, Perfil) nem depois de clicar nas ações de Hoje, Diário, Perfil, Treino, Semana, Painel, Plano e Caminhos.
  - Se um dia algum texto escapar do `esc()`, o risco que sobra sob esta CSP não é script. É um botão falso com `data-ac` que dispara uma ação do app (ex.: `zerar`). As ações que apagam pedem confirmação.

## 3. Cifra

Conferido e sem achado:
- PBKDF2-SHA256 calibrado (600 mil a 10 milhões de iterações), sal de 16 bytes por segredo.
- AES-KW para embrulhar a chave, AES-GCM 256 com **IV aleatório de 12 bytes a cada gravação** (`cifra.js:61-65`). Não há IV fixo nem contador reaproveitado.
- O código de recuperação tem 100 bits.
- PIN e código não vão para o armazenamento. A chave de dados vive em `cifChave` e é descartada no bloqueio junto com `E` (`cifra.js:139-144`). `salvar()` não grava nada com o app trancado (`nucleo.js:113`).

Em memória: o PIN fica em `cifCriacao` só durante a criação ou a troca, e nos valores lidos do formulário. Strings de JavaScript não podem ser apagadas à força. Isso é limite da plataforma, não erro.

Ataque fora do app (já descrito em `cifra.md`), com uma conta minha, **não medida**: com 5,7 milhões de iterações, uma placa de vídeo de jogo testa na casa de mil PINs por segundo. O milhão de combinações cai em dezenas de minutos; com o piso de 600 mil, em poucos minutos. O PIN protege contra quem abre o app no celular, não contra quem copia o armazenamento.

O que vai em texto no `localStorage`: `semana-a-semana.cifra.tentativas` (contagem de erros, sem segredo), `semana-a-semana.escala` (outro agente cuida), cópias antigas `*.v1.guardado.*` se existirem e `semana-a-semana.cifrado` (só sal, iterações, chaves embrulhadas, IV e dados cifrados).

### I1 (importante): "Crie um PIN novo" depois do código não bloqueia nunca
- **Onde:** `app/cifra.js:139` (`cifBloquear` sai sem fazer nada quando `cifChave` é nulo), `:386-387` (o bloqueio por segundo plano e por inatividade só age com `cifChave`), `:188-194` (`cifChaveRecuperada` fica guardada até o PIN novo).
- **Cenário:** ela toca "Esqueci o PIN", digita o código e chega em "Crie um PIN novo". Aí atende uma ligação, ou deixa o celular de lado. O app vai para segundo plano, fica parado, e a tela continua em "Crie um PIN novo". Qualquer pessoa que abra o app depois cria um PIN e entra em todos os registros, sem o código.
- **Confirmado** no navegador (`file://`, 440 px): segundo plano, volta e 6 minutos parados ainda mostram "Crie um PIN novo". Um PIN qualquer abriu os dados.
- **Correção sugerida:** no ouvinte de `visibilitychange` e na conferência de inatividade, além de `cifBloquear()`:
  - se `cifChaveRecuperada` ou `cifCriacao` existirem, zerar os dois;
  - se `cifPasso` for `novoPin`, `novoPinRepetir` ou `recuperar`, voltar para `"pin"`.
  - Contar a inatividade também nesses passos. Acrescentar o caso a `testes/fluxo-cifra.js`.

### I2 (importante, não testado): miniatura na tela de recentes
- **Onde:** `android/java/br/semanaasemana/MainActivity.java:38-82`. Não há `FLAG_SECURE` nem `setRecentsScreenshotEnabled(false)`.
- **Cenário:** ela está em Diário > Peso e troca de app. O Android tira a foto da tela para a lista de recentes antes de a página trocar para o portão do PIN, porque `visibilitychange` chega depois da pausa. Quem pega o celular destravado e abre "recentes" vê peso, sintomas ou notas, mesmo com o app bloqueado. É exatamente a pessoa contra quem o PIN foi feito.
- **Não testado:** sem emulador nesta rodada, e o MIUI/HyperOS pode tratar as miniaturas de outro jeito.
- **Correção sugerida:** em `onCreate`, `if (Build.VERSION.SDK_INT >= 33) setRecentsScreenshotEnabled(false);`. O celular dela tem Android 13 (API 33). Esconde só a miniatura e não impede ela de tirar print.
  - Alternativa para todas as versões: `getWindow().addFlags(WindowManager.LayoutParams.FLAG_SECURE)`. Também bloqueia print e gravação de tela, o que atrapalha mandar print para a nutricionista. A escolha é do chefe.
  - Conferir no emulador depois.

### M2 (menor): desbloqueio que termina em segundo plano
- **Onde:** `app/cifra.js:316-321` e `:178-186`. O `await` de `cifDesbloquear` não confere `document.hidden` ao terminar. O bloqueio por segundo plano não faz nada enquanto `cifChave` é nulo.
- **Cenário:** ela digita o PIN certo, toca Entrar e, durante "Conferindo" (cerca de 1 a 2 s no emulador), aperta o botão de início. A conta termina com o app em segundo plano e os dados abertos. Ao voltar, não há pedido de PIN. Fica assim até a conferência de inatividade, em até 5 minutos.
- **Confirmado** no navegador: depois de voltar, portão ausente e chave em memória.
- O mesmo vale para `cifConfirmar` (criação) e `cifNovoPinRepetir`.
- **Correção sugerida:** depois de cada `await` que abre os dados, `if (document.hidden) cifBloquear();`. Ou guardar um sinal "foi para segundo plano durante a conta" e descartar o resultado.

### M5 (menor): código de recuperação na tela depois de voltar
- **Onde:** `app/cifra.js:255-261`, mesma causa do I1.
- **Cenário:** na criação, o código aparece, ela troca de app e a tela continua mostrando o código. Os dados ainda estão em texto nessa hora, então o dano é pequeno. Mas quem vir o código pode usá-lo depois da criação.
- **Correção:** a mesma do I1. Ao voltar de segundo plano nesse passo, recomeçar a criação, ou cobrir o código com um botão "Mostrar código".

### M6 (menor): chave extraível na memória
- **Onde:** `app/cifra.js:101`. `generateKey(..., true, ...)` deixa a chave extraível durante a sessão em que o PIN foi criado. Em `:192`, a chave recuperada também é extraível e é ela que fica aberta depois de `cifPinNovoDepoisDeRecuperar`.
- **Cenário:** só importa se algum script estranho rodar na página, o que a CSP impede. No desbloqueio normal, a chave já é não extraível.
- **Correção:** depois de embrulhar, reimportar a chave como não extraível antes de `cifAbrir`. Mudança pequena, sem urgência.

## 4. Exportação e restauração

Conferido e sem achado:
- `segLerCopia` faz `JSON.parse` dentro de `try`, recusa versão desconhecida, confere o SHA-256 e passa tudo por `migrar()`.
- `migrar()` valida datas, números de dose e peso e limpa `id` para `[A-Za-z0-9_-]`. Por isso `data-id` não quebra atributo.
- Campos com HTML são inofensivos na tela (seção 2).
- Sem perfil, a cópia com código restaura sem perguntar. Com perfil, pede confirmação.
- O código SHA-256 não protege contra edição de propósito, como já dito no `LEIAME.md`.

### M3 (menor): cópia editada quebra telas e guarda lixo
- **Onde:**
  - `app/sintomas.js:13`: `NIVEIS_ENJOO[s.enjoo || 0].toLowerCase()` quebra com `enjoo` fora de 0 a 3.
  - `app/treino.js:13,19`: `T[local][tipo]` quebra com `ui.local` diferente de `casa`/`academia`.
  - `app/nucleo.js:73`: os registros de sintomas e treinos mantêm qualquer campo, sem conferir tipo.
  - `app/nucleo.js:58`: `Object.assign(vazio(), j)` guarda chaves desconhecidas no topo, e uma chave `__proto__` troca o protótipo do objeto. O efeito é só em memória, não testado em detalhe.
- **Cenário:** alguém manda para ela um "backup" editado, ou ela cola um texto de outro app. Com `enjoo: 5`, Diário > Sintomas fica sem desenhar. Com `ui.local: "x"`, Treino fica sem desenhar. Hoje e as outras telas funcionam. Visto no teste próprio, com erro no console.
- **Correção sugerida:** em `migrar()`, limitar `enjoo` a 0-3 inteiro, `intestino` à lista `INTESTINOS`, `ui.local` a `casa`/`academia` e textos livres (`nota`, `obs`, `local`) a string com tamanho máximo. Guardar só as chaves conhecidas do topo (as de `vazio()`).

### M4 (menor): tamanho e aninhamento do texto colado
- **Onde:** `app/seguranca.js:80-93` (sem limite antes de `JSON.parse`; `JSON.stringify(j.dados)` na linha 85), `app/aparelho.js:59-68` (a promessa de `importar` não tem `catch`).
- **Cenários:**
  1. Texto com 200 mil colchetes aninhados: o `JSON.parse` aceita, mas `JSON.stringify` estoura a pilha ("Maximum call stack size exceeded", medido no Node, que usa o mesmo motor V8 do Chromium). Nada acontece na tela, sem mensagem.
  2. No formato antigo, sem envelope, um campo desconhecido muito aninhado passa por `migrar`. Depois de "Restaurar", `E` é trocado e cada `salvar()` lança erro antes de acender a faixa "Não foi possível salvar". O que ela registrar até fechar ou bloquear o app se perde em silêncio. Os dados gravados antes continuam intactos (não testado na tela, deduzido do código: `nucleo.js:113-115`).
  3. Texto gigante (megabytes): passa do limite do `localStorage` (cerca de 5 MB) ao gravar cifrado. Aparece a faixa de erro e nada se perde, mas a tela já mostra os dados novos até bloquear.
- **Correção sugerida:** recusar texto acima de 1 milhão de caracteres antes do `JSON.parse` (a exportação já para em 250 mil no Android). Pôr `.catch` em `importar` com a mensagem "Texto inválido". Com o M3, guardar só as chaves conhecidas.

### M1 (menor): APK da pasta principal desatualizado
- `~/semana-a-semana/semana-a-semana.apk` foi gerado às 22:46. Os commits 68378d0, 593e50f e cb9f833 vieram às 23:06 e 23:10. Diferem `aparelho.js`, `estilo-hoje.css`, `guia.js`, `hoje.js` e `inicio.js`. O manifesto é o mesmo.
- **Correção:** compilar de novo com a chave verdadeira logo antes de entregar (já é a primeira pendência do `LEIAME.md`).

## O que não foi feito

- Nada foi instalado nem testado em celular ou emulador. I2 é dedução, não observação.
- Não revisei `sw.js`/`pwa.js` a fundo, porque a versão web não vai ser publicada. Não revisei o conteúdo da chave `escala`, que é de outro agente.
- Os testes próprios (`fuzz.js`, `fuzz2.js`, `recup.js`) ficaram numa pasta temporária, fora do repositório. Viram teste do projeto só se quem corrigir quiser.
- Rodei `testes/fluxo-seguranca.js` e `testes/fluxo-cifra.js`: os dois verdes. Não rodei a suíte inteira, porque não mudei código.
- Ninguém de fora revisou a cifra.
