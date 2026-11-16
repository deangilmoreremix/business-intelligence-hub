import { supabase } from './supabase';

/**
 * Small per-user preference store (layout orders, column widths, …): Supabase `app_settings` with a
 * localStorage mirror so the UI is instant and still works offline / before the first sync.
 */
const identity = (): string => {
  try {
    let id = localStorage.getItem('dashboard_user_id');
    if (!id) { id = `user_${Math.random().toString(36).slice(2, 10)}`; localStorage.setItem('dashboard_user_id', id); }
    return id;
  } catch { return 'anonymous'; }
};

const fullKey = (key: string) => `pref:${key}:${identity()}`;

export const readLocalPref = <T,>(key: string): T | null => {
  try { const v = localStorage.getItem(fullKey(key)); return v ? (JSON.parse(v) as T) : null; } catch { return null; }
};

export async function loadPref<T>(key: string): Promise<T | null> {
  const local = readLocalPref<T>(key);
  try {
    const { data } = await supabase.from('app_settings').select('setting_value').eq('setting_key', fullKey(key)).is('user_id', null).maybeSingle();
    if (data?.setting_value !== undefined && data?.setting_value !== null) {
      try { localStorage.setItem(fullKey(key), JSON.stringify(data.setting_value)); } catch { /* ignore */ }
      return data.setting_value as T;
    }
  } catch { /* offline: fall back to the mirror */ }
  return local;
}

export async function savePref<T>(key: string, value: T): Promise<void> {
  try { localStorage.setItem(fullKey(key), JSON.stringify(value)); } catch { /* ignore */ }
  const existing = await supabase.from('app_settings').select('id').eq('setting_key', fullKey(key)).is('user_id', null).maybeSingle();
  const row = { setting_key: fullKey(key), setting_value: value as unknown, updated_at: new Date().toISOString() };
  if (existing.data?.id) await supabase.from('app_settings').update(row).eq('id', existing.data.id);
  else await supabase.from('app_settings').insert(row);
}
