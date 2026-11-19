#!/usr/bin/env bash
# Usage: pr-context.sh <pr-url | pr-number>
# Resolves which local repo owns the PR, saves diff + metadata under
# .runs/pr-<repo>-<n>/ and checks the PR head out into a worktree for testing.
# Prints only a short summary and the paths.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"; cd "$ROOT"
ARG=${1:?pr url or number required}; N=${ARG##*/}; REPO=""
for d in */; do
  d=${d%/}; [ -d "$d/.git" ] || continue
  url=$(git -C "$d" remote get-url origin 2>/dev/null || true); [ -n "$url" ] || continue
  slug=$(echo "$url" | sed -E 's#(git@github.com:|https://github.com/)##; s#\.git$##')
  if [[ "$ARG" == http* ]]; then [[ "$ARG" == *"/$slug/pull/"* ]] && { REPO=$d; break; }
  elif (cd "$d" && gh pr view "$N" --json number >/dev/null 2>&1); then REPO=$d; break; fi
done
[ -n "$REPO" ] || { echo "ERROR: no local repo owns PR '$ARG' (check origin remotes / gh auth)"; exit 1; }
OUT=".runs/pr-$REPO-$N"; mkdir -p "$OUT"; cd "$REPO"
gh pr view "$N" --json title,author,baseRefName,headRefName,body,url \
  --template '{{.url}}{{"\n"}}{{.title}} — @{{.author.login}} ({{.headRefName}} → {{.baseRefName}}){{"\n\n"}}{{.body}}' >"../$OUT/pr.md"
gh pr diff "$N" >"../$OUT/diff.patch"
git fetch -q origin "pull/$N/head:pr-$N" 2>/dev/null || git fetch -q -f origin "pull/$N/head:pr-$N"
WT="$ROOT/$OUT/wt"; [ -d "$WT" ] || git worktree add -q "$WT" "pr-$N"
if git diff --quiet "origin/$(gh pr view "$N" --json baseRefName -q .baseRefName)" "pr-$N" -- package-lock.json 2>/dev/null; then
  [ -e "$WT/node_modules" ] || ln -s "$ROOT/$REPO/node_modules" "$WT/node_modules"
else (cd "$WT" && npm ci --silent >/dev/null 2>&1) || echo "WARN: npm ci failed in worktree"; fi
echo "repo=$REPO pr=$N"; head -n 2 "../$OUT/pr.md"
echo "files: $(grep -c '^diff --git' "../$OUT/diff.patch") changed, +$(grep -c '^+[^+]' "../$OUT/diff.patch")/-$(grep -c '^-[^-]' "../$OUT/diff.patch") lines"
echo "pr=$OUT/pr.md diff=$OUT/diff.patch worktree=$OUT/wt"
