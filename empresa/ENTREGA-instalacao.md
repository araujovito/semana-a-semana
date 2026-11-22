# Como instalar o Semana a Semana no celular dela

Guia para quem vai instalar. Leva uns 10 minutos se o celular não barrar; veja o passo 5 antes de começar.
Os nomes dos menus mudam um pouco de marca para marca (Samsung, Motorola, Xiaomi). Este passo a passo não foi testado num celular de verdade, só no emulador da equipe.

## O que você precisa

- O arquivo `semana-a-semana.apk` (está na pasta do projeto, `~/semana-a-semana/`).
- O celular dela, com Android 8 ou mais novo.
- Se der problema no passo 5: o computador e um cabo USB.

## 1. Passar o arquivo para o celular

Escolha um caminho:

- **Cabo USB**: ligue o celular no computador, escolha "Transferência de arquivos" no aviso que aparece no celular e copie o `.apk` para a pasta **Download**.
- **Mandar para si mesma**: envie o arquivo por um caminho que vocês controlam, por exemplo uma conversa de WhatsApp sua com ela, ou um e-mail seu para ela. Não use link de terceiros.

## 2. Abrir o arquivo

- Pelo cabo: no celular, abra o app **Arquivos** (na Samsung, **Meus Arquivos**), entre em **Download** e toque em `semana-a-semana.apk`.
- Pelo WhatsApp ou e-mail: toque no arquivo na conversa.

## 3. Permitir instalar desta fonte

O Android vai avisar que, por segurança, não instala apps desconhecidos daquela fonte.
Toque em **Configurações**, ligue **Permitir desta fonte** e volte.
A permissão vale só para o app que abriu o arquivo (o Arquivos, o WhatsApp ou o Gmail), não para o celular inteiro.

## 4. Instalar

Toque em **Instalar**.

Pode aparecer uma tela do **Play Protect** dizendo que o app é desconhecido ou nunca foi verificado. Leia a tela. Em geral há "Mais detalhes" e depois "Instalar mesmo assim".
Se o Play Protect oferecer enviar o app para análise: o que vai é o aplicativo, não os registros dela (ela ainda não tem nenhum). Aceitar ou recusar é escolha de vocês.

## 5. Se o celular não deixar instalar

Desde 30/09/2026 vale no Brasil uma regra nova do Android, a **verificação de desenvolvedores**. Este app não está registrado nela.

**O que se sabe** (páginas oficiais do Google, lidas em 22/11/2026):
- A regra vale no Brasil, Indonésia, Singapura e Tailândia, em celulares certificados com Android 8 ou mais.
- Nesta fase, o Google diz que a checagem roda nas instalações feitas por lojas: Google Play, Galaxy Store, loja da Xiaomi (GetApps), da OPPO, da HONOR, da vivo e da Transsion.
- A página de perguntas frequentes diz, em atualização de 15/07/2026: para app instalado direto por arquivo, a regra "ainda não se aplica". A expansão para todos os apps está prevista para 2027.
- Instalar pelo cabo com o comando `adb` continua permitido sem registro.
- Existe um "fluxo avançado" para instalar app de desenvolvedor não verificado: ativar o modo de desenvolvedor, confirmar que ninguém está orientando você, reiniciar, **esperar 1 dia**, confirmar com digital ou PIN. Depois disso a instalação mostra um aviso com "Instalar mesmo assim". Dá para liberar por 7 dias ou sem prazo.

**O que não se sabe:**
- Outra página oficial diz que pacote não registrado "não será mais instalável" em celular certificado nessas regiões. Isso contradiz a de perguntas frequentes. A equipe não sabe qual das duas descreve o celular dela hoje.
- Uma notícia brasileira (Canaltech) diz que ainda dá para instalar por arquivo, com o fluxo avançado e a espera de 24 horas. Não diz se o fluxo é obrigatório já agora para quem instala por arquivo.
- Só testando no celular dela se sabe.

**Opções se aparecer "desenvolvedor não verificado" e não houver botão para seguir:**

