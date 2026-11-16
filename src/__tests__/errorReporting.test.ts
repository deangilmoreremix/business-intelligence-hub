import { describe, expect, it } from 'vitest';
import { buildReport } from '../lib/errorReporting';

describe('buildReport', () => {
  it('captures message and stack, strips query/hash from the path', () => {
    const r = buildReport(new Error('boom'), 'error', '/app/contacts-hub?q=secret#x');
    expect(r.message).toBe('boom');
    expect(r.path).toBe('/app/contacts-hub');
    expect(r.stack).toContain('boom');
  });
  it('handles strings and non-errors and truncates long messages', () => {
    expect(buildReport('plain', 'unhandledrejection').message).toBe('plain');
    expect(buildReport({ a: 1 }, 'error').message).toBe('Non-error thrown');
    expect(buildReport(new Error('x'.repeat(2000)), 'error').message.length).toBe(500);
  });
});
