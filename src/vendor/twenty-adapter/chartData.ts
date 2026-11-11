/**
 * Answers Twenty's chart/aggregate GraphQL operations from Supabase (no Twenty backend):
 * configuration -> `dashboard_aggregate` RPC -> BarChartData / LineChartData / PieChartData / aggregates.
 */
import { computeRecordGqlOperationFilter } from 'twenty-shared/utils';
import { CATALOG_OBJECTS, TABLE_BY_OBJECT, buildCatalog, getFieldId, getObjectId, type CatalogObjectName } from './metadata';

export type AggregateRow = { g1: string | null; g2: string | null; v: number | null };
export type RpcFn = (args: Record<string, unknown>) => Promise<AggregateRow[]>;

export const defaultRpc: RpcFn = async args => {
  const { supabase } = await import('../../lib/supabase');
  const { data, error } = await supabase.rpc('dashboard_aggregate', args);
  if (error) throw new Error(error.message);
  return (data ?? []) as AggregateRow[];
};

type Obj = (typeof CATALOG_OBJECTS)[number];
const byId = (() => {
  const map = new Map<string, Obj>();
  for (const o of CATALOG_OBJECTS) map.set(getObjectId(o.nameSingular), o);
  return map;
})();
const fieldById = (o: Obj, id: string | null | undefined) => o.fields.find(f => getFieldId(o.nameSingular, f.name) === id);

export const objectFromMetadataId = (id: string): Obj => {
  const o = byId.get(id);
  if (!o) throw new Error(`Unknown object metadata id ${id}`);
  return o;
};

const METRIC: Record<string, string> = {
  COUNT: 'count', SUM: 'sum', AVG: 'avg', MIN: 'min', MAX: 'max', COUNT_EMPTY: 'count_empty', COUNT_NOT_EMPTY: 'count_not_empty',
  COUNT_UNIQUE_VALUES: 'count_unique', PERCENTAGE_EMPTY: 'percentage_empty', PERCENTAGE_NOT_EMPTY: 'percentage_not_empty',
  COUNT_TRUE: 'count_true', COUNT_FALSE: 'count_false',
};
const BUCKETABLE = new Set(['DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR']);
const MAX_GROUPS = 50;

type ChartConfig = Record<string, any>;

/** Twenty chart filter ({recordFilters, recordFilterGroups}) -> Twenty gql filter -> our RPC filter JSON. */
export const chartFilterToGql = (configuration: ChartConfig, obj: Obj): Record<string, unknown> => {
  const filter = configuration.filter;
  if (!filter || typeof filter !== 'object') return {};
  const recordFilters = Array.isArray(filter.recordFilters) ? filter.recordFilters : [];
  const recordFilterGroups = Array.isArray(filter.recordFilterGroups) ? filter.recordFilterGroups : [];
  if (!recordFilters.length && !recordFilterGroups.length) return {};
  const { flatFields } = buildCatalog();
  const fieldMetadataItems = flatFields.filter(f => f.objectMetadataId === getObjectId(obj.nameSingular));
  try {
    return computeRecordGqlOperationFilter({
      fieldMetadataItems: fieldMetadataItems as never,
      filterValueDependencies: {} as never,
      recordFilters: recordFilters.map((r: any) => ({ ...r, value: r.value ?? '' })),
      recordFilterGroups,
    }) as Record<string, unknown>;
  } catch {
    return {};
  }
};

const formatDate = (raw: string, granularity: string | null | undefined) => {
  const d = new Date(raw + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) return raw;
  switch (granularity) {
    case 'YEAR': return String(d.getUTCFullYear());
    case 'QUARTER': return `Q${Math.floor(d.getUTCMonth() / 3) + 1} ${d.getUTCFullYear()}`;
    case 'MONTH': return d.toLocaleString('en', { month: 'short', year: 'numeric', timeZone: 'UTC' });
    default: return d.toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  }
};

