# Lab 1: harness progression

Same model, same ticket, same prompt. Only its setup changes.

## The activity

Run one ticket twice:

- **Without:** your ticket, pasted in, and nothing else. Move any context files aside first.
- **With:** the same ticket and the same prompt, plus an `AGENTS.md` with all three pieces below.

Then compare the two results.

## The three pieces

| Piece | Closes the gap | File |
|-------|----------------|------|
| **Map and rules** | It never saw how your team builds | [pieces/map-and-rules.md](pieces/map-and-rules.md) |
| **Test loop** | It has no way to check its own work | [pieces/test-loop.md](pieces/test-loop.md) |
| **Plan and review** | Nobody checked what it assumed | [pieces/plan-and-review.md](pieces/plan-and-review.md) |

[AGENTS.md](AGENTS.md) has all three together. Copy it to your repo root, fill in the placeholders as a group, and add [CLAUDE.md](CLAUDE.md) next to it. About twenty lines is enough. If your repo already has a context file, start from yours.

## Steps

1. **Set up.** Pick one ticket with clear acceptance criteria. Make a `with` and a `without` branch, or two worktrees ([cheat sheet](../00-setup/git-worktrees.md)). On `without`, move context files aside. On `with`, start from a generated draft (below), cut it down, then add the three pieces and fill them in. Add `CLAUDE.md` next to it.
2. **Run both.** A new chat on each side, with the same prompt:
   > Implement this ticket:
   > <pasted ticket text>

   Don't correct it mid-run. If it asks a question, answer in one line and note it. On the `with` side, approving its plan is allowed: that's part of the setup.
3. **Compare.** Read both diffs side by side, not the agent's summaries. Answer the three questions.

## Start from a draft: doing beats perfect

A rough file today beats a perfect one never.

- **Claude Code:** run `/init`. It reads the repo and writes a `CLAUDE.md`. Rename it to `AGENTS.md` and make `CLAUDE.md` the one line `@AGENTS.md`.
- **Cursor:** ask the agent:
  > Read this repo and draft an AGENTS.md: the folders that matter, how to run the tests, lint and typecheck, and the conventions a new developer would get wrong. Under 40 lines. Leave out anything you could work out from the code itself.

Then cut it down as a group. Generated drafts describe the codebase at length; keep only what the agent couldn't work out by reading the code. Then add the three pieces. Think of the result as your team's conventions, written down: every line is a review or QA comment nobody has to write again.

## Why every piece goes in the file

Keep the prompt identical on both sides, so the setup is the only difference. It's also the habit worth keeping: the file carries the instructions, so nobody has to remember to type them.
