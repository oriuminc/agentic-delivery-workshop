import type { Request } from 'express';
import type { EntryInput, RequestMeta } from './types.js';

export const LIMITS = { title: 200, body: 50_000 } as const;

export type Validation<T> = { ok: true; value: T } | { ok: false; message: string };

function checkField(name: keyof typeof LIMITS, value: unknown): string | undefined {
  if (typeof value !== 'string') return `${name} must be a string`;
  if (value.length > LIMITS[name]) return `${name} must be at most ${LIMITS[name]} characters`;
  return undefined;
}

/** Full input for POST. Title is required (non-blank); body may be empty. */
export function validateCreate(input: unknown): Validation<EntryInput> {
  if (typeof input !== 'object' || input === null) return { ok: false, message: 'body must be a JSON object' };
  const { title, body = '' } = input as Record<string, unknown>;
  const err = checkField('title', title) ?? checkField('body', body);
  if (err) return { ok: false, message: err };
  if ((title as string).trim() === '') return { ok: false, message: 'title is required' };
  return { ok: true, value: { title: (title as string).trim(), body: body as string } };
}

/** Partial input for PATCH. At least one known field must be present. */
export function validateUpdate(input: unknown): Validation<Partial<EntryInput>> {
  if (typeof input !== 'object' || input === null) return { ok: false, message: 'body must be a JSON object' };
  const src = input as Record<string, unknown>;
  const patch: Partial<EntryInput> = {};
  for (const key of ['title', 'body'] as const) {
    if (!(key in src)) continue;
    const err = checkField(key, src[key]);
    if (err) return { ok: false, message: err };
    patch[key] = key === 'title' ? (src[key] as string).trim() : (src[key] as string);
  }
  if (Object.keys(patch).length === 0) return { ok: false, message: 'provide title and/or body' };
  if (patch.title === '') return { ok: false, message: 'title is required' };
  return { ok: true, value: patch };
}

export const UA_MAX = 256;

/** Strip control characters and truncate; empty or missing becomes null. */
export function sanitizeUserAgent(raw: string | undefined): string | null {
  if (!raw) return null;
  // eslint-disable-next-line no-control-regex
  const clean = raw.replace(/[\x00-\x1f\x7f]/g, '').slice(0, UA_MAX);
  return clean === '' ? null : clean;
}

/** Request metadata derived from the request only, never from the body. */
export function buildMeta(req: Request): RequestMeta {
  return { ip: req.ip || null, userAgent: sanitizeUserAgent(req.get('user-agent')) };
}
