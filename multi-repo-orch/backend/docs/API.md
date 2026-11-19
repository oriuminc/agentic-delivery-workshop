# Folio API contract

> Source of truth for the frontend ↔ backend contract. `frontend/src/types.ts`
> mirrors the types below — change both in the same feature.

Base URL: `http://localhost:4000` (the frontend dev server proxies `/api`).

## Entry

```ts
interface Entry {
  id: string;        // uuid
  title: string;     // 1–200 chars, trimmed
  body: string;      // 0–50,000 chars
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdMeta?: RequestMeta; // set by server on POST; absent on legacy entries
  updatedMeta?: RequestMeta; // set by server on POST and replaced on every PATCH
}

interface RequestMeta {
  ip: string | null;        // req.ip; null if unavailable
  userAgent: string | null; // User-Agent header, control chars stripped, truncated to 256; null if absent
}
```

`createdMeta` / `updatedMeta` are derived from the request by the server. They are ignored if sent in a
request body. PATCH updates `updatedMeta` only; `createdMeta` never changes.

### Privacy

The IP address is personal data. It is returned to anyone who can read the entry (the app has no auth)
and is not written to `logs/app.log`. `ip` is the socket peer unless the server is started with
`TRUST_PROXY` (hop count such as `1`, or `loopback`), in which case `X-Forwarded-For` is honoured.
`true` is rejected because clients could forge their IP. The user agent is client-controlled; treat it
as informational only.

## Endpoints

| Method | Path | Body | Success |
|---|---|---|---|
| GET | `/api/health` | — | `200 { status: "ok" }` |
| GET | `/api/entries` | — | `200 { entries: Entry[] }` newest `updatedAt` first |
| GET | `/api/entries/:id` | — | `200 { entry }` |
| POST | `/api/entries` | `{ title, body? }` | `201 { entry }` |
| PATCH | `/api/entries/:id` | `{ title?, body? }` (≥1) | `200 { entry }` |
| DELETE | `/api/entries/:id` | — | `204` |

## Errors

Every error is `{ error: { code, message, requestId } }`.

| Status | code |
|---|---|
| 400 | `invalid_input`, `invalid_json` |
| 404 | `not_found` |
| 413 | `too_large` |
| 500 | `internal` |

## Request ids

Send `x-request-id` (`[A-Za-z0-9_-]{1,64}`) to correlate; otherwise one is minted.
It is echoed in the response header, in `error.requestId`, and on every log line
in `logs/app.log` (JSON lines) — that is what `/rca <requestId>` searches.
