/** Short-lived token issued by the host CRM; kept in memory only (never localStorage) and sent to our Netlify Functions. */
let token: string | null = null;
export const setHostToken = (t: string | null) => { token = t && t.trim() ? t.trim() : null; };
export const getHostToken = () => token;
export const hostAuthHeaders = (): Record<string, string> => (token ? { Authorization: `Bearer ${token}` } : {});

/** Storage-safe tenant id from the host token's `tenant_id` claim ('public' without a token). Display/path only: the database re-verifies the token. */
export const getHostTenant = (): string => {
  try {
    const part = token?.split('.')[1];
    if (!part) return 'public';
    const claims = JSON.parse(atob(part.replace(/-/g, '+').replace(/_/g, '/'))) as { tenant_id?: unknown };
    const t = String(claims.tenant_id ?? '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
    return t || 'public';
  } catch {
    return 'public';
  }
};
