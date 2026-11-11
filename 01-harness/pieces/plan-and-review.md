# Plan and review

**Closes the gap:** nobody checked what it assumed.

```markdown
## How we work
1. Plan first. Before any code, write a plan: files to change, each
   acceptance criterion and its test, open questions. Wait for approval.
2. Stop and ask when: you need a file not in the plan, the same check fails
   3 times, you need a new dependency, or a criterion is unclear.
3. Before saying done: for each acceptance criterion, state met, partly met
   or not met, with the file and line that proves it. Fix anything not met.
```

Start the run in your tool's **plan mode**, so it can't edit files until you approve the plan.

**Review the plan with three questions**
1. Does it reuse what already exists in the repo?
2. Does every acceptance criterion have a test?
3. What is it assuming? Anything nobody confirmed becomes an open question.

**Why each part matters**
- **Plan first:** a wrong assumption costs a sentence to fix in a plan and an hour in code.
- **Stop rules:** agents rarely stop on their own. Without them, a stuck agent rewrites files outside the ticket or retries the same fix.
- **Self-review:** "done" becomes evidence, not a feeling.
