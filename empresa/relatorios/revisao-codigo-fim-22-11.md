# Revisão de código: correções do teste final do APK (22/11 à noite)

Revisor de código sênior. Escopo: `git log 281b1d4..cb9f833` (7 commits de código e 1 de relatório) e
`git diff 281b1d4..HEAD -- app android testes`. Não mudei código do app. Não usei o emulador. Provei os achados de lógica com um
script próprio em pasta temporária (carrega o app em Node com `testes/carregar-app.js`); a saída está resumida em cada item.

## Conclusão

Não achei nada que barre a entrega. As 7 correções fazem o que prometem no caminho principal, e `bash testar.sh` termina verde
(resultado na última seção). Há **3 achados importantes** e uma lista de menores:

1. **I-1. Depois de tocar em "Dor na barriga", os botões "Bem" e "Dor na barriga" ficam acesos ao mesmo tempo** (`app/hoje.js:93`).
   É um defeito novo, criado pelo commit 40a301c. O teste de ponta a ponta não pega porque, nessa hora, o enjoo forte já está marcado.
2. **I-2. Um toque em "Bem" apaga a dor forte registrada de propósito, sem perguntar** (`app/hoje.js:264`). O defeito já existia antes
   desta rodada. Agora pesa mais: "Foi dor forte: registrar assim" é um registro feito de propósito para o médico, e um toque em "Bem"
   à tarde tira a data do relatório.
3. **I-3. A dor que fica só como anotação não aparece no resumo do relatório nem na Semana.** Só aparece como texto solto no fim do
   bloco de sintomas. Isso segue a decisão do I3 e precisa de decisão da chefia, por causa da vesícula.

Fica também uma afirmação sem prova. O commit 1077e30 diz que mudar a **densidade** não recarrega mais o app, mas só a letra foi
conferida no emulador. Pela regra do Android, faltam `smallestScreenSize|screenLayout` no manifesto para isso valer (item m-1).

## Achados

### Importantes

**I-1. "Bem" e "Dor na barriga" acesos juntos.** `app/hoje.js:93` (`comoAtivo`).
- Cenário: hoje sem registro de sintoma. Ela toca em "Dor na barriga". O registro novo fica com `enjoo: 0, dor: false,
  nota: "Dor na barriga."`. Para "Bem", `comoAtivo` olha `!s.enjoo && !s.dor && !s.vomito && !semFome` e não olha `NOTA_DOR`.
  Por isso os dois botões ficam com `.ativa` e `aria-pressed="true"`. O leitor de tela diz "Bem, pressionado".
- Prova (script): `bem ativo: true  dor ativo: true` logo depois de `AC.como({k:"dor"})` num dia vazio.
- Por que o teste não pegou: em `testes/fluxo-hoje.js:190`, "Dor" é tocado depois de "Enjoo forte" e "Sem fome", e aí "Bem" já
  estava apagado por outro motivo. Nenhum teste confere o estado de "Bem" depois da dor.
- Gravidade: importante. A tela mostra um estado contraditório no cartão que ela usa todo dia.
- Correção: no ramo `bem`, acrescentar `&& String(s.nota || "").indexOf(NOTA_DOR) < 0`. No teste: começar de um dia vazio, tocar em
  "Dor" e conferir que `[data-k=bem].ativa` conta 0.

**I-2. "Bem" apaga a dor forte sem confirmação.** `app/hoje.js:264`.
- Cenário: de manhã ela tem dor e toca em "Foi dor forte: registrar assim" (ou marca no Diário). À tarde melhora e toca em "Bem".
  `s.dor = false`, e a data some de "Dor forte na barriga registrada em:" no topo do relatório (`relDorForte`, `app/sintomas.js:83`),
  da contagem e da Semana. Não aparece aviso nem confirmação, e não dá para desfazer.
- Já acontecia antes desta rodada, então não é regressão. Entra aqui porque o I3 transformou a dor forte em registro feito de
  propósito, e "Bem limpando" estava no escopo pedido.
- Gravidade: importante. A data da crise é o que o médico pergunta primeiro (comentário de `relDorForte`).
- Opções, para a chefia escolher: (a) "Bem" não mexe em `s.dor` e limpa só enjoo, sem fome e a anotação de dor; (b) com `s.dor`
  marcado, "Bem" pergunta antes ("Tirar a dor forte registrada hoje?"); (c) "Bem" grava "Melhorou." na anotação e mantém a dor.
  Nos três casos, `testes/fluxo-hoje.js:201` deixa de esperar `!ss[0].dor` depois da dor forte.

**I-3. Dor anotada (não forte) fica fora do resumo.** `app/sintomas.js:71` (`relSintomas`), `app/sintomas.js:83` (`relDorForte`),
`app/semana.js:137-140`.
- Cenário: ela toca em "Dor na barriga" e não marca como forte. O relatório diz no topo "Dor forte na barriga: nenhum registro no
  período". No bloco de sintomas aparece "Dor forte na barriga: 0" e, no fim, a linha solta "22/11/2026: Dor na barriga.". Na Semana
  aparece "nenhum sintoma marcado". O Diário mostra "Enjoo nenhum, intestino normal" e a anotação embaixo.
