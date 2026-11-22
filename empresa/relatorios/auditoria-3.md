# Auditoria 3: onda 2 (main em d676cf2)

22/11/2026. Auditoria independente, para a direção. Só leitura: nada foi editado em `app/`, `testes/`, `dados/` ou `android/`, nada foi juntado, o emulador não foi usado. Trabalhei numa cópia separada (worktree em /tmp, já removida). Escopo: o que entrou desde a74bc53 (perfil com vesícula, fígado e cirurgia; migração; aviso de ritmo; painel; visão semanal; escala nova e regras de gordura; caminhos; PWA). Os PDFs pessoais da raiz não foram abertos.

## Conclusão

**Como está em main, não recomendo entregar a onda 2.** Dois pontos barram:

1. **A meta de proteína que o médico ou a nutricionista passou não é seguida pelo cardápio.** Com meta informada de 80 g, o cardápio entrega 120 g (149%) e não avisa nada. O Perfil promete o contrário: "Se preencher, elas substituem o cálculo do app". Isso vai contra a regra 9 do briefing: a decisão clínica é do médico ou da nutricionista. O defeito é anterior à onda 2 (commit 3cea30b, conserto da auditoria 2), mas fica mais grave agora, porque ela tem nutricionista e tende a digitar as metas dela. O conserto é de uma linha.
2. **O painel e a visão semanal existem, mas ela não tem como chegar neles.** Nenhum botão ou link leva a `#painel` ou `#semana`. No APK (WebView sem barra de endereço), as duas telas pedidas pelo dono ficam invisíveis. A equipe sabe disso (diário, 16:48 e 16:51: "o botão entra com o visual novo"). Só barra se a entrega de segunda for anunciada com essas telas. Na mesma situação estão os caminhos de alimentação (só dados, sem tela) e a decisão de 22/11 de usar o plano da nutricionista como cardápio (nada disso está no código).

O resto não barra, mas sete pontos são importantes. Os que mais pesam: o cardápio vegetariano quebra todas as regras de vesícula, e a frase do Plano diz que não quebra. A visão semanal reescreve o passado quando ela troca o dia da aplicação. Um dia com só "+10 g de proteína" aparece no painel como dia de 0 kcal, com sugestão de levar ao médico. As marcas de 5, 7 e 10% do fígado dependem de um "peso inicial" editável e sem data. E uma atualização da versão web que falhe num único arquivo deixa a tela em branco.

O que está certo e foi conferido:
- A migração não perde nenhum campo.
- Não há nomes globais repetidos.
- O modo discreto esconde calorias e peso em todas as telas novas, com um deslize de texto (menor 1).
- O aviso de ritmo aparece no modo discreto para quem tem pedra na vesícula.
- No perfil parecido com o dela, a escala respeita a gordura por refeição e o teto de 500 kcal.
- Os testes estão verdes (`bash testar.sh`: TUDO VERDE em d676cf2).

## O que barra

### B1. Meta de proteína informada é ignorada pelo cardápio
- **Onde:** `app/nutricao.js:213` (`teto = Math.max(prot * 1.03, protTeto || 0)`) e `app/nutricao.js:296` (sempre passa `1,6 × peso de referência` como teto, com ou sem meta informada). A promessa está em `app/perfil.js:141`.
- **Reprodução** (Node, `testes/carregar-app.js`; perfil [dados pessoais removidos], sedentária, metaKcal 1500):

  | Meta de proteína informada | Cardápio entrega | Aviso no Plano |
  |---|---|---|
  | 80 g | 120 g (149%) | nenhum (`escalaNoLimite` falso) |
  | 90 g | 120 g (133%) | nenhum |
  | 130 g | 132 g (102%) | nenhum |

  A tela Plano mostra "Proteína 80 g" nas metas e cardápios diários com 110 a 129 g.
- **Causa:** o conserto da auditoria 2 (proteína pode passar da meta até 1,6 g/kg para a energia chegar à meta) vale também quando a meta veio do médico.
- **Conserto possível:** passar `protTeto` só quando `!p.metaProt`. Depois rodar os testes de escala de novo e acrescentar um caso com meta informada baixa.

