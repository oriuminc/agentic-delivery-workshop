#!/usr/bin/env bash
# Deterministic per-ticket git worktrees, so several tickets can run in parallel.
#
#   worktree.sh create <slug> <repo>...   create (or reuse) .worktrees/<slug>/<repo> on feat/<slug>
#   worktree.sh path   <slug> [repo]      print the worktree root (or one repo's path)
#   worktree.sh remove <slug>             remove the ticket's worktrees (FORCE=1 to drop dirty ones)
#
# Layout mirrors the workspace, so relative paths like backend/docs/API.md keep working:
#   .worktrees/<slug>/backend/    .worktrees/<slug>/frontend/
# Idempotent: re-running `create` reuses worktrees that already exist on the right branch.
# Prints one line per repo (`repo | branch | path | status`) and writes .runs/<slug>/WORKTREES.
# Env: BASE=<ref> branch point for a new branch. Default: the branch the repo's main checkout is on
#      right now (so unmerged groundwork such as e2e setup is included), else main, else master.
#      A notice is printed when that is not main/master.
#      INSTALL=1   run `npm ci` in each worktree instead of linking the main checkout's node_modules.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
die() { echo "worktree.sh: $*" >&2; exit 1; }

cmd=${1:-}; slug=${2:-}
[ -n "$cmd" ] && [ -n "$slug" ] || die "usage: worktree.sh create|path|remove <slug> [repo...]"
[[ $slug =~ ^[A-Za-z0-9][A-Za-z0-9._-]*$ ]] || die "bad slug '$slug' (letters, digits, . _ - only)"
shift 2

branch="feat/$slug"
WT_ROOT="$ROOT/.worktrees/$slug"
MANIFEST="$ROOT/.runs/$slug/WORKTREES"

is_repo()  { [ -e "$ROOT/$1/.git" ] && [ -d "$ROOT/$1" ]; }
default_base() {
  local cur; cur=$(git -C "$ROOT/$1" branch --show-current 2>/dev/null || true)
  if [ -n "$cur" ] && [ "$cur" != "$branch" ]; then echo "$cur"; return; fi
  for b in main master; do git -C "$ROOT/$1" rev-parse -q --verify "refs/heads/$b" >/dev/null && { echo "$b"; return; }; done
  die "$1: no main or master branch to branch from (set BASE=<ref>)"
}

create_one() {
  local repo=$1 wt="$WT_ROOT/$1" g status base
  is_repo "$repo" || die "'$repo' is not a git repo in $ROOT"
  g=(git -C "$ROOT/$repo")

  if [ -e "$wt/.git" ]; then
    # Reuse only if it is a worktree of this repo that is on the ticket branch.
    [ "$(git -C "$wt" branch --show-current)" = "$branch" ] || die "$wt exists but is not on $branch"
    status=reused
  else
    mkdir -p "$WT_ROOT"
    if "${g[@]}" rev-parse -q --verify "refs/heads/$branch" >/dev/null; then
      # Branch exists. git refuses if it is checked out elsewhere (e.g. the main checkout).
      "${g[@]}" worktree add "$wt" "$branch" >/dev/null 2>&1 \
        || die "$repo: $branch is checked out in another worktree ($("${g[@]}" worktree list --porcelain | awk -v b="refs/heads/$branch" '$1=="worktree"{p=$2} $1=="branch"&&$2==b{print p}'))"
      status="attached existing branch"
    else
      base="${BASE:-$(default_base "$repo")}"
      "${g[@]}" worktree add -b "$branch" "$wt" "$base" >/dev/null 2>&1 \
        || die "$repo: could not create worktree at $wt from $base"
      status="created from $base"
      case "$base" in main|master) ;; *) echo "worktree.sh: NOTE $repo: branched from '$base' (the main checkout's current branch), not main. Its commits ride along; BASE=main to override." >&2 ;; esac
    fi
  fi

  # Dependencies: link the main checkout's node_modules (fast, shared), or install fresh.
  if [ ! -e "$wt/node_modules" ] && [ -f "$wt/package.json" ]; then
    if [ "${INSTALL:-0}" = 1 ]; then
      (cd "$wt" && npm ci --silent >/dev/null 2>&1) || die "$repo: npm ci failed in $wt"
    elif [ -d "$ROOT/$repo/node_modules" ]; then
      ln -s "$ROOT/$repo/node_modules" "$wt/node_modules"
      # `node_modules/` in .gitignore matches directories only, not a symlink: exclude it locally.
      ex="$("${g[@]}" rev-parse --git-common-dir)/info/exclude"; ex="$(cd "$ROOT/$repo" && realpath "$ex")"
      grep -qxF '/node_modules' "$ex" 2>/dev/null || { mkdir -p "$(dirname "$ex")"; echo '/node_modules' >>"$ex"; }
    else
      status="$status; NO node_modules (run npm install in $repo, or INSTALL=1)"
    fi
  fi
  echo "$repo | $branch | $wt | $status"
}

case "$cmd" in
  create)
    [ $# -ge 1 ] || die "create needs at least one repo"
    mkdir -p "$ROOT/.runs/$slug"
    : >"$MANIFEST.tmp"
    for repo in "$@"; do
      line=$(create_one "$repo") || exit 1
      echo "$line"; echo "$repo=$WT_ROOT/$repo" >>"$MANIFEST.tmp"
    done
    # Keep earlier entries for repos not named this time; replace the ones that were.
    { [ -f "$MANIFEST" ] && grep -vE "^($(IFS='|'; echo "$*"))=" "$MANIFEST" || true; cat "$MANIFEST.tmp"; } >"$MANIFEST.new"
    mv "$MANIFEST.new" "$MANIFEST"; rm -f "$MANIFEST.tmp"
    echo "WORKTREE_ROOT=$WT_ROOT"
    ;;
  path)
    [ -d "$WT_ROOT" ] || die "no worktrees for '$slug' (run: worktree.sh create $slug <repo>...)"
    if [ -n "${1:-}" ]; then [ -e "$WT_ROOT/$1/.git" ] || die "no worktree for $1 under $WT_ROOT"; echo "$WT_ROOT/$1"; else echo "$WT_ROOT"; fi
    ;;
  remove)
    [ -d "$WT_ROOT" ] || { echo "nothing to remove for $slug"; exit 0; }
    for d in "$WT_ROOT"/*/; do
      repo=$(basename "$d"); [ -L "${d%/}" ] && { rm -f "${d%/}"; continue; }; [ -e "$d/.git" ] || continue
      [ -L "$d/node_modules" ] && rm "$d/node_modules"
      git -C "$ROOT/$repo" worktree remove ${FORCE:+--force} "$d" \
        || die "$repo: not removed (uncommitted changes? FORCE=1 to discard). Branch $branch is kept."
      echo "removed $repo worktree (branch $branch kept)"
    done
    rmdir "$WT_ROOT" 2>/dev/null || true
    rm -f "$MANIFEST"
    ;;
  *) die "unknown command '$cmd'" ;;
esac