- Prova (script, item 5): `relDorForte` → "nenhum registro no período"; `relSintomas` só tem a linha da anotação.
- Não é defeito de código: é o que o I3 decidiu ("grava só a anotação"). O risco é de produto. Ela tem pedra na vesícula, e dias de
  dor que não foi forte também interessam ao médico, mas hoje só aparecem como texto livre, contado por ninguém.
- Gravidade: importante. Precisa de decisão da chefia.
- Opção: contar no relatório e na Semana "Dor na barriga (sem marcar como forte): N dias", pela presença de `NOTA_DOR` na anotação,
  sem misturar com as datas de dor forte.

### Menores

**m-1. Densidade: a correção provavelmente não basta.** `android/AndroidManifest.xml:9`.
- Mudar "Tamanho da exibição" no Android muda a densidade e também `smallestScreenWidthDp` e, muitas vezes, `screenLayout`. A Activity
  é recriada quando qualquer mudança não está em `configChanges`. Com só `density` na lista, ela continua sendo recriada (a página
  recarrega e o PIN volta).
- O próprio commit diz que só conferiu a letra de 1,0 para 1,3. Não testei: a regra desta rodada proíbe o emulador. É uma conclusão
  pela leitura da documentação, **não comprovada**.
- Gravidade: menor (o M8 já era menor e a situação é rara). Mas o título do commit afirma mais do que foi verificado.
- Correção: `...|fontScale|density|smallestScreenSize|screenLayout`, e conferir no emulador em Configurações > Tela > Tamanho da exibição.

**m-2. O texto de "Bem" e da anotação procura uma frase dentro do texto livre.** `app/hoje.js:93`, `app/hoje.js:262`, `app/hoje.js:268`.
- Cenário: no Diário ela escreve a anotação "Dor na barriga. Passou depois do almoço.". Em Hoje, "Dor na barriga" acende. Um toque em
  "Bem" corta a frase dela, e sobra "Passou depois do almoço.".
- Prova (script, item 3). Também: `replace` + `trim` deixa espaço duplo no meio ("Acordei mal.  Melhorou.", item 2b). A anotação
  "Sem fome." já se comportava assim antes.
- Gravidade: menor (raro, e a perda é de texto, não de registro).
- Correção: guardar a marca num campo próprio (`s.dorLeve: true`) em vez de procurar a frase na anotação. Se continuar no texto,
  trocar `/\s{2,}/g` por um espaço depois do `replace`.

**m-3. Anotação e dor forte juntas pelo Diário.** Cenário: ela toca em "Dor na barriga" em Hoje e depois corrige o mesmo registro no
Diário, marcando "Dor forte na barriga". O registro fica com `dor: true` e com a anotação "Dor na barriga.". O relatório conta 1 dor
forte e repete "22/11/2026: Dor na barriga." (script, item 4). Não chega a contradizer, mas duplica. Gravidade: menor. Correção: em
`FORM.sintoma` (`app/sintomas.js:50`), com `dor` marcado, tirar `NOTA_DOR` da anotação, como o `dorForte` de Hoje já faz.

**m-4. O Painel diz uma coisa e a Hoje diz outra sobre o mesmo corte de 800 kcal.** `app/planonutri.js:146`. A nota do Painel diz
"800 kcal é o ponto em que o app sugere conversar com a sua nutricionista". Com o mesmo `KCAL_POUCO`, a Hoje mostra o cartão
"Assunto para o médico" (`app/hoje.js:40`), e o comentário em `consumo.js:22` também diz médico. Gravidade: menor. Correção: alinhar
os dois textos ("médico ou nutricionista" nos dois, por exemplo).

**m-5. A legenda do Painel chama a faixa de calorias de "faixa de proteína".** `app/painel.js:114`. Com o plano dela, o gráfico de
calorias ganhou a banda da faixa (classe `faixa`), mas a legenda única continua "faixa de proteína". Gravidade: menor. Correção:
"faixa do plano", ou uma legenda por gráfico.

**m-6. A meta de calorias do médico deixa de valer no Painel com o plano ligado.** `app/planonutri.js:145`. Com `metaKcal` no perfil
(por exemplo 1.000) e o plano ligado, que agora é o padrão, o corte é 800 e o anel usa 1.009 (script, item 7). O teste "meta do médico
abaixo de 1.200 vira o corte" (`testes/unidade/painel.js:76`) passou a desligar o plano para continuar verde, e por isso não cobre o
caso padrão. Pode ser a decisão certa (o plano da nutricionista manda), mas não está escrita em `decisoes.md`. Gravidade: menor.

