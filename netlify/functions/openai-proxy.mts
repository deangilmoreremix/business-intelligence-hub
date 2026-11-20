// Netlify Function: server-side proxy for the OpenAI Responses and Images APIs.
// Requires env var OPENAI_API_KEY (set in Netlify site settings). Optional: ALLOWED_ORIGIN.
import type { Context } from '@netlify/functions';
import { authenticate } from '../lib/auth.mts';
import { checkRate } from '../lib/ratelimit.mts';
import { log } from '../lib/log.mts';
import { exceeded, hasLimits, limitsFromEnv, supabaseBudgetStore, tokensOf, type BudgetStore } from '../lib/budget.mts';

// Replaceable in tests.
export const budgetHooks: { store: () => BudgetStore | null } = { store: () => supabaseBudgetStore() };

const ENDPOINTS = new Set(['responses', 'images/generations', 'images/edits']);
const MODEL_PREFIXES = ['gpt-6', 'gpt-5', 'gpt-image-'];
const MAX_OUTPUT_TOKENS = 16000;
const MAX_BODY_BYTES = 200_000;
const DEFAULT_RATE_LIMIT_PER_MIN = 30;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export default async (req: Request, _ctx: Context) => {
  if (req.method === 'GET') return json({ configured: Boolean(process.env.OPENAI_API_KEY) });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const allowed = process.env.ALLOWED_ORIGIN;
  const origin = req.headers.get('origin');
  // In production an explicit allowed origin is mandatory (otherwise any site could spend the OpenAI key).
  if (!allowed && process.env.CONTEXT === 'production') return json({ error: 'ALLOWED_ORIGIN must be set on the server' }, 500);
  if (allowed && origin && origin !== allowed) return json({ error: 'Forbidden origin' }, 403);

  const auth = authenticate(req);
  if (!auth.ok) return json({ error: auth.error }, auth.status ?? 401);
  const limit = await checkRate(`openai:${auth.tenant}`, Number(process.env.RATE_LIMIT_PER_MIN) || DEFAULT_RATE_LIMIT_PER_MIN);
  if (!limit.ok) return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(limit.retryAfter) } });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return json({ error: 'OPENAI_API_KEY is not configured on the server' }, 500);

  const limits = limitsFromEnv();
  const budget = hasLimits(limits) ? budgetHooks.store() : null;
  if (budget) {
    try {
      const hit = exceeded(await budget.get(auth.tenant), limits);
      if (hit) return json({ error: `Daily AI ${hit} limit reached for this account` }, 429);
    } catch (e) { log('error', 'openai-proxy', 'budget check failed (allowing request)', { err: String(e) }); }
  }

  let payload: { endpoint?: string; body?: Record<string, any> };
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) return json({ error: 'Request too large' }, 413);
    payload = JSON.parse(raw);
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { endpoint, body } = payload;
  if (!endpoint || !ENDPOINTS.has(endpoint) || !body || typeof body !== 'object') {
    return json({ error: 'Invalid endpoint or body' }, 400);
  }
  if (typeof body.model !== 'string' || !MODEL_PREFIXES.some((p) => body.model.startsWith(p))) {
    return json({ error: 'Model not allowed' }, 400);
  }
  if (endpoint === 'responses') {
    // Only OpenAI-hosted web search is allowed as a tool (no function/MCP/code tools via this proxy).
    if (body.tools !== undefined) {
      const ok = Array.isArray(body.tools) && body.tools.every((t: any) => t?.type === 'web_search');
      if (!ok) return json({ error: 'Tool not allowed' }, 400);
    }
    body.max_output_tokens = Math.min(Number(body.max_output_tokens) || MAX_OUTPUT_TOKENS, MAX_OUTPUT_TOKENS);
    delete body.stream; // non-streaming proxy
  }

  const upstream = await fetch(`${process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  const text = await upstream.text();
  if (!upstream.ok) log('warn', 'openai-proxy', 'upstream error', { status: upstream.status, endpoint, tenant: auth.tenant });
  if (budget && upstream.ok) {
    let tokens = 0;
    try { tokens = tokensOf(JSON.parse(text)); } catch { /* not JSON: count the request only */ }
    budget.add(auth.tenant, 1, tokens).catch(e => log('error', 'openai-proxy', 'budget update failed', { err: String(e) }));
  }
  return new Response(text, {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json' },
  });
};
