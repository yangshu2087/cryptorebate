#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="$REPO_ROOT/web"
ENV_FILE="${1:-$WEB_DIR/.env.local}"
GITHUB_REPO="${GITHUB_REPO:-yangshu2087/cryptorebate}"
VERCEL_TARGET="${VERCEL_TARGET:-production}"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI not found" >&2
  exit 1
fi

if ! command -v npx >/dev/null 2>&1; then
  echo "npx not found" >&2
  exit 1
fi

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

KEYS=(
  AUTOMATION_GSC_ENABLED
  AUTOMATION_GSC_PROPERTY
  AUTOMATION_GSC_AUTH_MODE
  AUTOMATION_GSC_START_DAYS_AGO
  AUTOMATION_GSC_ROW_LIMIT
  AUTOMATION_GSC_SERVICE_ACCOUNT_JSON
  AUTOMATION_GSC_SERVICE_ACCOUNT_JSON_BASE64
  AUTOMATION_GSC_CLIENT_EMAIL
  AUTOMATION_GSC_PRIVATE_KEY
  AUTOMATION_GSC_CLIENT_ID
  AUTOMATION_GSC_CLIENT_SECRET
  AUTOMATION_GSC_REFRESH_TOKEN
)

PARTNER_EXCHANGES=(BINANCE OKX BYBIT BITGET GATE KUCOIN HUOBI)
PARTNER_FIELDS=(
  ENABLED
  PROVIDER
  URL
  FORMAT
  MODE
  METHOD
  AUTH_TYPE
  AUTH_HEADER
  TOKEN
  KEY
  SECRET
  PASSPHRASE
  REPORT_KIND
  BROKER_TYPE
  WINDOW_DAYS
  BODY_JSON
  FALLBACK_LOCALE
  FALLBACK_PAGE_TYPE
)

for exchange in "${PARTNER_EXCHANGES[@]}"; do
  for field in "${PARTNER_FIELDS[@]}"; do
    KEYS+=("AUTOMATION_PARTNER_${exchange}_${field}")
  done
done

pushd "$REPO_ROOT" >/dev/null

TMP_DIR="$(mktemp -d)"
cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

SYNCED=0

for key in "${KEYS[@]}"; do
  value="${!key-}"
  if [[ -z "${value}" ]]; then
    continue
  fi

  tmp_file="$TMP_DIR/$key"
  printf '%s' "$value" >"$tmp_file"

  gh secret set "$key" -R "$GITHUB_REPO" <"$tmp_file"

  npx vercel env rm "$key" "$VERCEL_TARGET" --yes >/dev/null 2>&1 || true
  npx vercel env add "$key" "$VERCEL_TARGET" <"$tmp_file" >/dev/null

  echo "Synced $key"
  SYNCED=$((SYNCED + 1))
done

popd >/dev/null

echo "Done. Synced $SYNCED automation keys to GitHub and Vercel."
