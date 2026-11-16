# End-to-end tests

These drive the real UI in Chromium against a real Postgres (the repo's migrations applied),
with only the OpenAI proxy mocked (deterministic responses, so no API key or cost).

Setup (local, once):
1. Postgres with roles `anon`, `authenticated` and an `auth.uid()` stub; apply `supabase/migrations/*.sql` to a DB named `biztest`.
2. `npm i --no-save pg playwright`
3. `node e2e/postgrest-shim.cjs` (tiny PostgREST stand-in on :54321; or use `supabase start` and adjust the URL)
4. `.env.local`: `VITE_SUPABASE_URL=http://localhost:54321`, `VITE_SUPABASE_ANON_KEY=anon`; `npx vite --port 5111`
5. `node e2e/contacts.e2e.cjs`, `node e2e/apps.e2e.cjs`, `node e2e/chat.e2e.cjs`

Unit tests (no setup): `npm test`.

`builder.e2e.cjs` drives the Dashboard Builder (real vendored Twenty charts, drag/resize with the mouse, persistence,
filters, record context, drill-down, approved iframe embeds, team scope). It needs the `dashboard_aggregate` /
`dashboard_records` RPCs, which `postgrest-shim.cjs` exposes at `/rest/v1/rpc/<fn>` like Supabase does.

Also: `images.e2e.cjs` (real PNG uploads for contacts / team / company logos, needs the Storage stand-in in
`postgrest-shim.cjs`), `theme-audit.e2e.cjs` + `theme-states.e2e.cjs` (every page and overlay in light and dark; flags
wrong-colour surfaces and low-contrast text; the browser's OS scheme is deliberately the opposite of the app theme to prove
the app toggle wins) and `theme-persist.e2e.cjs` (theme choice survives reloads).

More scripts added later (same setup; each prints PASS/FAIL lines and exits non-zero on failure):
- `paging.e2e.cjs` – 120 contacts: server-side paging, search (incl. special characters), status filter, sort, export of all rows.
- `import.e2e.cjs` – CSV import: header mapping, quoted commas/newlines, duplicate and invalid rows with reasons.
- `contacts.e2e.cjs` also covers undo of single delete, bulk delete and merge.
- `deeplink.e2e.cjs` – `/app/contacts-hub?status=lead&q=ann` deep links (builder -> Advanced Contacts).
- `widgets-new.e2e.cjs` – KPI cards / AI analytics widgets in the builder.
- `mock-data.e2e.cjs` – "Delete mock data" hides demo figures on all pages and "Restore demo data" brings them back.
- `clicks.e2e.cjs` – clicks every button on every page (shard with `SHARD=0 N=4`) and lists ones that do nothing.
- `a11y-unlabeled.e2e.cjs` – lists buttons/links/inputs without an accessible name.
- Database isolation: `psql "$DB_URL" -v ON_ERROR_STOP=1 -f scripts/test-tenant-rls.sql` must print `PASS tenant isolation`.
