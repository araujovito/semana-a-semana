#!/usr/bin/env bash
# Monta semana-a-semana.apk a partir de app/ e android/, sem Gradle: aapt2 -> javac -> d8 -> zipalign -> apksigner.
# Requer ferramentas-android.sh rodado uma vez.
set -euo pipefail
cd "$(dirname "$0")"
A="$HOME/Android"; BT="$A/Sdk/build-tools/34.0.0"; PLAT="$A/Sdk/platforms/android-34/android.jar"
export JAVA_HOME="$A/jdk" PATH="$A/jdk/bin:$PATH"
[ -x "$BT/aapt2" ] && [ -f "$PLAT" ] || { echo "Ferramentas ausentes. Rode: bash ferramentas-android.sh"; exit 1; }
# A chave fica no projeto: atualizacoes do app so instalam por cima (mantendo os registros) se forem assinadas com a mesma chave.
# Sem a chave o script PARA: uma chave nova faria o celular recusar a atualização, e a única saída seria desinstalar, o que apaga
# os registros. Gerar outra só de propósito, num projeto que nunca foi instalado: NOVA_CHAVE=1 bash montar-apk.sh
if [ ! -f android/chave.keystore ]; then
  if [ "${NOVA_CHAVE:-}" = 1 ]; then
    keytool -genkeypair -keystore android/chave.keystore -storepass semana-a-semana -keypass semana-a-semana -alias app -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Semana a Semana"
  else
    echo "ERRO: android/chave.keystore não existe. Copie a chave original (ela não vai para o git: está no android/ da pasta principal do projeto) antes de compilar."
    echo "Um APK assinado com outra chave não instala por cima do que já está no celular, e desinstalar apaga os registros dela."
    echo "Só para um projeto que nunca foi instalado em celular nenhum: NOVA_CHAVE=1 bash montar-apk.sh"
    exit 1
  fi
fi
rm -rf build; mkdir -p build/gen build/obj build/dex
"$BT/aapt2" compile --dir android/res -o build/res.zip
"$BT/aapt2" link -o build/base.apk -I "$PLAT" --manifest android/AndroidManifest.xml -A app --java build/gen build/res.zip
javac -Xlint:-options -source 11 -target 11 -classpath "$PLAT" -d build/obj $(find android/java build/gen -name '*.java')
"$BT/d8" --lib "$PLAT" --min-api 26 --output build/dex $(find build/obj -name '*.class')
python3 -c "import zipfile;zipfile.ZipFile('build/base.apk','a',zipfile.ZIP_DEFLATED).write('build/dex/classes.dex','classes.dex')"
"$BT/zipalign" -f -p 4 build/base.apk build/alinhado.apk
"$BT/apksigner" sign --ks android/chave.keystore --ks-pass pass:semana-a-semana --key-pass pass:semana-a-semana --out semana-a-semana.apk build/alinhado.apk
"$BT/apksigner" verify --print-certs semana-a-semana.apk | head -1
ls -la semana-a-semana.apk
echo "Versão do cache da versão web (app/sw.js, VERSAO_APP): $(sed -n 's/^const VERSAO_APP = \"\([^\"]*\)\".*/\1/p' app/sw.js). Suba a cada entrega (ver LEIAME)."
