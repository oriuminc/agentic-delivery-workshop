#!/usr/bin/env bash
# Usage: collect-logs.sh <search-term> [since=24h]
# Gathers what can be fetched deterministically (local app logs, git history)
# into .runs/rca/<term>/ and prints a compact index — never the raw logs.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$ROOT"
Q=${1:?search term required}; SINCE=${2:-24h}
SAFE=$(printf '%s' "$Q" | tr -c 'A-Za-z0-9_-' '_' | cut -c1-40); OUT=".runs/rca/$SAFE"; mkdir -p "$OUT"
hours=${SINCE%h}; [[ "$hours" =~ ^[0-9]+$ ]] || hours=24
echo "# RCA evidence index: '$Q' (since ${hours}h) → $OUT"
for f in */logs/*.log; do
  [ -f "$f" ] || continue
  grep -F -- "$Q" "$f" >"$OUT/local-${f%%/*}.log" 2>/dev/null
  n=$(wc -l <"$OUT/local-${f%%/*}.log" | tr -d ' ')
  echo "== local:$f — $n matching lines"; head -n 6 "$OUT/local-${f%%/*}.log" | cut -c1-300
  # Errors in the same window, even without the term (neighbouring failures)
  e=$(grep -c '"level":"error"' "$f" 2>/dev/null || true); echo "   ($e error lines total in file)"
done
for r in */; do
  r=${r%/}; [ -d "$r/.git" ] || continue
  git -C "$r" log --since="${hours} hours ago" --pretty='%h %ad %an %s' --date=short >"$OUT/git-$r.log"
  echo "== git:$r — $(wc -l <"$OUT/git-$r.log" | tr -d ' ') commits in window"; head -n 5 "$OUT/git-$r.log"
done
echo "== remote sources (fetch via MCP/CLI in a subagent, save to $OUT/<source>.log):"
for r in */; do [ -f "$r.vercel/project.json" ] && echo "   vercel: ${r%/} (linked)"; done
for r in */; do ls "$r"wrangler.* >/dev/null 2>&1 && echo "   cloudflare: ${r%/} (wrangler config)"; done
command -v vercel >/dev/null && echo "   vercel CLI available"; command -v wrangler >/dev/null && echo "   wrangler CLI available"
exit 0
