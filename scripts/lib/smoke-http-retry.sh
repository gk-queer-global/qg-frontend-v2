#!/usr/bin/env bash
# Reusable HTTP retry helpers for deploy smoke tests.
#
# Run-wide deadline: call smoke_retry_init once at the start of a smoke run.
# All subsequent smoke_retry_deadline_exceeded / smoke_retry_sleep calls share
# that single budget (not one budget per check).
#
# Public API (after sourcing):
#   smoke_retry_init MAX_WAIT_SEC INITIAL_DELAY_SEC
#     Validates both values are positive integers; sets SMOKE_RETRY_DEADLINE and
#     SMOKE_RETRY_DELAY. Exits 64 on invalid config.
#
#   smoke_retry_deadline_exceeded
#     Returns 0 when the run-wide retry budget is exhausted.
#
#   smoke_retry_sleep
#     Sleeps for the current backoff (capped by remaining budget), then doubles
#     delay up to 30s. No-op when no time remains.
#
#   smoke_retry_curl_fetch URL [BASIC_AUTH]
#     Performs one GET. Sets SMOKE_FETCH_CODE and SMOKE_FETCH_BODY from that
#     single response. On curl connect/transfer failure, SMOKE_FETCH_CODE is
#     exactly "000" (never "000000") and SMOKE_FETCH_BODY is empty.

smoke_retry_init() {
  local max_wait=$1 initial_delay=$2
  if ! [[ "$max_wait" =~ ^[1-9][0-9]*$ ]]; then
    printf '%s\n' "SMOKE_MAX_WAIT_SEC must be a positive integer (got: ${max_wait:-<unset>})" >&2
    exit 64
  fi
  if ! [[ "$initial_delay" =~ ^[1-9][0-9]*$ ]]; then
    printf '%s\n' "SMOKE_INITIAL_DELAY_SEC must be a positive integer (got: ${initial_delay:-<unset>})" >&2
    exit 64
  fi
  SMOKE_RETRY_DEADLINE=$((SECONDS + max_wait))
  SMOKE_RETRY_DELAY=$initial_delay
}

smoke_retry_deadline_exceeded() {
  ((SECONDS >= SMOKE_RETRY_DEADLINE))
}

smoke_retry_sleep() {
  local remaining=$((SMOKE_RETRY_DEADLINE - SECONDS))
  local sleep_for=$SMOKE_RETRY_DELAY
  if ((sleep_for > remaining)); then
    sleep_for=$remaining
  fi
  if ((sleep_for > 0)); then
    sleep "$sleep_for"
  fi
  if ((SMOKE_RETRY_DELAY < 30)); then
    SMOKE_RETRY_DELAY=$((SMOKE_RETRY_DELAY * 2))
  fi
}

smoke_retry_curl_fetch() {
  local url=$1 auth=${2:-}
  local tmp code curl_status=0

  tmp=$(mktemp)
  if [ -n "$auth" ]; then
    code=$(curl -sS -o "$tmp" -w '%{http_code}' -u "$auth" "$url" 2>/dev/null) || curl_status=$?
  else
    code=$(curl -sS -o "$tmp" -w '%{http_code}' "$url" 2>/dev/null) || curl_status=$?
  fi

  if [ "$curl_status" -ne 0 ]; then
    SMOKE_FETCH_CODE=000
    SMOKE_FETCH_BODY=
    rm -f "$tmp"
    return 0
  fi

  SMOKE_FETCH_CODE=$code
  SMOKE_FETCH_BODY=$(<"$tmp")
  rm -f "$tmp"
}
