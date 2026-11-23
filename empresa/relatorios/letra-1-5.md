# Letra 1,5 a 440 px: passada em todas as telas

**Conclusão:** com a letra do sistema em 1,5, a 440 px (largura do celular dela), claro e escuro, nada sai da largura, nada se sobrepõe e todos os alvos de toque têm 44 px ou mais. Havia um defeito, em dois lugares: o botão ao lado de um texto (Fechar no topo das folhas, "ver" no aviso de ritmo de perda em Hoje) era espremido e o rótulo vazava para fora do botão. Corrigido com uma linha de CSS. A passada com letra 1,5 entrou no teste de ponta a ponta (`testes/fluxo-letra-15.js`, 182 verificações, todas verdes).

Teste feito no navegador sem janela, não no celular nem no emulador. A simulação é o pior caso (ver "Método"), mas não é o textZoom de verdade.

## Método

No APK, a casca aplica o tamanho de letra do Android como `textZoom` da WebView (commit 1077e30). O textZoom aumenta também a letra definida em px, e quase todo o CSS do app está em px. Por isso só pôr `font-size: 150%` no `html` não basta: aumentaria apenas Painel e Semana, que usam rem.

A simulação (`letraDoSistema` em `testes/apoio.js`, ativada com `abrir({ letra: 1.5 })`):
- multiplica por 1,5 todo `font-size` e `line-height` em px das folhas de estilo já carregadas (pelo CSSOM, sem `<style>` injetado, que a CSP proíbe);
- põe 150% no `font-size` do `html` (o que está em rem cresce junto);
- multiplica os `font-size` em px dos atributos `style` que o app desenhar (observador de mudanças no DOM);
- o `body` usa `font: 17px/1.45 var(--fonte)`; com `var()` no atalho, o CSSOM não mostra o tamanho, então ele vai no atributo `style` do body (25,5 px);
- texto de gráfico SVG em px fica igual.

Para ler as regras das folhas por `file://`, o navegador do teste abre com `--allow-file-access-from-files` (só quando a letra é simulada). O teste confere que a simulação pegou: corpo com 25,5 px e título do topo com 30 px.

É o pior caso: o textZoom real pode deixar algum texto menor que isso (o Chromium pode não aumentar blocos curtos), nunca maior.

## O que o teste confere em cada tela

1. Sem rolagem de lado.
2. Nada sai da tela nem do cartão.
3. Nada corta texto (caixa com conteúdo maior que ela, sem rolagem própria).
4. Filhos lado a lado em linhas e grades (flex e grid) não se sobrepõem.
5. Alvos de toque com 44 px ou mais.
6. A barra de baixo, que cresce com a letra, não cobre o fim da tela.

Telas percorridas, cada uma em claro e em escuro:
- primeiro uso (entrada e formulário, com a pergunta da cirurgia aberta);
- PIN (criar, código de recuperação, conferir o código, entrar);
- Hoje rolada inteira, e Hoje com a faixa "O app ganhou três perguntas";
- Semana, Painel (30 dias, tabela aberta), Comer > Plano e Caminhos, Mover, Guia (sanfona aberta), Perfil;
- Diário: Aplicações, Peso, Sintomas e Relatório;
- folhas: Dor na barriga, Ritmo de perda, Alimentos de que não gosta, Trocar PIN;
- diálogo: Apagar todos os dados.

## Defeito encontrado e correção

| Onde | Antes | Depois |
|---|---|---|
| Topo de toda folha (título + Fechar) | Fechar espremido para 74 a 83 px, com o rótulo vazando da borda ([antes](capturas/letra15-antes-folha-fechar-espremido.png), [antes, dor](capturas/letra15-antes-folha-dor.png)) | Botão inteiro; o título quebra linha ([depois](capturas/letra15-depois-folha-fechar.png), [depois, dor](capturas/letra15-depois-folha-dor.png)) |
| Hoje, aviso de ritmo de perda | "ver" com 42 px de largura, o texto vazava ([antes](capturas/letra15-antes-hoje-ritmo-ver.png)) | Botão com a largura do texto ([depois](capturas/letra15-depois-hoje-ritmo-ver.png)) |

Correção: em `app/estilo.css`, `.linha > button { flex-shrink: 0; }`. Toda `.linha` com botão do app é "texto + botão": topo das folhas, ritmo de perda, Refeições de hoje + Dia de enjoo, Treino A/B + Concluí hoje. Agora quem quebra linha é o texto. Em letra 1,0 nada muda: o botão já cabia.

## Telas sem defeito (amostra das capturas)

[Hoje: refeições](capturas/letra15-hoje-refeicoes.png) · [Hoje: atalhos, escuro](capturas/letra15-hoje-atalhos-escuro.png) · [Painel](capturas/letra15-painel.png) · [Semana, escuro](capturas/letra15-semana-escuro.png) · [Primeiro uso](capturas/letra15-primeiro-uso.png) · [PIN, código, escuro](capturas/letra15-pin-codigo-escuro.png) · [Diário > Aplicações](capturas/letra15-diario-aplicacoes.png) · [Mover](capturas/letra15-mover.png) · [Diálogo, escuro](capturas/letra15-dialogo-escuro.png)

Todas as telas da lista, nos dois temas, saem com `CAPTURAS=/pasta node testes/fluxo-letra-15.js` (nomes `letra15-*`).

## O que ficou de fora ou pendente

- **Não testado no celular nem no emulador.** O textZoom real do Android não foi medido em 1,5. Falta conferir no Redmi Note 13 Pro com a letra no máximo.
- **Faixa de dias do Plano e sub-abas do Diário:** outro agente cuida delas; não mexi. Em 1,5, as sub-abas do Diário rolam de lado e "Relatório" aparece cortado na borda até rolar ([captura](capturas/letra15-diario-aplicacoes.png)). O teste não acusa o que tem rolagem própria de lado.
- **Cosmético, sem corte:** em Mover, as repetições ao lado do nome do exercício quebram em duas linhas ("2 × 10 a / 12", [captura](capturas/letra15-mover.png)). Dá para ler, então não mexi.
- Em Hoje, os botões "comi tudo" e "um pouco" quebram em duas linhas; cabem e têm mais de 44 px.
- Sobreposição só é conferida entre irmãos de linhas e grades. Elemento com posição absoluta ou fixa (barra de baixo, aviso) não entra nessa conta.
