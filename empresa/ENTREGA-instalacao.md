# Como instalar o Semana a Semana no celular dela

Guia para quem vai instalar. O celular dela é um Xiaomi Redmi Note 13 Pro (MIUI 14 ou HyperOS).
Leva uns 15 minutos se o celular não barrar. Leia o passo 5 antes de começar.

**Limite deste guia:** nada foi testado num Xiaomi de verdade. A equipe testou num celular virtual com Android puro, na medida da tela dela.
Os nomes dos menus da Xiaomi mudam entre MIUI 14 e HyperOS e entre atualizações. Onde houver dúvida, o guia diz "pode variar".

## O que você precisa

- O arquivo `semana-a-semana.apk`, compilado na versão nova (ver `LEIAME.md`, "Compilar"). O da raiz de 22/11 às 16h27 é antigo: não tem PIN nem o plano da nutricionista.
- O celular dela, destravado e com bateria.
- Papel e caneta, para o código de recuperação do PIN.
- Se der problema no passo 5: o computador e um cabo USB.

## 1. Passar o arquivo para o celular

- **Cabo USB**: ligue o celular no computador, toque no aviso do celular e escolha "Transferência de arquivos". Copie o `.apk` para a pasta **Download**.
- **Mandar para si mesma**: por um caminho que vocês controlam (conversa de WhatsApp entre vocês, e-mail seu para ela). Não use link de terceiros.

## 2. Abrir o arquivo

- Pelo cabo: abra o app **Gerenciador de arquivos** da Xiaomi (ou o **Files** do Google), entre em **Download** e toque em `semana-a-semana.apk`.
- Pelo WhatsApp ou e-mail: toque no arquivo na conversa.

## 3. Permitir instalar desta fonte

Aparece um aviso de que, por segurança, o celular não instala apps desconhecidos daquela fonte.
Toque em **Configurações**, ligue **Permitir desta fonte** e volte.
A permissão vale só para o app que abriu o arquivo (Gerenciador de arquivos, WhatsApp ou Gmail).

## 4. Instalar: os avisos da Xiaomi

Toque em **Instalar**. No Xiaomi podem vir avisos a mais que num Android comum. O que se sabe, e que pode variar por versão:

- **Verificação de segurança da Xiaomi.** O sistema analisa o arquivo antes de instalar. Pode dizer que o app é desconhecido ou "não verificado". Leia a tela. Em geral há um botão para continuar (por exemplo "Instalar mesmo assim" ou "Continuar"). Às vezes ele só libera depois de uma contagem de alguns segundos.
- **Proteção extra e conta Xiaomi.** Em algumas versões, o celular oferece desligar uma proteção ou pede para entrar na conta Xiaomi para seguir. A equipe não sabe se isso vai aparecer no aparelho dela. Se pedir a conta, é a conta Xiaomi dela; decidir entrar ou não é com vocês.
- **Play Protect (Google).** Pode dizer que o app nunca foi verificado. Em geral há "Mais detalhes" e depois "Instalar mesmo assim". Se oferecer enviar o app para análise: vai o aplicativo, não os registros dela.

Fonte geral da Xiaomi sobre apps bloqueados (permissão de fontes desconhecidas, Play Protect e a segurança do sistema podem barrar): https://www.mi.com/uk/support/faq/details/KA-06974/ (a página recusou leitura automática em 22/11; o resumo vem da busca).

## 5. Se o celular não deixar instalar

Desde 30/09/2026 vale no Brasil a **verificação de desenvolvedores** do Android. Este app não está registrado nela.

**O que se sabe** (páginas oficiais do Google, lidas em 22/11/2026):
- Vale no Brasil, Indonésia, Singapura e Tailândia, em celulares certificados com Android 8 ou mais.
- Nesta fase, o Google diz que a checagem roda nas instalações por lojas: Google Play, Galaxy Store, loja da Xiaomi (GetApps) e outras.
- A página de perguntas frequentes (atualizada em 15/07/2026) diz que, para app instalado por arquivo, a regra "ainda não se aplica". A expansão está prevista para 2027.
- Instalar pelo cabo com `adb` continua permitido sem registro.
- Existe um "fluxo avançado" para app de desenvolvedor não verificado. Um site sobre Xiaomi (MundoXiaomi, 05/11/2026) descreve no HyperOS: ativar as opções de desenvolvedor, ligar a opção de apps de desenvolvedores não verificados, responder que ninguém está orientando você (se disser que alguém pediu, o celular bloqueia), reiniciar e **esperar 24 horas**.

