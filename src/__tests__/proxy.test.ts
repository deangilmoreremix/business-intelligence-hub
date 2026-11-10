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
