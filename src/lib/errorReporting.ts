/**
 * Minimal error reporting: logs uncaught errors / unhandled rejections and, when VITE_ERROR_REPORT_URL is set,
 * POSTs a small JSON report (message, stack, page path, time, build). No user data, no query strings, no cookies.
 * Capped at 10 reports per page load so a render loop cannot flood the endpoint.
 */
export interface ErrorReport { message: string; stack?: string; path: string; time: string; kind: 'error' | 'unhandledrejection' }

const MAX_REPORTS = 10;
let sent = 0;

export const buildReport = (err: unknown, kind: ErrorReport['kind'], path = '/'): ErrorReport => {
  const e = err instanceof Error ? err : new Error(typeof err === 'string' ? err : 'Non-error thrown');
  return { message: e.message.slice(0, 500), stack: e.stack?.slice(0, 2000), path: path.split('?')[0].split('#')[0], time: new Date().toISOString(), kind };
};

export const reportError = (err: unknown, kind: ErrorReport['kind'] = 'error') => {
  const report = buildReport(err, kind, typeof location !== 'undefined' ? location.pathname : '/');
  console.error('[error-report]', report.message);
  const url = import.meta.env.VITE_ERROR_REPORT_URL as string | undefined;
  if (!url || sent >= MAX_REPORTS) return;
  sent++;
  try {
    const body = JSON.stringify(report);
    if (typeof navigator !== 'undefined' && navigator.sendBeacon?.(url, new Blob([body], { type: 'application/json' }))) return;
    void fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => undefined);
  } catch { /* reporting must never throw */ }
};

export const installErrorReporting = () => {
  if (typeof window === 'undefined') return;
  window.addEventListener('error', e => reportError(e.error ?? e.message, 'error'));
  window.addEventListener('unhandledrejection', e => reportError(e.reason, 'unhandledrejection'));
};
