/*
  Duplicate detection in the database so the app never needs the whole contact list in the browser.
  Both functions are SECURITY INVOKER: Row Level Security (tenant scope) applies to the caller.
*/
-- Exact duplicates: same email (case-insensitive) or same phone (digits only, >= 7 digits).
CREATE OR REPLACE FUNCTION contact_duplicate_groups()
RETURNS TABLE (ids uuid[], reason text)
LANGUAGE sql STABLE AS $$
  SELECT array_agg(id ORDER BY created_at), 'Same email'::text
    FROM contacts WHERE email IS NOT NULL AND email <> ''
    GROUP BY lower(email) HAVING count(*) > 1
  UNION ALL
  SELECT array_agg(id ORDER BY created_at), 'Same phone'::text
    FROM contacts WHERE length(regexp_replace(coalesce(phone, ''), '\D', '', 'g')) >= 7
    GROUP BY regexp_replace(phone, '\D', '', 'g') HAVING count(*) > 1
$$;

-- Candidates for AI fuzzy matching: contacts that share a last name with at least one other contact.
CREATE OR REPLACE FUNCTION contact_fuzzy_candidates(p_limit integer DEFAULT 150)
RETURNS SETOF contacts
LANGUAGE sql STABLE AS $$
  SELECT c.* FROM contacts c
  WHERE coalesce(trim(c.last_name), '') <> ''
    AND lower(trim(c.last_name)) IN (
      SELECT lower(trim(last_name)) FROM contacts WHERE coalesce(trim(last_name), '') <> '' GROUP BY 1 HAVING count(*) > 1)
  ORDER BY lower(trim(c.last_name)), c.created_at
  LIMIT least(greatest(p_limit, 1), 500)
$$;
