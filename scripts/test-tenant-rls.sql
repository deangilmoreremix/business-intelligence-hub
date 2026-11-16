-- Run: psql "$DB_URL" -v ON_ERROR_STOP=1 -f scripts/test-tenant-rls.sql   (rolls back; leaves no data)
BEGIN;
SET LOCAL ROLE anon;

-- tenant A writes
SELECT set_config('request.jwt.claims', '{"tenant_id":"tenant-a"}', true);
INSERT INTO contacts (first_name, last_name, email) VALUES ('Alice', 'A', 'a@a.com');
INSERT INTO app_settings (setting_key, setting_value) VALUES ('crm_config', '{"x":1}');

-- tenant B writes the same keys without conflict, and cannot see A
SELECT set_config('request.jwt.claims', '{"tenant_id":"tenant-b"}', true);
INSERT INTO contacts (first_name, last_name, email) VALUES ('Bob', 'B', 'b@b.com');
INSERT INTO app_settings (setting_key, setting_value) VALUES ('crm_config', '{"x":2}');

DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM contacts WHERE email = 'a@a.com';
  IF n <> 0 THEN RAISE EXCEPTION 'FAIL: tenant B can read tenant A contacts'; END IF;
  SELECT count(*) INTO n FROM contacts;
  IF n <> 1 THEN RAISE EXCEPTION 'FAIL: tenant B sees % contacts, expected 1', n; END IF;
  UPDATE contacts SET first_name = 'Hacked' WHERE email = 'a@a.com';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 0 THEN RAISE EXCEPTION 'FAIL: tenant B updated tenant A row'; END IF;
  DELETE FROM contacts WHERE email = 'a@a.com';
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 0 THEN RAISE EXCEPTION 'FAIL: tenant B deleted tenant A row'; END IF;
  BEGIN
    INSERT INTO contacts (first_name, last_name, email, tenant_id) VALUES ('Eve', 'E', 'e@e.com', 'tenant-a');
    RAISE EXCEPTION 'FAIL: tenant B inserted a row into tenant A';
  EXCEPTION WHEN insufficient_privilege OR check_violation THEN NULL; -- expected (RLS WITH CHECK)
  END;
END $$;

-- tenant A still sees only its own data
SELECT set_config('request.jwt.claims', '{"tenant_id":"tenant-a"}', true);
DO $$
DECLARE n int; v text;
BEGIN
  SELECT count(*) INTO n FROM contacts;
  IF n <> 1 THEN RAISE EXCEPTION 'FAIL: tenant A sees % contacts, expected 1', n; END IF;
  SELECT (setting_value->>'x') INTO v FROM app_settings WHERE setting_key = 'crm_config';
  IF v <> '1' THEN RAISE EXCEPTION 'FAIL: tenant A settings leaked/overwritten (x=%)', v; END IF;
END $$;

-- no token => shared 'public' tenant: sees only its own rows, never a tenant's
SELECT set_config('request.jwt.claims', '', true);
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM contacts WHERE tenant_id <> 'public';
  IF n <> 0 THEN RAISE EXCEPTION 'FAIL: anonymous (public tenant) sees % rows of other tenants', n; END IF;
END $$;

-- chatbot + preference tables are tenant scoped on top of their own session/user policies
SELECT set_config('request.headers', '{"x-session-id":"s1"}', true);
SELECT set_config('request.jwt.claims', '{"tenant_id":"tenant-a"}', true);
INSERT INTO chatbot_conversations (session_id, title) VALUES ('s1', 'A chat');
INSERT INTO user_preferences (user_id, preferences) VALUES ('shared-user-id', '{"a":1}');
SELECT set_config('request.jwt.claims', '{"tenant_id":"tenant-b"}', true);
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM chatbot_conversations WHERE session_id = 's1';
  IF n <> 0 THEN RAISE EXCEPTION 'FAIL: tenant B sees tenant A chatbot conversation (same session id)'; END IF;
  SELECT count(*) INTO n FROM user_preferences WHERE user_id = 'shared-user-id';
  IF n <> 0 THEN RAISE EXCEPTION 'FAIL: tenant B sees tenant A preferences'; END IF;
END $$;
SELECT set_config('request.jwt.claims', '{"tenant_id":"tenant-a"}', true);
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM chatbot_conversations WHERE session_id = 's1';
  IF n <> 1 THEN RAISE EXCEPTION 'FAIL: tenant A lost its chatbot conversation (%)', n; END IF;
END $$;

-- budgets are not reachable from client roles
DO $$
BEGIN
  BEGIN
    PERFORM 1 FROM ai_budget LIMIT 1;
    RAISE EXCEPTION 'FAIL: anon can read ai_budget';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
END $$;

SELECT 'PASS tenant isolation' AS result;
ROLLBACK;
