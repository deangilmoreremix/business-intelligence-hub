import { describe, it, expect, vi } from 'vitest';

const chain: any = new Proxy(function () {}, {
  get: (_t, prop) => (prop === 'then' ? undefined : chain),
  apply: () => chain,
});
vi.mock('../lib/supabase', () => ({ supabase: { from: () => chain, channel: () => chain } }));

import { aiService } from '../services/aiService';

// OpenAI strict structured outputs: every object needs additionalProperties:false and all keys required.
function assertStrict(node: any, path = 'root') {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'object') {
    expect(node.additionalProperties, `${path}.additionalProperties`).toBe(false);
    expect([...(node.required ?? [])].sort(), `${path}.required`).toEqual(Object.keys(node.properties ?? {}).sort());
    for (const [k, v] of Object.entries(node.properties ?? {})) assertStrict(v, `${path}.${k}`);
  }
  if (node.type === 'array') assertStrict(node.items, `${path}[]`);
}

describe('aiService.analyzeWithAI', () => {
  it('sends a strict schema through text.format and maps the result', async () => {
    let body: any;
    const result = {
      insights: [{ title: 'T', description: 'D', type: 'risk', priority: 'high', confidence: 90, impact: 'high', effort: 'low', actionable: true, suggestedActions: ['a'] }],
      summary: 'S', confidence: 88, recommendations: ['r'], nextActions: ['n'], businessImpact: { revenue: '', efficiency: '', riskReduction: '' },
    };
    vi.stubGlobal('fetch', async (_u: string, init?: { body?: string }) => {
      if (!init?.body) return new Response(JSON.stringify({ configured: true }));
      body = JSON.parse(init.body).body;
      return new Response(JSON.stringify({ output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(result) }] }] }));
    });
    const out = await aiService.analyzeWithAI({ appId: 'pipeline-intelligence', analysisType: 'pipeline', provider: 'openai-deep', data: { deals: [], contacts: [] } });
    expect(out.insights[0].title).toBe('T');
    expect(out.summary).toBe('S');
    expect(body.response_format).toBeUndefined();
    expect(body.text.format.strict).toBe(true);
    assertStrict(body.text.format.schema);
    expect(body.model).toBe('gpt-6-astra');
    const fast = await aiService.analyzeWithAI({ appId: 'x', analysisType: 'analytics', provider: 'openai-fast', data: {} });
    expect(fast.provider).toBe('openai-fast');
    expect(body.model).toBe('gpt-6.1-terra');
  });
});
