// Netlify Function: server-side CRM connector. The CRM API key is stored in `crm_connections` (service-role only)
// and never returned to the browser. Requires a host token (tenant) — see netlify/lib/auth.mts.
// Env: SUPABASE_URL (or VITE_SUPABASE_URL), SUPABASE_SERVICE_ROLE_KEY, HOST_JWT_SECRET, optional CRM_ALLOWED_HOSTS.
import type { Context } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { authenticate } from '../lib/auth.mts';
import { checkRate } from '../lib/ratelimit.mts';
import { log } from '../lib/log.mts';
import { assertSafeCrmUrl, mapContact, mapDeal } from '../lib/crm.mts';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

const MAX_RECORDS = 5000;
const TIMEOUT_MS = 20_000;

interface Conn { api_url: string; api_key: string; customer_id: string; sync_enabled: boolean; last_sync: string | null }

const publicView = (c: Conn | null) => (c ? { apiUrl: c.api_url, apiKey: '', hasKey: true, customerId: c.customer_id, syncEnabled: c.sync_enabled, lastSync: c.last_sync ?? undefined } : null);

async function crmGet(conn: { api_url: string; api_key: string; customer_id: string }, path: string): Promise<any> {
  const base = assertSafeCrmUrl(conn.api_url, process.env.CRM_ALLOWED_HOSTS);
  const url = new URL(path, base.origin + base.pathname.replace(/\/?$/, '/'));
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${conn.api_key}`, 'Content-Type': 'application/json', 'X-Customer-ID': conn.customer_id },
      signal: ctrl.signal,
      redirect: 'error',
    });
    if (!res.ok) throw new Error(`CRM API error: ${res.status}`);
    return await res.json();
  } finally { clearTimeout(t); }
}

export default async (req: Request, _ctx: Context) => {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const allowed = process.env.ALLOWED_ORIGIN;
  const origin = req.headers.get('origin');
  if (!allowed && process.env.CONTEXT === 'production') return json({ error: 'ALLOWED_ORIGIN must be set on the server' }, 500);
  if (allowed && origin && origin !== allowed) return json({ error: 'Forbidden origin' }, 403);

  const auth = authenticate(req);
  if (!auth.ok) return json({ error: auth.error }, auth.status ?? 401);
  if (auth.anonymous) return json({ error: 'CRM connection requires a host token (set HOST_JWT_SECRET)' }, 401);
  const lim = await checkRate(`crm:${auth.tenant}`, 20);
  if (!lim.ok) return json({ error: 'Rate limit exceeded' }, 429);

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return json({ error: 'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not configured on the server' }, 500);
  const db = createClient(url, key, { auth: { persistSession: false } });
  const tenant = auth.tenant;

  let payload: { action?: string; config?: { apiUrl?: string; apiKey?: string; customerId?: string; syncEnabled?: boolean } };
  try {
    const raw = await req.text();
    if (raw.length > 20_000) return json({ error: 'Request too large' }, 413);
    payload = JSON.parse(raw);
  } catch { return json({ error: 'Invalid JSON' }, 400); }

  const load = async (): Promise<Conn | null> => {
    const { data } = await db.from('crm_connections').select('*').eq('tenant_id', tenant).maybeSingle();
    return (data as Conn | null) ?? null;
  };

  try {
    switch (payload.action) {
      case 'status': return json({ connection: publicView(await load()) });

      case 'connect':
      case 'test': {
        const c = payload.config;
        const stored = payload.action === 'test' && !c?.apiKey ? await load() : null;
        const conn = stored ?? (c?.apiUrl && c?.apiKey ? { api_url: c.apiUrl, api_key: c.apiKey, customer_id: c.customerId ?? '', sync_enabled: c.syncEnabled ?? true, last_sync: null } : null);
        if (!conn) return json({ error: 'apiUrl and apiKey are required' }, 400);
        await crmGet(conn, 'api/health');
        if (payload.action === 'connect') {
          const { error } = await db.from('crm_connections').upsert({ tenant_id: tenant, api_url: conn.api_url, api_key: conn.api_key, customer_id: conn.customer_id, sync_enabled: conn.sync_enabled, updated_at: new Date().toISOString() });
          if (error) throw new Error(error.message);
          return json({ ok: true, connection: publicView(await load()) });
        }
        return json({ ok: true });
      }

      case 'fetch':
      case 'sync': {
        const conn = await load();
        if (!conn) return json({ error: 'CRM not configured' }, 400);
        const [dealsRes, contactsRes] = await Promise.all([crmGet(conn, 'api/deals'), crmGet(conn, 'api/contacts')]);
        const deals: any[] = (dealsRes.deals ?? []).slice(0, MAX_RECORDS);
        const contacts: any[] = (contactsRes.contacts ?? []).slice(0, MAX_RECORDS);
        if (payload.action === 'fetch') return json({ deals, contacts });

        const contactRows = contacts.map(c => mapContact(tenant, c));
        const known = new Set(contactRows.map(r => r.id));
        const dealRows = deals.map(d => mapDeal(tenant, d)).map(r => ({ ...r, contact_id: r.contact_id && known.has(r.contact_id) ? r.contact_id : null }));
        for (let i = 0; i < contactRows.length; i += 500) {
          const { error } = await db.from('bi_contacts').upsert(contactRows.slice(i, i + 500), { onConflict: 'id' });
          if (error) throw new Error(`contacts: ${error.message}`);
        }
        for (let i = 0; i < dealRows.length; i += 500) {
          const { error } = await db.from('bi_deals').upsert(dealRows.slice(i, i + 500), { onConflict: 'id' });
          if (error) throw new Error(`deals: ${error.message}`);
        }
        const last = new Date().toISOString();
        await db.from('crm_connections').update({ last_sync: last }).eq('tenant_id', tenant);
        return json({ success: true, synced: { deals: dealRows.length, contacts: contactRows.length }, lastSync: last });
      }

      case 'disconnect': {
        await db.from('crm_connections').delete().eq('tenant_id', tenant);
        return json({ ok: true });
      }

      default: return json({ error: 'Unknown action' }, 400);
    }
  } catch (e) {
    log('warn', 'crm', 'request failed', { action: payload.action, tenant, err: e instanceof Error ? e.message : String(e) });
    return json({ error: e instanceof Error ? e.message : 'CRM request failed' }, 502);
  }
};
