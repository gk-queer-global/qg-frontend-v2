#!/usr/bin/env bash
# Sync staging basic-auth credentials to Cloudflare Pages project secrets.
# Values are read from env and piped to wrangler (never echoed).
#
# Usage: sync-pages-basic-auth-secrets.sh <pages-project>
#
# Env:
#   CLOUDFLARE_API_TOKEN              (required)
#   CLOUDFLARE_ACCOUNT_ID             (required)
#   QUEERGLOBAL_BASIC_AUTH_USER         GitHub secret -> Pages BASIC_AUTH_USER (required)
#   QUEERGLOBAL_BASIC_AUTH_PASS         GitHub secret -> Pages BASIC_AUTH_PASS (required)
set -euo pipefail

usage() { echo "usage: $0 <pages-project>" >&2; exit 64; }
if [ $# -ne 1 ]; then usage; fi
PROJECT=$1
: "${CLOUDFLARE_API_TOKEN:?CLOUDFLARE_API_TOKEN is required}"
: "${CLOUDFLARE_ACCOUNT_ID:?CLOUDFLARE_ACCOUNT_ID is required}"
: "${QUEERGLOBAL_BASIC_AUTH_USER:?QUEERGLOBAL_BASIC_AUTH_USER is required}"
: "${QUEERGLOBAL_BASIC_AUTH_PASS:?QUEERGLOBAL_BASIC_AUTH_PASS is required}"

put_secret() {
  local name=$1 value=$2
  printf '%s' "$value" | npx --yes wrangler@3.114.17 pages secret put "$name" --project-name "$PROJECT"
}

put_secret BASIC_AUTH_USER "$QUEERGLOBAL_BASIC_AUTH_USER"
put_secret BASIC_AUTH_PASS "$QUEERGLOBAL_BASIC_AUTH_PASS"
echo "pages secrets BASIC_AUTH_USER and BASIC_AUTH_PASS: synced for $PROJECT"
