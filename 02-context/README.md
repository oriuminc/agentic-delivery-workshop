# Lab 2: context engineering

Connect the agent to what it's missing, and only what earns its place.

## The activity: count the guesses

Plan a bigger ticket twice:

- **Without:** nothing new. Just the ticket and the code.
- **With:** one new source connected. Your group's choice:
  - **An MCP** for Jira or Bitbucket, so the agent can look up the ticket, linked issues and past PRs. Setup in [mcp/](mcp/).
  - **A skill** that carries reference docs the agent can't read from the code. Starter in [skills/reference-docs/](skills/reference-docs/).

Start both sides from the same branch: if you're keeping your Lab 1 `AGENTS.md`, have it on both. The new source is the only difference.

Both plans end with a list of every assumption the agent made. That list is where the difference shows: without the source it has to guess, with it, it can look things up.

## Steps

1. **List what it can see.** New chat on `main`, before you add anything:
   > List every instruction file, rule, skill and MCP server you can see, and summarize what each tells you to do.
2. **Connect one source** on the `with` side: an MCP or a skill. Check it works (*"Show me ticket <KEY>"*, *"List the last 5 merged PRs that touched <area>"*, or a question the skill should answer). Add a line to `AGENTS.md` saying when to use it, from [authoritative-sources.md](authoritative-sources.md).
3. **Plan it twice.** Same prompt on both sides:
   > Here's the ticket: <pasted text>. Write a plan for it. Follow how we've done similar changes before. End with a list of every assumption you made.
4. **Compare** the two plans and the two assumption lists. Answer the three questions.

**QA engineers:** if your QA platform has an MCP (Spur does), connect it as your source and ask for tests from the ticket's acceptance criteria, with and without it.

**Can't connect an MCP?** Take the skill route, or paste the same information into the `with` side by hand: the linked tickets and a similar past PR.

## Put each guess where it lives

Every guess on the assumptions list is a gap in the spec. Send each one back to where it belongs, then plan again:

| The guess is… | Fix it in |
|---|---|
| Only true for this change | The ticket |
| True for every change | `AGENTS.md`, as a rule |
| A choice with trade-offs | A decision record (ADR): what you chose and why |

Fix the spec and regenerate, rather than patching the code by hand.

## A technique for long tasks: hand off

A long chat fills up its context window and starts to forget. End a phase with a short written state file, then start a new chat from it. Template and prompts: [HANDOFF.md](HANDOFF.md).
