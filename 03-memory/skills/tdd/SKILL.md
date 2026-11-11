---
name: tdd
description: Implement an approved PLAN.md test-first, one behaviour at a time, with a red-green-refactor loop. Use when building a feature or fixing a bug from a plan, or when the user mentions TDD or "test first".
---

<!-- The core loop derives from Matt Pocock's tdd skill (github.com/mattpocock/skills, MIT)
     and Superpowers (github.com/obra/superpowers, MIT). -->

# TDD: build from the plan, test first

## The rule
**No production code without a failing test first.** You must see the test fail before writing the code that makes it pass. A test you never saw fail proves nothing.

## Steps

1. **Start from the plan.** Read `tickets/<ID>/PLAN.md`. Work through the "Acceptance criteria → tests" table in order. Do not re-plan.

2. **Loop, one behaviour at a time:**
   - **Red:** write one test for the next behaviour. Run only that test file. Paste the failing output.
   - **Green:** write the minimum code to make it pass. Run it again.
   - Repeat for the next behaviour. Never write all the tests first and then all the code.

3. **Refactor** only when green: remove duplication, reuse existing components. Run the tests after each change.

4. **Check everything.** Run the full check command from `AGENTS.md` (lint, typecheck, tests).

## Good tests
- Test behaviour through public interfaces, not internals.
- Mock only at system boundaries (external APIs, network).
- Name the test after the behaviour: "hides the section when the list is empty".

## Done when
- Every row in the plan's test table has a passing test.
- The full check command passes.
- If a failure survives two fix attempts, stop and report it. Do not keep patching.
