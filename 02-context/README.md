# Lab 2: context engineering

Connect the agent to what it's missing, and only what earns its place.

## The activity: count the guesses

Plan one ticket twice, one after the other: first with only what the agent can already see, then again after you connect one new source. Your group's choice of source:
  - **An MCP** for Jira or Bitbucket, so the agent can look up the ticket, linked issues and past PRs. Setup in [mcp/](mcp/).
  - **A skill** that carries reference docs the agent can't read from the code. Starter in [skills/reference-docs/](skills/reference-docs/).


Both plans end with a list of every assumption the agent made. That list is where the difference shows: without the source it has to guess, with it, it can look things up.

## Steps

1. **List the context sources.** New chat, before you add anything:
   > List every context source you can see: instruction files, rules, skills and MCP servers. Say what each one gives you.
2. **Plan with only those.** Same chat or a new one:
   > Here's the ticket: <pasted text>. Write a plan for it. Follow how we've done similar changes before. End with a list of every assumption you made.

   Save the plan and its assumption list.
3. **Connect one source:** an MCP or a skill. Check it works (*"Show me ticket <KEY>"*, *"List the last 5 merged PRs that touched <area>"*, or a question the skill should answer). Add a line to `AGENTS.md` saying when to use it, from [authoritative-sources.md](authoritative-sources.md).
4. **Plan it again and compare.** A new chat, the same prompt. Then compare the two assumption lists item by item: which guesses did the source answer? Answer the three questions.

**QA engineers:** if your QA platform has an MCP (Spur does), connect it as your source and ask for tests from the ticket's acceptance criteria, before and after you connect it.

**Can't connect an MCP?** Take the skill route, or paste the same information in by hand for the second plan: the linked tickets and a similar past PR.

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
