# Before you start

## Check the driver laptop

Each group needs one or two laptops that run the agent. On each one:

- [ ] Your repo is open and runs, the way it would on a normal morning.
- [ ] The AI tool is in agent mode and answers: *"In two sentences, what does this repo do?"*
- [ ] You know which tool you're on: Cursor or Claude Code.
- [ ] A Jira or Bitbucket MCP is connected, or you have what you need to connect one in Lab 2 (see [`02-context/mcp/`](../02-context/mcp/)).
- [ ] This kit is open in a browser tab.

## Where each tool keeps things

| What | Cursor | Claude Code |
|------|--------|-------------|
| Context file | `AGENTS.md` at the repo root (nested ones in subfolders also apply) | `CLAUDE.md` at the repo root. A `CLAUDE.md` containing `@AGENTS.md` makes it read the same file |
| Skills | `.cursor/skills/<name>/SKILL.md` (it also reads `.claude/skills/`) | `.claude/skills/<name>/SKILL.md` |
| MCP servers | `.cursor/mcp.json` | `.mcp.json` |
| Subagents | Check your version's docs | `.claude/agents/<name>.md` |
| Plan mode | Plan mode in the agent's mode picker | Shift+Tab until plan mode is on |

Keep `AGENTS.md` as the one source of truth and point `CLAUDE.md` at it, so both tools read the same instructions.

## Running "with" and "without" side by side

Most labs run the same ticket twice: once with a change, once without. Two laptops make that easy. On one laptop, use two worktrees, one editor window each. See [git-worktrees.md](git-worktrees.md).
