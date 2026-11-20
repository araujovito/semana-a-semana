#!/usr/bin/env bash
# Roda todos os testes: unidade (Node) e ponta a ponta (navegador sem janela). Sai com erro se qualquer um falhar.
# Uso: bash testar.sh            Opcional: CAPTURAS=/pasta bash testar.sh  (grava as telas)
set -uo pipefail
cd "$(dirname "$0")"
PW="${PLAYWRIGHT:-$HOME/Documents/hub-integracoes/backend/node_modules/playwright-core}"
CH="${CHROMIUM:-$(ls "$HOME"/.cache/ms-playwright/chromium_headless_shell-1254/*/chrome-headless-shell 2>/dev/null | head -1)}"
erro=0
echo "### Sintaxe"; for f in app/*.js testes/*.js testes/unidade/*.js dados/*.js; do node --check "$f" || erro=1; done
echo "### Unidade"; node testes/unidade.js || erro=1
echo "### Ponta a ponta"; node testes/fluxo.js "$PW" "$CH" ${CAPTURAS:+"$CAPTURAS"} || erro=1
[ "$erro" = 0 ] && echo "TUDO VERDE" || echo "HÁ FALHAS"
exit $erro
