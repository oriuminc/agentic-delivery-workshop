---
name: commit
description: Commit, push and open a PR for changed workspace repos, with a conventional commit message and a brief PR description (title, what it does, how to test). -i lets the user approve, edit or deny the message, then approve push + PR. Used by /orchestrator, or call /commit [-i] [repo...].
argument-hint: [-i] [repo ...]
---
# Commit

## 1. Scope
- **Repos**: the ones named in the arguments, otherwise every repo with `changed>0` from `.claude/scripts/repos.sh`.
  When `.runs/<slug>/WORKTREES` exists (an `/orchestrator` run), the repos are the paths listed there (`repo=<path>`), and `<repo>` below means that path. Never commit from the main checkout then.
- **Context**: if `.runs/CURRENT` exists, read the goal and acceptance criteria from `.runs/<slug>/PLAN.md`. They are the source for the message.
- **Gate**: if checks haven't passed this session, run `.claude/scripts/run-checks.sh <repo-name> all <slug>` first (omit the slug outside an `/orchestrator` run). On FAIL, stop.

## 2. Draft (per repo)
Run `git -C <repo> status --short` and `git -C <repo> diff --stat`. Read hunks only where the stat isn't enough.
- **Subject**: `<type>(<scope>): <summary>`, ≤72 chars, imperative. Add ` [KEY-123]` when there's a ticket. Types: feat, fix, refactor, test, docs, chore.
- **Body**: ≤4 bullets explaining *why*.
- **PR title**: the subject.
- **PR body**, saved to `.runs/<slug>/pr-<repo>.md`:
  ```
  ## What
  1–3 sentences on the change and the reason.
  ## How to test
  1. Concrete steps (commands, URLs, clicks) and the expected result.
  ## Related
  Ticket link, plus the companion PR in the other repo (if any).
  ```

## 3. Safety
- Never commit on `main` or `master`. Switch to `feat/<slug>` first.
- Stage explicit paths only. Never `git add -A`.
- Never stage `.env*`, `data/db.json`, `logs/`, `node_modules/`, `dist/` or `.runs/`.
- Never force-push.

## 4. Interactive (`-i`)
For each repo, show the subject, body and PR body, then AskUserQuestion:
- **Approve**
- **Edit**: take the user's text and show it again
- **Deny**: skip this repo
After every repo is committed, ask once: **Push + open PRs**, or **Keep local commits only**. Without `-i`: commit, push and open the PR right away.

## 5. Execute (per repo, backend first)
1. `git -C <repo> add <paths>`, then `git -C <repo> commit -F <msgfile>`.
2. If the repo has no `origin` remote, stop after the commit and say so.
3. `git -C <repo> push -u origin HEAD`.
4. `cd <repo> && gh pr create --title "<subject>" --body-file <pr-body>`.
5. When a frontend PR follows a backend PR, put the backend PR URL in the frontend body's Related section.

## 6. Return (≤6 lines)
Per repo: short SHA, branch, and PR URL (or "local only").
