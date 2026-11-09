# HANDOFF.md template

End a phase of a long task by asking the agent to write this file, then start a new chat from it.

**Prompt to end a phase**
> Write HANDOFF.md: what's done, decisions and why, files touched, what's next, open questions. Under 40 lines.

**Prompt to start the next chat**
> Read PLAN.md and HANDOFF.md, then do the next phase.

---

```markdown
# Handoff: <ticket>, end of phase <n>

## What's done
- <finished work, so the next chat doesn't redo it>

## Decisions and why
- <decision>: <why, so it doesn't get reopened>

## Files touched
- `<path>`: <what changed>

## What's next
- <the next phase, from PLAN.md>

## Open questions
- <anything unresolved>
```

Keep it under 40 lines. A 200-line handoff is just the transcript again.
