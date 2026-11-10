// Netlify Function: server-side proxy for the OpenAI Responses and Images APIs.
// Requires env var OPENAI_API_KEY (set in Netlify site settings). Optional: ALLOWED_ORIGIN.
import type { Context } from '@netlify/functions';

const ENDPOINTS = new Set(['responses', 'images/generations', 'images/edits']);
const MODEL_PREFIXES = ['gpt-6', 'gpt-5', 'gpt-image-'];
const MAX_OUTPUT_TOKENS = 16000;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export default async (req: Request, _ctx: Context) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const allowed = process.env.ALLOWED_ORIGIN;
  const origin = req.headers.get('origin');
  if (allowed && origin && origin !== allowed) return json({ error: 'Forbidden origin' }, 403);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return json({ error: 'OPENAI_API_KEY is not configured on the server' }, 500);

  let payload: { endpoint?: string; body?: Record<string, any> };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { endpoint, body } = payload;
  if (!endpoint || !ENDPOINTS.has(endpoint) || !body || typeof body !== 'object') {
    return json({ error: 'Invalid endpoint or body' }, 400);
  }
  if (typeof body.model !== 'string' || !MODEL_PREFIXES.some((p) => body.model.startsWith(p))) {
    return json({ error: 'Model not allowed' }, 400);
  }
  if (endpoint === 'responses') {
    body.max_output_tokens = Math.min(Number(body.max_output_tokens) || MAX_OUTPUT_TOKENS, MAX_OUTPUT_TOKENS);
    delete body.stream; // non-streaming proxy
  }

  const upstream = await fetch(`https://api.openai.com/v1/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json' },
  });
};
