#!/usr/bin/env bash
# Usage: run-checks.sh [repo|path|all] [test|e2e|typecheck|build|all] [slug]
# With a slug, repos resolve inside .worktrees/<slug>/ (never the main checkout); logs stay in .runs/logs/.
# Runs npm scripts outside the model's context. Full logs go to .runs/logs/;
# only a one-line verdict per check (+ a short failure digest) is printed.
# With a slug, e2e also saves screenshots to .runs/<slug>/evidence/<repo>/ and prints an EVIDENCE line (count + INDEX.md path).
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$ROOT"
REPOS=${1:-all}; TASKS=${2:-all}; TAIL=${TAIL:-8}
SLUG=${3:-}; BASE_DIR=.
if [ -n "$SLUG" ]; then
  BASE_DIR=".worktrees/$SLUG"; [ -d "$BASE_DIR" ] || { echo "FAIL no worktrees for '$SLUG' (run .claude/scripts/worktree.sh create $SLUG <repo>...)"; exit 2; }
fi
[ "$REPOS" = all ] && REPOS=$(for d in "$BASE_DIR"/*/; do [ -f "$d/package.json" ] && basename "$d"; done)
# "test" = unit + integration; "e2e" = Playwright in real Chrome. "test" always pulls in "e2e".
[ "$TASKS" = all ] && TASKS="typecheck test e2e"
case " $TASKS " in *" test "*) case " $TASKS " in *" e2e "*) ;; *) TASKS="$TASKS e2e";; esac;; esac  # unit/integration runs always bring e2e
mkdir -p .runs/logs; status=0
# e2e isolation: each run gets two free ports (unless E2E_API_PORT/E2E_WEB_PORT are set) and a fresh
# throw-away DB dir, so parallel features and re-runs never share ports or leftover entries.
free_port() { python3 -c 'import socket;s=socket.socket();s.bind(("127.0.0.1",0));print(s.getsockname()[1])'; }
for r in $REPOS; do
  for t in $TASKS; do
    script=$t; [ "$t" = e2e ] && script=test:e2e
    grep -q "\"$script\":" "$BASE_DIR/$r/package.json" || { echo "SKIP $r:$t (no script)"; continue; }
    # e2e starts the sibling backend via ../backend. A worktree set that touches only one repo has no
    # sibling, so link the main checkout's repo in for the run (removed right after; never committed).
    tmp_links=()
    if [ "$t" = e2e ] && [ -n "$SLUG" ]; then
      for sib in backend frontend; do
        [ "$sib" != "$r" ] && [ -d "$sib" ] && [ ! -e "$BASE_DIR/$sib" ] && ln -s "$ROOT/$sib" "$BASE_DIR/$sib" && tmp_links+=("$BASE_DIR/$sib")
      done
    fi
    log=".runs/logs/$(date +%H%M%S)-$(echo "$r" | tr '/' '_')-$t.log"; s=$SECONDS
    e2e_env=()
    if [ "$t" = e2e ]; then
      ap=${E2E_API_PORT:-$(free_port)}; wp=${E2E_WEB_PORT:-$(free_port)}
      rm -rf "${TMPDIR:-/tmp}/folio-e2e-$wp" "$(node -p "require('os').tmpdir()")/folio-e2e-$wp"
      e2e_env=(E2E_API_PORT="$ap" E2E_WEB_PORT="$wp")
      # Evidence: with a slug, Playwright keeps a screenshot of every test (pass or fail) under
      # .runs/<slug>/evidence/<repo>/raw/. playwright.config.ts reads E2E_EVIDENCE and E2E_OUTPUT_DIR.
      if [ -n "$SLUG" ]; then
        ev_dir="$ROOT/.runs/$SLUG/evidence/$r"; rm -rf "$ev_dir"; mkdir -p "$ev_dir"
        e2e_env+=(E2E_EVIDENCE=1 E2E_OUTPUT_DIR="$ev_dir/raw")
      fi
    fi
    if (cd "$BASE_DIR/$r" && env "${e2e_env[@]}" CI=1 npm run -s "$script") 2>&1 | sed $'s/\x1b\\[[0-9;]*m//g' >"$log"; [ "${PIPESTATUS[0]}" -eq 0 ]; then
      echo "PASS $r:$t ($((SECONDS - s))s) $(grep -E '^ *(Tests +[0-9]|[0-9]+ passed)' "$log" | tail -1 | tr -s ' ')"
    else
      status=1; echo "FAIL $r:$t ($((SECONDS - s))s) log=$log"
      grep -E ' FAIL |✘|AssertionError|Timeout|expect\(|Error:|error TS|Expected|Received|❯ .*:[0-9]+' "$log" | head -n 12 | cut -c1-220
      echo "  …"; grep -vE '^\s*$' "$log" | tail -n "$TAIL" | cut -c1-220
    fi
    if [ "$t" = e2e ] && [ -n "$SLUG" ]; then
      n=$(find "$ev_dir/raw" -name '*.png' 2>/dev/null | wc -l | tr -d ' ')
      if [ "$n" -gt 0 ]; then
        { echo "# Evidence: $r ($SLUG)"; echo
          (cd "$ev_dir" && find raw -name '*.png' | sort | while read -r f; do echo "- [$f]($f)"; done)
        } > "$ev_dir/INDEX.md"
        echo "EVIDENCE $r $n screenshots index=$ev_dir/INDEX.md"
      else
        echo "WARN $r:e2e no screenshots captured (does playwright.config.ts honour E2E_EVIDENCE / E2E_OUTPUT_DIR?)"
      fi
    fi
    [ "$t" = e2e ] && rm -rf "$(node -p "require('os').tmpdir()")/folio-e2e-$wp"
    for l in "${tmp_links[@]:-}"; do [ -n "$l" ] && rm -f "$l"; done
  done
done
exit $status
