---
name: merge
description: Merge a ticket's feat/<slug> commits into each repo's local main checkout and resolve conflicts or failing checks. Runs automatically after /commit in /orchestrator. Model-only, never user-invoked.
user-invocable: false
argument-hint: <slug> [repo ...]
---
# Merge

Brings the committed work from the worktrees into the local checkouts (`backend/`, `frontend/`) so they contain it. Local only: never push, never open or merge a PR, never touch a remote.

## 1. Scope
- `slug` is the first argument, otherwise `.runs/CURRENT`. Repos are the ones named, otherwise those in `.runs/<slug>/WORKTREES`.
- Skip a repo (and say why in the return) when it has no commits ahead of its base (`git -C <repo> rev-list --count main..feat/<slug>` is 0), or when the user denied its commit in `-i` mode.
- Merge backend first, then frontend, the same order as `/commit`.

## 2. Pre-flight (per repo, in the main checkout `<ROOT>/<repo>`)
- `git -C <repo> branch --show-current` must be `main` (or `master`). If not, stop for that repo and report it. Never switch the user's branch.
- `git -C <repo> status --short` must be empty. If the main checkout is dirty, stop for that repo and report the paths. Never stash, reset or discard the user's changes.
- The worktree on `feat/<slug>` must have no uncommitted changes. If it does, stop and report.

## 3. Merge
- `git -C <repo> merge --no-edit feat/<slug>`. Fast-forward is fine. Do not rebase, squash or rewrite the branch.
- Clean merge: go to step 4.
- Conflicts: list them with `git -C <repo> diff --name-only --diff-filter=U`, then resolve each. Read both sides and keep the intent of both. For `docs/API.md` or the `types.ts` files, the contract in `backend/docs/API.md` wins and the other two must match it. Never resolve by taking one side wholesale without reading the other. Run `git -C <repo> add <file>` per resolved file, then `git -C <repo> commit --no-edit`.
- Give up and `git -C <repo> merge --abort` when a conflict needs a product decision, or after 2 failed resolution attempts. Report the files and the question. Never leave a repo mid-merge.

## 4. Verify
Run `.claude/scripts/run-checks.sh <repo> all` (no slug, so it checks the main checkout). On FAIL:
- If the merge was clean, the failure is a pre-existing break on `main` or an interaction. Fix at most twice by briefing the `developer` agent with the FAILURES block and the main checkout path, then re-run.
- If still failing after 2 loops, `git -C <repo> reset --hard ORIG_HEAD` is NOT allowed. Revert with `git -C <repo> revert -m 1 HEAD` (merge commit) or report the fast-forward SHAs and stop, so the user decides.
- After a resolved conflict, a fix commit goes on `main` with a `fix(merge): ...` subject.

## 5. Safety
- Only `main`/`master` receives the merge. This is the one sanctioned write to a main checkout, and only through this skill.
- No `--force`, no `reset --hard`, no `git clean`, no `checkout .`, no branch deletion. The worktree and `feat/<slug>` stay; `worktree.sh remove` remains manual.
- Stage explicit paths only. Never stage `.env*`, `data/db.json`, `logs/`, `node_modules/`, `dist/` or `.runs/`.

## 6. Return (≤6 lines)
Per repo: `merged` / `fast-forwarded` / `skipped (<reason>)` / `blocked (<reason>)`, the resulting short SHA on main, the post-merge check verdict, and any conflicts resolved (file list only).
