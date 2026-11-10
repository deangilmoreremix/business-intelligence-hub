/*
  Core CRM + AI tables referenced by the app but previously missing:
  companies, contacts (advanced), contact_notes, contact_activities, deals, app_settings, ai_insights, ai_usage_logs.

  NOTE: policies are open to anon + authenticated because the embedded app has no auth of its own
  (it runs inside the host CRM). Tighten to owner_id = auth.uid() if you add Supabase Auth.
*/

CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text,
  industry text,
  employees integer,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  email text,
  phone text,
  company text,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  job_title text,
  city text,
  status text DEFAULT 'lead' CHECK (status IN ('lead','prospect','customer','inactive')),
  tags text[] DEFAULT '{}',
  lead_score integer CHECK (lead_score BETWEEN 0 AND 100),
  ai_summary text,
  ai_next_action text,
  last_contacted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS contacts_email_idx ON contacts (lower(email));
CREATE INDEX IF NOT EXISTS contacts_status_idx ON contacts (status);

CREATE TABLE IF NOT EXISTS contact_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  kind text NOT NULL,
  detail text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  value numeric DEFAULT 0,
  stage_id text,
  probability numeric,
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  assigned_to text,
  expected_close_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  setting_key text NOT NULL,
  setting_value jsonb,
  updated_at timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS app_settings_key_user_idx ON app_settings (setting_key, user_id) NULLS NOT DISTINCT;

CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text,
  data jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id text,
  user_id text,
  model_id text,
  feature_used text,
  tokens_used integer,
  cost numeric,
  response_time_ms integer,
  success boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['companies','contacts','contact_notes','contact_activities','deals','app_settings','ai_insights','ai_usage_logs']
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "%s_all" ON %I', t, t);
    EXECUTE format('CREATE POLICY "%s_all" ON %I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;
