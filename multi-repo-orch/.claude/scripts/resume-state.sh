#!/usr/bin/env bash
# SessionStart(compact) hook: re-injects the active orchestrator run's state
# so a compacted orchestrator resumes from files, not from memory.
cd "$(dirname "$0")/../.." || exit 0
[ -s .runs/CURRENT ] || exit 0
S=".runs/$(cat .runs/CURRENT)/STATE.md"
[ -f "$S" ] && { echo "Resuming orchestrator run — state from $S:"; cat "$S"; }
exit 0
