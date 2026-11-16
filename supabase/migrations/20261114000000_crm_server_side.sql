/*
  CRM connection is handled server-side (Netlify Function `crm`) so the CRM API key never reaches the browser.
  crm_connections is only reachable with the service role: RLS is on and no policy is granted to anon/authenticated.
  Keys previously stored in app_settings('crm_config') are scrubbed; reconnect once to store the key server-side.
*/
CREATE TABLE IF NOT EXISTS crm_connections (
  tenant_id text PRIMARY KEY,
  api_url text NOT NULL,
  api_key text NOT NULL,
  customer_id text NOT NULL DEFAULT '',
  sync_enabled boolean NOT NULL DEFAULT true,
  last_sync timestamptz,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE crm_connections ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON crm_connections FROM anon, authenticated;

UPDATE app_settings SET setting_value = setting_value - 'apiKey' WHERE setting_key = 'crm_config' AND setting_value ? 'apiKey';
