import { supabase } from '../../lib/supabase';
import type { CatalogObjectName } from '../../vendor/twenty-adapter/metadata';
import type { DashboardLayout } from './model';

export type Scope = 'user' | 'team';

export interface SavedDashboard { id: string; name: string; scope: Scope; owner_id: string; layout: DashboardLayout; updated_at: string }
export interface SavedFilter { id: string; name: string; object_name: CatalogObjectName; filter: unknown; scope: Scope; owner_id: string }

const read = (key: string, fallback: () => string) => {
  try {
    let v = localStorage.getItem(key);
    if (!v) { v = fallback(); localStorage.setItem(key, v); }
    return v;
  } catch { return fallback(); }
};

/** Identity of the viewer: the embedding CRM can set these; otherwise an anonymous per-browser user. */
export const getIdentity = () => ({
  userId: read('dashboard_user_id', () => `user_${Math.random().toString(36).slice(2, 10)}`),
  teamId: read('dashboard_team_id', () => 'team'),
});
export const ownerFor = (scope: Scope) => (scope === 'team' ? getIdentity().teamId : getIdentity().userId);

const must = <T,>(r: { data: T | null; error: { message: string } | null }): T => {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
};

export const EMPTY_LAYOUT: DashboardLayout = { widgets: [], context: null };

export async function listDashboards(scope: Scope): Promise<SavedDashboard[]> {
  return (must(await supabase.from('dashboard_layouts').select('*').eq('scope', scope).eq('owner_id', ownerFor(scope)).order('updated_at', { ascending: false })) ?? []) as SavedDashboard[];
}

export async function createDashboard(name: string, scope: Scope, layout: DashboardLayout = EMPTY_LAYOUT): Promise<SavedDashboard> {
  return must(await supabase.from('dashboard_layouts').insert({ name, scope, owner_id: ownerFor(scope), layout }).select().single()) as SavedDashboard;
}

export async function saveDashboard(id: string, patch: { name?: string; layout?: DashboardLayout; scope?: Scope }): Promise<SavedDashboard> {
  const row: Record<string, unknown> = { ...patch, updated_at: new Date().toISOString() };
  if (patch.scope) row.owner_id = ownerFor(patch.scope);
  return must(await supabase.from('dashboard_layouts').update(row).eq('id', id).select().single()) as SavedDashboard;
}

export async function deleteDashboard(id: string): Promise<void> {
  must(await supabase.from('dashboard_layouts').delete().eq('id', id).select());
}

export async function listSavedFilters(object: CatalogObjectName): Promise<SavedFilter[]> {
  const { userId, teamId } = getIdentity();
  const rows = must(await supabase.from('saved_filters').select('*').eq('object_name', object).order('created_at', { ascending: false })) as SavedFilter[];
  return (rows ?? []).filter(r => (r.scope === 'user' && r.owner_id === userId) || (r.scope === 'team' && r.owner_id === teamId));
}

export async function saveFilter(name: string, object: CatalogObjectName, filter: unknown, scope: Scope): Promise<SavedFilter> {
  return must(await supabase.from('saved_filters').insert({ name, object_name: object, filter, scope, owner_id: ownerFor(scope) }).select().single()) as SavedFilter;
}

export async function deleteSavedFilter(id: string): Promise<void> {
  must(await supabase.from('saved_filters').delete().eq('id', id).select());
}

/* ---------- approved iframe hosts (app_settings) ---------- */
const EMBED_KEY = 'dashboard_iframe_allowlist';

export async function loadAllowlist(): Promise<string[]> {
  const { data } = await supabase.from('app_settings').select('setting_value').eq('setting_key', EMBED_KEY).is('user_id', null).maybeSingle();
  return Array.isArray(data?.setting_value) ? (data!.setting_value as string[]) : [];
}

export async function saveAllowlist(hosts: string[]): Promise<void> {
  const clean = Array.from(new Set(hosts.map(h => h.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')).filter(Boolean)));
  const existing = await supabase.from('app_settings').select('id').eq('setting_key', EMBED_KEY).is('user_id', null).maybeSingle();
  const row = { setting_key: EMBED_KEY, setting_value: clean, updated_at: new Date().toISOString() };
  const r = existing.data?.id ? await supabase.from('app_settings').update(row).eq('id', existing.data.id) : await supabase.from('app_settings').insert(row);
  if (r.error) throw new Error(r.error.message);
}
