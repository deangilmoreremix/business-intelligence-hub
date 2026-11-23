/*
  Explicit grants for this app's tables and functions.
  Some Supabase projects create new public tables with NO default privileges for anon/authenticated
  ("default privileges private"); then RLS never even gets evaluated because the role has no table access.
  These grants are harmless on projects where the defaults already allow access. Row access is still decided by RLS.
  Server-only objects (crm_connections, ai_budget, bi_rate_limits and their functions) are NOT granted to clients.
*/
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'app_content','chatbot_conversations','chatbot_messages','chatbot_knowledge_base','chatbot_usage_analytics',
    'user_preferences','walkthrough_progress','tooltip_interactions',
    'companies','bi_contacts','contact_notes','contact_activities','bi_deals','app_settings','ai_insights','ai_usage_logs',
    'dashboard_layouts','saved_filters','team_members'
  ] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO anon, authenticated', t);
    END IF;
  END LOOP;
END $$;

-- Functions the browser calls (all SECURITY INVOKER: RLS applies to the caller). Some projects revoke the default
-- PUBLIC execute privilege on new functions, so grant it explicitly. Server-only functions (ai_budget_add,
-- rate_limit_hit) are intentionally not listed.
DO $$
DECLARE f record;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ('app_tenant', 'contact_duplicate_groups', 'contact_fuzzy_candidates',
                        'dashboard_column', 'dashboard_filter_sql', 'dashboard_aggregate', 'dashboard_records')
  LOOP
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO anon, authenticated', f.sig);
  END LOOP;
END $$;
