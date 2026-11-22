# Segurança do app: o que ele protege e o que não protege

**Conclusão.** O app guarda os dados de saúde só no celular, não tem permissão de internet e não carrega nada de fora.
Ele não tem senha própria: quem destrava o celular consegue abrir o app e ler tudo. Os dados ficam sem criptografia
dentro do celular. A cópia de segurança agora tem um código que avisa se o texto foi cortado ou alterado, e o app
avisa antes de qualquer texto com dados de saúde sair dele. A maior ameaça que sobra é perder os dados (celular perdido,
app desinstalado, chave do APK perdida), não alguém de fora roubá-los.

Ramo `onda2-seg`. Nada disto foi testado num celular de verdade: os testes rodam num navegador sem janela (modo arquivo,
como o WebView, e modo PWA por HTTP local). O APK foi compilado, mas não instalado.

## Quem pode ver os dados (modelo de ameaça)

| Quem | Consegue ver? | Por quê |
|---|---|---|
| Quem destrava o celular dela | Sim, tudo | O app não tem senha nem PIN. A proteção é o bloqueio de tela do celular. |
| Quem pega o celular bloqueado | Não, em geral | O Android criptografa o armazenamento com o bloqueio de tela. A proteção mais forte vale depois de reiniciar, até o primeiro desbloqueio; com o celular já destravado uma vez, depende de ninguém conseguir passar da tela de bloqueio. Sem bloqueio de tela, não há proteção. |
| A conta Google dela | Sim | O Android faz cópia dos dados do app na conta Google (decisão de 20/11: mantido para não perder tudo numa troca de celular). Agora a cópia leva só os registros, nada mais da pasta do app. Com bloqueio de tela ligado, o Android 9 ou mais novo criptografa essa cópia com o PIN do celular. |
| Quem recebe o texto exportado ou o relatório | Sim, tudo o que estiver no texto | O texto é legível. O app avisa antes de enviar. O app de mensagens também guarda uma cópia. |
| Outros apps do celular | Não | O Android separa os dados de cada app. O app não tem permissão nenhuma e só abre os próprios arquivos. |
| Alguém pela internet | Não | O app não tem permissão de internet, não carrega nada de fora e bloqueia qualquer arquivo de outro endereço. |
| Alguém com o celular no cabo USB | Não pela depuração | A depuração da tela do app ficou desligada. Com o celular destravado, vale a primeira linha. |
| Versão web (PWA) | Quem usa aquele navegador | Os dados ficam no navegador. Limpar os dados do navegador apaga tudo. |

## O que o app faz para proteger

- **Nada sai sozinho.** Sem permissão de internet. Os dados só saem pelo botão Compartilhar/Exportar (que ela toca) ou pela cópia do Google.
- **Aviso antes de enviar.** "Exportar tudo" e "Compartilhar" o relatório mostram, antes, que o texto tem dados de saúde. Ela pode cancelar.
- **Política de segurança da página (CSP).** A página só roda os próprios arquivos. Se algum texto colado tentasse injetar um programa,
  o navegador recusaria. Duas exceções, mínimas: o atributo `style` nas telas (é só aparência) e um único evento embutido, liberado
  por código (hash), na busca de "não gosto" do Perfil. Se esse evento mudar de texto em `perfil.js`, a busca para de funcionar e o
  teste acusa; o ideal é trocá-lo por um `addEventListener` e retirar o hash da política.
- **Menor privilégio no Android.** A tela do app não acessa arquivos, `content://` nem localização, não guarda o que é digitado em
  formulários, não navega para fora dos próprios arquivos e recusa arquivos de outro endereço. A ponte com o Android expõe só
  três funções (compartilhar, copiar, calendário), cada uma conferindo o que recebe. Sem permissões, sem tráfego sem criptografia.
- **Cópia de segurança com código de verificação.** A exportação tem versão e um código SHA-256 do conteúdo. Ao restaurar, o app
  recalcula: texto cortado, danificado ou editado é recusado, e nada muda. Logo depois de exportar, o app relê a cópia e só diz
  "Cópia pronta e conferida" se ela voltar igual. Cópias antigas, sem código, ainda restauram, com aviso.
- **Lembrete discreto de cópia.** Passados 14 dias sem exportar, um cartão pequeno em Diário > Relatório oferece exportar. "Agora não" adia.
- **Restaurar num celular novo.** Antes, era preciso preencher um perfil qualquer para achar o campo de restaurar. Agora a primeira tela
  oferece. Teste de ponta a ponta: exportar, apagar, restaurar num navegador limpo; voltou tudo, campo por campo, inclusive vesícula,
  fígado, aguarda cirurgia, modo discreto e campos que ainda não existem.
- **Atualização da versão web.** Versão nova não troca no meio do uso: aparece "Versão nova pronta. Toque para atualizar".

## O que o app não protege (riscos que continuam)

1. **Sem senha própria.** Quem destrava o celular lê tudo. Uma senha ou PIN no app está pendente de decisão do dono e não foi feita.
2. **Dados sem criptografia no celular.** Ficam em texto dentro da pasta do app. Num celular com root, ou por falha do Android, dá para ler.
3. **O código de verificação não é assinatura.** Ele pega texto cortado ou alterado sem querer. Quem quiser alterar de propósito
   consegue recalcular o código, porque o app não tem segredo guardado. Para isso seria preciso uma senha dela (ligado ao item 1).
4. **O texto exportado é legível.** Quem receber lê tudo. O app de mensagens guarda cópia (e pode fazer backup dela na nuvem).
5. **Cópia do Google.** Está ligada por decisão. Não foi testada num aparelho: não sabemos se a restauração do Google traz o
   armazenamento da WebView em todos os celulares. A exportação manual continua sendo o caminho garantido.
6. **Limite de tamanho no Android.** Acima de 250 mil caracteres o Android não passa o texto para outro app; o app avisa e não envia.
   Isso daria vários meses de uso intenso. Ainda não há saída alternativa (salvar em arquivo); fica como próxima tarefa.
7. **Chave do APK.** `android/chave.keystore` fica só neste computador, fora do git, e a senha está escrita em `montar-apk.sh`.
   Quem tiver o arquivo da chave consegue assinar um app que instala por cima do dela e lê os registros. Se a chave se perder,
   nenhuma atualização instala por cima: seria preciso desinstalar, o que apaga os registros (por isso a cópia exportada importa).
   Opção: guardar uma cópia da chave fora deste computador, num lugar só do dono.
8. **Versão web.** Limpar os dados do navegador apaga tudo. O app pede ao navegador para não apagar sozinho, mas o navegador pode negar.
9. **Não testado em aparelho.** WebView 113 e PWA instalada num celular de verdade não foram testados. A política da página foi
   testada no Chromium do computador, nos modos arquivo e HTTP.
