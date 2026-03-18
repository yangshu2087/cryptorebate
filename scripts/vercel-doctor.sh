#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="$ROOT_DIR/web"
VERCEL_SCOPE="${VERCEL_SCOPE:-yangshus-projects-d2e835f3}"
VERCEL_PROJECT="${VERCEL_PROJECT:-cryptorebate}"
MODE="${1:-check}"

log() {
  printf '\n[%s] %s\n' "$1" "$2"
}

die() {
  printf '\n[error] %s\n' "$1" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

usage() {
  cat <<'EOF'
Usage:
  scripts/vercel-doctor.sh
  scripts/vercel-doctor.sh check
  scripts/vercel-doctor.sh deploy

What it does:
  1. Verifies Vercel CLI and login status
  2. Re-links the repo root to the correct Vercel project
  3. Runs local lint and production build from web/
  4. Optionally creates a preview deployment

Notes:
  - Run this from the repository root.
  - This project already uses Root Directory = web in Vercel.
  - Do not deploy with "--cwd web", or Vercel will try to resolve web/web.
EOF
}

[[ -d "$WEB_DIR" ]] || die "Expected web app at $WEB_DIR"

case "$MODE" in
  check|deploy) ;;
  -h|--help|help)
    usage
    exit 0
    ;;
  *)
    usage
    die "Unsupported mode: $MODE"
    ;;
esac

log "check" "Verifying required commands"
require_cmd vercel
require_cmd npm

log "check" "Checking Vercel login"
if ! vercel whoami >/dev/null 2>&1; then
  die "Vercel CLI is not logged in. Run: vercel login"
fi

log "link" "Linking repo root to ${VERCEL_SCOPE}/${VERCEL_PROJECT}"
vercel link --yes --scope "$VERCEL_SCOPE" --project "$VERCEL_PROJECT" >/dev/null

log "lint" "Running npm run lint in web/"
(cd "$WEB_DIR" && npm run lint)

log "build" "Running npm run build in web/"
(cd "$WEB_DIR" && npm run build)

if [[ "$MODE" == "deploy" ]]; then
  log "deploy" "Creating Vercel preview deployment"
  (
    cd "$ROOT_DIR"
    vercel deploy --yes
  )
else
  log "done" "Preflight passed. Run scripts/vercel-doctor.sh deploy to publish a preview."
fi
