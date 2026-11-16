import { ViewFilterOperand } from 'twenty-shared/types';
import type { FilterRow } from '../dashboard-builder/model';
import type { SavedView } from '../../services/contactService';

/** A contacts saved view (search text + status) expressed as dashboard-builder filter rows. */
export const viewToFilterRows = (v: Pick<SavedView, 'query' | 'status'>): FilterRow[] => {
  const rows: FilterRow[] = [];
  if (v.status && v.status !== 'all') rows.push({ field: 'status', operand: ViewFilterOperand.IS, value: JSON.stringify([v.status]) });
  if (v.query?.trim()) rows.push({ field: 'firstName', operand: ViewFilterOperand.CONTAINS, value: v.query.trim() });
  return rows;
};

/** The Advanced Contacts URL that shows the same slice as a set of builder filters (status + text only). */
export const filtersToContactsUrl = (rows: FilterRow[]): string => {
  const p = new URLSearchParams();
  const st = rows.find(r => r.field === 'status' && r.operand === ViewFilterOperand.IS);
  if (st) { try { const [s] = JSON.parse(st.value) as string[]; if (s) p.set('status', s); } catch { /* ignore */ } }
  const q = rows.find(r => r.field === 'firstName' && r.operand === ViewFilterOperand.CONTAINS);
  if (q?.value) p.set('q', q.value);
  const s = p.toString();
  return `/app/contacts-hub${s ? `?${s}` : ''}`;
};
