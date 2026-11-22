# PIN de 6 dígitos e dados cifrados

22/11/2026, engenheiro de cifra. Ramo `onda2-pin`, ainda não juntado à main.

## Conclusão

- O PIN funciona no navegador (PWA, em https ou localhost) e no APK (WebView com `file://`). Nos dois existe a cifra do próprio navegador (`crypto.subtle`), então não foi preciso nenhuma cifra caseira nem biblioteca de fora.
- **O que protege:** quem pega o celular destravado e abre o app sem saber o PIN. Protege também as cópias do armazenamento do app, como a cópia de segurança do Google, contra quem só olha o conteúdo: lá ficam só dados embaralhados.
- **O que não protege:** quem consegue copiar o armazenamento do app pode tentar todos os PINs fora do app, sem a espera entre tentativas. Um PIN de 6 dígitos tem 1 milhão de combinações. A conta lenta (PBKDF2) só deixa cada tentativa demorada: perto de 0,75 s no celular dela, ou bem menos num computador potente. Isso atrasa quem ataca, mas não impede.
- **Esqueceu o PIN e perdeu o código de recuperação: os dados não voltam.** Nem a equipe consegue recuperar. Uma exportação em texto (Diário > Relatório > Exportar tudo) feita antes continua servindo para restaurar.

## Como ela usa

1. Na primeira abertura depois da atualização, com ou sem registros, aparece "Crie um PIN de 6 dígitos". Ela digita o PIN duas vezes, com o teclado numérico e os dígitos escondidos.
2. Aparece uma vez só um código de recuperação de 4 grupos de 5 letras e números, sem 0, O, 1 e I. Junto vem o aviso: "Anote em papel e guarde fora do celular. Sem o PIN e sem este código, os dados não podem ser recuperados." Para seguir, ela redigita um dos grupos, sorteado. Antes dessa confirmação nada é gravado: se o app fechar no meio, os dados continuam como estavam.
3. O app pede o PIN ao abrir, quando volta de outro app (inclusive depois de compartilhar uma exportação ou abrir o calendário) e quando ela toca na tela depois de 5 minutos sem uso. Uma conferência a cada 15 s também bloqueia sozinha a tela parada.
4. PIN errado: a partir do 5º erro seguido, o app pede para esperar 30 s, depois 1 min, depois 5 min a cada erro. A contagem continua valendo se o app for fechado. Nada é apagado.
5. "Esqueci o PIN": ela digita o código de recuperação, com ou sem espaços e em maiúsculas ou minúsculas, e cria um PIN novo. O código continua o mesmo.
6. "Trocar PIN" fica no fim do Perfil e pede o PIN atual.
7. A exportação continua em texto, com o aviso de dados de saúde que já existe. A restauração grava de novo, cifrado.

## Como funciona por dentro

- Uma chave aleatória (AES-GCM de 256 bits) cifra todos os registros, o mesmo conteúdo que antes ficava em texto em `semana-a-semana.v1`.
- Essa chave fica guardada "embrulhada" duas vezes: uma com uma chave tirada do PIN, outra com uma chave tirada do código de recuperação. As duas saem do PBKDF2-SHA256, cada uma com seu sal aleatório. Para embrulhar, o app usa o AES-KW. Ele confere a integridade: PIN errado dá erro na hora, sem abrir nada.
- No celular, na chave `semana-a-semana.cifrado`, fica só `{ v, sal, salRec, iter, chaveEmbrulhadaPin, chaveEmbrulhadaRec, iv, dadosCifrados }`. O pedido listava um único `sal`. Usei dois (`sal` e `salRec`) para poder trocar o PIN com sal novo sem precisar do código de recuperação.
- O PIN e o código nunca são gravados. A chave aberta só existe na memória enquanto o app está desbloqueado. Ao bloquear, ela é descartada junto com os registros carregados.
- Também ficam no celular, sem segredo: a contagem de erros (`semana-a-semana.cifra.tentativas`) e as porções guardadas do cardápio (`semana-a-semana.escala`), que já existiam.
- **Migração:** os registros em texto são cifrados e gravados. Depois a cópia gravada é relida e decifrada, e o resultado é comparado com o original. O texto puro só é apagado se os dois baterem. Se a gravação falhar, por exemplo por falta de espaço, o que acabou de ser gravado é desfeito e o texto continua lá. Se o app fechar entre gravar e apagar, o texto que sobrou é apagado no próximo desbloqueio, e só se for igual ao cifrado.
- **Dados danificados:** se o registro cifrado não abre, mesmo com a chave certa, o app avisa que não conseguiu abrir os dados, e nada é apagado nem gravado por cima. Ela pode tentar de novo ou "Guardar à parte e começar do zero". Nesse caso o registro danificado fica guardado, ainda cifrado, numa chave à parte.