const labelFor = (obj: Obj, fieldId: string | null | undefined, raw: string | null, granularity: string | null | undefined) => {
  if (raw === null || raw === undefined) return 'Not set';
  const field = fieldById(obj, fieldId);
  if (field?.options) return field.options.find(o => o.value === raw)?.label ?? raw;
  if (field && (field.type === 'DATE_TIME' || field.type === 'DATE') && BUCKETABLE.has(granularity ?? '')) return formatDate(raw, granularity);
  return raw;
};

const bucketOf = (g: string | null | undefined) => (g && BUCKETABLE.has(g) ? g : null);
const fieldName = (obj: Obj, id: string | null | undefined) => fieldById(obj, id)?.name ?? null;

const orderRows = (rows: AggregateRow[], orderBy: string | null | undefined, obj: Obj, fieldId: string | null | undefined, manual: string[] | null | undefined) => {
  const field = fieldById(obj, fieldId);
  const sorted = [...rows];
  const position = (v: string | null) => field?.options?.findIndex(o => o.value === v) ?? -1;
  switch (orderBy) {
    case 'FIELD_DESC': return sorted.sort((a, b) => String(b.g1 ?? '').localeCompare(String(a.g1 ?? '')));
    case 'FIELD_POSITION_ASC': return sorted.sort((a, b) => position(a.g1) - position(b.g1));
    case 'FIELD_POSITION_DESC': return sorted.sort((a, b) => position(b.g1) - position(a.g1));
    case 'VALUE_ASC': return sorted.sort((a, b) => (a.v ?? 0) - (b.v ?? 0));
    case 'VALUE_DESC': return sorted.sort((a, b) => (b.v ?? 0) - (a.v ?? 0));
    case 'MANUAL': return sorted.sort((a, b) => (manual ?? []).indexOf(String(a.g1)) - (manual ?? []).indexOf(String(b.g1)));
    default: return sorted.sort((a, b) => String(a.g1 ?? '').localeCompare(String(b.g1 ?? '')));
  }
};

const fetchRows = async (rpc: RpcFn, obj: Obj, c: ChartConfig, withSecondary: boolean): Promise<AggregateRow[]> => {
  const metric = METRIC[c.aggregateOperation] ?? 'count';
  const aggField = fieldName(obj, c.aggregateFieldMetadataId);
  const needsField = metric !== 'count' || false;
  return rpc({
    p_table: TABLE_BY_OBJECT[obj.nameSingular as CatalogObjectName],
    p_metric: metric,
    p_field: needsField ? aggField : null,
    p_group1: fieldName(obj, c.primaryAxisGroupByFieldMetadataId),
    p_bucket1: bucketOf(c.primaryAxisDateGranularity),
    p_group2: withSecondary ? fieldName(obj, c.secondaryAxisGroupByFieldMetadataId) : null,
    p_bucket2: withSecondary ? bucketOf(c.secondaryAxisGroupByDateGranularity) : null,
    p_filter: chartFilterToGql(c, obj),
    p_limit: 500,
  });
};

const axisLabels = (obj: Obj, c: ChartConfig) => {
  const metricField = fieldById(obj, c.aggregateFieldMetadataId);
  const op = String(c.aggregateOperation ?? 'COUNT').toLowerCase().replace(/_/g, ' ');
  return {
    x: fieldById(obj, c.primaryAxisGroupByFieldMetadataId)?.label ?? '',
    y: c.aggregateOperation === 'COUNT' ? 'Count' : `${metricField?.label ?? ''} (${op})`.trim(),
  };
};

const cumulate = (values: number[]) => { let t = 0; return values.map(v => (t += v)); };

