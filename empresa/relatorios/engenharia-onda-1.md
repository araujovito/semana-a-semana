# Engenharia, onda 1: parada por limite de uso (20/11)

**Conclusão: main está verde (`bash testar.sh`), mas os dois achados que barram a entrega (A1 e A2) NÃO estão em main.** O trabalho deles está pela metade nas cópias de trabalho. O APK de main não foi recompilado nem aberto no emulador depois destas mudanças.

## O que entrou em main (ponta: d9cae0f)
- 33e2414 app.js repartido por área (telas idênticas, conferido). 5f3aa47 formato de dados v2 com migração. e74724c testes por área, unidade e `bash testar.sh`. ad71f61 barra de abas escondida sem perfil. 8c5a0e8 e 5b73f3a marcas de restrição/setor e pontos de encaixe.
- 7ff647b base do app: virada do dia (B2, achado 4), falha ao salvar e dado de versão desconhecida (B6, achados 8 e 21), restauração que confere tipos (20), diálogos da página, campo obrigatório, troca de aba sem histórico, `window.aoVoltar()`, barra de abas some com teclado (parte de B8: achados 15, 16, 17, 22), relógio fixo nos testes de ponta a ponta.
- 7e681fb e 6f8fbf4: guia e treino em segunda pessoa (parte de B1).
- d9cae0f: dados (B10, achado 14) e quarta-feira a 1.362 kcal (parte de B4). Média semanal: vitamina A 1.002 para 799 µg, folato 496 para 439, vitamina D 7,8 para 7,1, cálcio 1.011 para 991 mg (99%).

## Pela metade (nada disto está em main)
Cópias em `.copias/<nome>`, ramo `onda1-<nome>`.
- **peso** (2 commits, verdes no ramo): B11, edição de peso e sintomas, modo discreto, datas. Juntado a main falha 1 teste (`fluxo-peso-sintomas.js`, apagar registro em edição): o teste conta com o `confirm()` do navegador e main agora usa diálogo da página. Próximo passo: trocar `alert`/`confirm` de peso.js/sintomas.js por `alerta`/`confirmar`, ajustar o teste (`t.sim()`), juntar.
- **android** (1 commit, 6c524dd, verde e compilado no ramo): tema escuro, botão voltar, teclado, cartão de calendário (B13), texto de privacidade (B9). Não juntado nem revisado por mim. Tem `aoVoltar()` e teclado provisórios em aparelho.js que duplicam os de inicio.js: remover na junção. Calendário não foi visto preenchido (o app de calendário do emulador quebra). Faltam testes, `ferramentas-android.sh` e `montar-apk.sh`.
- **plano** (sem commit, teste vermelho): A2 inteiro, B3, piso de B4, trocas automáticas, tudo escrito em nutricao.js/perfil.js/plano.js e não testado. Próximo passo: atualizar fluxo-perfil.js/fluxo-plano.js, rodar unidade/nutricao.js, listar os textos de saúde. Decisão pendente: ele usou a meta informada pelo médico como piso do dia quando é menor que 1.200.
- **tratamento** (sem commit, 3 arquivos mexidos): A1, B12, hipoglicemia, edição de aplicações. Estado desconhecido: o engenheiro não respondeu antes da parada.
- **hoje** (1 commit, 2794753, verde no ramo): porção parcial com botão de proteína, dias anteriores (B7), enjoo que preserva as marcas (B5), aviso de comer pouco (B4), modo discreto. Não juntado nem revisado por mim; o engenheiro não olhou as capturas. Campos novos a documentar em nucleo.js: `dias[data].comidoEnjoo`, `ui.avisoPouco`. Textos de saúde novos (cartão "Assunto para o médico") estão em hoje.js, para a auditoria.

## Próximo passo de cada item
- A1: retomar `.copias/tratamento`; testes de unidade com relógio fixo. A2: retomar `.copias/plano`; depois chamar `avisoPesoBaixo()`/`avisoGestante()` na tela Hoje.
- B1: falta hoje, tratamento, perfil, plano, sintomas (nos ramos). B2: feito. B3: em plano. B4: avisos em hoje, piso em plano. B5: em hoje. B6: feito.
- B7: peso/sintomas no ramo peso; aplicações em tratamento; dias passados em hoje. B8: lado da página feito; lado Android no ramo android. B9, B13: ramo android. B10: feito. B11: ramo peso. B12: em tratamento.
- Depois de juntar tudo: varrer `alert(`/`confirm(`/`location.hash =` restantes, recompilar o APK e abrir no emulador, atualizar o LEIAME (não foi atualizado).

## Para a auditoria conferir
Aveia marcada como glúten; dez alimentos novos na base com medida caseira estimada (bebida de soja com dado americano fortificado); correção de folato por umidade é estimativa; texto novo "Ritmo de perda" (só no ramo peso).
