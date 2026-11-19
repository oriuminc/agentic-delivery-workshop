---
paths:
  - "backend/src/**"
  - "frontend/src/**"
---
# Code hygiene

Reviewers flag a violation as MINOR. The security and contract items marked **MAJOR** are the exceptions.

## Naming and files
- Files: `camelCase.ts` for modules, `PascalCase.tsx` for components. A component file exports one component.
- Booleans read as questions (`isLoading`, `hasError`). Functions are verbs (`validateEntry`). Constants are `UPPER_SNAKE` and live in one object when related (`LIMITS`).
- No default exports in `backend/`. Named exports only.

## Types
- No `any` and no `@ts-ignore`. Use `unknown` and narrow it.
- A type shared with the API lives in `types.ts` and must match `backend/docs/API.md`. A mismatch is **MAJOR**.

## Leftovers
- No `console.log`, `debugger`, commented-out code, or `TODO` without a ticket key (`TODO(ABC-123): …`).
- Backend logs go through `logger.ts` and always carry `requestId`.

## Errors and secrets
- API errors go through `sendError()` and carry `requestId`. The UI shows it as `Ref <requestId>`. A swallowed error (an empty `catch`) is **MAJOR**.
- `fetch` is called only from `frontend/src/api/client.ts`.
- No raw colours in the frontend. Use the tokens in `styles.css`.
- No secrets, `.env*`, `data/db.json` or `logs/*.log` in a diff. **MAJOR**.

## Size
- A function over about 40 lines, or a file over about 300, needs a reason in the PR.
