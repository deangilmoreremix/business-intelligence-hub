// Structured (single-line JSON) logs for Netlify Functions: easy to filter in the Netlify log viewer.
export const log = (level: 'info' | 'warn' | 'error', fn: string, msg: string, extra: Record<string, unknown> = {}) => {
  const line = JSON.stringify({ level, fn, msg, ...extra, t: new Date().toISOString() });
  (level === 'error' ? console.error : level === 'warn' ? console.warn : console.log)(line);
};
