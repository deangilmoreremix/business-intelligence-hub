// Host-issued token verification + per-tenant rate limiting for Netlify Functions.
//
// The embedded app runs inside a host CRM. The host signs a short-lived HS256 JWT with the shared secret
// HOST_JWT_SECRET and passes it to the app (postMessage 'AUTH_TOKEN'); the app sends it as `Authorization: Bearer`.
// Claims used: tenant_id (or sub) -> tenant, exp (required), iss (checked when HOST_JWT_ISSUER is set).
import { createHmac, timingSafeEqual } from 'node:crypto';

export interface AuthResult { ok: boolean; status?: number; error?: string; tenant: string; anonymous: boolean }

const b64url = (b: Buffer) => b.toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
const fromB64url = (s: string) => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

export function verifyJwt(token: string, secret: string, issuer?: string): { ok: true; claims: Record<string, any> } | { ok: false; error: string } {
  const parts = token.split('.');
  if (parts.length !== 3) return { ok: false, error: 'Malformed token' };
  try {
    const header = JSON.parse(fromB64url(parts[0]).toString('utf8'));
    if (header.alg !== 'HS256') return { ok: false, error: 'Unsupported token algorithm' };
    const expected = createHmac('sha256', secret).update(`${parts[0]}.${parts[1]}`).digest();
    const given = fromB64url(parts[2]);
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return { ok: false, error: 'Invalid token signature' };
    const claims = JSON.parse(fromB64url(parts[1]).toString('utf8'));
    if (typeof claims.exp !== 'number' || claims.exp * 1000 < Date.now()) return { ok: false, error: 'Token expired' };
    if (issuer && claims.iss !== issuer) return { ok: false, error: 'Wrong token issuer' };
    return { ok: true, claims };
  } catch {
    return { ok: false, error: 'Malformed token' };
  }
}

/** Test helper / reference signer (the host app does the equivalent on its side). */
export const signJwt = (claims: Record<string, unknown>, secret: string) => {
  const h = b64url(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const p = b64url(Buffer.from(JSON.stringify(claims)));
  return `${h}.${p}.${b64url(createHmac('sha256', secret).update(`${h}.${p}`).digest())}`;
};

/**
 * When HOST_JWT_SECRET is set a valid token is required. When it is not set the function runs open (local dev,
 * or the deployment has not been wired to the host yet) unless REQUIRE_AUTH=true, which then refuses all requests.
 */
export function authenticate(req: Request, env: Record<string, string | undefined> = process.env): AuthResult {
  const secret = env.HOST_JWT_SECRET;
  if (!secret) {
    if (env.REQUIRE_AUTH === 'true') return { ok: false, status: 500, error: 'HOST_JWT_SECRET is not configured on the server', tenant: 'none', anonymous: true };
    return { ok: true, tenant: 'anonymous', anonymous: true };
  }
  const m = /^Bearer (.+)$/.exec(req.headers.get('authorization') ?? '');
  if (!m) return { ok: false, status: 401, error: 'Missing bearer token', tenant: 'none', anonymous: false };
  const v = verifyJwt(m[1], secret, env.HOST_JWT_ISSUER);
  if (!v.ok) return { ok: false, status: 401, error: v.error, tenant: 'none', anonymous: false };
  const tenant = String(v.claims.tenant_id ?? v.claims.sub ?? '');
  if (!tenant) return { ok: false, status: 401, error: 'Token has no tenant', tenant: 'none', anonymous: false };
  return { ok: true, tenant, anonymous: false };
}

/* ---- per-tenant fixed-window rate limit (in memory: best effort per function instance) ---- */
const windows = new Map<string, { start: number; count: number }>();
export function rateLimit(tenant: string, limit: number, windowMs = 60_000, now = Date.now()): { ok: boolean; retryAfter: number } {
  const w = windows.get(tenant);
  if (!w || now - w.start >= windowMs) { windows.set(tenant, { start: now, count: 1 }); return { ok: true, retryAfter: 0 }; }
  if (w.count >= limit) return { ok: false, retryAfter: Math.ceil((w.start + windowMs - now) / 1000) };
  w.count++;
  return { ok: true, retryAfter: 0 };
}
export const _resetRateLimits = () => windows.clear();
