import { describe, expect, it } from 'vitest';
import { filtersToContactsUrl, viewToFilterRows } from './viewFilters';

describe('contacts saved view <-> builder filters', () => {
  it('converts status and text', () => {
    const rows = viewToFilterRows({ query: 'ann', status: 'lead' });
    expect(rows.map(r => r.field)).toEqual(['status', 'firstName']);
    expect(filtersToContactsUrl(rows)).toBe('/app/contacts-hub?status=lead&q=ann');
  });
  it('"all" and empty text produce no filters', () => {
    expect(viewToFilterRows({ query: ' ', status: 'all' })).toEqual([]);
    expect(filtersToContactsUrl([])).toBe('/app/contacts-hub');
  });
});