| Opção | Como | Custo e risco |
|---|---|---|
| A. Instalar pelo cabo (`adb`) | No celular: ativar o modo de desenvolvedor (tocar 7 vezes em "Número da versão" em Configurações > Sobre o telefone) e ligar "Depuração USB". No computador: `~/Android/Sdk/platform-tools/adb install -r ~/semana-a-semana/semana-a-semana.apk`. Aceitar no celular o pedido de confiar no computador. | Sem espera. Depois, pode desligar a depuração USB e o modo de desenvolvedor. Alguns apps de banco reclamam com o modo de desenvolvedor ligado. |
| B. Fluxo avançado no celular | Seguir as telas do Android para liberar apps de desenvolvedores não verificados. | Espera de 1 dia. Não precisa de computador. |
| C. Registrar o app no Google (conta de distribuição limitada) | Conta Google com verificação em duas etapas, perfil de pagamentos com nome e endereço, registro do pacote com a chave de assinatura. Gratuita, até 20 aparelhos. | Seus dados pessoais vão para o Google. Decisão sua; a equipe não faz isso. |

Fontes:
- Perguntas frequentes da verificação: https://developer.android.com/developer-verification/guides/faq
- Visão geral e lojas onde vale: https://developer.android.com/developer-verification/guides
- Conta de distribuição limitada: https://developer.android.com/developer-verification/guides/limited-distribution
- Play Protect (ajuda do Google): https://support.google.com/googleplay/answer/2812853?hl=pt-BR
- Canaltech: https://canaltech.com.br/apps/ainda-da-para-instalar-apk-brasil-vira-cobaia-de-nova-trava-do-google/

## 6. Depois de instalar

- Volte em **Configurações > Apps > Acesso especial > Instalar apps desconhecidos** e desligue a permissão do passo 3.
- Abra o **Semana a Semana** uma vez para conferir que entra na tela "Antes de começar". O resto é com ela (ver `ENTREGA-primeiros-passos.md`).

## Atualizar depois, sem perder os registros

- Instale o arquivo novo **por cima**, repetindo os passos 1 a 4. **Não desinstale** o antigo: desinstalar apaga os registros.
- Só funciona se a versão nova for assinada com a **mesma chave** (`android/chave.keystore`). Se a chave se perder, não há como atualizar: só desinstalar e instalar de novo, perdendo o que não tiver cópia.
- **Guarde uma cópia da chave fora do computador** (pendrive, outro computador ou cofre de senhas). A senha está escrita em `montar-apk.sh`; guarde junto.
- A versão nova precisa ter número de versão maior. Isso é com quem compilar (ver `LEIAME.md`).
- Faça uma cópia dos dados (abaixo) antes de atualizar.
- Se em 2027 a regra de verificação valer para tudo, atualizar vai exigir a opção A, B ou C do passo 5.

## Cópia dos dados

Os registros ficam guardados dentro do app, no celular. O app tem cópia manual por texto:

- **Fazer a cópia**: no app, aba **Diário > Relatório**, cartão "Cópia de segurança", botão **Exportar tudo**. Abre o menu de compartilhar do Android com um texto (todos os dados). Ela pode mandar para ela mesma (WhatsApp, e-mail) ou salvar numa nota.
- **Restaurar**: no mesmo cartão, colar o texto inteiro no campo "Restaurar" e tocar em **Restaurar**. O app pergunta antes de substituir os dados do celular.
- O texto tem dados de saúde dela. Vai para onde ela mandar: se for WhatsApp ou e-mail, fica guardado nesses serviços.
- O app não faz cópia automática em arquivo.
- Além disso, se a cópia de segurança do Google estiver ligada no celular, o Android pode incluir os dados do app na conta Google dela. A equipe não testou se essa cópia volta num app instalado por arquivo. Não conte só com ela.
- "Apagar todos os dados", no mesmo cartão, zera o app. Não dá para desfazer.

## O que o app não faz

- Não envia nada. Não tem permissão de internet. Os dados só saem do celular quando ela toca em Compartilhar ou Exportar.
- Não tem conta, servidor nem sincronização. Você acompanha pelo relatório que ela compartilhar (Diário > Relatório).
- Não manda lembretes nem notificações.
- Não prescreve dose, remédio nem suplemento. As metas são estimativas e podem ser trocadas pelas do médico ou da nutricionista no Perfil.
- Não substitui o médico. Ninguém com formação clínica revisou os textos do app.
