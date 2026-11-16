import { savePref } from './prefs';

/**
 * Demo ("mock") data switch.
 *
 * Many screens ship with built-in sample figures. `mock(x)` returns `x` unchanged while demo data is on (the default),
 * and an empty-state version of it while off: arrays become [], numbers 0, figures like "$2.4M" / "67%" become "—".
 * Nothing is deleted from the code: turning demo data back on restores everything. Real data (contacts, deals,
 * uploads, saved layouts) is never touched.
 */
const KEY = 'mock-data-enabled';

export const isMockDataEnabled = (): boolean => {
  try { return localStorage.getItem(KEY) !== 'false'; } catch { return true; }
};

export const setMockDataEnabled = (enabled: boolean): void => {
  try { localStorage.setItem(KEY, enabled ? 'true' : 'false'); } catch { /* ignore */ }
  void savePref(KEY, enabled).catch(() => undefined);
};

const isFigure = (s: string) => /\d/.test(s) && /[$%]|\b(days?|hours?|hrs?|min|mins|sec|ms)\b|\d\s?[KMBhdwm]\b|\d[.,]\d/.test(s);

export const blank = (value: unknown): unknown => {
  if (Array.isArray(value)) return [];
  if (typeof value === 'number') return 0;
  if (typeof value === 'string') return isFigure(value) ? '—' : value;
  if (value && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, blank(v)]));
  }
  return value;
};

export function mock<T>(value: T): T {
  return isMockDataEnabled() ? value : (blank(value) as T);
}
