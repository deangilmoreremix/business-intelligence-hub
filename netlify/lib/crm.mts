// Pure helpers for the server-side CRM connector (unit-tested without network).
import { createHash } from 'node:crypto';
import { isIP } from 'node:net';

/** Deterministic uuid from tenant + kind + external id: re-syncing the same CRM record always hits the same row. */
export function stableId(tenant: string, kind: 'contact' | 'deal', externalId: string): string {
  const h = createHash('sha1').update(`${tenant}:${kind}:${externalId}`).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

const PRIVATE_V4 = [/^10\./, /^127\./, /^169\.254\./, /^192\.168\./, /^172\.(1[6-9]|2\d|3[01])\./, /^0\./];

/** Refuses non-https, credentials in the URL, localhost / private / link-local hosts (SSRF guard). Optional host allowlist. */
export function assertSafeCrmUrl(raw: string, allowedHosts?: string): URL {
  let u: URL;
  try { u = new URL(raw); } catch { throw new Error('CRM URL is not valid'); }
  if (u.protocol !== 'https:') throw new Error('CRM URL must use https');
  if (u.username || u.password) throw new Error('CRM URL must not contain credentials');
  const host = u.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) throw new Error('CRM host is not allowed');
  const ip = isIP(host.replace(/^\[|\]$/g, ''));
  if (ip === 6) throw new Error('CRM host is not allowed');
  if (ip === 4 && PRIVATE_V4.some(r => r.test(host))) throw new Error('CRM host is not allowed');
  const allow = (allowedHosts ?? '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
  if (allow.length && !allow.includes(host)) throw new Error('CRM host is not on the allowed list');
  return u;
}

const STATUSES = ['lead', 'prospect', 'customer', 'inactive'];

export function mapContact(tenant: string, c: Record<string, any>) {
  const status = STATUSES.includes(c.status) ? c.status : 'lead';
  return {
    id: stableId(tenant, 'contact', String(c.id)),
    tenant_id: tenant,
    first_name: String(c.firstName ?? '').slice(0, 200) || 'Unknown',
    last_name: c.lastName ? String(c.lastName).slice(0, 200) : null,
    email: c.email ? String(c.email).slice(0, 320).toLowerCase() : null,
    phone: c.phone ?? null,
    company: c.company ?? null,
    status,
    created_at: c.createdAt ?? undefined,
    updated_at: c.updatedAt ?? undefined,
  };
}

export function mapDeal(tenant: string, d: Record<string, any>) {
  return {
    id: stableId(tenant, 'deal', String(d.id)),
    tenant_id: tenant,
    title: String(d.title ?? 'Untitled deal').slice(0, 300),
    value: Number.isFinite(Number(d.value)) ? Number(d.value) : 0,
    stage_id: d.stage ?? null,
    probability: Number.isFinite(Number(d.probability)) ? Number(d.probability) : null,
    contact_id: d.contactId ? stableId(tenant, 'contact', String(d.contactId)) : null,
    assigned_to: d.assignedTo ?? null,
    expected_close_date: d.expectedCloseDate ?? null,
    created_at: d.createdAt ?? undefined,
    updated_at: d.updatedAt ?? undefined,
  };
}
