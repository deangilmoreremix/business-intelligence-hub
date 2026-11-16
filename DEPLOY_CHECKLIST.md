# Deploy checklist

Things only you can run (they need live credentials):

1. **Supabase** – apply `supabase/migrations/*` in filename order (20261110… → 20261112…). Confirm the `people-images` storage bucket exists and is public-read.
2. **Netlify env vars** – `OPENAI_API_KEY` (required), `ALLOWED_ORIGIN` (your host app's origin), optional `OPENAI_MODEL`, `OPENAI_FAST_MODEL`, `OPENAI_IMAGE_MODEL`. Build env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
3. **Deploy**, then run `SITE_URL=https://<site>.netlify.app npm run smoke:openai` – all lines must PASS.
4. **Images** – open Advanced Contacts, upload a contact photo, reload; it must persist (proves Storage signed upload).
5. **Federation** – load `/remoteEntry.js` from the host app and open the AnalyticsApp remote; check styles render.
6. **Known gaps** – row-level security is still open to anon/authenticated (tenant policies need the host token model); the openai-proxy has no per-user auth/rate limits yet. Do not expose publicly with real customer data until those are done.
