-- Public-web enrichment fields (OpenAI web search) for contacts.
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS linkedin_url text,
  ADD COLUMN IF NOT EXISTS twitter_url text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS enrichment jsonb,
  ADD COLUMN IF NOT EXISTS enriched_at timestamptz;

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS linkedin_url text;
