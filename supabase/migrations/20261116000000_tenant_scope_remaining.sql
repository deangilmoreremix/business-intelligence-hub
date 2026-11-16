/*
  Tenant scope for the chatbot, preference and walkthrough tables.
  Existing (session / user based) policies stay as they are; a RESTRICTIVE policy is added on top so a row is only
  visible/writable when it ALSO belongs to the caller's tenant (see app_tenant() in 20261113000000).
  Existing rows land in the shared 'public' tenant via the column default. Shared read-only tables
  (app_content, chatbot_knowledge_base) are intentionally left alone.
*/
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['chatbot_conversations','chatbot_messages','chatbot_usage_analytics','user_preferences','walkthrough_progress','tooltip_interactions'] LOOP
    IF to_regclass('public.' || t) IS NULL THEN CONTINUE; END IF;
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS tenant_id text NOT NULL DEFAULT app_tenant()', t);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I (tenant_id)', t || '_tenant_idx', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_tenant_scope', t);
    EXECUTE format('CREATE POLICY %I ON %I AS RESTRICTIVE FOR ALL USING (tenant_id = app_tenant()) WITH CHECK (tenant_id = app_tenant())', t || '_tenant_scope', t);
  END LOOP;
END $$;
