// Rate limiting shared across function instances (Supabase `rate_limit_hit`), with the in-memory limiter as fallback.
// If the shared store is unavailable the request is checked against the in-memory limiter instead (fail open to
// per-instance limiting, never to "no limit") and the error is logged.
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from './auth.mts';
import { log } from './log.mts';

export interface RateStore { hit(key: string, limit: number, windowSeconds: number): Promise<{ allowed: boolean; retryAfter: number }> }

export function supabaseRateStore(env: Record<string, string | undefined> = process.env): RateStore | null {
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const db = createClient(url, key, { auth: { persistSession: false } });
  return {
    async hit(k, limit, windowSeconds) {
      const { data, error } = await db.rpc('rate_limit_hit', { p_key: k, p_limit: limit, p_window_seconds: windowSeconds });
      if (error) throw new Error(error.message);
      const row = (Array.isArray(data) ? data[0] : data) as { allowed: boolean; retry_after: number } | undefined;
      if (!row) throw new Error('empty rate limit response');
      return { allowed: Boolean(row.allowed), retryAfter: Number(row.retry_after) || 0 };
    },
  };
}

// Replaceable in tests.
export const rateHooks: { store: () => RateStore | null } = { store: () => supabaseRateStore() };

export async function checkRate(key: string, limit: number, windowSeconds = 60): Promise<{ ok: boolean; retryAfter: number }> {
  const store = rateHooks.store();
  if (store) {
    try {
      const r = await store.hit(key, limit, windowSeconds);
      return { ok: r.allowed, retryAfter: r.retryAfter };
    } catch (e) {
      log('error', 'ratelimit', 'shared store failed, using per-instance limit', { err: String(e) });
    }
  }
  return rateLimit(key, limit, windowSeconds * 1000);
}
