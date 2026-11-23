/*
  One contact per email per tenant (case-insensitive). Skipped with a NOTICE (never fails the deploy) when the table
  already contains duplicates: merge them in Advanced Contacts ("Find duplicates"), then re-run this statement.
*/
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM bi_contacts WHERE email IS NOT NULL AND email <> '' GROUP BY tenant_id, lower(email) HAVING count(*) > 1) THEN
    RAISE NOTICE 'bi_contacts_tenant_email_key NOT created: duplicate emails exist. Merge duplicates, then run: CREATE UNIQUE INDEX bi_contacts_tenant_email_key ON bi_contacts (tenant_id, lower(email)) WHERE email IS NOT NULL AND email <> ''''';
  ELSE
    CREATE UNIQUE INDEX IF NOT EXISTS bi_contacts_tenant_email_key ON bi_contacts (tenant_id, lower(email)) WHERE email IS NOT NULL AND email <> '';
  END IF;
END $$;
