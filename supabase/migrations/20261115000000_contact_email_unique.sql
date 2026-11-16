/*
  One contact per email per tenant (case-insensitive). Skipped with a NOTICE (never fails the deploy) when the table
  already contains duplicates: merge them in Advanced Contacts ("Find duplicates"), then re-run this statement.
*/
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM contacts WHERE email IS NOT NULL AND email <> '' GROUP BY tenant_id, lower(email) HAVING count(*) > 1) THEN
    RAISE NOTICE 'contacts_tenant_email_key NOT created: duplicate emails exist. Merge duplicates, then run: CREATE UNIQUE INDEX contacts_tenant_email_key ON contacts (tenant_id, lower(email)) WHERE email IS NOT NULL AND email <> ''''';
  ELSE
    CREATE UNIQUE INDEX IF NOT EXISTS contacts_tenant_email_key ON contacts (tenant_id, lower(email)) WHERE email IS NOT NULL AND email <> '';
  END IF;
END $$;
