# OpenAI Responses API integration

Stack: **Netlify** (hosting + Functions), **Supabase** (data), **OpenAI API** only. No Gemini or other providers.

- `src/lib/openai.ts` - single client. `createResponse` / `createJsonResponse` call the **Responses API** with
  top-level `instructions`, `reasoning.effort` (low|medium|high; never `none`/`minimal`), `text.verbosity`,
  structured output via `text.format` (`json_schema`, strict), `store: false`. No `temperature`/`top_p` (unsupported with reasoning).
  `generateImage` calls the Images API (`gpt-image-2.6-sunburst`, override with `VITE_OPENAI_IMAGE_MODEL`; falls back to `gpt-image-2.5-sunburst`).
- `netlify/functions/openai-proxy.mts` - server-side proxy; the key is `OPENAI_API_KEY` in Netlify env vars (never `VITE_*` in production).
- Models: `gpt-6-astra` (default, "openai-deep"), `gpt-6.1-terra` ("openai-fast"). Override via `VITE_OPENAI_MODEL`, `VITE_OPENAI_FAST_MODEL`.
- Local dev: run `netlify dev`, or set `VITE_OPENAI_API_KEY` to call OpenAI directly (dev builds only).
