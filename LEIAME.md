# Semana a Semana

App de acompanhamento de tratamento com tirzepatida: cardápio com macro e micronutrientes, treino de força para iniciantes, guia e diário (aplicações, peso, sintomas, relatório para a consulta).

- `app/`: o app inteiro em HTML, CSS e JavaScript puro. Abre no navegador (`app/index.html`) e funciona sem internet.
- `android/`: casca Android mínima (uma WebView). O manifesto não pede permissão de internet.
- `dados/gerar_alimentos.py`: monta `app/alimentos.js` a partir da TACO e do USDA SR Legacy (`dados/fontes/`).
- `dados/conferir_cardapio.js`: soma os nutrientes de cada dia do cardápio.
- `testes/fluxo.js`: teste de uso de ponta a ponta com Playwright.

## Montar o APK

    bash ferramentas-android.sh   # uma vez: baixa JDK e ferramentas do Android para ~/Android
    bash montar-apk.sh            # gera semana-a-semana.apk

Guarde `android/chave.keystore`. Uma versão nova só instala por cima da antiga, preservando os registros, se for assinada com a mesma chave.

## Limites

Os registros ficam no armazenamento local do app. Desinstalar apaga tudo; a aba Diário > Relatório tem exportação e restauração.
As metas são estimativas populacionais e podem ser substituídas pelas do médico ou nutricionista na aba Perfil.
