#!/usr/bin/env bash
# Baixa o JDK 17 (Temurin) e as ferramentas de build do Android para ~/Android. Sem sudo. Cerca de 500 MB.
# So precisa rodar uma vez. Para desfazer: apagar a pasta ~/Android.
set -euo pipefail
A="$HOME/Android"; mkdir -p "$A/dl" "$A/jdk" "$A/Sdk/cmdline-tools"
cd "$A/dl"
[ -x "$A/jdk/bin/javac" ] || { curl -fL -o jdk17.tar.gz "https://api.adoptium.net/v3/binary/latest/17/ga/linux/x64/jdk/hotspot/normal/eclipse"; tar -xzf jdk17.tar.gz -C "$A/jdk" --strip-components=1; }
[ -x "$A/Sdk/cmdline-tools/latest/bin/sdkmanager" ] || {
  curl -fL -o cmdtools.zip "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
  python3 -c "import zipfile,sys;zipfile.ZipFile('cmdtools.zip').extractall(sys.argv[1])" "$A/Sdk/cmdline-tools"
  mv "$A/Sdk/cmdline-tools/cmdline-tools" "$A/Sdk/cmdline-tools/latest"; chmod +x "$A/Sdk/cmdline-tools/latest/bin/"*
}
export JAVA_HOME="$A/jdk" PATH="$A/jdk/bin:$PATH"
# "yes" aceita as licencas do Android SDK (https://developer.android.com/studio/terms)
yes | "$A/Sdk/cmdline-tools/latest/bin/sdkmanager" --sdk_root="$A/Sdk" "build-tools;34.0.0" "platforms;android-34" >/dev/null
echo "Pronto: $("$A/jdk/bin/java" -version 2>&1 | head -1), build-tools $(ls "$A/Sdk/build-tools")"
