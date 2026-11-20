import { afterEach, describe, expect, it } from 'vitest';
import { checkRate, rateHooks } from '../../netlify/lib/ratelimit.mts';
import { _resetRateLimits } from '../../netlify/lib/auth.mts';

const original = rateHooks.store;
afterEach(() => { rateHooks.store = original; _resetRateLimits(); });

describe('checkRate', () => {
  it('uses the shared store when available', async () => {
    const calls: Array<[string, number, number]> = [];
    rateHooks.store = () => ({ hit: async (k, l, w) => { calls.push([k, l, w]); return { allowed: false, retryAfter: 7 }; } });
    expect(await checkRate('openai:t1', 5, 60)).toEqual({ ok: false, retryAfter: 7 });
    expect(calls).toEqual([['openai:t1', 5, 60]]);
  });

  it('falls back to the per-instance limiter without a store', async () => {
    rateHooks.store = () => null;
    expect((await checkRate('k', 2)).ok).toBe(true);
    expect((await checkRate('k', 2)).ok).toBe(true);
    const third = await checkRate('k', 2);
    expect(third.ok).toBe(false);
    expect(third.retryAfter).toBeGreaterThan(0);
  });

  it('falls back (still limited) when the shared store errors', async () => {
    rateHooks.store = () => ({ hit: async () => { throw new Error('db down'); } });
    expect((await checkRate('e', 1)).ok).toBe(true);
    expect((await checkRate('e', 1)).ok).toBe(false);
  });
});
