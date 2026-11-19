import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { JsonFileStore } from './store.js';

let dir: string;
let dbFile: string;
let app: ReturnType<typeof createApp>;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'folio-'));
  dbFile = join(dir, 'db.json');
  app = createApp(new JsonFileStore(dbFile));
});
afterEach(() => rm(dir, { recursive: true, force: true }));

describe('entries API', () => {
  // Tests the full create → list → read round trip on an empty store.
  // Params: title "  First  " (padded, to prove trimming), body "Hello".
  // Expected: 201 with a trimmed title and equal createdAt/updatedAt; the entry
  // is then listed and fetchable by id, and is persisted to the JSON file.
  it('creates, lists and reads an entry, persisting it to disk', async () => {
    const created = await request(app).post('/api/entries').send({ title: '  First  ', body: 'Hello' });
    expect(created.status).toBe(201);
    expect(created.body.entry).toMatchObject({ title: 'First', body: 'Hello' });
    expect(created.body.entry.createdAt).toBe(created.body.entry.updatedAt);

    const list = await request(app).get('/api/entries');
    expect(list.body.entries).toHaveLength(1);

    const one = await request(app).get(`/api/entries/${created.body.entry.id}`);
    expect(one.body.entry.id).toBe(created.body.entry.id);

    const disk = JSON.parse(await readFile(dbFile, 'utf8'));
    expect(disk.entries[0].title).toBe('First');
  });

  // Tests that the most recently updated entry is listed first.
  // Params: two entries "A" then "B", then "A" is edited so it becomes newest.
  // Expected: list order is [A, B] after the edit.
  it('lists entries newest-updated first', async () => {
    const a = await request(app).post('/api/entries').send({ title: 'A', body: '' });
    await new Promise((r) => setTimeout(r, 5));
    await request(app).post('/api/entries').send({ title: 'B', body: '' });
    await new Promise((r) => setTimeout(r, 5));
    await request(app).patch(`/api/entries/${a.body.entry.id}`).send({ body: 'edited' });

    const list = await request(app).get('/api/entries');
    expect(list.body.entries.map((e: { title: string }) => e.title)).toEqual(['A', 'B']);
  });

  // Tests a partial update: only the body is sent.
  // Params: entry titled "Keep me", PATCH { body: "new" }.
  // Expected: 200, title unchanged, body replaced.
  it('patches only the fields provided', async () => {
    const { body } = await request(app).post('/api/entries').send({ title: 'Keep me', body: 'old' });
    const res = await request(app).patch(`/api/entries/${body.entry.id}`).send({ body: 'new' });
    expect(res.status).toBe(200);
    expect(res.body.entry).toMatchObject({ title: 'Keep me', body: 'new' });
  });

  // Tests deletion and that a second delete of the same id is a 404.
  // Params: one created entry, deleted twice.
  // Expected: 204 then 404 with code "not_found"; list is empty.
  it('deletes an entry and 404s on repeat', async () => {
    const { body } = await request(app).post('/api/entries').send({ title: 'Bye', body: '' });
    expect((await request(app).delete(`/api/entries/${body.entry.id}`)).status).toBe(204);
    const again = await request(app).delete(`/api/entries/${body.entry.id}`);
    expect(again.status).toBe(404);
    expect(again.body.error.code).toBe('not_found');
    expect((await request(app).get('/api/entries')).body.entries).toEqual([]);
  });

  // Tests that validation errors carry the request id the client sent, which
  // is what makes /rca able to trace a user-reported error.
  // Params: blank title "   ", x-request-id "demo-123".
  // Expected: 400 invalid_input, error.requestId and response header both "demo-123".
  it('rejects a blank title and echoes the request id', async () => {
    const res = await request(app).post('/api/entries').set('x-request-id', 'demo-123').send({ title: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.error).toEqual({ code: 'invalid_input', message: 'title is required', requestId: 'demo-123' });
    expect(res.headers['x-request-id']).toBe('demo-123');
  });

  // Tests that a malformed incoming request id is not trusted (log-injection guard).
  // Params: x-request-id containing spaces and a newline-like payload.
  // Expected: the server mints its own 8-char id instead.
  it('replaces a malformed request id with a generated one', async () => {
    const res = await request(app).get('/api/entries').set('x-request-id', 'bad id; drop');
    expect(res.headers['x-request-id']).toMatch(/^[a-f0-9-]{8}$/);
  });

  // Tests that request logs record the full route path (not the router-relative
  // "/"), since /rca traces a request id back to its route from this line.
  // Params: a capturing logger; GET /api/entries?x=1 with x-request-id "trace-1".
  // Expected: one "request" log with path "/api/entries" (query stripped), status 200.
  it('logs the full request path with the request id', async () => {
    const lines: Record<string, unknown>[] = [];
    const logged = createApp(new JsonFileStore(dbFile), (_l, msg, f) => lines.push({ msg, ...f }));
    await request(logged).get('/api/entries?x=1').set('x-request-id', 'trace-1');
    expect(lines).toContainEqual(expect.objectContaining({
      msg: 'request', requestId: 'trace-1', method: 'GET', path: '/api/entries', status: 200,
    }));
  });

  // Tests malformed JSON handling.
  // Params: raw body "{oops" with content-type application/json.
  // Expected: 400 with code "invalid_json" rather than a 500.
  it('returns 400 for invalid JSON', async () => {
    const res = await request(app).post('/api/entries').set('content-type', 'application/json').send('{oops');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('invalid_json');
  });
});
