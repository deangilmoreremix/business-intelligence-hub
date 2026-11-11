import { supabase } from '../../lib/supabase';
import { TABLE_BY_OBJECT, type CatalogObjectName } from '../../vendor/twenty-adapter/metadata';

export type RecordRow = Record<string, unknown> & { id: string };

const toCamel = (k: string) => k.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
export const camelizeRow = (row: Record<string, unknown>): RecordRow => Object.fromEntries(Object.entries(row).map(([k, v]) => [toCamel(k), v])) as RecordRow;

export async function fetchRecords(object: CatalogObjectName, filter: Record<string, unknown>, opts: { order?: string; desc?: boolean; limit?: number; offset?: number } = {}): Promise<RecordRow[]> {
  const { data, error } = await supabase.rpc('dashboard_records', {
    p_table: TABLE_BY_OBJECT[object], p_filter: filter, p_order: opts.order ?? null, p_desc: opts.desc ?? true, p_limit: opts.limit ?? 50, p_offset: opts.offset ?? 0,
  });
  if (error) throw new Error(error.message);
  return ((data ?? []) as Record<string, unknown>[]).map(camelizeRow);
}

export async function countRecords(object: CatalogObjectName, filter: Record<string, unknown>): Promise<number> {
  const { data, error } = await supabase.rpc('dashboard_aggregate', { p_table: TABLE_BY_OBJECT[object], p_metric: 'count', p_filter: filter, p_limit: 1 });
  if (error) throw new Error(error.message);
  return Number((data as { v: number }[] | null)?.[0]?.v ?? 0);
}

export const recordLabel = (object: CatalogObjectName, r: RecordRow): string =>
  object === 'contact' ? `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim() || String(r.email ?? r.id)
  : object === 'deal' ? String(r.title ?? r.id)
  : String(r.name ?? r.id);

export async function searchRecords(object: CatalogObjectName, text: string): Promise<RecordRow[]> {
  const field = object === 'contact' ? 'firstName' : object === 'deal' ? 'title' : 'name';
  const filter = text ? { [field]: { ilike: `%${text}%` } } : {};
  return fetchRecords(object, filter, { limit: 8, order: field, desc: false });
}
