# Deploy checklist

Things only you can run (they need live credentials):

1. **Supabase** – apply `supabase/migrations/*` in filename order (20261110… → 20261112…). Confirm the `people-images` storage bucket exists and is public-read.
2. **Netlify env vars** – `OPENAI_API_KEY` (required), `ALLOWED_ORIGIN` (your host app's origin), optional `OPENAI_MODEL`, `OPENAI_FAST_MODEL`, `OPENAI_IMAGE_MODEL`. Build env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
3. **Deploy**, then run `SITE_URL=https://<site>.netlify.app npm run smoke:openai` – all lines must PASS.
4. **Images** – open Advanced Contacts, upload a contact photo, reload; it must persist (proves Storage signed upload).
5. **Federation** – load `/remoteEntry.js` from the host app and open the AnalyticsApp remote; check styles render.
6. **Auth + tenancy** – set `HOST_JWT_SECRET` (use the Supabase JWT secret), `ALLOWED_ORIGIN`, and have the host post `{type:'AUTH_TOKEN', data: <jwt>}` (claims `tenant_id`, `exp`, `role: "authenticated"`). Apply migrations `20261113…` (tenant RLS) and `20261114…` (CRM server-side). Run `psql "$DB_URL" -f scripts/test-tenant-rls.sql` – it must print `PASS tenant isolation`. Without a token everything lives in the shared `public` tenant.
7. **CRM** – set `SUPABASE_SERVICE_ROLE_KEY` (+ `SUPABASE_URL`); the CRM connector now runs server-side and requires a host token. Reconnect the CRM once (old browser-stored keys are scrubbed).
8. **Headers** – CSP is report-only; review violations in the browser console, then switch it to enforcing and add `frame-ancestors <host origin>`.
9. **Known gaps** – the daily AI budget is not enforced (rate limit is per function instance, in memory); chatbot/preferences/walkthrough tables are still session-scoped, not tenant-scoped; storage uploads are not tenant-isolated. Without HOST_JWT_SECRET the proxy runs open.
