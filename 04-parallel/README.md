# Lab 4: parallelization

Two ways to go parallel:

- **Separate tasks at once.** Two tickets that don't touch each other, one agent each, in two worktrees. Easy, and you can do it on Monday.
- **One task, split up.** One feature built in pieces at the same time. Faster, but the pieces have to agree on how they connect.

## Three pieces

- **Main agent:** the chat you talk to. It can start helpers and merge what they bring back.
- **Subagent:** a helper with a fresh context. It can't see your conversation, knows only its brief, and sends back a summary.
- **Worktree:** a second checkout of the repo on its own branch, so two agents never share files. See the [cheat sheet](../00-setup/git-worktrees.md).

## Collisions are silent

A subagent can't stop and ask you. When parallel work collides, it usually doesn't say so: one agent overwrites another's edit, two define the same type slightly differently, or one "fixes" a file another is halfway through. The main agent may still report that every part is done. So look for it:

- Run the check command. Typecheck and tests are where collisions show up.
- Run `git status` and read the diff, not the summary.
- Ask the main agent: *"Which files did each subagent change? Did any two overlap?"*
- Merge one part at a time, running the check after each merge.

## Write a contract first

The fix is the same as for two developers: agree on the connections before anyone starts. [CONTRACTS.md](CONTRACTS.md) covers:

- **Shared shapes:** the types, props and API responses the parts pass between them.
- **File owners:** each shared file (routes, index exports, `package.json`, config) gets exactly one owner.
- **Merge order:** what others depend on goes first, e.g. data, then API, then UI.

The main agent acts as the tech lead: it writes the contract, gives each subagent the contract and its part, checks each result against it, and merges in order. Prompts: [prompts.md](prompts.md).

## The activity

1. **Two tasks at once, plan only.** Two small tasks that don't touch each other, one agent each (two worktrees or two chats). Ask each for a plan, not code. Do the two plans touch any of the same files?
2. **Split one feature and write the contract.** Pick a feature that splits into parts that share something (a type, a route, a component's props). The agent drafts `CONTRACTS.md`; you check and approve it. Nothing gets built.
3. **Bonus: make it repeatable.** Turn what you just did into a skill that drafts a contract for any feature, using the [session-to-skill prompt](../03-memory/session-to-skill.md).

Running the parts in parallel and merging them is the next step after the workshop: the full prompt is in [prompts.md](prompts.md), and the merge steps are in the [cheat sheet](../00-setup/git-worktrees.md#merge-a-part-back-lab-4).

## Tool notes

- **Subagents share your checkout by default** in both tools. Ask for a worktree each, as the prompt in [prompts.md](prompts.md) does.
- **Cursor:** copy [part-builder.md](part-builder.md) to `.cursor/agents/`. Cursor ignores its `isolation` line, so the request in the prompt is what gives each one a worktree. For step 1, start each task's chat with `/worktree`, and bring a result back with `/apply-worktree`.
- **Claude Code:** copy [part-builder.md](part-builder.md) to `.claude/agents/`. Its `isolation: worktree` line gives each subagent its own worktree. For step 1, make two worktrees with the [cheat sheet](../00-setup/git-worktrees.md) and start Claude Code in each.
- **Gotcha:** a new worktree branches from your default branch, so an uncommitted `CONTRACTS.md` won't be in it. Commit it first, or put the contract in each brief.
- **Commit:** each agent must commit its work, or the merge finds nothing.

## Keep several agents in view

You can't read five chats at once. Use one view that shows which agent is waiting on you, and step in there:

- **Claude Code:** `claude agents` opens agent view: every session in one place, with the ones that need input on top.
- **Cursor:** the Agents window runs several agents side by side, each in its own worktree.
- **Any terminal:** [Herdr](https://github.com/brac/herdr) shows every agent CLI in one place: working, blocked or done.

## Let agents run inside a box

Agents running on their own need a boundary that isn't your laptop. [Docker Sandboxes](https://www.docker.com/blog/docker-sandboxes-run-claude-code-and-other-coding-agents-unsupervised-but-safely/) run each agent in its own small virtual machine, with its own files and Docker, away from yours. They support Claude Code and Cursor, among others. Match the leash to the risk: the more an agent can reach, the closer a person sits to the gate. Keep keys out of the agent's reach, and never let the agent that wrote a change approve it.

## When not to

- **Small tasks:** splitting costs more than it saves.
- **Tangled work:** if every part touches the same files, do it in one go.
- **You're the bottleneck:** more work in flight means more for you to review and decide.
