---
paths:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/e2e/**/*.spec.ts"
---
# Test hygiene

Applies to every test file in `backend/` and `frontend/`, including e2e specs. Reviewers flag a violation as MINOR.

## Coverage
- Unit tests cover all edge cases of the unit, not just the happy path: empty, null/undefined, boundary values (min, max, off-by-one), invalid input, duplicates, error paths, and unusual-but-valid input.
- Every feature that spans more than one component (frontend ↔ backend, or two modules/layers inside a repo) must also have integration tests that exercise the components together, with real wiring in place of mocks between them. Mock only at the system boundary (network, clock, third-party services).
- Every ticket or request also gets **end-to-end tests** (see "End-to-end tests" below).
- A feature without all three is incomplete. Reviewers flag missing edge-case unit tests, missing integration tests or missing e2e tests as MAJOR.

## End-to-end tests (Playwright)
- E2E specs live in `frontend/e2e/<feature>.spec.ts` and run with `npm run test:e2e` (from `frontend/`). They launch the real Chrome (`channel: 'chrome'`) against the real backend and frontend. `playwright.config.ts` starts both on throw-away ports and a temp DB, so never mock the API, never touch `data/db.json`, and never rely on a dev stack that is already running.
- Write them from the ticket's acceptance criteria (or the request's goal), not from the implementation. Each acceptance criterion has at least one test that drives the UI the way a user would (click, type, navigate) and asserts the visible outcome, plus the main failure path for it (validation error, "Ref <id>" toast, empty state). A backend-only ticket is still covered through the UI that consumes it, or with Playwright's `request` fixture against the running API when it has no UI.
- Name each test after the criterion it proves, and quote the ticket key in the `describe` when there is one: `test.describe('FOL-12 delete entry', …)`. Same What / Params / Expected comment block as every other test; "Expected" must say which acceptance criterion the assertion proves.
- Query by role, label or text (`getByRole`, `getByLabel`), never CSS or XPath. Use web-first assertions (`await expect(locator).toBeVisible()`), never fixed sleeps (`waitForTimeout`).
- Each test sets up its own data through the UI or API and does not depend on test order. No `.only` or `.skip` (`test.fixme` needs a ticket key).
- **Evidence screenshots.** Every e2e test that proves an acceptance criterion also saves a named screenshot of the visible outcome, taken right after the key assertion: `await page.screenshot({ path: testInfo.outputPath('<NN>-<what-it-shows>.png') })` (e.g. `02-entry-saved-read-only.png`). Use the `testInfo` fixture. `run-checks.sh … <slug>` also keeps an automatic end-of-test screenshot of every test, so the named shots are the human-readable ones. Both land in `.runs/<slug>/evidence/<repo>/` and are linked from the final report. Never put secrets or real personal data on screen in a test.
- **Always run together:** whenever unit/integration tests are run (`npm test`, `run-checks.sh … test`, or `all`), the e2e suite must be run in the same pass. `run-checks.sh <repo> all <slug>` does both. A green unit/integration run without a green e2e run is not a pass. If e2e can't run (Chrome or Playwright missing), report FAIL, never SKIP.
- Run headed to watch a test: `HEADED=1 npm run test:e2e`. Parallel worktrees set `E2E_API_PORT` and `E2E_WEB_PORT` to unused ports.

## Files
- A unit or integration test sits next to its source and is named `<source>.test.ts` (or `.test.tsx` for components): `validation.ts` → `validation.test.ts`. E2E specs are the exception: they sit in `frontend/e2e/` and are named `<feature>.spec.ts`.
- One top-level `describe` per file, named after the unit under test (`'entries API'`, `'validateEntry'`, `<Sidebar />`) or, for e2e, the feature.

## Names
- Name each `it` for the behaviour and the outcome, in plain words: `'creates, lists and reads an entry, persisting it to disk'`.
- Never `'works'`, `'test 1'`, `'should work'` or the function name alone.
- No "should" prefix. The sentence starts with a verb: `rejects`, `returns`, `shows`, `keeps`.
- Names are unique within a file.

## Comment block (mandatory)
Every `it` (and e2e `test`) has a three-line comment directly above it:
```ts
// What: <the scenario>.
// Params: <key inputs, and why those values>.
// Expected: <what the assertion checks, and why that is correct>.
```
The existing tests write this as one short paragraph (`Tests that…  Params: …  Expected: …`). Either form passes if all three parts are present.

## Isolation and queries
- Each backend test gets a new temp DB file and removes it in `afterEach`. Never touch `data/db.json`.
- Frontend tests mock `./api/client` with `vi.mock` and query by role or label, never by class name or test id unless nothing else fits.
- No `.only` or `.skip` committed. A `.todo` needs a ticket key in its name.
- Every bug fix includes a test that fails without the fix.
