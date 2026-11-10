import { supabase } from '../lib/supabase';
import type { Contact } from '../store/contactStore';

export interface Company {
  id: string;
  name: string;
  domain?: string | null;
  industry?: string | null;
  employees?: number | null;
  contactCount?: number;
}

export interface Activity {
  id: string;
  kind: string;
  detail: string | null;
  created_at: string;
}

export interface SavedView {
  name: string;
  query: string;
  status: string;
  sortKey: string;
  sortDir: 1 | -1;
}

const must = <T,>(r: { data: T | null; error: { message: string } | null }): T => {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
};

/* ---------- companies ---------- */
export async function listCompanies(): Promise<Company[]> {
  const companies = must(await supabase.from('companies').select('*').order('name')) as Company[];
  const links = must(await supabase.from('contacts').select('company_id')) as Array<{ company_id: string | null }>;
  const counts = new Map<string, number>();
  for (const l of links) if (l.company_id) counts.set(l.company_id, (counts.get(l.company_id) ?? 0) + 1);
  return (companies ?? []).map(c => ({ ...c, contactCount: counts.get(c.id) ?? 0 }));
}

export async function createCompany(input: { name: string; domain?: string; industry?: string }): Promise<Company> {
  return must(await supabase.from('companies').insert({ name: input.name, domain: input.domain || null, industry: input.industry || null }).select().single()) as Company;
}

export async function linkContactToCompany(contactId: string, company: Company | null): Promise<void> {
  must(await supabase.from('contacts').update({ company_id: company?.id ?? null, company: company?.name ?? null }).eq('id', contactId).select());
}

export async function getContactCompanyId(contactId: string): Promise<string | null> {
  const row = must(await supabase.from('contacts').select('company_id').eq('id', contactId).single()) as { company_id: string | null };
  return row?.company_id ?? null;
}

/* ---------- timeline ---------- */
export async function listActivities(contactId: string): Promise<Activity[]> {
  return (must(await supabase.from('contact_activities').select('*').eq('contact_id', contactId).order('created_at', { ascending: false })) ?? []) as Activity[];
}

export async function addActivity(contactId: string, kind: string, detail?: string): Promise<void> {
  await supabase.from('contact_activities').insert({ contact_id: contactId, kind, detail: detail ?? null });
}

/* ---------- bulk ---------- */
export async function bulkSetStatus(ids: string[], status: NonNullable<Contact['crmStatus']>): Promise<void> {
  must(await supabase.from('contacts').update({ status }).in('id', ids).select());
}

export async function bulkTag(ids: string[], tag: string): Promise<void> {
  const rows = must(await supabase.from('contacts').select('id,tags').in('id', ids)) as Array<{ id: string; tags: string[] | null }>;
  for (const r of rows ?? []) {
    const tags = Array.from(new Set([...(r.tags ?? []), tag]));
    must(await supabase.from('contacts').update({ tags }).eq('id', r.id).select());
  }
}

export async function bulkDelete(ids: string[]): Promise<void> {
  must(await supabase.from('contacts').delete().in('id', ids).select());
}

/* ---------- merge duplicates ---------- */
const MERGE_FIELDS = ['email', 'phone', 'company', 'company_id', 'job_title', 'city', 'linkedin_url', 'twitter_url', 'website', 'bio', 'lead_score', 'ai_summary', 'ai_next_action'] as const;

/** Merge `otherIds` into `primaryId`: fill the primary's empty fields, re-point notes/activities/deals, delete the rest. */
export async function mergeContacts(primaryId: string, otherIds: string[]): Promise<void> {
  const ids = [primaryId, ...otherIds];
  const rows = must(await supabase.from('contacts').select('*').in('id', ids)) as Array<Record<string, unknown> & { id: string }>;
  const primary = rows.find(r => r.id === primaryId);
  if (!primary) throw new Error('Primary contact not found');
  const patch: Record<string, unknown> = {};
  for (const f of MERGE_FIELDS) {
    if (primary[f] !== null && primary[f] !== undefined && primary[f] !== '') continue;
    const donor = rows.find(r => r.id !== primaryId && r[f] !== null && r[f] !== undefined && r[f] !== '');
    if (donor) patch[f] = donor[f];
  }
  const tags = Array.from(new Set(rows.flatMap(r => (r.tags as string[] | null) ?? [])));
  if (tags.length) patch.tags = tags;
  if (Object.keys(patch).length) must(await supabase.from('contacts').update(patch).eq('id', primaryId).select());
  for (const table of ['contact_notes', 'contact_activities', 'deals']) {
    must(await supabase.from(table).update({ contact_id: primaryId }).in('contact_id', otherIds).select());
  }
  await addActivity(primaryId, 'merged', `Merged ${otherIds.length} duplicate contact(s)`);
  must(await supabase.from('contacts').delete().in('id', otherIds).select());
}

/* ---------- saved views (stored in app_settings) ---------- */
const VIEWS_KEY = 'contact_views';

export async function loadViews(): Promise<SavedView[]> {
  const { data } = await supabase.from('app_settings').select('setting_value').eq('setting_key', VIEWS_KEY).is('user_id', null).maybeSingle();
  return ((data?.setting_value as SavedView[] | undefined) ?? []);
}

export async function saveViews(views: SavedView[]): Promise<void> {
  const existing = await supabase.from('app_settings').select('id').eq('setting_key', VIEWS_KEY).is('user_id', null).maybeSingle();
  const row = { setting_key: VIEWS_KEY, setting_value: views, updated_at: new Date().toISOString() };
  const r = existing.data?.id
    ? await supabase.from('app_settings').update(row).eq('id', existing.data.id)
    : await supabase.from('app_settings').insert(row);
  if (r.error) throw new Error(r.error.message);
}
