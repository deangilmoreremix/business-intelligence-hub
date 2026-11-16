import { describe, expect, it } from 'vitest';
import { exceeded, hasLimits, limitsFromEnv, tokensOf } from '../../netlify/lib/budget.mts';

describe('budget helpers', () => {
  it('reads limits from env, ignoring junk', () => {
    expect(limitsFromEnv({ DAILY_REQUEST_LIMIT: '100', DAILY_TOKEN_LIMIT: 'abc' })).toEqual({ requests: 100, tokens: undefined });
    expect(hasLimits(limitsFromEnv({}))).toBe(false);
  });
  it('reports which limit is reached', () => {
    expect(exceeded({ requests: 5, tokens: 0 }, { requests: 5 })).toBe('requests');
    expect(exceeded({ requests: 1, tokens: 900 }, { requests: 5, tokens: 900 })).toBe('tokens');
    expect(exceeded({ requests: 1, tokens: 1 }, { requests: 5, tokens: 900 })).toBeNull();
    expect(exceeded({ requests: 999, tokens: 999 }, {})).toBeNull();
  });
  it('extracts tokens from usage', () => {
    expect(tokensOf({ usage: { total_tokens: 12 } })).toBe(12);
    expect(tokensOf({ usage: { input_tokens: 5, output_tokens: 7 } })).toBe(12);
    expect(tokensOf({})).toBe(0);
    expect(tokensOf(null)).toBe(0);
  });
});
