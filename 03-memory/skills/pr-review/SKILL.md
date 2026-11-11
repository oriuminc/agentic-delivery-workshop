---
name: pr-review
description: Review a branch or pull request against its Jira ticket and the team conventions in AGENTS.md, and report blocking and non-blocking findings. Use when the user asks to review a PR, review a branch, or check work before opening a PR.
---

# PR review: diff vs. ticket vs. conventions

## Steps

1. **Get the diff.**
   - A PR: read it through your Git host's MCP (Bitbucket, GitHub), or `git diff <base>...<branch>`.
   - No PR yet: `git diff main...HEAD`.

2. **Get the intent.**
   - Find the ticket key in the PR title, branch name or description (e.g. `PROJ-123`).
   - Read the ticket and its acceptance criteria through the Jira MCP, or from `tickets/<ID>/`.
   - If the ticket can't be read, say so in the review and continue.

3. **Check three things:**
   - **Scope:** does the diff do what the ticket asks, and only that? Flag missing criteria and unrelated changes.
   - **Conventions:** check every rule in `AGENTS.md` (file locations, component reuse, anything the team has written down).
   - **Tests:** does every acceptance criterion have a test? Are there TODOs, skipped tests or fake data on real paths?

4. **Report.** Group findings as:
   - **Blocking:** wrong behaviour, missing criterion, broken convention.
   - **Non-blocking:** naming, small refactors.
   For each finding: `file:line`, what's wrong, and a suggested fix.

5. **Post only when asked.** By default, show the review in chat. Post to the PR only if the user says so.

## Done when
- Each acceptance criterion is marked met / not met.
- Every finding has a `file:line` and a suggested fix.
