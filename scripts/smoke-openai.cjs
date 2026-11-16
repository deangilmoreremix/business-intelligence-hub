// Live checks against the deployed (or `netlify dev`) openai-proxy. Needs OPENAI_API_KEY set on that site.
// Usage: SITE_URL=https://your-site.netlify.app npm run smoke:openai
const base = (process.env.SITE_URL || 'http://localhost:8888').replace(/\/$/, '');
const url = `${base}/.netlify/functions/openai-proxy`;
const post = body => fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }).then(async r => ({ status: r.status, json: await r.json().catch(() => ({})) }));
const text = j => (j.output || []).flatMap(o => o.content || []).map(c => c.text || '').join('');
const checks = [
  ['proxy configured (GET)', async () => { const r = await fetch(url); const j = await r.json(); return j.configured === true; }],
  ['Responses API text', async () => { const r = await post({ model: process.env.OPENAI_MODEL || 'gpt-6.1-terra', input: 'Reply with the word ok', store: false }); return r.status === 200 && /ok/i.test(text(r.json)); }],
  ['structured output (json_schema)', async () => { const r = await post({ model: process.env.OPENAI_MODEL || 'gpt-6.1-terra', input: 'Give a=1', store: false, text: { format: { type: 'json_schema', name: 'x', strict: true, schema: { type: 'object', properties: { a: { type: 'number' } }, required: ['a'], additionalProperties: false } } } }); return r.status === 200 && JSON.parse(text(r.json)).a === 1; }],
  ['web_search tool', async () => { const r = await post({ model: process.env.OPENAI_MODEL || 'gpt-6.1-terra', input: 'What is the capital of France? Use web search.', store: false, tools: [{ type: 'web_search' }] }); return r.status === 200 && /paris/i.test(text(r.json)); }],
  ['disallowed tool is rejected', async () => (await post({ model: 'x', input: 'x', tools: [{ type: 'code_interpreter' }] })).status >= 400],
];
(async () => {
  let failed = 0;
  for (const [name, fn] of checks) { try { const ok = await fn(); console.log(ok ? 'PASS' : 'FAIL', name); if (!ok) failed++; } catch (e) { console.log('FAIL', name, e.message); failed++; } }
  process.exit(failed ? 1 : 0);
})();
