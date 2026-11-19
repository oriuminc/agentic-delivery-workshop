import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError } from './client';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

afterEach(() => vi.unstubAllGlobals());

describe('api client', () => {
  // Tests that every call sends a short x-request-id so backend logs can be correlated.
  // Params: fetch stubbed to return an empty entries list.
  // Expected: header is an 8-char id; listEntries unwraps to [].
  it('sends an x-request-id and unwraps the entries list', async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(200, { entries: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(api.listEntries()).resolves.toEqual([]);
    const headers = fetchMock.mock.calls[0]![1].headers as Record<string, string>;
    expect(headers['x-request-id']).toMatch(/^[a-f0-9-]{8}$/);
  });

  // Tests that server errors become ApiError with the server's requestId.
  // Params: 400 response { code: invalid_input, requestId: "srv-1" }.
  // Expected: ApiError(status 400, code invalid_input, requestId "srv-1").
  it('maps an error response to ApiError carrying the request id', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      json(400, { error: { code: 'invalid_input', message: 'title is required', requestId: 'srv-1' } }),
    ));
    const err = await api.createEntry({ title: '', body: '' }).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 400, code: 'invalid_input', requestId: 'srv-1', message: 'title is required' });
  });

  // Tests a network failure (server down) still yields a traceable error.
  // Params: fetch rejects with TypeError.
  // Expected: ApiError code "network", status 0, with a client-minted request id.
  it('reports network failures as ApiError("network")', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const err = await api.listEntries().catch((e) => e);
    expect(err).toMatchObject({ code: 'network', status: 0 });
    expect(err.requestId).toHaveLength(8);
  });

  // Tests DELETE's 204 path, which has no JSON body to parse.
  // Params: 204 empty response for id "a/b" (needs URL-encoding).
  // Expected: resolves undefined and the id is encoded as a%2Fb.
  it('handles 204 and encodes ids', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(api.deleteEntry('a/b')).resolves.toBeUndefined();
    expect(fetchMock.mock.calls[0]![0]).toBe('/api/entries/a%2Fb');
  });
});
