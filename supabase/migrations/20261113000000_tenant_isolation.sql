/*
  Tenant isolation.

  The host CRM mints a Supabase-compatible JWT (signed with the project's JWT secret) carrying a `tenant_id`
  claim. PostgREST exposes the claims as `request.jwt.claims`; `app_tenant()` reads the tenant from there.
  Requests WITHOUT a token (the anon key only) all belong to the shared tenant 'public', so existing
  single-tenant deployments keep working unchanged, while a tenant with a token can only see its own rows.

  Existing rows are backfilled into 'public' by the column default.
  Storage (people-images) is public-read by design; uploads are namespaced by the app, not isolated by RLS.
*/

CREATE OR REPLACE FUNCTION app_tenant() RETURNS text
LANGUAGE sql STABLE AS $$
  SELECT coalesce(
    nullif(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'tenant_id', ''),
    'public'
  )
$$;

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'companies','contacts','contact_notes','contact_activities','deals',
    'app_settings','ai_insights','ai_usage_logs','dashboard_layouts','saved_filters','team_members'
  ] LOOP
    IF to_regclass('public.' || t) IS NULL THEN CONTINUE; END IF;
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS tenant_id text NOT NULL DEFAULT app_tenant()', t);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON %I (tenant_id)', t || '_tenant_idx', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_all', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_tenant', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR ALL TO anon, authenticated USING (tenant_id = app_tenant()) WITH CHECK (tenant_id = app_tenant())',
      t || '_tenant', t);
  END LOOP;
END $$;

-- Uniqueness is per tenant now.
DROP INDEX IF EXISTS app_settings_key_user_idx;
CREATE UNIQUE INDEX IF NOT EXISTS app_settings_tenant_key_user_idx ON app_settings (tenant_id, setting_key, user_id) NULLS NOT DISTINCT;

ALTER TABLE team_members DROP CONSTRAINT IF EXISTS team_members_name_key;
DROP INDEX IF EXISTS team_members_name_key;
CREATE UNIQUE INDEX IF NOT EXISTS team_members_tenant_name_key ON team_members (tenant_id, name);
