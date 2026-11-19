import { describe, expect, it } from 'vitest';
import { LIMITS, validateCreate, validateUpdate } from './validation.js';

describe('validateCreate', () => {
  // Tests that body defaults to an empty string when omitted.
  // Params: { title: "Only title" }.
  // Expected: ok with body "".
  it('defaults body to empty string', () => {
    expect(validateCreate({ title: 'Only title' })).toEqual({ ok: true, value: { title: 'Only title', body: '' } });
  });

  // Tests the title length boundary.
  // Params: a title one character over LIMITS.title (201 chars).
  // Expected: rejected with a "at most 200" message.
  it('rejects an over-long title', () => {
    const res = validateCreate({ title: 'x'.repeat(LIMITS.title + 1) });
    expect(res).toEqual({ ok: false, message: 'title must be at most 200 characters' });
  });

  // Tests non-object payloads.
  // Params: null and a bare string.
  // Expected: both rejected as "body must be a JSON object".
  it('rejects non-object input', () => {
    expect(validateCreate(null).ok).toBe(false);
    expect(validateCreate('title').ok).toBe(false);
  });
});

describe('validateUpdate', () => {
  // Tests that an empty patch is rejected so PATCH can't be a silent no-op.
  // Params: {} and { unknown: 1 }.
  // Expected: both rejected with "provide title and/or body".
  it('requires at least one known field', () => {
    expect(validateUpdate({})).toEqual({ ok: false, message: 'provide title and/or body' });
    expect(validateUpdate({ unknown: 1 })).toEqual({ ok: false, message: 'provide title and/or body' });
  });

  // Tests that a patch can't blank out a title.
  // Params: { title: "  " }.
  // Expected: rejected with "title is required".
  it('rejects blanking the title', () => {
    expect(validateUpdate({ title: '  ' })).toEqual({ ok: false, message: 'title is required' });
  });
});
