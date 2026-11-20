/*
  people-images: writes are limited to the caller's tenant folder.
  Uploads go to `<tenant>/<folder>/<uuid>.<ext>` (tenant = tenant_id claim of the host token, 'public' without one).
  Reads stay public (public bucket; URLs are unguessable uuids). Objects uploaded before this migration live under
  `contacts/…`, `team/…`, `companies/…` and keep displaying, but can no longer be overwritten or deleted by clients.
  Guarded so the migration also applies to a plain Postgres without the Supabase `storage` schema (local tests).
*/
DO $$
BEGIN
  IF to_regclass('storage.objects') IS NOT NULL THEN
    DROP POLICY IF EXISTS "people_images_insert" ON storage.objects;
    CREATE POLICY "people_images_insert" ON storage.objects FOR INSERT TO anon, authenticated
      WITH CHECK (bucket_id = 'people-images' AND (storage.foldername(name))[1] = app_tenant());
    DROP POLICY IF EXISTS "people_images_update" ON storage.objects;
    CREATE POLICY "people_images_update" ON storage.objects FOR UPDATE TO anon, authenticated
      USING (bucket_id = 'people-images' AND (storage.foldername(name))[1] = app_tenant());
    DROP POLICY IF EXISTS "people_images_delete" ON storage.objects;
    CREATE POLICY "people_images_delete" ON storage.objects FOR DELETE TO anon, authenticated
      USING (bucket_id = 'people-images' AND (storage.foldername(name))[1] = app_tenant());
  END IF;
END $$;
