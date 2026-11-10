import { describe, it, expect, vi } from 'vitest';

vi.mock('../lib/supabase', () => ({ supabase: { from: () => ({ update: () => ({ eq: async () => ({ error: null }) }), insert: async () => ({ error: null }) }) } }));

import { enrichContact, applyEnrichment } from '../services/contactAIService';
import { normalizeProvider } from '../services/aiService';

let calls: Array<Record<string, any>> = [];

describe('provider normalisation', () => {
  it('maps legacy ids', () => {
    expect(normalizeProvider('gpt-5')).toBe('openai-deep');
    expect(normalizeProvider('gemini')).toBe('openai-fast');
    expect(normalizeProvider(undefined)).toBe('openai-deep');
    expect(normalizeProvider('openai-fast')).toBe('openai-fast');
  });
});

describe('enrichContact', () => {
  it('uses web_search, retries without structured output on 400, parses fenced JSON, merges sources', async () => {
    calls = [];
    let n = 0;
    vi.stubGlobal('fetch', async (_u: string, init?: { body?: string }) => {
      if (!init?.body) return new Response(JSON.stringify({ configured: true }));
      calls.push(JSON.parse(init.body).body);
      if (n++ === 0) return new Response(JSON.stringify({ error: { message: 'bad format' } }), { status: 400 });
      return new Response(JSON.stringify({ output: [
        { type: 'web_search_call', action: { sources: [{ url: 'https://a.com' }] } },
        { type: 'message', content: [{ type: 'output_text', text: '```json\n{"found":true,"confidence":"high","jobTitle":"CTO","company":"A","companyWebsite":"","industry":"","city":"","linkedinUrl":"https://linkedin.com/in/x","twitterUrl":"","website":"","bio":"","notes":""}\n```', annotations: [{ type: 'url_citation', url: 'https://b.com' }] }] },
      ] }));
    });
    const r = await enrichContact({ id: '1', name: 'Jane Doe', email: 'j@a.com' });
    expect(r.jobTitle).toBe('CTO');
    expect(r.sources).toEqual(['https://b.com', 'https://a.com']);
    expect(calls[0].tools).toEqual([{ type: 'web_search', search_context_size: 'medium' }]);
    expect(calls[0].tool_choice).toBe('required');
    expect(calls[0].text.format.type).toBe('json_schema');
    expect(calls[1].text.format).toBeUndefined();
  });

  it('applyEnrichment only writes accepted, valid fields', async () => {
    const patches: Array<Record<string, unknown>> = [];
    const { supabase } = await import('../lib/supabase');
    (supabase as any).from = () => ({ update: (p: Record<string, unknown>) => { patches.push(p); return { eq: async () => ({ error: null }) }; }, insert: async () => ({ error: null }) });
    await applyEnrichment('1', {
      found: true, confidence: 'high', jobTitle: 'CTO', company: 'A', companyWebsite: '', industry: '', city: '',
      linkedinUrl: 'javascript:alert(1)', twitterUrl: '', website: 'https://a.com', bio: '', notes: '', sources: [],
    }, ['jobTitle', 'linkedinUrl', 'website', 'city']);
    expect(patches[0]).toMatchObject({ job_title: 'CTO', website: 'https://a.com' });
    expect(patches[0].linkedin_url).toBeUndefined();
    expect(patches[0].city).toBeUndefined();
  });
});
