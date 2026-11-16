/*
  Per-tenant daily AI usage counters, written by the openai-proxy Netlify Function with the service role.
  RLS is on with no policy and all client roles are revoked: the browser can never read or alter budgets.
*/
CREATE TABLE IF NOT EXISTS ai_budget (
  tenant_id text NOT NULL,
  day date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  requests integer NOT NULL DEFAULT 0,
  tokens bigint NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (tenant_id, day)
);
ALTER TABLE ai_budget ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ai_budget FROM anon, authenticated;

/* Atomic increment used by the proxy: returns the new totals for the day. */
CREATE OR REPLACE FUNCTION ai_budget_add(p_tenant text, p_requests integer, p_tokens bigint)
RETURNS TABLE (requests integer, tokens bigint)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO ai_budget AS b (tenant_id, requests, tokens) VALUES (p_tenant, p_requests, p_tokens)
  ON CONFLICT (tenant_id, day) DO UPDATE SET requests = b.requests + EXCLUDED.requests, tokens = b.tokens + EXCLUDED.tokens, updated_at = now()
  RETURNING b.requests, b.tokens
$$;
REVOKE ALL ON FUNCTION ai_budget_add(text, integer, bigint) FROM PUBLIC, anon, authenticated;
