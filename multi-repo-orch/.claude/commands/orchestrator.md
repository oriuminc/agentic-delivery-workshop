---
description: Plan → TDD build → test → review → commit across every repo in this workspace. Usage /orchestrator <TICKET-KEY | "what to build"> [-i]
argument-hint: <ticket-key | "description"> [-i]
---
# Orchestrator

Input: `$ARGUMENTS`. If it contains `-i`, run in interactive mode. A token like `ABC-123` is a ticket key; otherwise it's a description.

You coordinate. Subagents do the work. Your context is a budget: it auto-compacts at 250k (`autoCompactWindow` in settings).

## Context rules
- Never read source files, full diffs or full logs yourself. Delegate those reads.
- Every subagent returns ≤15 lines. Details live in files under `.runs/<slug>/`.
- Checks run only through `.claude/scripts/run-checks.sh`, which prints only verdict lines.
- After each step, overwrite `.runs/<slug>/STATE.md`: step, status, decisions, open items, and paths. A hook re-injects it after compaction, so resume from it and not from memory.
- Each gate gets at most 2 fix loops. After that, stop and ask the user.
- Spend turns sparingly: every turn re-reads this whole context. Launch every independent subagent for a step in one message. When a hand-back needs no decision, don't write prose in reply; go straight to the next tool call. Update `STATE.md` once per step, not per agent. In that same Bash call, log each finished subagent's token count with `.claude/scripts/cost-report.sh tokens <slug> <agent> <n>` (the `subagent_tokens` in its completion notice), so the report can split cost per feature. Narrate only at the end of a step, in one line.

## Steps
0. **Setup**
   - **Split detection (first, before anything else).** Read the input and decide whether it holds more than one independent feature: different user-facing goals, different kinds of change (e.g. a behaviour change plus a visual theme change), or work that could ship, be reviewed or be reverted on its own. Shared files alone don't make it one feature.
     - If it is one feature, continue with a single slug.
     - If it is two or more, list the features back to the user in one line each and give each its own kebab-case slug (≤5 words) and its own description. Don't ask unless the split is ambiguous.
     - Each feature then runs its **own full workflow** (steps 1–7): its own `.runs/<slug>/`, plan, worktree, branch, tests, review and commit. Never combine them into one plan, worktree or branch. Always run them in parallel, never one after another: launch every feature's subagents in the same message at each step (planners together, then developers together, and so on). Shared files don't change this, since each feature has its own worktree and branch; any conflict is resolved by the `merge` skill at step 6.5. Give each its own report.
     - A ticket key is already one unit, so skip detection for it.
   - `slug` = the ticket key, or a kebab-case summary of the description (≤5 words). With a split, this is each feature's slug in turn.
   - `mkdir -p .runs/<slug> && echo <slug> > .runs/CURRENT`, then run `.claude/scripts/repos.sh` and `.claude/scripts/cost-report.sh start` (records the cost baseline for this run; a no-op if one exists).
   - If any repo has uncommitted changes, ask before continuing.
