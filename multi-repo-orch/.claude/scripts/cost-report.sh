#!/usr/bin/env bash
# Cost figures for the orchestrator report.
#   cost-report.sh start                 record the session's running cost as this run's baseline
#   cost-report.sh tokens <slug> <agent> <n>   log one subagent's token count against a feature
#   cost-report.sh report <slug>...      print per-feature (per-worktree) cost and the session total
# The session cost comes from cost-tap.sh (.runs/cost/<session_id>.cost, the newest file = this session).
# Per-feature cost is an ESTIMATE: the run's spend since `start` is split across features by the share of
# subagent tokens each logged. Orchestrator overhead is spread the same way. Session total is exact.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; C="$ROOT/.runs/cost"
cur() { f=$(ls -t "$C"/*.cost 2>/dev/null | head -1); [ -n "$f" ] && cat "$f" || echo 0; }
case "${1:-}" in
  start)  mkdir -p "$C"; [ -f "$C/run.start" ] || cur >"$C/run.start"; echo "baseline \$$(cat "$C/run.start")" ;;
  tokens) [ $# -eq 4 ] || { echo "usage: tokens <slug> <agent> <n>" >&2; exit 2; }
          mkdir -p "$ROOT/.runs/$2"; echo "$3 $4" >>"$ROOT/.runs/$2/TOKENS" ;;
  report) shift; total=$(cur); base=$(cat "$C/run.start" 2>/dev/null || echo 0)
          for s in "$@"; do t=$(awk '{n+=$2} END{print n+0}' "$ROOT/.runs/$s/TOKENS" 2>/dev/null); echo "$s $t"; done |
          awk -v tot="$total" -v base="$base" '
            {slug[NR]=$1; tk[NR]=$2; all+=$2}
            END{ run=tot-base; if(run<0) run=0
              for(i=1;i<=NR;i++){ share=(all>0)?tk[i]/all:1/NR
                printf "COST %s | ~$%.2f\n", slug[i], run*share }
              printf "COST run | $%.2f this run (est. split above)\n", run
              printf "COST session total | $%.2f\n", tot }' ;;
  *) echo "usage: cost-report.sh start | tokens <slug> <agent> <n> | report <slug>..." >&2; exit 2 ;;
esac
