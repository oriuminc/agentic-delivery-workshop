---
name: review-pr
description: Functional and security review of a pull request in any workspace repo, with the tests run on the PR head. Use when the user runs /review-pr, or asks to review, check or look over a PR (a URL or number). Add --post to publish the review to GitHub. Read-only on the PR branch.
argument-hint: <pr-url | pr-number> [--post]
---
# Review PR

Input: `$ARGUMENTS`. The first token is the PR. `--post` publishes the review to GitHub.
When invoked by the model from a conversation, take the PR from the user's message and never pass `--post` unless they asked to post.

## Steps
1. **Resolve**: run `.claude/scripts/pr-context.sh <pr>`.
   - It finds the owning repo, saves `pr.md` and `diff.patch` under `.runs/pr-<repo>-<n>/`, and checks the PR head out into a worktree.
   - If it errors, report the error line and stop.
2. **Ticket context**: if the PR title or body contains a ticket key (`[A-Z]+-\d+`), fetch the ticket through the Atlassian MCP and save it to `.runs/pr-<repo>-<n>/ticket.md`. That gives you the acceptance criteria to review against.
3. **Run tests on the PR head**: `.claude/scripts/run-checks.sh .runs/pr-<repo>-<n>/wt all`
   - Keep only the PASS/FAIL lines.
4. **Review**: run the `reviewer` agent with the paths to `pr.md`, `diff.patch` and `ticket.md` (if any), the check results, and the output dir `.runs/pr-<repo>-<n>/`.
   - If the diff changes the API contract, tell it to check the other repo's `types.ts` and flag a missing companion PR.
   - Tell it to apply the hygiene rules in `.claude/rules/` to the changed files (test naming, comment blocks, tokens, and so on). A violation is MINOR unless the rule file says otherwise.
5. **Report** to the user (≤12 lines):
   - verdict
   - check results
   - BLOCKER/MAJOR lines
   - path to REVIEW.md
6. **Post** (only with `--post`): show the exact body first, then post.
   - `--request-changes` if there's any BLOCKER, otherwise `--comment`.
   - `gh pr review <n> -R <owner/repo> --comment|--request-changes --body-file .runs/pr-<repo>-<n>/REVIEW.md`
7. **Cleanup**: `git -C <repo> worktree remove --force .runs/pr-<repo>-<n>/wt`

## Rules
- Read-only on the PR branch: never push, never apply fixes here.
- Never approve a PR on GitHub. A human approves.