**O que não se sabe:**
- Outra página oficial diz que pacote não registrado "não será mais instalável" nessas regiões. Contradiz a de perguntas frequentes.
- Se o fluxo avançado já é obrigatório agora para instalar por arquivo no aparelho dela. Só testando.

**Opções se aparecer "desenvolvedor não verificado" e não houver botão para seguir:**

| Opção | Como | Custo e risco |
|---|---|---|
| A. Pelo cabo (`adb`) | No celular: **Configurações > Sobre o telefone**, tocar 7 vezes em "Versão do MIUI" ou "Versão do SO" (HyperOS). Em **Configurações > Configurações adicionais > Opções do desenvolvedor**, ligar **Depuração USB** e **Instalar via USB**. No computador: `~/Android/Sdk/platform-tools/adb install -r ~/semana-a-semana/semana-a-semana.apk`. Aceitar no celular o pedido de confiar no computador e o pedido de instalar. | Sem espera. **No Xiaomi, "Instalar via USB" costuma pedir login na conta Xiaomi** (em alguns aparelhos, também chip no celular). Depois, dá para desligar as opções de desenvolvedor. Alguns apps de banco reclamam com elas ligadas. |
| B. Fluxo avançado no celular | As telas do sistema para liberar apps de desenvolvedores não verificados. | Espera de 24 horas. Sem computador. |
| C. Registrar o app no Google (distribuição limitada) | Conta Google com verificação em duas etapas, perfil de pagamentos com nome e endereço, registro do pacote com a chave. Gratuita, até 20 aparelhos. | Seus dados pessoais vão para o Google. Decisão sua; a equipe não faz isso. |

Fontes:
- Perguntas frequentes da verificação: https://developer.android.com/developer-verification/guides/faq
- Visão geral e lojas: https://developer.android.com/developer-verification/guides
- Distribuição limitada: https://developer.android.com/developer-verification/guides/limited-distribution
- Play Protect: https://support.google.com/googleplay/answer/2812853?hl=pt-BR
- Canaltech: https://canaltech.com.br/apps/ainda-da-para-instalar-apk-brasil-vira-cobaia-de-nova-trava-do-google/
- MundoXiaomi (HyperOS e a regra das 24 horas): https://www.mundoxiaomi.com/moviles/como-puedo-instalar-apps-desarrolladores-no-verificados-archivos-appk-externos-hyperos-regla-24-horas/

## 6. Primeira abertura: o PIN

O app abre pedindo para **criar um PIN de 6 dígitos**. Quem cria é ela. Use o PIN que vocês escolheram.

1. Ela digita o PIN duas vezes.
2. Aparece **uma vez só** o **código de recuperação**: 4 grupos de 5 letras e números.
3. **Anote o código em papel**, confira letra por letra e guarde o papel **fora do celular** (gaveta, cofre, junto dos documentos). Não guarde foto do código no próprio celular.
4. O app pede para redigitar um dos grupos. Só depois disso grava.

**Sem o PIN e sem o código, os dados não voltam.** Nem a equipe consegue abrir. Só uma cópia exportada antes (abaixo) salva.

Depois:
- O app pede o PIN ao abrir, ao voltar de outro app e depois de 5 minutos parado.
- Esqueceu o PIN: "Esqueci o PIN", digitar o código e criar um PIN novo. O código continua o mesmo.
- PIN errado várias vezes: o app pede para esperar (30 s, 1 min, 5 min). Nada é apagado.
- Trocar o PIN: no Perfil, no fim, "Trocar PIN".

Em seguida vem a tela "Antes de começar" e o formulário curto. O resto é com ela (`ENTREGA-primeiros-passos.md`).

## 7. Depois de instalar

- Tire a permissão do passo 3: em **Configurações > Apps > Permissões > Instalar apps desconhecidos** (o caminho pode variar; procure "apps desconhecidos" na busca das Configurações), desligue para o app que abriu o arquivo.
- Se usou a opção A, pode desligar as opções de desenvolvedor.

## O limpador do sistema Xiaomi

O Xiaomi tem um app **Segurança** com **Limpeza** (limpador) e sugestões de liberar espaço.

- **Nunca** use "Limpar dados" ou "Limpar tudo" em **Configurações > Apps > Gerenciar apps > Semana a Semana > Armazenamento**. Apaga todos os registros.
- No limpador, não marque nada do Semana a Semana para apagar. Os registros ficam dentro da pasta do app. A equipe não testou o que o limpador da Xiaomi faz com eles.
- "Limpar cache" também não foi testado. Na dúvida, não use.
- Economia de bateria não atrapalha: o app não faz nada em segundo plano.