### B2. Painel e visão semanal sem caminho na interface
- **Onde:** `app/inicio.js:6` (`TELAS` sem painel e semana); `app/painel.js:124-127` e `app/semana.js:189-194` registram as telas sem botão; nada em `app/index.html` nem em `app/hoje.js` aponta para elas.
- **Reprodução:** abrir o app e procurar um toque que leve ao painel ou à semana. Não existe. Só digitando `#painel` na barra do navegador.
- **Junto:** `app/caminhos.js` não tem tela. A decisão de 22/11 ("o app passa a seguir o plano da nutricionista") não tem código. `empresa/ENTREGA-primeiros-passos.md` não fala de painel, semana, vesícula nem fígado.

## Importantes

### I1. Vegetariana: o cardápio quebra as regras da vesícula, e a frase do Plano diz o contrário
- **Onde:** a troca em `app/nutricao.js:68` (`TETO_TROCA` = 250 g) junto com `fatorDaRefeicao` (`app/nutricao.js:164-183`), que só encolhe gordura e energia, nunca a proteína. A frase está em `app/plano.js:7-8`. O teste não cobre esse caso: `testes/unidade/regras-cardapio.js:13-15` só tem lactose, peixe e ovo.
- **Reprodução:** `node dados/conferir_cardapio.js --perfil sexo=F,altura=158,peso=120,idade=45,atividade=1.2,naoCome=vegetariana` sai com erro e lista 23 problemas:
  - 4 almoços de 537 a 614 kcal (teto de 500);
  - almoços com até 27,9 g de gordura (teto de 20);
  - dias com 37 a 40% de gordura (faixa de 25 a 35).

  Exemplo: na terça, o patinho vira 250 g de soja cozida. Mesmo assim o Plano diz "nenhuma refeição passa de cerca de 500 kcal" e "cerca de 15 g de gordura no prato".
- As outras restrições sozinhas, no mesmo perfil, passam: lactose, ovo, peixe, carne vermelha, porco, glúten, peixe com ovo, lactose com glúten. Só sobram 1 ou 2 refeições entre 15 e 15,7 g, que o conferidor chama de "acima do alvo".
- Não sabemos se ela é vegetariana (o briefing diz que o app pergunta).

### I2. A visão semanal reescreve o passado quando muda o dia habitual
- **Onde:** `app/semana.js:53` (o dia habitual é o de hoje, `diaHabitual(ds, E.diaDose, h)`) e `app/semana.js:61-63` (cada aplicação antiga é encaixada por esse dia).
- **Reprodução 1:** seis aplicações às segundas (12/10 a 16/11), depois ela marca a quinta como dia habitual. Resultado:
  - todas as aplicações antigas aparecem "4 dias depois do previsto";
  - a semana 1 mostra duas aplicações;
  - a semana 6 (atual) diz "sem aplicação registrada", embora ela tenha aplicado em 16/11, segunda dessa semana;
  - o padrão diz "Aplicação fora do dia habitual nas semanas 1, 2, 3, 4 e 5".
- **Reprodução 2:** primeira aplicação numa segunda (12/10), depois domingos, com o domingo marcado como habitual. A primeira aplicação da vida dela aparece como "1 dia depois do previsto" e a semana 1 fica com duas aplicações.
- **Conserto possível:** guardar o dia habitual em vigor em cada aplicação, ou só reclassificar dali em diante.

### I3. Dia com só "+10 g de proteína" vira dia de 0 kcal no painel e na semana
- **Onde:** `app/painel.js:20` e `app/painel.js:34` usam `consumoDoDia().registrou`, que é verdadeiro com só `protExtra` (`app/consumo.js:71`). O mesmo vale para a média de energia em `app/semana.js:87`. Já o aviso de comer pouco da tela Hoje usa `refeicoes > 0` (`app/consumo.js:102`): as duas telas contam diferente.
- **Reprodução:** um dia com só `protExtra: 10` dá `mediaKcal` 0 e `abaixoKcal` 1 de 1. A tela mostra "Abaixo de 1.200 kcal: 1 de 1" e "Se isso se repetir, vale levar ao médico ou ao nutricionista".

### I4. Marcas de 5, 7 e 10% do fígado dependem de um "peso inicial" editável e sem data
- **Onde:** `app/perfil.js:45` (`progressoPerda(E.perfil.peso, m.peso)`); o campo editável está em `app/perfil.js:125`.
- **Reprodução:** é o próprio estado do teste `fluxo-peso-sintomas`. Perfil com 95,4 kg e pesagens de 101 kg (20/10) a 95,5 kg (20/11): ela perdeu 5,4% desde a primeira pesagem, mas o cartão mostra perda de 0% e "faltam 4,9 kg" para a marca de 5%.
- Editar o campo muda o progresso em silêncio, para baixo ou para cima, sem aviso. O relatório também usa esse número como "Inicial" (`app/peso.js:203`).
- No caso dela, a bioimpedância de 03/11 dá [peso removido] e o dono informou [peso]. Essa diferença sozinha move a barra 1,3 ponto.