1. **Plan**: run the `planner` agent with the input and the slug. Relay its summary and open questions.
   - **Trivial path (skip the planner).** A feature is trivial when ALL hold: one repo, no API contract change, no auth/input-handling/personal-data surface, and the change is visual, copy or config only (a colour theme, a label, a spacing tweak). Then write `.runs/<slug>/PLAN.md` yourself, without reading any code: goal, 3–6 acceptance criteria, the repo, the behaviours to test one per line, and `Review: light`. The `developer` finds the files. When unsure, use the planner. Never take this path for a ticket key.
   - With `-i`, ask: approve, adjust (re-plan with the user's notes), or stop.
   - Without `-i`, pause only if there are blocking open questions.
2. **Worktrees**: run `.claude/scripts/worktree.sh create <slug> <repo>...` once, naming every repo the plan touches.
   - This is the only way work starts. Never run `git switch`, `git checkout -b` or `git worktree add` yourself, and never edit a main checkout.
   - It creates `.worktrees/<slug>/<repo>` on `feat/<slug>` (reusing it on a re-run), so tickets don't share a working tree.
   - Take `WORKTREE_ROOT=` from its output. If it fails, stop and show the user the error.
   - If the plan later needs another repo, run `create` again for it.
3. **Build**: run the `developer` agent once per repo, in the plan's order (contract owner first).
   - Brief: slug, repo, the worktree path (`<WORKTREE_ROOT>/<repo>`), and "follow PLAN.md for <repo>".
   - Run repos in parallel only if the plan says the contract is already fixed.
4. **Test**: run `.claude/scripts/run-checks.sh "<repo> <repo>" all <slug>` yourself (`all` = typecheck, unit/integration and Playwright e2e in Chrome; e2e must always run with the tests and verify the ticket's acceptance criteria), in one Bash call for all touched repos. It prints only verdict lines, so it costs almost nothing in context.
   - With a slug, e2e also saves screenshots as evidence under `.runs/<slug>/evidence/<repo>/` and prints `EVIDENCE <repo> <n> screenshots index=<path>`. Note each index path in `STATE.md` for the report. A `WARN … no screenshots captured` counts as a failed gate: pass it to `developer` like a FAIL. Never open the images yourself.
   - On FAIL, pass the FAILURES lines (and the log path) straight to `developer` for the repo that failed, then re-run the script yourself for all touched repos. No diagnosis agent.
5. **Review**: run one `reviewer` agent for all touched repos of a feature, with the slug and the worktree paths, plus each repo's evidence `INDEX.md` path so it can check the screenshots against the acceptance criteria.
   - If the plan says `Review: light`, skip the reviewer and mark Review ⏭️ in the report, with "light change, checks only". Never skip it for a feature with a contract change or a security surface.
   - On BLOCKER or MAJOR findings: `developer` fixes them, you re-run the checks script, then re-review. The re-review brief is narrow: the earlier finding ids to confirm fixed, the files the fix touched, and regressions only. Tell it not to re-audit the rest of the diff.
   - MINOR findings go in the report. They don't block.
6. **Commit**: follow `.claude/skills/commit/SKILL.md` for the touched repos' worktree paths, passing `-i` through.
   - Backend goes first, so the frontend PR can link to it.
   - With `-i`, the user approves, edits or denies each message, then approves push and PR.
6.5. **Merge**: run the `merge` skill (model-only) for the slug and the committed repos, automatically, with no prompt, even with `-i`.
   - It merges `feat/<slug>` into each local `main` checkout, resolves conflicts, and re-runs checks there. Local only: it never pushes.
   - Skipped for a repo whose commit was denied. If it reports `blocked`, surface that in the report and stop for the user.
7. **Report** (emoji-marked, as two tables; one header line first):
   - Header: `🚀 <slug> — done` (or `⚠️ <slug> — blocked at <step>`). With a split, one header line per feature, then a single table.
   - Results table: one row per feature and repo, with these columns:
     `| | Feature | Repo | Branch | Typecheck | Tests | Evidence | Review | Merge | PR | Cost |`
     Row shape: `| 🚀 | **<slug>** | 📦 <repo> | 🌿 `<branch>` | ✅ | ✅ <n> | 📸 [<n> shots](<absolute INDEX.md path>) | ✅ APPROVE | 🔀 `<sha>` | 🔗 <PR URL or "local only"> | 💰 ~$<cost> |`
     The first cell is 🚀 for done and ⚠️ for blocked. Name the slug on every row, including a feature's second repo.
   - Marks: ✅ pass/approved/done · ❌ fail or rejected · ⚠️ warning, skipped or blocked · ⏭️ not applicable · 🔀 merge result · 🔗 PR. Put the test count after ✅. If a gate needed fix loops, add one short note under the tables.
   - Extras table, `| Extras | |`, one row per non-empty item, in this order: `📸 Evidence` · `📝 MINOR` · `🧩 Stubs` · `❓ Open` · `🧹 Cleanup` (`.claude/scripts/worktree.sh remove <slug>`, keeps the branch; don't run it yourself). Show Stubs as "none" when empty.
   - **Evidence.** In the table, the Evidence cell links the repo's `INDEX.md` by absolute path, and shows ⏭️ for a repo with no e2e (e.g. backend). In the `📸 Evidence` extras row, per feature, link up to 6 named screenshots (the files not called `test-finished-*`; list them with `ls` or `head -n 12` on the INDEX, never read images) as `[<file>](<absolute path>)`. Screenshots stay local under `.runs/` (git-ignored); say so.
   - Never mark ✅ for something that didn't run; use ⏭️ or ⚠️ and say why.
   - **Costs.** Run `.claude/scripts/cost-report.sh report <slug>...` (every feature) and fill the `Cost` column. A feature's cost (its worktree) goes on its first row only, `—` on its other repo rows. Per-feature figures are estimates, so show `~$`. After the results table add one line: `💰 **Session total: $<n>** (this run: $<n>)`. If the script gives no session figure, write "⚠️ cost unavailable" and never invent one.
   - then clear `.runs/CURRENT`


## Never
- Commit to `main`, except the merge that step 6.5's `merge` skill performs.
- Write code or commit in a main checkout (`backend/`, `frontend/`). Use the worktree. Only the `merge` skill merges into it.
- Skip a failing gate.
- Push without an explicit yes in `-i` mode.
