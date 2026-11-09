# Lab 3: memory

Every session starts empty. Memory is what you write down so the next one doesn't.

## Two kinds of memory

| Kind | Where it lives | Loaded | Keep it |
|------|----------------|--------|---------|
| **Rules** | `AGENTS.md` | Every session | Short: every line costs room in every session |
| **Skills** | `SKILL.md` in your tool's skills folder | Only when the task matches, or when you call it by name | Focused: the description has to say when to use it |

A learnings log ([LEARNINGS.md](LEARNINGS.md)) is the longer-form, always-on kind: decisions and why.

**Worth keeping:** decisions and why, conventions you had to explain, failures and what caused them. **Skip:** transcripts, one-off fixes, anything the agent can read from the code.

## The activity: teach it once

1. **Ticket A.** One person drives. Everyone else writes down every correction: each time the driver redirects the agent, explains something or fixes its output.
2. **Turn the corrections into memory, both kinds.** Let the agent draft, then cut it down as a group.
   - Rules: [rules-prompt.md](rules-prompt.md)
   - A skill: [session-to-skill.md](session-to-skill.md), using [SKILL.md](SKILL.md) as the shape, or start from one of the [starter skills](skills/)
3. **Ticket B,** a similar one, with the new rules and skill. Keep the ticket A corrections list next to you and watch for repeats.
4. **Compare with ticket A.** Did the skill fire? Which helped more, the rules or the skill?

   To tell whether the skill fired, watch for the agent reading its `SKILL.md`, or ask: *"Which skills did you use in this session?"*

## Where skills go

- **Cursor:** `.cursor/skills/<name>/SKILL.md` (Cursor also reads `.claude/skills/`)
- **Claude Code:** `.claude/skills/<name>/SKILL.md`

The folder name should match the skill's `name`.

## Starter skills

A three-step workflow, simplified from the setup Orium's delivery teams use. Adapt them; don't adopt them wholesale.

| Skill | What it does |
|-------|--------------|
| [prepare](skills/prepare/SKILL.md) | Turns a ticket into an approved `PLAN.md` |
| [tdd](skills/tdd/SKILL.md) | Builds from the plan, test-first, one behaviour at a time |
| [pr-review](skills/pr-review/SKILL.md) | Checks a diff against the ticket and the rules in `AGENTS.md` |

## When it doesn't work

- **The skill never fires.** The description is too vague. Rewrite it to say what the skill does, then "Use when…". Or call it by name.
- **The skill is too long and the output got worse.** Move reference material into a separate file the skill links to.
- **Ten vague rules.** Keep the two or three that will come up again. Three sharp rules beat ten vague ones.
