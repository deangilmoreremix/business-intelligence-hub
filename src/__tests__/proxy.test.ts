import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import type { AddressInfo } from 'node:net';

// The Netlify function is a plain Request -> Response handler, so we drive it directly
// against a local mock of the OpenAI API (selected via OPENAI_BASE_URL).
const proxyPath = '../../netlify/functions/openai-proxy.mts';
let server: http.Server;
let seen: Array<{ url: string; auth: string | undefined; body: Record<string, unknown> }> = [];
let handler: (req: Request) => Promise<Response>;

const call = (payload: unknown, init: RequestInit = {}) =>
  handler(new Request('http://localhost/.netlify/functions/openai-proxy', { method: 'POST', body: JSON.stringify(payload), ...init }));

beforeAll(async () => {
  server = http.createServer((req, res) => {
    let data = '';
    req.on('data', c => (data += c));
    req.on('end', () => {
      seen.push({ url: req.url ?? '', auth: req.headers.authorization, body: JSON.parse(data || '{}') });
      if ((JSON.parse(data || '{}') as { model?: string }).model === 'gpt-6-boom') {
        res.writeHead(429, { 'content-type': 'application/json' });
        return res.end(JSON.stringify({ error: { message: 'rate limited' } }));
      }
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ output_text: 'hi' }));
    });
  });
  await new Promise<void>(r => server.listen(0, r));
  process.env.OPENAI_BASE_URL = `http://127.0.0.1:${(server.address() as AddressInfo).port}/v1`;
  process.env.OPENAI_API_KEY = 'sk-test';
  handler = (await import(/* @vite-ignore */ proxyPath)).default;
});
afterAll(() => server.close());

describe('openai-proxy', () => {
  it('forwards allowed requests with the server-side key and caps output tokens', async () => {
    seen = [];
    const res = await call({ endpoint: 'responses', body: { model: 'gpt-6-astra', input: 'x', max_output_tokens: 999999, stream: true } });
    expect(res.status).toBe(200);
    expect(seen[0].url).toBe('/v1/responses');
    expect(seen[0].auth).toBe('Bearer sk-test');
    expect(seen[0].body.max_output_tokens).toBe(16000);
    expect(seen[0].body.stream).toBeUndefined();
  });

  it('allows web_search but rejects other tools', async () => {
    expect((await call({ endpoint: 'responses', body: { model: 'gpt-6-astra', input: 'x', tools: [{ type: 'web_search' }] } })).status).toBe(200);
    for (const tools of [[{ type: 'function', name: 'f' }], [{ type: 'mcp' }], [{ type: 'code_interpreter' }], 'nope']) {
      expect((await call({ endpoint: 'responses', body: { model: 'gpt-6-astra', input: 'x', tools } })).status).toBe(400);
    }
  });

  it('rejects unknown endpoints, models and bad input; allows image generation', async () => {
    expect((await call({ endpoint: 'chat/completions', body: { model: 'gpt-6-astra' } })).status).toBe(400);
    expect((await call({ endpoint: 'responses', body: { model: 'claude-x', input: 'x' } })).status).toBe(400);
    expect((await call({ endpoint: 'responses' })).status).toBe(400);
    expect((await handler(new Request('http://x', { method: 'POST', body: 'not json' }))).status).toBe(400);
    expect((await call({ endpoint: 'images/generations', body: { model: 'gpt-image-2.6-sunburst', prompt: 'p' } })).status).toBe(200);
  });

  it('passes upstream errors through', async () => {
    const res = await call({ endpoint: 'responses', body: { model: 'gpt-6-boom', input: 'x' } });
    expect(res.status).toBe(429);
    expect((await res.json()).error.message).toBe('rate limited');
  });

  it('reports config status on GET, rejects other methods, enforces ALLOWED_ORIGIN', async () => {
    expect(await (await handler(new Request('http://x', { method: 'GET' }))).json()).toEqual({ configured: true });
    expect((await handler(new Request('http://x', { method: 'PUT' }))).status).toBe(405);
    process.env.ALLOWED_ORIGIN = 'https://app.example.com';
    expect((await call({ endpoint: 'responses', body: { model: 'gpt-6-astra', input: 'x' } }, { headers: { origin: 'https://evil.com' } })).status).toBe(403);
    expect((await call({ endpoint: 'responses', body: { model: 'gpt-6-astra', input: 'x' } }, { headers: { origin: 'https://app.example.com' } })).status).toBe(200);
    delete process.env.ALLOWED_ORIGIN;
    delete process.env.OPENAI_API_KEY;
    expect((await call({ endpoint: 'responses', body: { model: 'gpt-6-astra', input: 'x' } })).status).toBe(500);
  });
});

describe('openai-proxy auth, limits and size', () => {
  beforeAll(() => { process.env.OPENAI_API_KEY = 'sk-test'; });
  it('requires a valid host token when HOST_JWT_SECRET is set, and uses its tenant', async () => {
    const { signJwt, _resetRateLimits } = await import(/* @vite-ignore */ '../../netlify/lib/auth.mts');
    _resetRateLimits();
    process.env.HOST_JWT_SECRET = 'shh';
    try {
      const ok = { endpoint: 'responses', body: { model: 'gpt-6-astra', input: 'x' } };
      expect((await call(ok)).status).toBe(401);
      expect((await call(ok, { headers: { authorization: 'Bearer nope' } })).status).toBe(401);
      const expired = signJwt({ tenant_id: 't1', exp: Math.floor(Date.now() / 1000) - 10 }, 'shh');
      expect((await call(ok, { headers: { authorization: `Bearer ${expired}` } })).status).toBe(401);
      const wrongKey = signJwt({ tenant_id: 't1', exp: Math.floor(Date.now() / 1000) + 60 }, 'other');
      expect((await call(ok, { headers: { authorization: `Bearer ${wrongKey}` } })).status).toBe(401);
      const good = signJwt({ tenant_id: 't1', exp: Math.floor(Date.now() / 1000) + 60 }, 'shh');
      expect((await call(ok, { headers: { authorization: `Bearer ${good}` } })).status).toBe(200);
    } finally { delete process.env.HOST_JWT_SECRET; }
  });

  it('rate-limits per tenant', async () => {
    const { _resetRateLimits } = await import(/* @vite-ignore */ '../../netlify/lib/auth.mts');
    _resetRateLimits();
    process.env.RATE_LIMIT_PER_MIN = '2';
    try {
      const ok = { endpoint: 'responses', body: { model: 'gpt-6-astra', input: 'x' } };
      expect((await call(ok)).status).toBe(200);
      expect((await call(ok)).status).toBe(200);
      const third = await call(ok);
      expect(third.status).toBe(429);
      expect(Number(third.headers.get('retry-after'))).toBeGreaterThan(0);
    } finally { delete process.env.RATE_LIMIT_PER_MIN; _resetRateLimits(); }
  });

  it('rejects oversized bodies and refuses production without ALLOWED_ORIGIN', async () => {
    const big = { endpoint: 'responses', body: { model: 'gpt-6-astra', input: 'x'.repeat(250_000) } };
    expect((await call(big)).status).toBe(413);
    process.env.CONTEXT = 'production';
    try { expect((await call({ endpoint: 'responses', body: { model: 'gpt-6-astra', input: 'x' } })).status).toBe(500); }
    finally { delete process.env.CONTEXT; }
  });
});
