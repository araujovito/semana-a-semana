# PIN: os três caminhos que faltavam (espera, inatividade, troca)

Testador de segurança (PIN), 22/11/2026. Navegador sem janela (Chromium headless, por file://, 440 px), relógio controlado. Sem emulador e sem celular. PINs de teste inventados.

## Conclusão

**Os três caminhos funcionam, e achei 3 defeitos, já corrigidos.** Nenhum deles perdia dados.

1. **Relógio do celular atrasado travava o app por horas.** Se o relógio voltasse depois dos 5 erros (ajuste de hora, fuso), a espera durava o tempo que ele voltou. Com o relógio um dia atrás, a tela dizia "Espere 1440 minutos" e nem o PIN certo abria. Agora a espera nunca passa da duração daquele erro (30 s, 1 min ou 5 min) e recomeça de agora.
2. **Bloquear com uma folha ou diálogo aberto deixava o conteúdo na página.** A folha era escondida, mas continuava lá. Na troca de PIN, o PIN atual digitado ficava num campo escondido enquanto o app estava trancado. Agora o bloqueio esvazia a folha e o diálogo.
3. **"Espere 2 minuto".** Na espera de 5 minutos, entre 61 e 119 s restantes, a palavra ficava no singular. Corrigido.

O teste novo pega os três: rodei os testes novos sobre o `app/cifra.js` antigo e eles falharam nesses pontos.

## O que o teste novo cobre (`testes/fluxo-pin-caminhos.js`, 65 verificações)

**Esperas depois de PINs errados**
- Do 1º ao 4º erro, a tela diz "PIN errado" e não pede espera. A partir do 2º, avisa que a espera vem depois de 5.
- 5º erro: 30 s. 6º: 1 min. 7º: 5 min. 8º em diante: continua 5 min. O instante em que a espera termina fica guardado, e o PIN não é guardado.
- A espera continua depois de recarregar e depois de fechar e reabrir a página.
- Durante a espera, nem o PIN certo abre, e tentar não conta como erro.
- Quando a espera acaba, o aviso some sozinho, sem tocar na tela.
- Relógio um dia atrás: a espera fica em no máximo 5 minutos (era o defeito 1).
- Acertar o PIN zera a contagem: o erro seguinte volta a ser o 1º.

**Bloqueio depois de 5 minutos parado**
- Com 4 min 59 s parado, o toque funciona. Toque e tecla contam como uso.
- Com 5 min 1 s parado, o toque bloqueia, tira a chave e os dados da memória e não chega ao app (a aba não muda por trás).
- Parada sem tocar em nada, ela é bloqueada sozinha pela conferência periódica (a cada 15 s).
- Um registro salvo logo antes do bloqueio aparece depois de abrir de novo, e foi gravado cifrado.
- Com a folha "Trocar PIN" aberta e o PIN digitado, o bloqueio fecha a folha e o PIN sai da página (era o defeito 2). Com um diálogo aberto, ele fecha e o texto sai da página.

**Troca de PIN pelo Perfil**
- Recusa PIN novo diferente da repetição, PIN novo curto e PIN atual vazio, sem mexer nos dados guardados.
- O PIN atual errado conta como erro: no 5º, pede espera de 30 s. Essa espera vale também na tela de entrada.
- Com o PIN atual certo, a folha fecha e aparece "PIN trocado.". Os dados continuam os mesmos. Mudam o sal e a chave embrulhada pelo PIN. A parte do código de recuperação não muda. Nada fica legível no armazenamento.
- Um registro feito depois da troca é gravado e aparece ao abrir com o PIN novo.
- Depois de fechar e reabrir a página, o PIN antigo não abre e o PIN novo abre tudo.
- **O código de recuperação de antes da troca continua abrindo os dados.** Depois da recuperação, o PIN trocado deixa de abrir e o PIN criado na recuperação abre.

## Mudança no apoio dos testes

`testes/apoio.js` ganhou a opção `abrir({ relogioSobrevive: true })`. Com ela, a hora mudada pelo teste continua depois de recarregar a página. Sem ela, cada carga volta para 20/11 10h, e é esse o comportamento que os outros testes continuam usando. Só o teste novo usa a opção.

## O que ficou de fora ou pendente

- **Nada disso foi testado num celular nem no emulador.** Foi tudo no navegador, com o relógio simulado. A conferência de inatividade a cada 15 s rodou com o relógio real do navegador.
- "Espere 1 segundos": no último segundo de espera, o plural continua errado. É raro de ver e não corrigi.
- Quando o bloqueio acontece por um toque num elemento que some, o app ignora o próximo clique por 0,8 s. Isso é de propósito e não atrapalha uma pessoa, que não digita 6 números nesse tempo. O teste espera esse tempo.
- O código de recuperação não tem espera entre tentativas erradas. Com 100 bits, adivinhar não é viável, então não mexi.
- Os limites que já estavam anotados no LEIAME continuam valendo: adiantar o relógio encurta a espera, e quem copiar o armazenamento consegue testar PINs fora do app.
