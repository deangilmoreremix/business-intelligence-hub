// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { resolveBarChart, resolveLineChart, resolvePieChart, resolveAggregateQuery, type RpcFn, type AggregateRow } from './chartData';
import { getFieldId, getObjectId } from './metadata';

const calls: Record<string, unknown>[] = [];
const fake = (rows: AggregateRow[]): RpcFn => async args => { calls.push(args); return rows; };
const contact = getObjectId('contact');

describe('chart resolvers (Supabase-backed replacement for Twenty chart queries)', () => {
  it('bar: single group, select-option labels, ordering by value, null bucket', async () => {
    const out = await resolveBarChart(fake([
      { g1: 'lead', g2: null, v: 2 }, { g1: 'customer', g2: null, v: 5 }, { g1: null, g2: null, v: 1 },
    ]), contact, {
      aggregateFieldMetadataId: getFieldId('contact', 'id'), aggregateOperation: 'COUNT',
      primaryAxisGroupByFieldMetadataId: getFieldId('contact', 'status'), primaryAxisOrderBy: 'VALUE_DESC', layout: 'VERTICAL',
    });
    expect(out.indexBy).toBe('label');
    expect(out.data.map(d => d.label)).toEqual(['Customer', 'Lead', 'Not set']);
    expect(out.data.map(d => d.value)).toEqual([5, 2, 1]);
    expect(out.formattedToRawLookup).toMatchObject({ Customer: 'customer', Lead: 'lead' });
    expect(calls.at(-1)).toMatchObject({ p_table: 'contacts', p_metric: 'count', p_group1: 'status', p_field: null });
  });

  it('bar: secondary grouping pivots into keys; sum maps to numeric field', async () => {
    const out = await resolveBarChart(fake([
      { g1: 'lead', g2: 'Acme', v: 10 }, { g1: 'lead', g2: 'Initech', v: 4 }, { g1: 'customer', g2: 'Acme', v: 7 },
    ]), contact, {
      aggregateFieldMetadataId: getFieldId('contact', 'leadScore'), aggregateOperation: 'SUM',
      primaryAxisGroupByFieldMetadataId: getFieldId('contact', 'status'), secondaryAxisGroupByFieldMetadataId: getFieldId('contact', 'company'),
      primaryAxisOrderBy: 'FIELD_ASC', layout: 'HORIZONTAL', groupMode: 'GROUPED',
    });
    expect(out.keys.sort()).toEqual(['Acme', 'Initech']);
    expect(out.data.find(d => d.label === 'Lead')).toMatchObject({ Acme: 10, Initech: 4 });
    expect(out.data.find(d => d.label === 'Customer')).toMatchObject({ Acme: 7, Initech: 0 });
    expect(out.layout).toBe('HORIZONTAL');
    expect(calls.at(-1)).toMatchObject({ p_metric: 'sum', p_field: 'leadScore', p_group1: 'status', p_group2: 'company' });
  });

  it('bar: cumulative + omitNullValues + date bucketing labels', async () => {
    const out = await resolveBarChart(fake([
      { g1: '2026-01-01', g2: null, v: 2 }, { g1: '2026-02-01', g2: null, v: 3 }, { g1: null, g2: null, v: 9 },
    ]), contact, {
      aggregateFieldMetadataId: getFieldId('contact', 'id'), aggregateOperation: 'COUNT', isCumulative: true, omitNullValues: true,
      primaryAxisGroupByFieldMetadataId: getFieldId('contact', 'createdAt'), primaryAxisDateGranularity: 'MONTH',
    });
    expect(out.data.map(d => d.value)).toEqual([2, 5]);
    expect(out.data.map(d => d.label)).toEqual(['Jan 2026', 'Feb 2026']);
    expect(calls.at(-1)).toMatchObject({ p_bucket1: 'MONTH' });
  });

  it('line: series per secondary group with x/y points', async () => {
    const out = await resolveLineChart(fake([
      { g1: '2026-01-01', g2: 'lead', v: 1 }, { g1: '2026-02-01', g2: 'lead', v: 2 }, { g1: '2026-02-01', g2: 'customer', v: 4 },
    ]), contact, {
      aggregateFieldMetadataId: getFieldId('contact', 'id'), aggregateOperation: 'COUNT',
      primaryAxisGroupByFieldMetadataId: getFieldId('contact', 'createdAt'), primaryAxisDateGranularity: 'MONTH',
      secondaryAxisGroupByFieldMetadataId: getFieldId('contact', 'status'),
    });
    expect(out.series.map(s => s.key).sort()).toEqual(['Customer', 'Lead']);
    expect(out.series.find(s => s.key === 'Lead')!.data).toEqual([
      expect.objectContaining({ x: 'Jan 2026', y: 1 }), expect.objectContaining({ x: 'Feb 2026', y: 2 }),
    ]);
    expect(out.series.find(s => s.key === 'Customer')!.data.map(p => p.y)).toEqual([0, 4]);
  });

  it('pie: uses groupByFieldMetadataId and returns key/value items', async () => {
    const out = await resolvePieChart(fake([{ g1: 'lead', g2: null, v: 3 }, { g1: 'inactive', g2: null, v: 1 }]), contact, {
      aggregateFieldMetadataId: getFieldId('contact', 'id'), aggregateOperation: 'COUNT',
      groupByFieldMetadataId: getFieldId('contact', 'status'), orderBy: 'VALUE_DESC',
    });
    expect(out.data).toEqual([expect.objectContaining({ key: 'Lead', value: 3 }), expect.objectContaining({ key: 'Inactive', value: 1 })]);
    expect(calls.at(-1)).toMatchObject({ p_group1: 'status' });
  });

  it('chart filters are translated to the RPC filter (status eq lead)', async () => {
    await resolvePieChart(fake([]), contact, {
      aggregateFieldMetadataId: getFieldId('contact', 'id'), aggregateOperation: 'COUNT', groupByFieldMetadataId: getFieldId('contact', 'status'),
      filter: { recordFilters: [{ id: 'f1', fieldMetadataId: getFieldId('contact', 'status'), operand: 'IS', value: '["lead"]', type: 'SELECT', label: 'Status', displayValue: 'Lead' }], recordFilterGroups: [] },
    });
    const filter = JSON.stringify(calls.at(-1)!.p_filter);
    expect(filter).toContain('status');
    expect(filter).toContain('lead');
  });

  it('aggregate query: totalCount / sumX / percentageEmptyX map to RPC metrics', async () => {
    const out = await resolveAggregateQuery(fake([{ g1: null, g2: null, v: 42 }]), 'contacts', ['totalCount', 'sumLeadScore', 'percentageEmptyEmail'], { status: { eq: 'lead' } });
    expect(out).toMatchObject({ totalCount: 42, sumLeadScore: 42, percentageEmptyEmail: 42 });
    const metrics = calls.slice(-3).map(c => `${c.p_metric}:${c.p_field}`).sort();
    expect(metrics).toEqual(['count:null', 'percentage_empty:email', 'sum:leadScore']);
    expect(calls.at(-1)!.p_filter).toEqual({ status: { eq: 'lead' } });
    await expect(resolveAggregateQuery(fake([]), 'contacts', ['sumNope'], {})).rejects.toThrow(/Unknown field/);
  });
});
