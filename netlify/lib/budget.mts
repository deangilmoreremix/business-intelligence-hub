// Per-tenant daily AI budget (requests + tokens). Counters live in Supabase `ai_budget` (service role only).
// Enabled when DAILY_REQUEST_LIMIT and/or DAILY_TOKEN_LIMIT is set AND the Supabase service credentials exist;
// otherwise it is a no-op. Storage errors never block a request (fail open) but are logged.
import { createClient } from '@supabase/supabase-js';

export interface Usage { requests: number; tokens: number }
export interface BudgetStore {
  get(tenant: string): Promise<Usage>;
  add(tenant: string, requests: number, tokens: number): Promise<void>;
}
export interface Limits { requests?: number; tokens?: number }

export const limitsFromEnv = (env: Record<string, string | undefined> = process.env): Limits => {
  const n = (v?: string) => (v && Number(v) > 0 ? Number(v) : undefined);
  return { requests: n(env.DAILY_REQUEST_LIMIT), tokens: n(env.DAILY_TOKEN_LIMIT) };
};

export const hasLimits = (l: Limits) => l.requests !== undefined || l.tokens !== undefined;

/** Which limit (if any) the usage has already reached. */
export const exceeded = (u: Usage, l: Limits): 'requests' | 'tokens' | null =>
  l.requests !== undefined && u.requests >= l.requests ? 'requests' : l.tokens !== undefined && u.tokens >= l.tokens ? 'tokens' : null;

/** Total tokens from a Responses API payload (usage.total_tokens, else input+output). */
export const tokensOf = (payload: unknown): number => {
  const u = (payload as { usage?: { total_tokens?: number; input_tokens?: number; output_tokens?: number } } | null)?.usage;
  if (!u) return 0;
  return Number(u.total_tokens) || (Number(u.input_tokens) || 0) + (Number(u.output_tokens) || 0);
};

export function supabaseBudgetStore(env: Record<string, string | undefined> = process.env): BudgetStore | null {
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const db = createClient(url, key, { auth: { persistSession: false } });
  return {
    async get(tenant) {
      const day = new Date().toISOString().slice(0, 10);
      const { data, error } = await db.from('ai_budget').select('requests,tokens').eq('tenant_id', tenant).eq('day', day).maybeSingle();
      if (error) throw new Error(error.message);
      return { requests: Number(data?.requests ?? 0), tokens: Number(data?.tokens ?? 0) };
    },
    async add(tenant, requests, tokens) {
      const { error } = await db.rpc('ai_budget_add', { p_tenant: tenant, p_requests: requests, p_tokens: tokens });
      if (error) throw new Error(error.message);
    },
  };
}
