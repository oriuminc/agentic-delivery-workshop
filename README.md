# Agentic Delivery Workshop: kit

Your AI coding tool, Cursor or Claude Code, is the harness around the model: the loop, the tools and the modes. It already looks for a context file, a skills folder and an MCP config. This kit helps you fill them in for your repo.

Prompts, templates and starter files for the workshop's four labs. Copy what you need into your own repo as you go. Nothing here is specific to one team or codebase: every file uses placeholders like `<test command>` that you fill in for your repo.

## How the day runs

Each lab is a short talk, then your group works a real ticket on one or two laptops, then the room compares notes. Labs 1 and 2 run the same ticket twice with the same prompt: first **without** one part of the setup, then **with** it. Lab 3 compares a second ticket against the first, and Lab 4 plans two tasks at once and writes a contract for splitting one.

Keep three questions in mind in every lab:

- What did the agent do differently?
- How often did you step in?
- Would you keep it?

## What's here

| Folder | Lab | What's inside |
|--------|-----|---------------|
| [`00-setup/`](00-setup/) | Before you start | Laptop checklist, where each tool keeps things, a git worktree cheat sheet |
| [`01-harness/`](01-harness/) | Lab 1: harness progression | A starter `AGENTS.md`, a one-line `CLAUDE.md`, and the three pieces to copy in |
| [`02-context/`](02-context/) | Lab 2: context engineering | MCP configs (Jira, Bitbucket, Context7, Playwright), a reference-docs skill, a handoff template |
| [`03-memory/`](03-memory/) | Lab 3: memory | Prompts for turning corrections into rules and a skill, a skill template, three starter skills |
| [`04-parallel/`](04-parallel/) | Lab 4: parallelization | The contract-first prompt, a `CONTRACTS.md` template, a subagent definition |

## Ground rules

- **Nothing gets pushed during the workshop.** Lab branches and worktrees stay on the laptop. If something works, take it back to your team through your normal PR process.
- **Tokens never go in files.** MCP configs read them from environment variables.
- **Works with Cursor and Claude Code.** Where the tools differ, each folder's README says how.

## Questions after the workshop

Stuck on any of it, or want a second opinion on your `AGENTS.md` or a skill? Email smith.milner@orium.com.
