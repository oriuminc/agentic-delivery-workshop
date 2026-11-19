# backend — Folio API

Express 5 + TypeScript (ESM, run with `tsx`), with a JSON file store. Port 4000.

- `npm run dev` · `npm test` (Vitest + supertest) · `npm run typecheck`
- `src/app.ts`: `createApp(store, log)`. Request-id middleware and the error handler live here.
- `src/routes/entries.ts`: CRUD routes. Errors go through `sendError()` → `{ error: { code, message, requestId } }`.
- `src/store.ts`: `JsonFileStore`. Writes are serialised and atomic (tmp + rename). Inject a temp file in tests.
- `src/validation.ts`: all input validation, with the limits in `LIMITS`.
- `src/logger.ts`: JSON-lines logs to `logs/app.log`. Every line has `requestId`.
- `docs/API.md`: **the contract**. Update it with any API change, and mirror it in `frontend/src/types.ts`.

Conventions: tests live next to the source (`*.test.ts`), and each has a What / Params / Expected
comment. Use a new temp DB per test. Never commit `data/db.json` or `logs/*.log`.
