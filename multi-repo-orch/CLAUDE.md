# Folio workspace

A multi-repo project. Always start Claude Code from this folder.

| Repo | Stack | Port | Owns |
|---|---|---|---|
| `backend/` | Node · Express 5 · TypeScript · Vitest | 4000 | API, JSON store (`data/db.json`), the contract in `docs/API.md` |
| `frontend/` | React 19 · Vite · TypeScript · Vitest + Testing Library | 5173 | UI. Proxies `/api` to the backend |

Each repo is its own git repo with its own `CLAUDE.md`. This folder isn't a repo.
Run `./dev.sh` to start both (the app is at http://localhost:5173).

## Harness (`.claude/`)
| Piece | Kind | Model | Job |
|---|---|---|---|
| `/orchestrator <KEY \| "desc"> [-i]` | command | session | plan → build → test → review → commit |
| `planner` | agent | sonnet | ticket → `.runs/<slug>/PLAN.md` |
| `developer` | agent | sonnet | one repo per call, red-green-refactor TDD |
| `reviewer` | agent | sonnet | functional + security review → `REVIEW.md` |
| `/review-pr <url\|n> [--post]` | skill | session | review a PR, with tests run on its head. You can run it, and Claude can too when you ask for a PR review |
| `rules/testing.md`, `rules/code-hygiene.md` | rules | n/a | test naming and code hygiene. They load when matching files are read, and `reviewer` checks them |
| `/rca <id\|link\|screenshot>` | skill | session | logs → root cause → optional fix |
| `/commit [-i]` | skill | session | message + PR (what / how to test) |
| `merge` | skill (model-only) | session | runs after commit: merges `feat/<slug>` into each local `main`, resolves conflicts, re-checks. Never pushes |

## Context discipline
- Deterministic work runs in `.claude/scripts/*`, and only verdict lines reach the context.
  For example, `run-checks.sh` saves full logs to `.runs/logs/` and prints PASS/FAIL plus a short digest.
- Auto-compact fires at 250k tokens (`autoCompactWindow`). Orchestrator state lives in
  `.runs/<slug>/STATE.md` and is re-injected after compaction by a SessionStart hook.
- Subagents return ≤15 lines. Long output goes to a file, and only its path is returned.

## Cross-repo rules
- The API contract is `backend/docs/API.md`. The types in `backend/src/types.ts` and
  `frontend/src/types.ts` must match it. Change all three in the same feature.
- Every API error carries a `requestId`, which the UI shows as "Ref <id>". That id is the input for `/rca`.
- Branch per feature: `feat/<slug>`, using the same name in every repo touched.
- `.runs/` is scratch space (git-ignored inside repos). Never commit it.
