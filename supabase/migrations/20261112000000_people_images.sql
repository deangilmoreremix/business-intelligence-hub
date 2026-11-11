/*
  Uploadable people images (contacts, team members, company logos).

  - Storage bucket `people-images` (public read) + policies. Guarded so the migration also applies to a plain
    Postgres without the Supabase `storage` schema (local tests).
  - contacts.avatar_url, companies.logo_url
  - team_members: the team shown on pages like Win Rate / Smart Followups (previously hardcoded in the front end);
    avatar_url is the uploaded photo, falling back to the stock photo when null.

  Policies are open like the rest of the app until the tenant-token auth plan is implemented.
*/

DO $$
BEGIN
  IF to_regclass('storage.buckets') IS NOT NULL THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('people-images', 'people-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
    ON CONFLICT (id) DO UPDATE SET public = true, file_size_limit = 10485760,
      allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    DROP POLICY IF EXISTS "people_images_read" ON storage.objects;
    CREATE POLICY "people_images_read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'people-images');
    DROP POLICY IF EXISTS "people_images_insert" ON storage.objects;
    CREATE POLICY "people_images_insert" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'people-images');
    DROP POLICY IF EXISTS "people_images_update" ON storage.objects;
    CREATE POLICY "people_images_update" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'people-images');
    DROP POLICY IF EXISTS "people_images_delete" ON storage.objects;
    CREATE POLICY "people_images_delete" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'people-images');
  END IF;
END $$;

ALTER TABLE contacts ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS logo_url text;

CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  role text,
  status text DEFAULT 'online' CHECK (status IN ('online', 'offline', 'away', 'busy')),
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "team_members_all" ON team_members;
CREATE POLICY "team_members_all" ON team_members FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO team_members (name, role, status) VALUES
  ('Sarah Johnson', 'Senior Sales Manager', 'online'),
  ('Michael Chen', 'Account Executive', 'online'),
  ('Emily Rodriguez', 'Business Development Rep', 'away'),
  ('David Kim', 'Sales Director', 'online'),
  ('Lisa Thompson', 'Customer Success Manager', 'busy'),
  ('James Wilson', 'Sales Analyst', 'online')
ON CONFLICT (name) DO NOTHING;