## Atualizar depois, sem perder os registros

- Faça antes uma cópia dos dados (abaixo).
- Instale o arquivo novo **por cima**, repetindo os passos 1 a 4. **Não desinstale** o antigo: desinstalar apaga os registros.
- Só funciona se:
  - a versão nova vier assinada com a **mesma chave** (`android/chave.keystore`);
  - o **número da versão (versionCode) for maior** que o do instalado. Isso é com quem compila (`LEIAME.md`). O APK de 22/11 tem 2; o próximo precisa de 3 ou mais.
- Se a chave se perder, não há como atualizar: só desinstalar, perdendo o que não tiver cópia. **Guarde uma cópia da chave fora do computador**, com a senha (está em `montar-apk.sh`).
- Quem já usava uma versão sem PIN: na primeira abertura depois da atualização, o app pede para criar o PIN. Os registros são cifrados e conferidos; o texto antigo só é apagado depois que a conferência bate.
- Se em 2027 a regra de verificação valer para tudo, atualizar vai exigir a opção A, B ou C do passo 5.

## Cópia de segurança dos dados

- **Fazer a cópia:** aba **Semana > Diário > Relatório**, cartão "Cópia de segurança", **Exportar tudo**.
  - Antes, o app avisa que a cópia tem todos os dados de saúde e que quem receber consegue ler tudo. Ela toca **Seguir** ou cancela.
  - O app monta a cópia com um **código de verificação** e relê antes de enviar. Só então diz "Cópia pronta e conferida" e abre o menu de compartilhar.
  - Ela manda para ela mesma (WhatsApp, e-mail) ou salva numa nota. O texto fica guardado nesse serviço.
  - Ao voltar do outro app, o Semana a Semana pede o PIN de novo. É esperado.
- **Lembrete:** passados 14 dias sem exportar, aparece um cartão pequeno no mesmo lugar, com "Exportar agora" e "Agora não".
- **Restaurar:**
  - Celular novo ou app reinstalado: depois de criar o PIN e passar por "Antes de começar", a tela do formulário tem o cartão **"Já usava o app?"**. Cole o texto inteiro e toque em **Restaurar**. Não precisa preencher nada antes.
  - Com o app em uso: no cartão "Cópia de segurança", campo "Restaurar". O app pergunta antes de substituir.
  - Texto cortado ou alterado é recusado e nada muda. Cole de novo o texto inteiro.
- A cópia exportada é legível: não tem o PIN. Guarde onde só ela acessa.
- Cópia do Google: se estiver ligada no celular, o Android pode incluir os registros (cifrados) na conta Google dela. Não foi testado se volta num app instalado por arquivo, nem se o Xiaomi usa outra cópia. Não conte só com ela.
- "Apagar todos os dados", no mesmo cartão, zera o app. Não dá para desfazer.

## Alternativa: versão web

O app também existe como página que se instala pelo Chrome (versão web). Está **pronta, mas não publicada**: para usar, alguém precisaria hospedar a pasta `app/` num endereço `https`. Por decisão do dono, isso não foi feito.

Se um dia for usada:
- No Chrome, menu > **Adicionar à tela inicial** (ou "Instalar app").
- No Xiaomi, o atalho pode não aparecer na tela inicial. Pode ser preciso dar ao Chrome a permissão de **atalhos na tela inicial**: Configurações > Apps > Gerenciar apps > Chrome > Outras permissões (o caminho pode variar).
- Os dados ficam no Chrome daquele celular. **Limpar os dados do Chrome** (ou o limpador apagar dados do navegador) apaga tudo.
- Versão nova aparece como "Versão nova pronta. Toque para atualizar".
- Os dados do APK e os da versão web são separados. Para passar de um para o outro, exportar e restaurar.

## O que o app não faz

- Não envia nada. Não tem permissão de internet. Os dados só saem quando ela toca em Compartilhar ou Exportar, ou pela cópia do Google.
- Não tem conta, servidor nem sincronização. Você acompanha pelo relatório que ela compartilhar ("Para a consulta").
- Não manda lembretes nem notificações. O botão "Pôr no calendário" (Perfil) cria um evento no calendário do celular, se ela quiser.
- Não prescreve dose, remédio nem suplemento. Segue o plano da nutricionista; as metas do app são reserva.
- Não substitui o médico. Ninguém com formação clínica revisou os textos. O que depende de aval está em `PARA-O-MEDICO.md`.