/* ------------------------------- Bar ------------------------------- */
export const resolveBarChart = async (rpc: RpcFn, objectMetadataId: string, c: ChartConfig) => {
  const obj = objectFromMetadataId(objectMetadataId);
  const hasSecondary = !!c.secondaryAxisGroupByFieldMetadataId;
  let rows = await fetchRows(rpc, obj, c, hasSecondary);
  if (c.omitNullValues) rows = rows.filter(r => r.g1 !== null && (!hasSecondary || r.g2 !== null));
  const { x, y } = axisLabels(obj, c);
  const lookup: Record<string, unknown> = {};
  const lab1 = (raw: string | null) => { const l = labelFor(obj, c.primaryAxisGroupByFieldMetadataId, raw, c.primaryAxisDateGranularity); lookup[l] = raw; return l; };
  const lab2 = (raw: string | null) => { const l = labelFor(obj, c.secondaryAxisGroupByFieldMetadataId, raw, c.secondaryAxisGroupByDateGranularity); lookup[l] = raw; return l; };

  let data: Record<string, string | number>[];
  let keys: string[];
  let series: { key: string; label: string }[];

  if (!hasSecondary) {
    const ordered = orderRows(rows, c.primaryAxisOrderBy, obj, c.primaryAxisGroupByFieldMetadataId, c.primaryAxisManualSortOrder);
    const vals = c.isCumulative ? cumulate(ordered.map(r => r.v ?? 0)) : ordered.map(r => r.v ?? 0);
    data = ordered.map((r, i) => ({ label: lab1(r.g1), value: vals[i] }));
    keys = ['value'];
    series = [{ key: 'value', label: y }];
  } else {
    const primary = orderRows(
      Array.from(new Map(rows.map(r => [r.g1, { g1: r.g1, g2: null, v: 0 }])).values()),
      c.primaryAxisOrderBy === 'VALUE_ASC' || c.primaryAxisOrderBy === 'VALUE_DESC' ? 'FIELD_ASC' : c.primaryAxisOrderBy,
      obj, c.primaryAxisGroupByFieldMetadataId, c.primaryAxisManualSortOrder,
    );
    const secondaryRaw = Array.from(new Set(rows.map(r => r.g2)));
    const secKeys = secondaryRaw.map(lab2);
    data = primary.map(p => {
      const row: Record<string, string | number> = { label: lab1(p.g1) };
      secondaryRaw.forEach((s, i) => { row[secKeys[i]] = rows.find(r => r.g1 === p.g1 && r.g2 === s)?.v ?? 0; });
      return row;
    });
    keys = secKeys;
    series = secKeys.map(k => ({ key: k, label: k }));
  }

  return {
    __typename: 'BarChartData',
    data,
    indexBy: 'label',
    keys,
    series: series.map(s => ({ __typename: 'BarChartSeries', ...s })),
    xAxisLabel: x,
    yAxisLabel: y,
    showLegend: true,
    showDataLabels: false,
    layout: c.layout ?? 'VERTICAL',
    groupMode: c.groupMode ?? 'STACKED',
    hasTooManyGroups: data.length > MAX_GROUPS,
    formattedToRawLookup: lookup,
  };
};

/* ------------------------------- Line ------------------------------- */
export const resolveLineChart = async (rpc: RpcFn, objectMetadataId: string, c: ChartConfig) => {
  const obj = objectFromMetadataId(objectMetadataId);
  const hasSecondary = !!c.secondaryAxisGroupByFieldMetadataId;
  let rows = await fetchRows(rpc, obj, c, hasSecondary);
  if (c.omitNullValues) rows = rows.filter(r => r.g1 !== null);
  const { x, y } = axisLabels(obj, c);
  const lookup: Record<string, unknown> = {};
  const lab1 = (raw: string | null) => { const l = labelFor(obj, c.primaryAxisGroupByFieldMetadataId, raw, c.primaryAxisDateGranularity); lookup[l] = raw; return l; };
  const lab2 = (raw: string | null) => { const l = labelFor(obj, c.secondaryAxisGroupByFieldMetadataId, raw, c.secondaryAxisGroupByDateGranularity); lookup[l] = raw; return l; };
  const xs = orderRows(Array.from(new Map(rows.map(r => [r.g1, { g1: r.g1, g2: null, v: 0 }])).values()), 'FIELD_ASC', obj, c.primaryAxisGroupByFieldMetadataId, null);
  const groups = hasSecondary ? Array.from(new Set(rows.map(r => r.g2))) : [null];

  const series = groups.map(g => {
    const raw = xs.map(p => rows.find(r => r.g1 === p.g1 && (!hasSecondary || r.g2 === g))?.v ?? 0);
    const ys = c.isCumulative ? cumulate(raw) : raw;
    const key = hasSecondary ? lab2(g) : 'value';
    return {
      __typename: 'LineChartSeries', key, label: hasSecondary ? key : y,
      data: xs.map((p, i) => ({ __typename: 'LineChartDataPoint', x: lab1(p.g1), y: ys[i] })),
    };
  });

  return {
    __typename: 'LineChartData', series, xAxisLabel: x, yAxisLabel: y, showLegend: true, showDataLabels: false,
    hasTooManyGroups: xs.length > MAX_GROUPS, formattedToRawLookup: lookup,
  };
};

