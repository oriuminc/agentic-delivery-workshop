# frontend — Folio UI

React 19 + Vite + TypeScript. Port 5173, and `/api` is proxied to `localhost:4000`.

- `npm run dev` · `npm test` (Vitest + Testing Library, jsdom) · `npm run test:e2e` (Playwright, real Chrome; `HEADED=1` to watch) · `npm run typecheck` · `npm run build`
- `src/api/client.ts`: the only place that calls `fetch`. Sends `x-request-id` and throws `ApiError` with `requestId`.
- `src/types.ts`: mirrors `backend/docs/API.md`. Change both together.
- `src/App.tsx`: state (entries, selection, draft, toast). `src/components/`: Sidebar, Editor, Toast.
- `src/styles.css`: design tokens on `:root` (light and dark). Use tokens, never raw colours.

Conventions: tests use `vi.mock('./api/client')` and query by role or label, never by class name.
Each test has a What / Params / Expected comment. User-facing errors show `Ref <requestId>`.
Fonts: Fraunces (display), Source Serif 4 (reading), Inter (UI).
