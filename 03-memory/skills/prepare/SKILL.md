---
name: prepare
description: Turn a Jira ticket into an approved implementation plan before any code is written. Use when starting work on a ticket, when the user gives a ticket ID (e.g. PROJ-123), or asks to "plan" a ticket.
---

# Prepare: ticket → PLAN.md

Do not write or change application code in this skill.

## Steps

1. **Fetch the ticket.**
   - Use the Jira MCP to read the ticket: summary, description, acceptance criteria.
   - If the MCP is not available, ask the user to paste the ticket.
   - Save it to `tickets/<ID>/ticket.md`.

2. **Read the codebase before planning.**
   - Read `AGENTS.md`.
   - Find the existing files, components and patterns this ticket touches. Prefer reuse over new code.
   - If the ticket needs data from another system (a CMS, a commerce platform, an API), check the real models through its MCP or docs. Do not guess field names.

3. **Write `tickets/<ID>/PLAN.md`** with exactly these sections:
   - **Goal:** one or two sentences.
   - **Files:** each file to create or change, and why.
   - **Data:** the real fields and types used, with their source.
   - **Acceptance criteria → tests:** every criterion mapped to at least one test.
   - **Open questions:** anything the ticket does not answer.

4. **Challenge the plan**, one question at a time:
   - Does every file and function the plan names exist, with that shape?
   - What edge cases does the plan skip (empty, max, missing data, locale)?
   - Could someone read a step two different ways?
   - Ask the user each open question, with your recommended answer. Write each answer back into `PLAN.md`.

5. **Stop and ask for approval.** Show the plan. Do not start implementation until the user approves.

## Done when
- `PLAN.md` exists with all five sections.
- Every acceptance criterion has a test.
- No open question is left unanswered.
