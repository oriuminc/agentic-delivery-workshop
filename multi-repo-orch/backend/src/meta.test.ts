import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from './app.js';
import { silentLogger } from './logger.js';
import { JsonFileStore } from './store.js';
import { sanitizeUserAgent } from './validation.js';

let dir: string;
let dbFile: string;
let app: ReturnType<typeof createApp>;

beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), 'folio-meta-'));
  dbFile = join(dir, 'db.json');
  app = createApp(new JsonFileStore(dbFile));
});
afterEach(() => rm(dir, { recursive: true, force: true }));

describe('request metadata', () => {
  // What: POST records createdMeta and updatedMeta from the request.
  // Params: User-Agent "TestAgent/1.0".
  // Expected: both metas equal, with that UA and a non-empty ip.
  it('stores createdMeta and updatedMeta on create', async () => {
    const res = await request(app).post('/api/entries').set('User-Agent', 'TestAgent/1.0').send({ title: 'A' });
    expect(res.status).toBe(201);
    expect(res.body.entry.createdMeta.userAgent).toBe('TestAgent/1.0');
    expect(res.body.entry.createdMeta.ip).toBeTruthy();
    expect(res.body.entry.updatedMeta).toEqual(res.body.entry.createdMeta);
  });

  // What: PATCH replaces updatedMeta only.
  // Params: create with UA one, patch with UA two.
  // Expected: createdMeta UA one, updatedMeta UA two, persisted by GET.
  it('patch replaces updatedMeta and keeps createdMeta', async () => {
    const c = await request(app).post('/api/entries').set('User-Agent', 'one').send({ title: 'A' });
    const p = await request(app).patch(`/api/entries/${c.body.entry.id}`).set('User-Agent', 'two').send({ body: 'x' });
    expect(p.body.entry.createdMeta.userAgent).toBe('one');
    expect(p.body.entry.updatedMeta.userAgent).toBe('two');
    const g = await request(app).get(`/api/entries/${c.body.entry.id}`);
    expect(g.body.entry.updatedMeta.userAgent).toBe('two');
    const l = await request(app).get('/api/entries');
    expect(l.body.entries[0].createdMeta.userAgent).toBe('one');
  });

  // What: client-supplied meta fields are ignored.
  // Params: body with createdMeta, updatedMeta, ip on POST and PATCH.
  // Expected: stored meta comes from the request, forged values absent.
  it('ignores meta fields sent in the body', async () => {
    const forged = { createdMeta: { ip: '6.6.6.6', userAgent: 'evil' }, updatedMeta: { ip: '6.6.6.6', userAgent: 'evil' }, ip: '6.6.6.6' };
    const c = await request(app).post('/api/entries').set('User-Agent', 'real').send({ title: 'A', ...forged });
    expect(c.body.entry.createdMeta.userAgent).toBe('real');
    const p = await request(app).patch(`/api/entries/${c.body.entry.id}`).set('User-Agent', 'real2').send({ body: 'b', ...forged });
    expect(p.body.entry.createdMeta.userAgent).toBe('real');
    expect(p.body.entry.updatedMeta.userAgent).toBe('real2');
    const disk = await readFile(dbFile, 'utf8');
    expect(disk).not.toContain('6.6.6.6');
    expect(p.body.entry.ip).toBeUndefined();
  });

  // What: legacy entries without meta are served without error.
  // Params: db file holding one entry with no meta fields.
  // Expected: GET by id and list return 200 with no meta keys.
  it('serves legacy entries without meta', async () => {
    const legacy = { id: 'old', title: 'Old', body: '', createdAt: '2020-01-01T00:00:00.000Z', updatedAt: '2020-01-01T00:00:00.000Z' };
    await writeFile(dbFile, JSON.stringify({ entries: [legacy] }));
    const g = await request(app).get('/api/entries/old');
    expect(g.status).toBe(200);
    expect(g.body.entry.createdMeta).toBeUndefined();
    expect((await request(app).get('/api/entries')).status).toBe(200);
    const p = await request(app).patch('/api/entries/old').set('User-Agent', 'u').send({ body: 'n' });
    expect(p.body.entry.updatedMeta.userAgent).toBe('u');
    expect(p.body.entry.createdMeta).toBeUndefined();
  });

  // What: UA sanitising.
  // Params: 300-char UA, UA with control chars, undefined.
  // Expected: truncated to 256, control chars stripped, null.
  it('sanitizeUserAgent truncates, strips control chars and nulls missing', () => {
    expect(sanitizeUserAgent('a'.repeat(300))).toHaveLength(256);
    expect(sanitizeUserAgent('a\r\nb\x00c\x1fd')).toBe('abcd');
    expect(sanitizeUserAgent(undefined)).toBeNull();
    expect(sanitizeUserAgent('')).toBeNull();
  });

  // What: missing UA header gives null through the API.
  // Params: User-Agent header removed.
  // Expected: userAgent null.
  it('stores null userAgent when header is absent', async () => {
    const res = await request(app).post('/api/entries').unset('User-Agent').send({ title: 'A' });
    expect(res.body.entry.createdMeta.userAgent).toBeNull();
  });

  // What: X-Forwarded-For handling depends on trust proxy.
  // Params: header X-Forwarded-For 9.9.9.9 with trust proxy off, then on.
  // Expected: off -> socket addr; on -> 9.9.9.9.
  it('ignores X-Forwarded-For unless trust proxy is set', async () => {
    const off = await request(app).post('/api/entries').set('X-Forwarded-For', '9.9.9.9').send({ title: 'A' });
    expect(off.body.entry.createdMeta.ip).not.toBe('9.9.9.9');
    const trusted = createApp(new JsonFileStore(join(dir, 'b.json')), silentLogger, { trustProxy: '1' });
    const on = await request(trusted).post('/api/entries').set('X-Forwarded-For', '9.9.9.9').send({ title: 'A' });
    expect(on.body.entry.createdMeta.ip).toBe('9.9.9.9');
  });

  // What: failed requests write nothing.
  // Params: invalid POST, then PATCH of unknown id.
  // Expected: 400 and 404, db has no entries.
  it('writes no meta on 400 or 404', async () => {
    expect((await request(app).post('/api/entries').send({})).status).toBe(400);
    expect((await request(app).patch('/api/entries/nope').send({ body: 'x' })).status).toBe(404);
    expect((await request(app).get('/api/entries')).body.entries).toHaveLength(0);
  });

  // What: store update on a missing id.
  // Params: id "missing".
  // Expected: undefined and no file written.
  it('store.update returns undefined for a missing id without writing', async () => {
    const store = new JsonFileStore(dbFile);
    expect(await store.update('missing', { body: 'x' }, { ip: null, userAgent: null })).toBeUndefined();
    await expect(readFile(dbFile, 'utf8')).rejects.toThrow();
  });
});
