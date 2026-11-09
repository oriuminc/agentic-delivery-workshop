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

1. **Set up.** Pick one ticket with clear acceptance criteria. Make a `with` and a `without` branch, or two worktrees ([cheat sheet](../00-setup/git-worktrees.md)). On `without`, move context files aside. On `with`, add `AGENTS.md` and `CLAUDE.md` and fill them in.
2. **Run both.** A new chat on each side, with the same prompt:
   > Implement this ticket:
   > <pasted ticket text>

   Don't correct it mid-run. If it asks a question, answer in one line and note it. On the `with` side, approving its plan is allowed: that's part of the setup.
3. **Compare.** Read both diffs side by side, not the agent's summaries. Answer the three questions.

## Why every piece goes in the file

Keep the prompt identical on both sides, so the setup is the only difference. It's also the habit worth keeping: the file carries the instructions, so nobody has to remember to type them.
