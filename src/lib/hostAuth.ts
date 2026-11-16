/** Short-lived token issued by the host CRM; kept in memory only (never localStorage) and sent to our Netlify Functions. */
let token: string | null = null;
export const setHostToken = (t: string | null) => { token = t && t.trim() ? t.trim() : null; };
export const getHostToken = () => token;
export const hostAuthHeaders = (): Record<string, string> => (token ? { Authorization: `Bearer ${token}` } : {});
