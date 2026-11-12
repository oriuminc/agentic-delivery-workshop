# Lab 1: harness progression

Same model, same ticket, same prompt. Only the setup around it changes.

## The activity

Run one ticket twice, one run after the other:

1. **Without:** your ticket, pasted in, and nothing else. Move any context files aside first.
2. **With:** the same ticket and the same prompt, after you've added an `AGENTS.md` with all three pieces below.

Then compare how the two runs went, not the code they produced: the questions it asked, the guesses it made and how often you had to step in.

## The three pieces

| Piece | Closes the gap | File |
|-------|----------------|------|
| **Map and rules** | It never saw how your team builds | [pieces/map-and-rules.md](pieces/map-and-rules.md) |
| **Test loop** | It has no way to check its own work | [pieces/test-loop.md](pieces/test-loop.md) |
| **Plan and review** | Nobody checked what it assumed | [pieces/plan-and-review.md](pieces/plan-and-review.md) |

[AGENTS.md](AGENTS.md) has all three together. Copy it to your repo root, fill in the placeholders as a group, and add [CLAUDE.md](CLAUDE.md) next to it. About twenty lines is enough. If your repo already has a context file, start from yours.

## Steps

1. **Without (first half).** Pick one ticket with clear acceptance criteria. Move aside `AGENTS.md`, `CLAUDE.md`, `.cursor/rules` and any skills folder ([how](../00-setup/git-worktrees.md#empty-the-without-side)). Start a new chat:
   > Implement this ticket:
   > <pasted ticket text>

   Don't correct it mid-run. Write down every question it asks, every guess it makes and every time you have to step in. That list is the point of this half. The run doesn't have to finish.
2. **With (second half).** Halfway through the lab, stop wherever the first run got to and write your `AGENTS.md`. Start from a generated draft (below), cut it down, then add the three pieces, filled in from the list the first run gave you. Add `CLAUDE.md` next to it. Open a new chat and run the same ticket with the same prompt, keeping the same list. Approving its plan is allowed: that's part of the setup.
3. **Compare the process.** Which questions from the first run didn't come up again because the file answered them? Where did you still step in? Did it plan, run the checks, stop when stuck? Answer the three questions.

One checkout is enough, since the runs happen one after the other. To keep both runs open side by side, use two worktrees ([cheat sheet](../00-setup/git-worktrees.md)).

## Start from a draft

A rough file today beats a perfect one never.

- **Claude Code:** run `/init`. It reads the repo and writes a `CLAUDE.md`. Rename it to `AGENTS.md` and make `CLAUDE.md` the one line `@AGENTS.md`.
- **Cursor:** ask the agent:
  > Read this repo and draft an AGENTS.md: the folders that matter, how to run the tests, lint and typecheck, and the conventions a new developer would get wrong. Under 40 lines. Leave out anything you could work out from the code itself.

Cut it down as a group. Generated drafts describe the codebase at length; keep only what the agent couldn't work out by reading the code. Then add the three pieces. Think of the result as your team's conventions, written down: every line is a review or QA comment nobody has to write again.

## Why it goes in the file, not the prompt

Keep the prompt identical on both runs so the setup is the only difference. That's also the habit worth keeping: the file carries the instructions, so nobody has to remember to type them.