**m-7. O Painel compara todos os dias com a faixa do plano dela, inclusive os que não foram no plano.** `app/painel.js:99`.
`alvoEnergia` olha o interruptor de hoje (`pnEmUso`). Os dias de enjoo (cardápio leve do app) e os dias marcados no cardápio do app
entram no gráfico e no "Abaixo de 800" comparados com a faixa dela. Desligar o interruptor muda a comparação de todo o histórico.
Gravidade: menor (só muda a referência, não os números). Registro para quem mexer depois.

**m-8. O teste de rolagem do Guia aceita a seção escondida sob o cabeçalho.** `testes/fluxo-vesicula-figado.js:53` confere
`r.top >= 0 && r.top < innerHeight / 2`. Se a conta de `rolarPara` esquecesse de descontar o cabeçalho fixo, o título ficaria
coberto e o teste passaria do mesmo jeito. Gravidade: menor. Correção: `r.top >= document.getElementById("topo").offsetHeight`.
Também: `rolarPara` desconta só `#topo`. Quando a faixa `#erro-salvar` (também presa no topo) está visível, o título fica sob ela
(raro).

**m-9. O teste não passa por "Bem" depois da anotação de dor.** `testes/fluxo-hoje.js:190-201`. A sequência marca a dor forte antes de
tocar em "Bem", e o `dorForte` já tira a anotação. Por isso o `tirarDor()` do ramo "Bem" nunca é exercitado, e o I-1 não aparece.
Gravidade: menor (lacuna de teste). Correção: um passo com dia vazio → "Dor" → conferir "Bem" apagado → "Bem" → conferir anotação
limpa.

**m-10. Comentário desatualizado.** `app/hoje.js:212` ainda diz "A já marcada encolhe (classe feita)". Depois de cb9f833 ela não encolhe
mais. Gravidade: menor.

**m-11. "Apagar tudo" não zera `diaSel`.** `app/aparelho.js:69`. Ficou fora da correção do M7. Depois de apagar tudo e refazer o
perfil, a Hoje pode abrir no dia passado que estava aberto. Gravidade: menor (raro). Correção: `diaSel = null` também ali.

**m-12. Enter num campo obrigatório vazio não faz nada.** `app/inicio.js:133-134`. Com a correção do M5, se o campo vazio é o próprio
campo em foco (por exemplo, Enter no Peso vazio do Diário), o foco fica onde está e nenhum aviso aparece. Para ela, parece que o botão
do teclado não respondeu. Gravidade: menor. Correção: mostrar o aviso quando `c === document.activeElement`.

## O que conferi e está certo

- **I1, calorias:** `alvoEnergia` é usada no anel, no gráfico, no "Abaixo de X", na nota e no relatório. No modo discreto, nada de
  calorias aparece no Painel nem no relatório (script, item 8). Sem o plano, os valores são os mesmos de antes. Sem perfil,
  `alvoEnergia()` quebra (`m` null), mas o código anterior também quebrava em `m.kcal`, e o Painel não abre sem perfil.
- **I3, folha de dor:** os três estados de `htmlSinaisDor` (`"leve"`, `true` e data) dão textos e botões coerentes. "Foi dor forte"
  só aparece quando a dor ainda é anotação. A dor forte vinda do Diário com outra data continua dizendo "Registrado em ...". Com
  `s.dor` já marcado, tocar em "Dor" não duplica a anotação (script, item 5b).
- **fontScale:** `setTextZoom` no `onCreate` repete o que a WebView já faz por padrão. No `onConfigurationChanged`, ele reaplica a letra.
  Está certo (e foi conferido no emulador por quem fez o commit).
- **rolarPara:** é consumido no primeiro desenho. `sinaisGuia` fecha a folha antes de marcar, e o desenho seguinte é o do `hashchange`.
  Não achei desenho no meio que roube a marca.
- **Restaurar:** `diaSel = null` antes de `irPara("hoje")`. As edições pendentes (`sintomaEmEdicao` etc.) já se anulam quando o id não
  existe mais.
- **Refeição marcada:** com o seletor visível, `MUD.pnOpcao` troca a foto da porção e mantém a fração marcada. Era o comportamento
  esperado.
- **"alvo do dia":** `blocoProteina` só recebe "hoje" ou "no dia".
- **Dados antigos:** os registros feitos antes de 40a301c pelo botão "Dor na barriga" continuam como dor forte, e não dá para separá-los.
  Isso afeta só os dados de teste. Ela ainda não usa o app.

## Testes

`bash testar.sh` no worktree (commit cb9f833): **TUDO VERDE** (sintaxe, unidade e ponta a ponta). Os testes verdes não cobrem o I-1 nem o m-1 (ver m-8 e m-9).

Script da prova: `prova.js`, na pasta temporária da sessão, fora do repositório. Ele roda só leituras e chamadas a `AC.como` e
`FORM.sintoma` sobre estados montados em memória.
