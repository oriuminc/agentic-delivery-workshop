#!/usr/bin/env bash
# Stop hook (runs after each answer, no polling). When the session's cost crosses a new
# multiple of COST_STEP (default $5), prints a double-line banner and appends it to
# .runs/cost/cost.log. Jumping from $4 to $12 prints $10 once, with the actual figure.
# Reads the total written by cost-tap.sh. Never blocks: always exits 0.
IN=$(cat)
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
STEP=${COST_STEP:-5}
sid=$(jq -r '.session_id // empty' <<<"$IN" 2>/dev/null)
[ -n "$sid" ] && [ -f "$ROOT/.runs/cost/$sid.cost" ] || exit 0
cost=$(cat "$ROOT/.runs/cost/$sid.cost")
mark_file="$ROOT/.runs/cost/$sid.milestone"
last=$(cat "$mark_file" 2>/dev/null || echo 0)
# Integer milestone: floor(cost / STEP) * STEP, computed in awk to avoid float math in bash.
ms=$(awk -v c="$cost" -v s="$STEP" 'BEGIN { printf "%d", int(c / s) * s }')
[ "$ms" -gt "$last" ] 2>/dev/null || exit 0
echo "$ms" >"$mark_file"

slug=$(cat "$ROOT/.runs/CURRENT" 2>/dev/null || echo "-")
now=$(date '+%Y-%m-%d %H:%M:%S')
line1=$(printf 'API COST  $%d  MILESTONE' "$ms")
line2=$(printf 'actual $%.2f   run %s   %s' "$cost" "$slug" "$now")
w=${#line2}; [ ${#line1} -gt "$w" ] && w=${#line1}
bar=$(printf '═%.0s' $(seq 1 $((w + 2))))
pad() { printf '║ %-*s ║' "$w" "$1"; }
banner=$(printf '╔%s╗\n%s\n%s\n╚%s╝' "$bar" "$(pad "$line1")" "$(pad "$line2")" "$bar")

printf '%s\n' "$banner" >>"$ROOT/.runs/cost/cost.log"
jq -n --arg m "$banner" '{systemMessage: $m}'
exit 0
