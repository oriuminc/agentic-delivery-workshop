#!/usr/bin/env bash
# Lists project repos (child dirs with .git), one line each:
#   name | branch | changed files | origin
set -euo pipefail
cd "$(dirname "$0")/../.."
for d in */; do
  d=${d%/}; [ -d "$d/.git" ] || continue
  b=$(git -C "$d" branch --show-current 2>/dev/null || echo "?")
  n=$(git -C "$d" status --porcelain | wc -l | tr -d ' ')
  r=$(git -C "$d" remote get-url origin 2>/dev/null || echo "no-remote")
  echo "$d | branch=$b | changed=$n | $r"
done
