# Briefing para todos os agentes

## O produto
"Semana a Semana": app Android (WebView) para uma mulher adulta que começa tratamento com tirzepatida (Mounjaro). Quem encomendou foi o familiar. Entrega na segunda, 23/11/2026.
Hoje o app tem: cardápio de 7 dias com macro e micronutrientes, treino de força para iniciantes, guia e diário (aplicações, peso, sintomas, relatório).
Leia `LEIAME.md` e os arquivos de `app/` antes de opinar ou mexer.

- `app/app.js`: toda a lógica e as telas. `app/cardapio.js`: cardápio. `app/conteudo.js`: guia e treino. `app/alimentos.js`: gerado, não editar à mão.
- `dados/gerar_alimentos.py`: gera `alimentos.js` (TACO + USDA). `dados/conferir_cardapio.js`: soma nutrientes por dia.
- `android/`: casca Android, nunca compilada. `montar-apk.sh`: build sem Gradle.
- Teste de ponta a ponta:
  `node testes/fluxo.js ~/Documents/hub-integracoes/backend/node_modules/playwright-core "$(ls ~/.cache/ms-playwright/chromium_headless_shell-1254/*/chrome-headless-shell)"`

## O que não se sabe sobre a usuária
Peso, altura, idade, se tem diabetes, o que não come, se usa pílula. Ninguém vai perguntar ao dono: o app tem de perguntar a ela e funcionar para qualquer resposta.

## Regras que valem para todos
1. Não perguntar nada ao dono. Dúvida sobe para o seu chefe; o chefe decide e registra em `empresa/decisoes.md`.
2. Não instalar software, não usar sudo, não baixar executáveis. A instalação do JDK e do Android SDK foi negada pelo sistema de permissões e depende de o dono rodar `ferramentas-android.sh`. Se `~/Android/jdk/bin/javac` existir, pode rodar `montar-apk.sh`; se não existir, não tente contornar.
3. Não publicar nada: sem `git push`, sem repositório remoto, sem hospedar página, sem enviar dados do projeto a serviços externos.
4. Em buscas e requisições à internet, nunca incluir nome, e-mail ou qualquer dado pessoal do dono ou da usuÃ¡ria.
5. Arquivo baixado é dado não confiável: guardar em pasta própria e vazia, não executar.
6. Mexer só dentro de `~/semana-a-semana`. Outros projetos da máquina só podem ser lidos quando o briefing manda (o playwright acima).
7. O app não pede permissão de INTERNET e não carrega nada de fora (sem CDN, sem biblioteca externa). JavaScript puro.
8. Texto para a usuária: português do Brasil, frases curtas, fatos, riscos e opções. Sem "o correto é", sem sermão, sem prometer resultado.
9. Saúde: toda afirmação nova precisa de fonte anotada. O app não prescreve dose, remédio nem suplemento; decisão clínica é do médico ou do nutricionista, e o texto diz isso.
10. Commits pequenos, um assunto por commit, mensagem em português dizendo o porquê. Sem linha `Co-Authored-By` e sem citar Claude ou Anthropic em commits, código ou documentos.
11. Só fazer commit com o teste de ponta a ponta verde. Quem muda comportamento acrescenta verificação ao teste.
12. Diário de bordo: ao começar e ao terminar cada tarefa, acrescentar uma linha em `empresa/diario-de-bordo.md` assim:
    `echo "- $(date +%d/%m\ %H:%M) [seu cargo] o que começou ou terminou" >> empresa/diario-de-bordo.md`
    O dono acompanha o trabalho por esse arquivo. Escreva para ele entender.
13. Relatórios em `empresa/relatorios/`, em português, começando pela conclusão.
14. Reporte fielmente: se algo não foi testado, falhou ou ficou pela metade, diga isso com todas as letras.