### I5. Versão web: uma atualização com falha num arquivo deixa a tela em branco
- **Onde:** `app/sw.js:6` (nome do cache fixo, `semana-a-semana-v1`) e `app/sw.js:19-24` (cada arquivo é renovado por conta própria; se um falhar, fica o velho).
- **Reprodução:** script `sw-atualizacao.js`. Serve a versão a74bc53, abre, publica a main com `cardapio.js` respondendo 503. Na 2ª e na 3ª abertura aparece `ReferenceError: REGRAS_CARDAPIO is not defined` e a tela fica vazia: o `nutricao.js` é novo e o `cardapio.js` é velho. Sem internet, fica assim até a rede voltar e o arquivo baixar.
- Sem falha, a troca funciona: a 1ª abertura depois de publicar ainda mostra a velha, a 2ª já mostra a nova.
- Não barra porque a versão web não está publicada (decisão de 22/11) e o APK não usa service worker. Barra no dia em que publicarem.
- **Conserto possível:** versão no nome do cache, trocada a cada publicação, e `addAll` atômico na instalação, sem gravar arquivo por arquivo durante o uso.

### I6. Desempenho da escala nova
Medido no Chromium headless com o perfil parecido com o dela e a CPU desacelerada pelo DevTools:

| CPU | `metas()` sem cache | Abertura sem cache | Abertura com cache | Hoje logo depois de registrar peso |
|---|---|---|---|---|
| normal | 0,20 a 0,27 s | 0,36 a 0,44 s | 0,11 a 0,20 s | 0,19 s |
| 4× mais lenta | 0,76 a 0,99 s | 1,45 a 1,83 s | 0,47 a 0,74 s | 0,82 s |
| 10× mais lenta | 2,06 a 2,31 s | 3,8 a 4,1 s | 1,28 a 1,72 s | 1,86 s |

- A conta é refeita sempre que muda a chave de cache. Isso acontece com quase toda pesagem, porque a meta de proteína muda: de 120 para 118,4 kg ela passa de 108 para 107 g. Também acontece a cada alimento marcado como "não gosto".
- Com a CPU 10× mais lenta, o app trava cerca de 2 s depois de registrar o peso, sem nenhum sinal na tela.
- Com 150 dias de registro, as telas novas ficam rápidas: painel 91 ms, painel de 30 dias 156 ms, semana 390 ms.
- Não medi em celular de verdade.

### I7. Quem já usa o app não fica sabendo das perguntas novas
- **Onde:** `app/nucleo.js:59` (a migração deixa vesícula e fígado sem resposta) e `app/perfil.js:128` (o bloco Saúde fica fechado e marcado como "opcional").
- Sem resposta, nada da onda 2 aparece: nem o cartão da vesícula, nem o do fígado, nem os sinais de crise em Hoje, nem o aviso de ritmo no modo discreto.
- O APK v2 já pode estar no celular dela (decisões de 22/11). Nada na tela Hoje pede que ela responda, e os guias de entrega não falam disso.

## Menores

