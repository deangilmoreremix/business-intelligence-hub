/*
  Shared fixed-window rate limit used by the Netlify Functions (service role only), so the limit holds across
  function instances. RLS on, no policies, client roles revoked. Denied requests still count toward the window.
*/
CREATE TABLE IF NOT EXISTS rate_limits (
  key text PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT now(),
  count integer NOT NULL DEFAULT 0
);
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON rate_limits FROM anon, authenticated;

CREATE OR REPLACE FUNCTION rate_limit_hit(p_key text, p_limit integer, p_window_seconds integer)
RETURNS TABLE (allowed boolean, retry_after integer)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  WITH up AS (
    INSERT INTO rate_limits AS r (key, window_start, count) VALUES (p_key, now(), 1)
    ON CONFLICT (key) DO UPDATE SET
      window_start = CASE WHEN r.window_start <= now() - make_interval(secs => p_window_seconds) THEN now() ELSE r.window_start END,
      count        = CASE WHEN r.window_start <= now() - make_interval(secs => p_window_seconds) THEN 1 ELSE r.count + 1 END
    RETURNING r.count, r.window_start
  )
  SELECT up.count <= p_limit,
         GREATEST(0, ceil(extract(epoch FROM (up.window_start + make_interval(secs => p_window_seconds) - now())))::integer)
  FROM up
$$;
REVOKE ALL ON FUNCTION rate_limit_hit(text, integer, integer) FROM PUBLIC, anon, authenticated;
