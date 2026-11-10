import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createJsonResponse, createResponseFull, extractSources, generateImage, checkAIAvailable } from '../lib/openai';

type Call = { endpoint: string; body: Record<string, unknown> };
let calls: Call[] = [];
let handler: (c: Call) => { status?: number; json: unknown };

beforeEach(() => {
  calls = [];
  handler = () => ({ json: { output: [{ type: 'message', content: [{ type: 'output_text', text: '{"ok":true}' }] }] } });
  vi.stubGlobal('fetch', async (_url: string, init?: { method?: string; body?: string }) => {
    if (!init?.body) return new Response(JSON.stringify({ configured: true }));
    const parsed = JSON.parse(init.body) as { endpoint: string; body: Record<string, unknown> };
    const call = { endpoint: parsed.endpoint, body: parsed.body };
    calls.push(call);
    const r = handler(call);
    return new Response(JSON.stringify(r.json), { status: r.status ?? 200 });
  });
});

describe('Responses API request shape', () => {
  it('uses text.format (not response_format), instructions, reasoning effort, no sampling params', async () => {
    const out = await createJsonResponse<{ ok: boolean }>({
      input: 'hi', instructions: 'sys', jsonSchema: { name: 'x', schema: { type: 'object' } }, useCase: 'complex',
    });
    expect(out).toEqual({ ok: true });
    const b = calls[0].body as Record<string, any>;
    expect(calls[0].endpoint).toBe('responses');
    expect(b.model).toBe('gpt-6-astra');
    expect(b.response_format).toBeUndefined();
    expect(b.temperature).toBeUndefined();
    expect(b.instructions).toBe('sys');
    expect(b.reasoning).toEqual({ effort: 'high' });
    expect(b.text.verbosity).toBe('high');
    expect(b.text.format).toMatchObject({ type: 'json_schema', name: 'x', strict: true });
    expect(b.store).toBe(false);
  });

  it('never emits unsupported reasoning efforts', async () => {
    for (const useCase of ['chatbot', 'analysis', 'complex'] as const) {
      await createResponseFull({ input: 'x', useCase });
    }
    for (const c of calls) expect(['low', 'medium', 'high']).toContain((c.body.reasoning as { effort: string }).effort);
  });

  it('passes web_search tools, tool_choice and include', async () => {
    await createResponseFull({ input: 'x', tools: [{ type: 'web_search' }], toolChoice: 'required', include: ['web_search_call.action.sources'] });
    expect(calls[0].body.tools).toEqual([{ type: 'web_search' }]);
    expect(calls[0].body.tool_choice).toBe('required');
    expect(calls[0].body.include).toEqual(['web_search_call.action.sources']);
  });

  it('throws on refusal, incomplete and invalid JSON', async () => {
    handler = () => ({ json: { output: [{ type: 'message', content: [{ type: 'refusal', refusal: 'no' }] }] } });
    await expect(createResponseFull({ input: 'x' })).rejects.toThrow(/refused/);
    handler = () => ({ json: { status: 'incomplete', incomplete_details: { reason: 'max_output_tokens' }, output: [] } });
    await expect(createResponseFull({ input: 'x' })).rejects.toThrow(/incomplete/);
    handler = () => ({ json: { output: [{ type: 'message', content: [{ type: 'output_text', text: 'not json' }] }] } });
    await expect(createJsonResponse({ input: 'x', jsonSchema: { name: 'a', schema: {} } })).rejects.toThrow(/invalid JSON/);
  });

  it('surfaces upstream errors with status', async () => {
    handler = () => ({ status: 429, json: { error: { message: 'rate limited' } } });
    await expect(createResponseFull({ input: 'x' })).rejects.toMatchObject({ status: 429, message: 'rate limited' });
  });

  it('extracts citations and consulted sources', () => {
    const r = extractSources({ output: [
      { type: 'web_search_call', action: { sources: [{ url: 'https://a.com' }] } },
      { type: 'message', content: [{ type: 'output_text', annotations: [{ type: 'url_citation', url: 'https://b.com', title: 'B' }] }] },
    ] });
    expect(r.sources).toEqual(['https://a.com']);
    expect(r.citations).toEqual([{ url: 'https://b.com', title: 'B' }]);
  });
});

describe('images', () => {
  it('falls back to the 2.5 model when 2.6 is rejected', async () => {
    handler = (c) => String(c.body.model).includes('2.6')
      ? { status: 404, json: { error: { message: 'The model does not exist' } } }
      : { json: { data: [{ b64_json: 'QUJD' }] } };
    const url = await generateImage({ prompt: 'p' });
    expect(url).toBe('data:image/png;base64,QUJD');
    expect(calls.map(c => c.body.model)).toEqual(['gpt-image-2.6-sunburst', 'gpt-image-2.5-sunburst']);
    expect(calls[0].body.output_format).toBe('png');
  });
});

describe('availability', () => {
  it('reports configured status from the proxy', async () => {
    expect(await checkAIAvailable()).toBe(true);
  });
});
