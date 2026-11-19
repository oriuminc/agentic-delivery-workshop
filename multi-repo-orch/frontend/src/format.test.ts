import { describe, expect, it } from 'vitest';
import { excerpt, relativeTime } from './format';

describe('relativeTime', () => {
  const now = new Date('2026-11-16T12:00:00.000Z');

  // Tests each relative bucket at a fixed "now" so results are deterministic.
  // Params: 30s, 5m, 3h and 30h before now.
  // Expected: "just now", "5m ago", "3h ago", "yesterday".
  it('buckets recent times', () => {
    expect(relativeTime('2026-11-16T11:59:30.000Z', now)).toBe('just now');
    expect(relativeTime('2026-11-16T11:55:00.000Z', now)).toBe('5m ago');
    expect(relativeTime('2026-11-16T09:00:00.000Z', now)).toBe('3h ago');
    expect(relativeTime('2026-11-15T06:00:00.000Z', now)).toBe('yesterday');
  });
});

describe('excerpt', () => {
  // Tests whitespace collapsing and truncation with an ellipsis.
  // Params: multi-line text and max=10.
  // Expected: newlines collapsed; output is exactly 10 chars ending in "…".
  it('collapses whitespace and truncates', () => {
    expect(excerpt('a\n\nb   c')).toBe('a b c');
    const out = excerpt('abcdefghijklmnop', 10);
    expect(out).toBe('abcdefghi…');
    expect(out).toHaveLength(10);
  });
});