1. **Modo discreto mostra "500 kcal".** A frase da escala no Plano não tem a condição do modo discreto (`app/plano.js:8`). Conferido no navegador com o modo discreto ligado.
2. **"faltam 0,0 kg" numa marca não alcançada.** Exemplo: inicial 120,9 kg e atual 114,9 kg (4,96%). Arredondamento em `app/perfil.js:48-49`.
3. **"Proteína na faixa" ignora a meta informada.** A conta usa a faixa calculada pelo app (`app/painel.js:33` e `app/painel.js:86`). Com meta de 130 g, um dia com 130 g conta como fora da faixa (faixa de 92 a 123 g), embora o anel mostre a meta cumprida.
4. **Dois limites diferentes para "levar ao médico".** O painel usa 1.200 kcal fixos, mesmo quando a meta informada abaixo de 1.200 vira o piso do dia (`app/painel.js:11` e `app/painel.js:108`). A tela Hoje usa 800 kcal (`app/consumo.js:20`).
5. **Semana: adiantada e atrasada contam diferente.** O padrão "fora do dia habitual" conta só os atrasos; a aplicação adiantada fica de fora (`app/semana.js:108-109`). Ela também aparece numa semana cujo período não contém a data dela (ex.: "Semana 3, 26/10 a 01/11" lista "Sáb, 24/10"). É escolha documentada, mas confunde.
6. **O cache da escala pode guardar porções velhas depois de uma atualização.** `VERSAO_ESCALA` (`app/nutricao.js:204`) não inclui `REGRAS_CARDAPIO`, `GORDURA_PISO` nem `ESCALA`, e do cardápio só pega o tamanho do texto. Trocar 80 g por 90 g, ou o teto de 500 kcal, sem subir o "3" à mão, deixa porções velhas para quem já abriu o app. Nenhum teste pega. Hoje está coerente: subiu de 2 para 3 nesta onda.
7. **O cartão da vesícula pede confirmação "antes de começar" para sempre.** Em Hoje ele diz "Confirme com ele antes de começar" (`app/perfil.js:84`) em todas as semanas do tratamento.
8. **Caminhos (ainda sem tela) prometem coisas que não existem.** O `noApp` do caminho A diz "É o cardápio de 7 dias do app", o que contradiz a decisão de 22/11 sobre o plano da nutricionista. B e C prometem "prato dividido" e "contador de bebida açucarada", que não existem (`app/caminhos.js:17,26,35`).
9. **Guia e cartão falam diferente da febre.** Para ligar 192, o Guia diz "febre alta" (`app/conteudo.js:104`) e o cartão diz "febre" (`app/perfil.js:88`).
10. **O aviso de ritmo some para quem pesa uma vez por mês.** Ele precisa de uma pesagem de 14 a 28 dias antes da última (`app/peso.js:57`). Quem só se pesa na consulta mensal nunca vê o aviso.
11. **Na versão web, cada atualização só aparece na segunda abertura** (`app/sw.js:22`). Um texto de segurança corrigido demora uma abertura a mais para chegar.

## Conferido sem achado
- **Migração:** um estado completo da versão anterior (perfil com campo desconhecido, `comidoEnjoo`, `ui.diaPlano`, chave de topo desconhecida) passa por `migrar()` sem nenhum campo mudado ou perdido. Os campos novos entram sem resposta. Vesícula gravada como texto ("true") vira sem resposta, que é o lado seguro.
- **Nomes globais:** 268 nomes no nível de cima, nenhum repetido entre arquivos, nenhum igual a uma propriedade nativa de `window`.
- **Modo discreto:** Hoje, painel, semana, aplicações e relatório na tela não mostram kcal nem kg. O Peso mostra a lista de pesagens (decisão anterior), e a semana deixa o peso atrás de "Ver peso". O aviso de ritmo aparece sem número para quem tem vesícula marcada.
- **Escala no perfil parecido com o dela:** média de 1.651 kcal e 107 g de proteína para metas de 1.650 kcal e 108 g. Maior refeição 499 kcal, maior gordura numa refeição 15,0 g, gordura do dia de 28 a 31%, fibra acima de 36 g, peixe em 5 dias. O dia de enjoo tem uma refeição com 9,6 g de gordura.
- **Lacunas no painel:** dia sem registro fica fora das médias e aparece como traço vazio. Dia só com água também. Dia com "nada" em todas as refeições conta como 0 kcal, o que está certo.

## Limites desta auditoria
- **Não testei:** APK, emulador, WebView 113 real, cabeçalhos de cache de um servidor real (GitHub Pages e parecidos) e leitor de tela.
- **Desempenho:** a CPU "4× e 10× mais lenta" é emulação do DevTools num computador, não um celular.
- Ninguém com formação clínica revisou os textos (limite já registrado pela direção).

## Scripts (em /tmp/claude-1000/auditoria-3/scripts, fora do projeto)
- `contas.js`: casos montados à mão (painel, semana, fígado).
- `desempenho.js` e `telas-lentas.js`: medidas com a CPU desacelerada.
- `sw-atualizacao.js`: troca de versão do PWA.
- `migracao.js`, `globais.js` e `janela.js`: migração e nomes globais.
- `discreto.js`: modo discreto tela a tela.
- Para a escala por restrição: `node dados/conferir_cardapio.js --perfil ...`.
