import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';
import type { PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import {
  CATALOG_OBJECTS, getFieldId, getObjectId, type CatalogObjectName,
} from '../../vendor/twenty-adapter/metadata';
import { chartFilterToGql, objectFromMetadataId } from '../../vendor/twenty-adapter/chartData';

export type WidgetKind = 'bar' | 'line' | 'pie' | 'aggregate' | 'recordList' | 'iframe' | 'aiInsights';

export interface FilterRow {
  field: string;               // catalog field name
  operand: ViewFilterOperand;  // Twenty operand
  value: string;               // Twenty value encoding ("a", or JSON array '["lead"]' for selects)
}

export interface WidgetOptions {
  operation: string;                // Twenty AggregateOperations
  aggregateField: string | null;    // metric field (null => id / count)
  groupBy: string | null;
  granularity: string | null;       // ObjectRecordGroupByDateGranularity
  groupBy2: string | null;
  granularity2: string | null;
  orderBy: string;
  layout: 'VERTICAL' | 'HORIZONTAL';
  groupMode: 'GROUPED' | 'STACKED';
  omitNull: boolean;
  cumulative: boolean;
  legend: boolean;
  dataLabels: boolean;
  filters: FilterRow[];
  useContext: boolean;              // narrow by the dashboard's selected record
  url: string;                      // iframe
  columns: string[];                // record list
  limit: number;                    // record list
}

export interface WidgetSpec {
  id: string;
  kind: WidgetKind;
  title: string;
  objectName: CatalogObjectName;
  grid: { x: number; y: number; w: number; h: number };
  options: WidgetOptions;
}

export interface ContextRecord { object: CatalogObjectName; id: string; label: string }
export interface DashboardLayout { widgets: WidgetSpec[]; context?: ContextRecord | null }

export const DEFAULT_OPTIONS: WidgetOptions = {
  operation: 'COUNT', aggregateField: null, groupBy: null, granularity: null, groupBy2: null, granularity2: null,
  orderBy: 'FIELD_ASC', layout: 'VERTICAL', groupMode: 'STACKED', omitNull: false, cumulative: false,
  legend: true, dataLabels: false, filters: [], useContext: false, url: '', columns: [], limit: 10,
};

export const newId = () => `w_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;

export const objectDef = (name: CatalogObjectName) => CATALOG_OBJECTS.find(o => o.nameSingular === name)!;

const DEFAULT_GROUP: Record<CatalogObjectName, { field: string; granularity?: string }> = {
  contact: { field: 'status' }, deal: { field: 'stageId' }, company: { field: 'industry' },
};

export const defaultWidget = (kind: WidgetKind, objectName: CatalogObjectName = 'contact'): WidgetSpec => {
  const g = DEFAULT_GROUP[objectName];
  const titles: Record<WidgetKind, string> = {
    bar: 'Bar chart', line: 'Trend', pie: 'Distribution', aggregate: 'Total', recordList: 'Records', iframe: 'Embedded page', aiInsights: 'AI insights',
  };
  const base = { ...DEFAULT_OPTIONS, groupBy: g.field };
  const options: WidgetOptions =
    kind === 'line' ? { ...base, groupBy: 'createdAt', granularity: 'MONTH' }
    : kind === 'aggregate' ? { ...DEFAULT_OPTIONS }
    : kind === 'recordList' ? { ...DEFAULT_OPTIONS, columns: objectDef(objectName).fields.filter(f => f.name !== 'id').slice(0, 4).map(f => f.name) }
    : base;
  const size = kind === 'aggregate' ? { w: 3, h: 3 } : kind === 'recordList' ? { w: 6, h: 6 } : { w: 6, h: 5 };
  return { id: newId(), kind, title: `${titles[kind]}${kind === 'iframe' || kind === 'aiInsights' ? '' : ` · ${objectDef(objectName).labelPlural}`}`, objectName, grid: { x: 0, y: Infinity, ...size }, options };
};

/* -------------------- filters -------------------- */

export const OPERANDS_BY_TYPE: Record<string, ViewFilterOperand[]> = {
  TEXT: [ViewFilterOperand.CONTAINS, ViewFilterOperand.DOES_NOT_CONTAIN, ViewFilterOperand.IS_EMPTY, ViewFilterOperand.IS_NOT_EMPTY],
  NUMBER: [ViewFilterOperand.GREATER_THAN_OR_EQUAL, ViewFilterOperand.LESS_THAN_OR_EQUAL, ViewFilterOperand.IS_EMPTY, ViewFilterOperand.IS_NOT_EMPTY],
  SELECT: [ViewFilterOperand.IS, ViewFilterOperand.IS_NOT, ViewFilterOperand.IS_EMPTY, ViewFilterOperand.IS_NOT_EMPTY],
  DATE_TIME: [ViewFilterOperand.IS_AFTER, ViewFilterOperand.IS_BEFORE, ViewFilterOperand.IS_EMPTY, ViewFilterOperand.IS_NOT_EMPTY],
  UUID: [ViewFilterOperand.IS],
};

export const operandNeedsValue = (op: ViewFilterOperand) => op !== ViewFilterOperand.IS_EMPTY && op !== ViewFilterOperand.IS_NOT_EMPTY;

const filterRowToRecordFilter = (objectName: CatalogObjectName, row: FilterRow, i: number) => {
  const field = objectDef(objectName).fields.find(f => f.name === row.field)!;
  return {
    id: `flt_${i}_${row.field}`,
    fieldMetadataId: getFieldId(objectName, row.field),
    operand: row.operand,
    value: row.value,
    displayValue: row.value,
    label: field.label,
    type: field.type,
    subFieldName: null,
  };
};

export const contextFilterRow = (objectName: CatalogObjectName, ctx: ContextRecord | null | undefined): FilterRow | null => {
  if (!ctx) return null;
  if (ctx.object === objectName) return { field: 'id', operand: ViewFilterOperand.IS, value: ctx.id };
  if (ctx.object === 'contact' && objectName === 'deal') return { field: 'contactId', operand: ViewFilterOperand.IS, value: ctx.id };
  if (ctx.object === 'company' && objectName === 'contact') return { field: 'companyId', operand: ViewFilterOperand.IS, value: ctx.id };
  return null;
};

export const effectiveFilterRows = (spec: WidgetSpec, ctx: ContextRecord | null | undefined): FilterRow[] => {
  const rows = spec.options.filters.filter(f => objectDef(spec.objectName).fields.some(x => x.name === f.field));
  const c = spec.options.useContext ? contextFilterRow(spec.objectName, ctx) : null;
  return c ? [...rows, c] : rows;
};

const chartFilter = (spec: WidgetSpec, ctx: ContextRecord | null | undefined) => {
  const rows = effectiveFilterRows(spec, ctx);
  return rows.length ? { recordFilters: rows.map((r, i) => filterRowToRecordFilter(spec.objectName, r, i)), recordFilterGroups: [] } : null;
};

/* -------------------- Twenty widget conversion -------------------- */

const idField = (o: CatalogObjectName) => getFieldId(o, 'id');
const fid = (o: CatalogObjectName, name: string | null | undefined) => (name ? getFieldId(o, name) : null);

export const toTwentyWidget = (spec: WidgetSpec, ctx?: ContextRecord | null): PageLayoutWidget => {
  const { options: o, objectName: obj } = spec;
  const common = { aggregateFieldMetadataId: fid(obj, o.operation === 'COUNT' ? null : o.aggregateField) ?? idField(obj), aggregateOperation: o.operation, filter: chartFilter(spec, ctx) };
  const gridPosition = { row: spec.grid.y, column: spec.grid.x, rowSpan: spec.grid.h, columnSpan: spec.grid.w };
  const w = (type: string, configuration: Record<string, unknown>) =>
    ({ id: spec.id, pageLayoutTabId: 'tab', title: spec.title, type, objectMetadataId: type === 'IFRAME' ? null : getObjectId(obj), gridPosition, configuration }) as unknown as PageLayoutWidget;

  switch (spec.kind) {
    case 'bar':
      return w('GRAPH', {
        __typename: 'BarChartConfiguration', configurationType: 'BAR_CHART', ...common,
        primaryAxisGroupByFieldMetadataId: fid(obj, o.groupBy), primaryAxisDateGranularity: o.granularity, primaryAxisOrderBy: o.orderBy,
        secondaryAxisGroupByFieldMetadataId: fid(obj, o.groupBy2), secondaryAxisGroupByDateGranularity: o.granularity2,
        layout: o.layout, groupMode: o.groupMode, omitNullValues: o.omitNull, isCumulative: o.cumulative,
        displayLegend: o.legend, displayDataLabel: o.dataLabels, axisNameDisplay: 'BOTH',
      });
    case 'line':
      return w('GRAPH', {
        __typename: 'LineChartConfiguration', configurationType: 'LINE_CHART', ...common,
        primaryAxisGroupByFieldMetadataId: fid(obj, o.groupBy), primaryAxisDateGranularity: o.granularity, primaryAxisOrderBy: o.orderBy,
        secondaryAxisGroupByFieldMetadataId: fid(obj, o.groupBy2), secondaryAxisGroupByDateGranularity: o.granularity2,
        omitNullValues: o.omitNull, isCumulative: o.cumulative, displayLegend: o.legend, displayDataLabel: o.dataLabels, axisNameDisplay: 'BOTH',
      });
    case 'pie':
      return w('GRAPH', {
        __typename: 'PieChartConfiguration', configurationType: 'PIE_CHART', ...common,
        groupByFieldMetadataId: fid(obj, o.groupBy), dateGranularity: o.granularity, orderBy: o.orderBy,
        omitNullValues: o.omitNull, displayLegend: o.legend, displayDataLabel: o.dataLabels,
      });
    case 'aggregate':
      return w('GRAPH', { __typename: 'AggregateChartConfiguration', configurationType: 'AGGREGATE_CHART', ...common, displayDataLabel: true });
    case 'iframe':
      return w('IFRAME', { __typename: 'IframeConfiguration', configurationType: 'IFRAME', url: o.url });
    default:
      return w('GRAPH', { configurationType: 'NONE', filter: chartFilter(spec, ctx) });
  }
};

export const fieldsOf = (obj: CatalogObjectName, pred: (t: FieldMetadataType) => boolean = () => true) =>
  objectDef(obj).fields.filter(f => pred(f.type as FieldMetadataType));

export const isNumeric = (t: FieldMetadataType) => t === FieldMetadataType.NUMBER;
export const isDate = (t: FieldMetadataType) => t === FieldMetadataType.DATE_TIME || t === FieldMetadataType.DATE;

/** Filter (Twenty gql shape) a widget applies, including dashboard context; same translation the charts use. */
export const gqlFilterFor = (spec: WidgetSpec, ctx?: ContextRecord | null) =>
  chartFilterToGql(toTwentyWidget(spec, ctx).configuration as never, objectFromMetadataId(getObjectId(spec.objectName)));