/* ------------------------------- Pie ------------------------------- */
export const resolvePieChart = async (rpc: RpcFn, objectMetadataId: string, c: ChartConfig) => {
  const obj = objectFromMetadataId(objectMetadataId);
  let rows = await fetchRows(rpc, obj, { ...c, primaryAxisGroupByFieldMetadataId: c.groupByFieldMetadataId, primaryAxisDateGranularity: c.dateGranularity }, false);
  if (c.omitNullValues) rows = rows.filter(r => r.g1 !== null);
  const lookup: Record<string, unknown> = {};
  const ordered = orderRows(rows, c.orderBy, obj, c.groupByFieldMetadataId, c.manualSortOrder);
  const items = ordered.map(r => {
    const key = labelFor(obj, c.groupByFieldMetadataId, r.g1, c.dateGranularity);
    lookup[key] = r.g1;
    return { __typename: 'PieChartDataItem', key, value: r.v ?? 0 };
  });
  return {
    __typename: 'PieChartData', data: items, showLegend: true, showDataLabels: false, showCenterMetric: true,
    hasTooManyGroups: items.length > MAX_GROUPS, formattedToRawLookup: lookup,
  };
};

/* ------------------------------ Aggregate ------------------------------ */
const GQL_OPS: Array<[prefix: string, metric: string]> = [
  ['countUniqueValues', 'count_unique'], ['countNotEmpty', 'count_not_empty'], ['countEmpty', 'count_empty'],
  ['percentageNotEmpty', 'percentage_not_empty'], ['percentageEmpty', 'percentage_empty'],
  ['countTrue', 'count_true'], ['countFalse', 'count_false'], ['sum', 'sum'], ['avg', 'avg'], ['min', 'min'], ['max', 'max'],
];

/** Resolves Twenty's `Aggregate<Plural>` query: { <namePlural>: { totalCount, sumValue, ... } }. */
export const resolveAggregateQuery = async (rpc: RpcFn, namePlural: string, selected: string[], gqlFilter: Record<string, unknown> | undefined) => {
  const obj = CATALOG_OBJECTS.find(o => o.namePlural === namePlural);
  if (!obj) throw new Error(`Unknown object ${namePlural}`);
  const table = TABLE_BY_OBJECT[obj.nameSingular as CatalogObjectName];
  const result: Record<string, number | null> = {};
  await Promise.all(selected.map(async gqlField => {
    if (gqlField === '__typename') return;
    let metric = 'count';
    let field: string | null = null;
    if (gqlField !== 'totalCount') {
      const op = GQL_OPS.find(([p]) => gqlField.startsWith(p) && gqlField.length > p.length);
      if (!op) throw new Error(`Unsupported aggregate field ${gqlField}`);
      metric = op[1];
      const rest = gqlField.slice(op[0].length);
      field = obj.fields.find(f => f.name.toLowerCase() === rest.toLowerCase())?.name ?? null;
      if (!field) throw new Error(`Unknown field in ${gqlField}`);
    }
    const rows = await rpc({ p_table: table, p_metric: metric, p_field: field, p_filter: gqlFilter ?? {}, p_limit: 1 });
    result[gqlField] = rows[0]?.v ?? 0;
  }));
  return { __typename: 'Aggregate', ...result };
};
