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
