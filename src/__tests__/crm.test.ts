import { describe, expect, it, beforeAll } from 'vitest';
import { assertSafeCrmUrl, mapContact, mapDeal, stableId } from '../../netlify/lib/crm.mts';

describe('CRM helpers', () => {
  it('stableId is a deterministic uuid, different per tenant/kind/id', () => {
    const a = stableId('t1', 'contact', '42');
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-a[0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(stableId('t1', 'contact', '42')).toBe(a);
    expect(stableId('t2', 'contact', '42')).not.toBe(a);
    expect(stableId('t1', 'deal', '42')).not.toBe(a);
  });

  it('blocks unsafe CRM URLs (SSRF guard)', () => {
    for (const bad of ['http://crm.example.com', 'https://localhost/x', 'https://127.0.0.1', 'https://10.0.0.5', 'https://192.168.1.2', 'https://172.20.1.1', 'https://169.254.169.254/latest', 'https://user:pw@crm.example.com', 'https://[::1]/', 'https://db.internal', 'not a url']) {
      expect(() => assertSafeCrmUrl(bad), bad).toThrow();
    }
    expect(assertSafeCrmUrl('https://crm.example.com/api').hostname).toBe('crm.example.com');
  });

  it('honours the host allowlist', () => {
    expect(() => assertSafeCrmUrl('https://other.com', 'crm.example.com')).toThrow(/allowed/);
    expect(assertSafeCrmUrl('https://crm.example.com', 'crm.example.com, x.com')).toBeTruthy();
  });

  it('maps CRM records, tolerating bad values', () => {
    const c = mapContact('t1', { id: 7, firstName: 'Ann', email: 'ANN@X.COM', status: 'weird' });
    expect(c).toMatchObject({ tenant_id: 't1', first_name: 'Ann', email: 'ann@x.com', status: 'lead' });
    const d = mapDeal('t1', { id: 9, title: 'Big', value: 'abc', contactId: 7, stage: 'won' });
    expect(d.value).toBe(0);
    expect(d.contact_id).toBe(c.id); // deal links to the mapped contact id
  });
});

describe('crm function gating', () => {
  let handler: (r: Request) => Promise<Response>;
  const call = (body: unknown, headers: Record<string, string> = {}) => handler(new Request('http://x/.netlify/functions/crm', { method: 'POST', headers, body: JSON.stringify(body) }));
  beforeAll(async () => { const m = await import(/* @vite-ignore */ '../../netlify/functions/crm.mts'); handler = (r: Request) => m.default(r, {} as never); });

  it('refuses anonymous callers and invalid tokens', async () => {
    delete process.env.HOST_JWT_SECRET;
    expect((await call({ action: 'status' })).status).toBe(401);
    process.env.HOST_JWT_SECRET = 'shh';
    try { expect((await call({ action: 'status' }, { authorization: 'Bearer bad' })).status).toBe(401); }
    finally { delete process.env.HOST_JWT_SECRET; }
  });

  it('refuses private CRM hosts before touching the database', async () => {
    const { signJwt, _resetRateLimits } = await import(/* @vite-ignore */ '../../netlify/lib/auth.mts');
    _resetRateLimits();
    process.env.HOST_JWT_SECRET = 'shh';
    process.env.SUPABASE_URL = 'http://127.0.0.1:9';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service';
    try {
      const tok = signJwt({ tenant_id: 't1', exp: Math.floor(Date.now() / 1000) + 60 }, 'shh');
      const r = await call({ action: 'connect', config: { apiUrl: 'https://169.254.169.254', apiKey: 'k' } }, { authorization: `Bearer ${tok}` });
      expect(r.status).toBe(502);
      expect((await r.json()).error).toMatch(/not allowed/);
    } finally { delete process.env.HOST_JWT_SECRET; delete process.env.SUPABASE_URL; delete process.env.SUPABASE_SERVICE_ROLE_KEY; }
  });
});
