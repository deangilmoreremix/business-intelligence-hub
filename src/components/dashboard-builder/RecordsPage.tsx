import { useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import qs from 'qs';
import { ViewFilterOperand, ViewFilterOperandDeprecated } from 'twenty-shared/types';
import { PageWrapper } from '../layout/PageWrapper';
import { GlassCard } from '../ui/GlassCard';
import { CATALOG_OBJECTS } from '../../vendor/twenty-adapter/metadata';
import { defaultWidget, objectDef, type FilterRow, type WidgetSpec } from './model';
import { RecordListWidget } from './RecordListWidget';

const OPERAND_BY_URL: Record<string, ViewFilterOperand> = {
  [ViewFilterOperandDeprecated.Is]: ViewFilterOperand.IS,
  [ViewFilterOperandDeprecated.IsNot]: ViewFilterOperand.IS_NOT,
  [ViewFilterOperandDeprecated.IsNotNull]: ViewFilterOperand.IS_NOT_NULL,
  [ViewFilterOperandDeprecated.LessThanOrEqual]: ViewFilterOperand.LESS_THAN_OR_EQUAL,
  [ViewFilterOperandDeprecated.GreaterThanOrEqual]: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
  [ViewFilterOperandDeprecated.IsBefore]: ViewFilterOperand.IS_BEFORE,
  [ViewFilterOperandDeprecated.IsAfter]: ViewFilterOperand.IS_AFTER,
  [ViewFilterOperandDeprecated.Contains]: ViewFilterOperand.CONTAINS,
  [ViewFilterOperandDeprecated.DoesNotContain]: ViewFilterOperand.DOES_NOT_CONTAIN,
  [ViewFilterOperandDeprecated.IsEmpty]: ViewFilterOperand.IS_EMPTY,
};

/** Parses Twenty's drill-down URL: filter[field][operand]=value (what chart clicks navigate to). */
export const parseDrilldownFilters = (search: string): { rows: FilterRow[]; unsupported: boolean } => {
  const parsed = qs.parse(search.replace(/^\?/, '')) as { filter?: Record<string, Record<string, string>>; filterGroup?: unknown };
  const rows: FilterRow[] = [];
  for (const [field, ops] of Object.entries(parsed.filter ?? {})) {
    for (const [op, value] of Object.entries(ops ?? {})) {
      const operand = OPERAND_BY_URL[op] ?? (Object.values(ViewFilterOperand).includes(op as ViewFilterOperand) ? (op as ViewFilterOperand) : undefined);
      if (operand) rows.push({ field, operand, value: String(value ?? '') });
    }
  }
  return { rows, unsupported: parsed.filterGroup !== undefined };
};

export const RecordsPage = () => {
  const { objectNamePlural } = useParams<{ objectNamePlural: string }>();
  const [params] = useSearchParams();
  const def = CATALOG_OBJECTS.find(o => o.namePlural === objectNamePlural);
  const { rows, unsupported } = useMemo(() => parseDrilldownFilters(params.toString().replace(/%5B/g, '[').replace(/%5D/g, ']')), [params]);

  const spec: WidgetSpec | null = useMemo(() => {
    if (!def) return null;
    const w = defaultWidget('recordList', def.nameSingular);
    const valid = rows.filter(r => objectDef(def.nameSingular).fields.some(f => f.name === r.field));
    return { ...w, options: { ...w.options, filters: valid, limit: 100, columns: objectDef(def.nameSingular).fields.filter(f => f.name !== 'id').slice(0, 7).map(f => f.name) } };
  }, [def, rows]);

  if (!def || !spec) {
    return <PageWrapper title="Records" description="Unknown object"><p>Nothing here. <Link className="underline" to="/">Back</Link></p></PageWrapper>;
  }
  return (
    <PageWrapper title={def.labelPlural} description={rows.length ? 'Filtered from a dashboard widget' : 'All records'}>
      {unsupported && <p className="mb-2 text-xs text-amber-600">Grouped filters from the widget are not shown here.</p>}
      {!!spec.options.filters.length && (
        <div className="flex flex-wrap gap-2 mb-3" aria-label="Active filters">
          {spec.options.filters.map((f, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-xs">{objectDef(def.nameSingular).fields.find(x => x.name === f.field)?.label}: {f.operand.toLowerCase().replace(/_/g, ' ')} {f.value.replace(/[[\]"]/g, '')}</span>
          ))}
        </div>
      )}
      <GlassCard className="h-[70vh]"><RecordListWidget spec={spec} /></GlassCard>
    </PageWrapper>
  );
};
