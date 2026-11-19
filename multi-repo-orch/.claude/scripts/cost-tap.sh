#!/usr/bin/env bash
# statusLine command. Hooks never receive session cost, but the statusline does
# (cost.total_cost_usd), and it runs after every assistant message. So this records the
# running total for cost-banner.sh, then hands the same JSON to the user's own statusline
# so the status bar looks exactly as before.
# Writes .runs/cost/<session_id>.cost (a bare number). No output of its own.
IN=$(cat)
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
sid=$(jq -r '.session_id // empty' <<<"$IN" 2>/dev/null)
cost=$(jq -r '.cost.total_cost_usd // empty' <<<"$IN" 2>/dev/null)
if [ -n "$sid" ] && [ -n "$cost" ]; then
  mkdir -p "$ROOT/.runs/cost"
  printf '%s\n' "$cost" >"$ROOT/.runs/cost/$sid.cost.tmp" && mv "$ROOT/.runs/cost/$sid.cost.tmp" "$ROOT/.runs/cost/$sid.cost"
fi
# Pass through to the personal statusline when it exists.
if [ -x "$HOME/.claude/statusline.sh" ]; then printf '%s' "$IN" | "$HOME/.claude/statusline.sh"; fi
exit 0
