#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

if [ "${1:-}" = "--no-proto" ]; then
  shift
  exec pnpm expo run:android "$@"
fi

if command -v proto >/dev/null 2>&1; then
  exec proto exec --tools-from-config -- bash "$0" --no-proto "$@"
fi

exec pnpm expo run:android "$@"
