# Guia do engenheiro (primeira onda)

Leia antes `empresa/BRIEFING.md` inteiro. As regras de lá valem todas. Este guia diz como a engenharia trabalha.

## Onde você trabalha

- Você está numa cópia separada do projeto (worktree do git), num ramo só seu. Confira com `git rev-parse --show-toplevel` e `git branch --show-current` e trabalhe só nessa pasta. Não mexa na pasta principal `~/semana-a-semana`, com duas exceções, sempre por caminho absoluto:
  - diário de bordo: `echo "- $(date +%d/%m\ %H:%M) [seu cargo] ..." >> ~/semana-a-semana/empresa/diario-de-bordo.md` (ao começar e ao terminar cada item; escreva para um leigo entender);
  - capturas de tela pedidas no seu briefing: `~/semana-a-semana/empresa/relatorios/capturas/`.
- Não edite `empresa/diario-de-bordo.md` nem `empresa/decisoes.md` dentro da sua cópia.
- Edite só os arquivos listados no seu briefing. Se precisar de mudança em arquivo de outra pessoa (inclusive `app/nucleo.js`, `app/inicio.js`, `app/index.html`, `app/estilo.css`, `testes/apoio.js`, que são do chefe), não mexa: descreva no relatório final o que precisa e por quê.
- Commits pequenos no seu ramo, um assunto por commit, mensagem em português dizendo o porquê, sem `Co-Authored-By` e sem citar ferramentas de IA. Só com `bash testar.sh` verde. Use `git add` com os nomes dos arquivos (nunca `git add -A`). Não faça merge, rebase, push nem troque de ramo: quem junta em main é o chefe, depois de revisar o diff.

## Como o app é montado

JavaScript puro, sem módulos: os arquivos de `app/` são carregados em ordem por `index.html` e dividem o mesmo escopo global. Leia `app/nucleo.js` inteiro (formato dos dados no topo) e os arquivos da sua área.

- `nucleo.js`: constantes, estado `E` (gravado com `salvar()`), `migrar()`, utilidades de data e número (`hoje()`, `mais()`, `entre()`, `br()`, `num()`, `fmt()`, `esc()`), `dia(data)`/`gravarDia(data, r)`, `barra()`, `aviso()`, `compartilhar()`, e os registros `AC` (clique em `data-ac="nome"`, recebe o `dataset`), `FORM` (envio de `<form data-form="nome">`, recebe objeto com os campos) e `MUD` (mudança em campo com `data-mud="nome"`, recebe o elemento).
- `inicio.js`: `render()` redesenha a tela atual; `abrirFolha(titulo, html)` / `fecharFolha()` mostram um painel que sobe de baixo, para escolher coisas.
- Cada tela é uma função que devolve HTML em texto. Todo texto que vem de dado digitado passa por `esc()`.
- Nenhum arquivo toca em `document`, `window.Android` ou `localStorage` fora de função: as contas têm de carregar em Node (`testes/carregar-app.js`).
- O formato dos dados é o do comentário no topo de `nucleo.js`. Você pode detalhar os campos da sua área dentro do que está lá. Se precisar de campo novo fora disso, escolha um nome, trate a ausência dele no código (dado antigo não tem o campo) e avise no relatório.
- O aparelho de teste tem WebView 113 (Chrome de 2023): nada de sintaxe ou CSS mais novo que 2022 (sem `:has()` fora de uso seguro, sem aninhamento de CSS, sem `structuredClone` novo, sem `Array.prototype.findLast`/`toSorted`, sem `Object.groupBy`).

## Qualidade

- Ela usa sozinha, no celular, às vezes enjoada: tela simples, poucos toques, texto curto, sem culpa. Português do Brasil.
- Alvo de toque de pelo menos 44 px; funcionar em 320 px de largura sem rolagem horizontal; modo escuro (use só as variáveis de cor de `estilo.css`, nunca cor fixa).
- CSS novo vai no arquivo de estilo da sua área (`app/estilo-*.css` indicado no briefing). Prefira as classes que já existem em `estilo.css`.
- Sem biblioteca externa, sem internet.
- Saúde: não invente conteúdo. Se a tarefa pedir texto de saúde que não está no guia (`app/conteudo.js`), escreva o mínimo, anote a fonte num comentário ao lado e liste o texto, palavra por palavra, no relatório final. O app não prescreve nem interpreta: decisão é do médico ou nutricionista.

## Testes

- `bash testar.sh` roda tudo (sintaxe, unidade, ponta a ponta). Tem de estar verde antes de cada commit e na entrega.
- Ponta a ponta: `testes/fluxo-<área>.js`, usando `testes/apoio.js` (`abrir({ estado, aba, largura, escuro })`, `estadoBase(extra)`, `d(n)` = data de n dias atrás, `t.ler()`, `t.semRolagem(nome)`, `t.alvosDeToque(nome)`, `t.foto(nome)`, `t.fechar()`). Roda sozinho: `node testes/fluxo-hoje.js`. Para ver as telas: `CAPTURAS=/pasta node testes/fluxo-hoje.js` grava os PNG dos pontos com `t.foto()`; abra-os para conferir o visual. Guarde capturas fora do projeto (pasta temporária).
- Toda funcionalidade nova ganha verificação de ponta a ponta, incluindo uma passada em 320 px (`largura: 320`) com `semRolagem` e `alvosDeToque`, e uma abertura em modo escuro sem erro.
- Toda conta nova ganha teste de unidade em `testes/unidade/<área>.js` (`node:test` + `require("../carregar-app")(estado)`; veja `testes/unidade/nucleo.js`).

## Entrega

Sua resposta final é o relatório para o chefe, começando pela conclusão:
1. ramo e pasta da sua cópia, lista de commits (`git log --oneline main..HEAD`);
2. o que entrou, item por item, e como usar;
3. o que ficou de fora ou pela metade, e por quê;
4. o que não foi testado;
5. textos de saúde novos, palavra por palavra, com a fonte;
6. decisões que você tomou (o chefe registra);
7. o que precisa mudar em arquivos que não são seus.
Reporte fielmente: o chefe roda os testes e lê o diff antes de aceitar.
