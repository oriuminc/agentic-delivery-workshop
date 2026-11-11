# Test loop

**Closes the gap:** it has no way to check its own work.

```markdown
## Run
- Test: `<test command>`
- Check: `<lint command> && <typecheck command> && <test command>`

## Definition of done
- Every acceptance criterion has at least one test.
- The check command passes. If it fails, fix the cause and run it again.
  Never say "done" while it fails.
```

**Why it works**
- Without it, the agent stops when it *decides* it's done. With it, done means the checks pass.
- Tests are written as part of the work, where the repo already keeps them. That isn't test-first: test-first is the stricter version, and it's the `tdd` skill in [03-memory/skills/tdd](../../03-memory/skills/tdd/SKILL.md).
- If your repo has no test runner, make the check `lint + typecheck + build`.
- The agent has to be allowed to run terminal commands for this to work. Check your tool's settings.
