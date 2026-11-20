#!/usr/bin/env bash
# Celular virtual (Android 14) para testar o APK sem aparelho.
#   bash emulador.sh ligar            cria (na primeira vez) e liga o emulador sem janela; espera o Android subir
#   bash emulador.sh instalar         instala semana-a-semana.apk por cima (mantém os dados) e abre o app
#   bash emulador.sh foto arquivo.png captura a tela
#   bash emulador.sh toque X Y | texto "abc" | voltar | log
#   bash emulador.sh desligar
set -euo pipefail
cd "$(dirname "$0")"
A="$HOME/Android"; SDK="$A/Sdk"
export JAVA_HOME="$A/jdk" ANDROID_SDK_ROOT="$SDK" ANDROID_AVD_HOME="$A/avd" PATH="$A/jdk/bin:$SDK/platform-tools:$SDK/emulator:$SDK/cmdline-tools/latest/bin:$PATH"
AVD=semana
case "${1:-}" in
  ligar)
    mkdir -p "$ANDROID_AVD_HOME"
    [ -d "$ANDROID_AVD_HOME/$AVD.avd" ] || echo no | avdmanager create avd -n "$AVD" -k "system-images;android-34;default;x86_64" -d pixel_5 >/dev/null
    if ! adb devices | grep -q "emulator-.*device"; then
      nohup emulator -avd "$AVD" -no-window -no-audio -no-boot-anim -no-snapshot -gpu swiftshader_indirect > "$A/dl/emulador-exec.log" 2>&1 &
    fi
    adb wait-for-device
    for i in $(seq 1 120); do [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ] && break; sleep 2; done
    [ "$(adb shell getprop sys.boot_completed | tr -d '\r')" = "1" ] && echo "Android no ar: $(adb shell getprop ro.build.version.release | tr -d '\r')" || { echo "Não subiu; veja $A/dl/emulador-exec.log"; exit 1; } ;;
  instalar) adb install -r semana-a-semana.apk && adb shell am start -n br.semanaasemana/.MainActivity ;;
  foto) adb exec-out screencap -p > "$2" && echo "$2" ;;
  toque) adb shell input tap "$2" "$3" ;;
  texto) adb shell input text "$2" ;;
  voltar) adb shell input keyevent KEYCODE_BACK ;;
  log) adb logcat -d -t 300 | grep -iE "semanaasemana|chromium|AndroidRuntime|WebView" | tail -60 ;;
  desligar) adb emu kill || true ;;
  *) sed -n '2,8p' "$0" ;;
esac
