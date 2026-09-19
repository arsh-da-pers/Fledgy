#!/usr/bin/env bash
# Tell IndexNow (Bing, Yandex, Seznam, Naver) about new or updated pages, so
# they crawl within hours instead of whenever they next get round to us.
# Bing's index is what ChatGPT search leans on, so this is the fast lane for
# AI answers as much as for Bing itself.
#
#   scripts/indexnow.sh                      # every URL in the live sitemap
#   scripts/indexnow.sh /blog/some-new-post  # just these paths
#
# The key file (public/$KEY.txt) must already be deployed — IndexNow fetches it
# to prove we own the domain. Deploy first, submit second.
set -euo pipefail

HOST="fledgy.guide"
KEY="6da1c048b4738b0e8a995eb21d4abe81"
KEY_LOCATION="https://${HOST}/${KEY}.txt"

if [ "$#" -gt 0 ]; then
  URLS=()
  for arg in "$@"; do
    case "$arg" in
      http*) URLS+=("$arg") ;;
      /*)    URLS+=("https://${HOST}${arg}") ;;
      *)     URLS+=("https://${HOST}/${arg}") ;;
    esac
  done
else
  echo "Reading https://${HOST}/sitemap.xml ..."
  URLS=($(curl -fsS "https://${HOST}/sitemap.xml" | sed -n 's:.*<loc>\(.*\)</loc>.*:\1:p'))
fi

if [ "${#URLS[@]}" -eq 0 ]; then
  echo "No URLs to submit." >&2
  exit 1
fi

echo "Checking the key file is live ..."
if ! curl -fsS "$KEY_LOCATION" | grep -q "^${KEY}$"; then
  echo "Key file not reachable at $KEY_LOCATION — deploy it before submitting." >&2
  exit 1
fi

PAYLOAD=$(KEY="$KEY" HOST="$HOST" KEY_LOCATION="$KEY_LOCATION" python3 -c '
import json, os, sys
print(json.dumps({
    "host": os.environ["HOST"],
    "key": os.environ["KEY"],
    "keyLocation": os.environ["KEY_LOCATION"],
    "urlList": sys.argv[1:],
}))' "${URLS[@]}")

printf "Submitting %s URL(s):\n" "${#URLS[@]}"
printf "  %s\n" "${URLS[@]}"

STATUS=$(curl -sS -o /tmp/indexnow-response.txt -w "%{http_code}" \
  -X POST "https://api.indexnow.org/IndexNow" \
  -H "Content-Type: application/json; charset=utf-8" \
  --data-raw "$PAYLOAD")

case "$STATUS" in
  200|202) echo "OK (HTTP $STATUS) — accepted." ;;
  400) echo "HTTP 400: bad request — check the payload." >&2; cat /tmp/indexnow-response.txt >&2; exit 1 ;;
  403) echo "HTTP 403: key not valid for this host. Is $KEY_LOCATION deployed?" >&2; exit 1 ;;
  422) echo "HTTP 422: URLs don't match the host, or the key doesn't match." >&2; exit 1 ;;
  429) echo "HTTP 429: too many requests — try again later." >&2; exit 1 ;;
  *)   echo "Unexpected HTTP $STATUS" >&2; cat /tmp/indexnow-response.txt >&2; exit 1 ;;
esac
