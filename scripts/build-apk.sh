#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [ "${1:-}" != "--no-proto" ] && command -v proto >/dev/null 2>&1; then
  exec proto exec --tools-from-config -- bash "$0" --no-proto "$@"
fi

if [ "${1:-}" = "--no-proto" ]; then
  shift
fi

pnpm expo prebuild --clean --platform android --no-install
(cd android && ./gradlew app:assembleRelease -PreactNativeArchitectures=arm64-v8a,armeabi-v7a)

mkdir -p dist
cp android/app/build/outputs/apk/release/app-release.apk dist/kosfix.apk

test -f dist/kosfix.apk
echo "APK: dist/kosfix.apk"
