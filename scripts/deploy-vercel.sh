#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-production}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f ".vercel/project.json" ]]; then
  echo "Missing .vercel/project.json in repo root. Run: npx vercel link --project cryptorebate --yes"
  exit 1
fi

if ! grep -q '"projectName":"cryptorebate"' .vercel/project.json; then
  echo "Repo root is not linked to Vercel project 'cryptorebate'."
  echo "Current link: $(cat .vercel/project.json)"
  exit 1
fi

if [[ "$MODE" == "preview" ]]; then
  exec npx vercel
fi

exec npx vercel --prod
