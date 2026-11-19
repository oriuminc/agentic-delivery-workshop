import type { Entry, EntryInput } from '../types';

/** Error raised for any failed API call. `requestId` is what users quote to /rca. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly requestId: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const newRequestId = () => crypto.randomUUID().slice(0, 8);

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const requestId = newRequestId();
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      ...init,
      headers: { 'content-type': 'application/json', 'x-request-id': requestId, ...init.headers },
    });
  } catch {
    throw new ApiError('Could not reach the server', 0, 'network', requestId);
  }
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = data?.error ?? {};
    throw new ApiError(err.message ?? res.statusText, res.status, err.code ?? 'unknown', err.requestId ?? requestId);
  }
  return data as T;
}

export const api = {
  listEntries: () => request<{ entries: Entry[] }>('/entries').then((d) => d.entries),
  createEntry: (input: EntryInput) =>
    request<{ entry: Entry }>('/entries', { method: 'POST', body: JSON.stringify(input) }).then((d) => d.entry),
  updateEntry: (id: string, patch: Partial<EntryInput>) =>
    request<{ entry: Entry }>(`/entries/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(patch) }).then(
      (d) => d.entry,
    ),
  deleteEntry: (id: string) => request<void>(`/entries/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};
