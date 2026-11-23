# Chave `semana-a-semana.escala` em texto puro com o PIN ligado (teste final do APK, I2, detalhe menor)

## Conclusão
Corrigido no código, com migração. Com o PIN ligado, as porções guardadas passam a ficar em `E.ui.escala`, dentro dos dados cifrados. A chave em texto é apagada ao criar o PIN e a cada abertura com PIN, antes mesmo do desbloqueio. Sem PIN, nada muda. Nenhum registro dela se perde: o que sai do texto puro é só um resultado de conta, refeito se faltar. O desbloqueio não depende dessa chave, então a abertura não muda.

## Para que serve a chave e por que ficou de fora
- É um cache de `calcularEscala()` (`app/nutricao.js`): os dois fatores que ajustam as porções do cardápio às metas dela. A primeira conta leva de 0,3 s a alguns segundos num celular fraco (auditoria 2). Por isso o resultado ficava guardado entre aberturas.
- A chave do cache é `kcal|prot|teto|piso|marcas|não gosta`, e o valor traz `kcalMedia` e `protMedia`. Daí o "1.550 kcal e 107 g", que permite estimar o peso. As marcas (vesícula, fígado e outras) e os alimentos que ela não come também aparecem na chave.
- Ficou fora da cifra porque o cache é anterior ao PIN e grava direto no `localStorage`, sem passar por `salvar()`. O relatório `cifra.md` já o listava como "sem segredo". Ele **não** é lido antes do desbloqueio: com o app trancado não há perfil e não há nada que use a escala.
- Embaralhar a chave com um hash não resolve. O cardápio está no próprio código, então quem tem os fatores refaz as somas e chega às metas.

## O que mudou (app/nutricao.js, app/cifra.js)
- Com PIN (`CIF_GRAVAR` presente, ou seja, app desbloqueado): ler e gravar usam `E.ui.escala`. Essa entrada vai cifrada na próxima gravação normal, sem chamar `salvar()` dentro da conta.
- Trancado (`CIF_TRANCADO`): não guarda nada.
- Migração: `nutricao.js` apaga a chave em texto logo ao carregar se houver dados cifrados, e `cifCriarProtecao()` apaga a chave ao criar o PIN. A primeira abertura depois disso refaz a conta uma vez e a guarda cifrada.
- Sem PIN: tudo como antes, na chave em texto (os registros também ficam em texto nesse caso).

## Custos e riscos conhecidos
- `E.ui.escala` entra na exportação (cópia de segurança). São no máximo 21 resultados, alguns KB, com metas que a cópia já permite calcular a partir do peso. Uma cópia restaurada num aparelho sem PIN deixa esse campo em texto, junto com o resto dos dados, que nesse caso já está em texto.
- Se ela abrir o app e fechar sem registrar nada, o resultado não chega a ser gravado e a conta é refeita na próxima abertura (cerca de 1 s num celular intermediário, pela estimativa da auditoria 2). Com qualquer registro, fica guardado.
- `MEMO_ESCALA` continua na memória enquanto o app está trancado (não é apagado em `cifBloquear()`). Fica só na memória do processo, nunca no disco. Não mexi nisso para não aumentar a mudança.
- Não mexi no texto antigo que sobra no LevelDB depois da migração (parte principal do I2, aceita pela direção). O valor antigo da chave `escala` também pode continuar no `000003.log` até a compactação. É a mesma limitação.

## Testes
- Novo teste de unidade em `testes/unidade/cifra.js`: sem PIN, a chave fica em texto. Ao criar o PIN, ela some. Com uma chave velha plantada, ela some ao abrir, ainda trancado. Trancado, nada é gravado. Desbloqueado, o resultado vai para `E.ui.escala` e não volta para o texto. A meta não aparece no armazenamento. Ao reabrir, a escala vem dos dados cifrados e o plano sai igual.
- `testes/fluxo-cifra.js` (navegador): a conferência "estado depois de criar o PIN igual ao de antes" passou a ignorar `ui.escala`. Na primeira rodada ela falhou justamente porque o app guarda a escala no estado ao desenhar o plano depois do PIN; os registros dela continuam comparados por inteiro. Verificação nova: depois do PIN, nenhuma chave `semana-a-semana.escala` no armazenamento e `E.ui.escala` presente.
- `bash testar.sh` completo: tudo verde. Não testei no emulador nem no aparelho, por regra desta rodada.
