# AGENTS.md

<!-- Starter context file. Fill in the <placeholders> for your repo and delete
     anything the agent can already read from the code. Aim for about twenty lines. -->

## Map
- `<folder>/`: <what lives here>
- `<folder>/`: <what lives here>
- `<folder>/`: <what lives here>

## Rules
- Reuse components from `<path>` before writing new UI.
- Don't add a dependency without asking.
- Don't change files outside the ticket's scope.
- <a mistake a new developer makes in this repo, and what to do instead>

## Run
- Test: `<test command>`
- Check: `<lint command> && <typecheck command> && <test command>`

## Definition of done
- Every acceptance criterion has at least one test.
- The check command passes. If it fails, fix the cause and run it again. Never say "done" while it fails.

## How we work
1. Plan first. Before any code, write a plan: files to change, each acceptance criterion and its test, open questions. Wait for approval.
2. Stop and ask when: you need a file that isn't in the plan, the same check fails 3 times, you need a new dependency, or a criterion is unclear.
3. Before saying done: for each acceptance criterion, state met, partly met or not met, with the file and line that proves it. Fix anything not met.
