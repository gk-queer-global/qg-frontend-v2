#!/usr/bin/env bash
# Smoke-test a basic-auth gated static site (Cloudflare Pages middleware).
#
# Usage: smoke-basic-auth.sh <base-url>
#
# Env:
#   BASIC_AUTH_USER / BASIC_AUTH_PASS  credentials for authorized requests (required)
#   SMOKE_PATHS      space-separated paths (default "/ /about /blog /favicon.ico")
#   SMOKE_MAX_WAIT_SEC       total retry budget after deploy propagation (default 180)
#   SMOKE_INITIAL_DELAY_SEC  first retry sleep in seconds (default 2)
set -euo pipefail

usage() { echo "usage: $0 <base-url>" >&2; exit 64; }
if [ $# -ne 1 ]; then usage; fi
BASE=${1%/}
: "${BASIC_AUTH_USER:?BASIC_AUTH_USER is required}"
: "${BASIC_AUTH_PASS:?BASIC_AUTH_PASS is required}"
PATHS=${SMOKE_PATHS:-"/ /about /blog /favicon.ico"}
SMOKE_MAX_WAIT_SEC=${SMOKE_MAX_WAIT_SEC:-180}
SMOKE_INITIAL_DELAY_SEC=${SMOKE_INITIAL_DELAY_SEC:-2}

log() { printf '%s\n' "$*" >&2; }

# Any 2xx/3xx without credentials means the staging gate is open.
is_ungated_status() {
  local code=$1
  [[ "$code" =~ ^[23][0-9]{2}$ ]]
}

# Propagation / edge errors we may retry; never retry an ungated success.
is_transient_status() {
  local code=$1 want=$2 unauth=$3
  if [ -z "$code" ] || [ "$code" = "000" ]; then
    return 0
  fi
  if [ "$unauth" = "1" ] && is_ungated_status "$code"; then
    return 1
  fi
  case "$code" in
    404|429|502|503|504|520|521|522|523|524|525|526|530) return 0 ;;
  esac
  if [[ "$code" =~ ^5 ]]; then
    return 0
  fi
  if [ "$want" = "200" ] && [ "$code" = "401" ]; then
    return 0
  fi
  return 1
}

fetch_http_code() {
  local url=$1 auth=$2
  if [ -n "$auth" ]; then
    curl -sS -o /dev/null -w '%{http_code}' -u "$auth" "$url" 2>/dev/null || printf '000'
  else
    curl -sS -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || printf '000'
  fi
}

check_status() {
  local url=$1 want=$2 auth=$3
  local unauth=0
  [ -z "$auth" ] && unauth=1
  local started=$SECONDS
  local delay=$SMOKE_INITIAL_DELAY_SEC
  local code

  while true; do
    code=$(fetch_http_code "$url" "$auth")
    if [ "$code" = "$want" ]; then
      log "ok HTTP $want $url"
      return 0
    fi
    if [ "$unauth" = "1" ] && is_ungated_status "$code"; then
      log "::error::ungated HTTP $code for $url (expected $want without credentials)"
      return 1
    fi
    if ! is_transient_status "$code" "$want" "$unauth"; then
      log "::error::expected HTTP $want for $url (got $code)"
      return 1
    fi
    if (( SECONDS - started >= SMOKE_MAX_WAIT_SEC )); then
      log "::error::expected HTTP $want for $url (got $code, retries exhausted)"
      return 1
    fi
    log "transient HTTP $code for $url (want $want), retrying in ${delay}s"
    sleep "$delay"
    if (( delay < 30 )); then
      delay=$((delay * 2))
    fi
  done
}

fetch_body_with_auth() {
  local url=$1 auth=$2
  curl -sS -u "$auth" "$url" 2>/dev/null || true
}

check_home_shell() {
  local url=$1 auth=$2
  local started=$SECONDS
  local delay=$SMOKE_INITIAL_DELAY_SEC
  local body code

  while true; do
    code=$(fetch_http_code "$url" "$auth")
    if [ "$code" = "200" ]; then
      body=$(fetch_body_with_auth "$url" "$auth")
      if grep -q '<div id="root">' <<<"$body"; then
        log "ok authorized home page contains SPA root"
        return 0
      fi
      log "::error::authorized GET $url returned 200 but not the SPA shell"
      return 1
    fi
    if ! is_transient_status "$code" "200" "0"; then
      log "::error::authorized GET $url expected 200 with SPA shell (got HTTP $code)"
      return 1
    fi
    if (( SECONDS - started >= SMOKE_MAX_WAIT_SEC )); then
      log "::error::authorized GET $url expected 200 with SPA shell (got HTTP $code, retries exhausted)"
      return 1
    fi
    log "transient HTTP $code for $url (want 200 + SPA shell), retrying in ${delay}s"
    sleep "$delay"
    if (( delay < 30 )); then
      delay=$((delay * 2))
    fi
  done
}

auth="$BASIC_AUTH_USER:$BASIC_AUTH_PASS"
failed=0

for path in $PATHS; do
  url="$BASE$path"
  check_status "$url" 401 "" || failed=1
  check_status "$url" 200 "$auth" || failed=1
done

check_home_shell "$BASE/" "$auth" || failed=1

exit "$failed"