## Quanto tempo leva o desbloqueio

O número de iterações não é fixo. Na criação do PIN, o app mede quanto o próprio aparelho leva e escolhe as iterações para a conta durar cerca de 0,75 s. O piso é de 600 mil iterações (a recomendação atual da OWASP para PBKDF2-SHA256) e o teto, de 10 milhões. O número escolhido fica guardado (`iter`). Assim, o celular dela calibra pela própria velocidade.

| Onde | Iterações escolhidas | Desbloqueio (PIN → dados abertos) |
|---|---|---|
| Chromium sem janela, CPU normal | 5,67 milhões | 0,84 a 0,88 s |
| Chromium sem janela, "CPU 4× mais lenta" (DevTools) | 5,06 milhões | 0,74 a 0,77 s |
| Emulador Android 14 (x86, WebView), APK | (sem acesso ao número) | 1,8 a 2,4 s até a tela Hoje desenhada, medido por capturas de tela; inclui desenhar Hoje |

Atenção ao "CPU 4× mais lenta": a desaceleração do DevTools freia só o JavaScript da página. A conta do PBKDF2 roda fora dela, no código nativo do navegador, e não fica mais lenta. Medi: 600 mil iterações levam 76 ms nos dois casos, enquanto um laço em JavaScript passa de 23 para 91 ms. Por isso a calibração no aparelho é o que garante o tempo, e não um número fixo escolhido no computador.

Não medi num celular de verdade. Num celular muito lento, que não chegue a 600 mil iterações por segundo, o desbloqueio passa de 1 s, porque o piso prevalece.

## Testes

- `testes/unidade/cifra.js` (12 testes): criar o PIN com e sem dados, migração sem perda (estado comparado antes e depois), falha de gravação na criação, gravação cifrada, bloqueio que descarta chave e dados, PIN errado e esperas de 30 s, 1 min e 5 min (a contagem sobrevive a fechar o app), recuperação, troca de PIN, dados danificados (avisa e não apaga), migração interrompida, restauração e limites da calibração.
- `testes/fluxo-cifra.js` (navegador, `file://`, 440 px): o mesmo pela tela, mais bloqueio por inatividade e por segundo plano, grupo de confirmação errado, nada legível no armazenamento (nome, nota, peso, PIN), alvos de toque de 44 px e nenhuma rolagem lateral.
- `testes/fluxo-pwa.js` confere que `crypto.subtle` existe por HTTP local.
- Os testes antigos rodam sem PIN: o teste põe `window.cifTesteSemPin` antes de o app carregar. Esse sinal só vale quando ainda não há dados cifrados, e nunca abre dados cifrados.
- **Emulador (APK montado numa cópia, chave copiada só para lá):** instalado por cima da versão anterior, que tinha registros de teste. Funcionaram a criação do PIN (com a migração mantendo os registros), o teclado numérico, o bloqueio ao ir para segundo plano, a recuperação pelo código com PIN novo e o desbloqueio depois de fechar o app à força. Não conferi o arquivo de armazenamento no emulador, porque o app não é depurável. A ausência do texto puro foi conferida só no navegador e nos testes de unidade.

## O que ficou de fora ou merece atenção

- **Cópias "guardadas à parte" antigas:** se o app já tinha guardado à parte um texto ilegível (`semana-a-semana.v1.guardado.*`, tela "Não consegui ler os dados guardados"), essa cópia continua em texto. A migração não mexe nela.
- **Texto puro diferente do cifrado:** se, depois do PIN, aparecer em `semana-a-semana.v1` um texto diferente do cifrado (só acontece se instalarem uma versão antiga por cima), ele não é apagado sozinho.
- **Dados ilegíveis antes do PIN:** se os dados em texto já estavam ilegíveis antes da atualização, a tela antiga de "Não consegui ler" aparece antes da criação do PIN. Essa tela já permite compartilhar o texto guardado.
- **Bloqueio ao compartilhar:** compartilhar a exportação ou abrir o calendário leva o app para segundo plano e bloqueia. Ela volta e digita o PIN. O pedido manda bloquear sempre ao ir para segundo plano.
- **Atualização da versão web:** o nome do cache do service worker continua fixo (achado I5 da auditoria 3, fora do meu escopo). Até ele mudar, a versão web pode misturar arquivos velhos e novos numa atualização com falha.
- **Esperas entre tentativas:** elas dependem do relógio do celular. Quem adiantar o relógio pula a espera. Contra quem copia o armazenamento, a espera não vale de qualquer jeito: ver a conclusão.
- Ninguém de fora revisou a cifra.
