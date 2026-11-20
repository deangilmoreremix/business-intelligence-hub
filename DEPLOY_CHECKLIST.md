# Deploy checklist

Things only you can run (they need live credentials):

1. **Supabase** – apply `supabase/migrations/*` in filename order (20261110… → 20261112…). Confirm the `people-images` storage bucket exists and is public-read.
2. **Netlify env vars** – `OPENAI_API_KEY` (required), `ALLOWED_ORIGIN` (your host app's origin), optional `OPENAI_MODEL`, `OPENAI_FAST_MODEL`, `OPENAI_IMAGE_MODEL`. Build env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
3. **Deploy**, then run `SITE_URL=https://<site>.netlify.app npm run smoke:openai` – all lines must PASS.
4. **Images** – open Advanced Contacts, upload a contact photo, reload; it must persist (proves Storage signed upload).
5. **Federation** – load `/remoteEntry.js` from the host app and open the AnalyticsApp remote; check styles render.
6. **Auth + tenancy** – set `HOST_JWT_SECRET` (use the Supabase JWT secret), `ALLOWED_ORIGIN`, and have the host post `{type:'AUTH_TOKEN', data: <jwt>}` (claims `tenant_id`, `exp`, `role: "authenticated"`). Apply migrations `20261113…` (tenant RLS) and `20261114…` (CRM server-side). Run `psql "$DB_URL" -f scripts/test-tenant-rls.sql` – it must print `PASS tenant isolation`. Without a token everything lives in the shared `public` tenant.
7. **CRM** – set `SUPABASE_SERVICE_ROLE_KEY` (+ `SUPABASE_URL`); the CRM connector now runs server-side and requires a host token. Reconnect the CRM once (old browser-stored keys are scrubbed).
8. **More migrations** – apply `20261115…` (unique email per tenant; it prints a NOTICE and skips itself if duplicate emails exist – merge them first), `20261116…` (tenant scope for chatbot/preferences/walkthrough), `20261117…` (AI budget table).
9. **Migrations 18–20** – `20261118…` limits `people-images` writes to the caller's tenant folder (needs the Supabase `storage` schema; existing photos keep displaying), `20261119…` adds the shared rate limit (`rate_limits`, `rate_limit_hit`), `20261120…` adds server-side duplicate detection. After applying, upload a photo with and without a host token (path starts with the tenant id, or `public/`).
10. **AI budget** – optional: set `DAILY_REQUEST_LIMIT` and/or `DAILY_TOKEN_LIMIT` (needs `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` on the function). Counters are per tenant per UTC day; if the database is unreachable the proxy lets requests through and logs an error.
11. **Error reports** – optional: set `VITE_ERROR_REPORT_URL` at build time to receive uncaught-error reports (message, stack, path only).
12. **Headers** – CSP is report-only; review violations in the browser console, then switch it to enforcing and add `frame-ancestors <host origin>`.
13. **Known gaps** – reads of uploaded photos are public by design (unguessable uuid URLs); the rate limit falls back to per-instance memory if the database is unreachable; the full contact list is still loaded into the store for other pages (KPI cards etc.); the contacts/deals board and table column drag/resize from Twenty are not included (need Twenty's own record backend). Without HOST_JWT_SECRET the proxy runs open.
