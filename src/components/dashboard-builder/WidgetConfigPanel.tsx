import { useEffect, useState } from 'react';
import { Trash2, X, Plus, Bookmark } from 'lucide-react';
import { ViewFilterOperand } from 'twenty-shared/types';
import type { CatalogObjectName } from '../../vendor/twenty-adapter/metadata';
import {
  OPERANDS_BY_TYPE, defaultWidget, objectDef, operandNeedsValue, isDate, isNumeric,
  type FilterRow, type WidgetOptions, type WidgetSpec,
} from './model';
import { deleteSavedFilter, listSavedFilters, saveFilter, type SavedFilter } from './persistence';
import { CATALOG_OBJECTS } from '../../vendor/twenty-adapter/metadata';
import type { FieldMetadataType } from 'twenty-shared/types';

const input = 'w-full py-1.5 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm';
const label = 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1';
const GRANULARITY = ['NONE', 'DAY', 'WEEK', 'MONTH', 'QUARTER', 'YEAR'];
const OPERATIONS_NUMERIC = ['COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COUNT_EMPTY', 'COUNT_NOT_EMPTY', 'COUNT_UNIQUE_VALUES', 'PERCENTAGE_EMPTY', 'PERCENTAGE_NOT_EMPTY'];
const OPERATIONS_OTHER = ['COUNT', 'COUNT_EMPTY', 'COUNT_NOT_EMPTY', 'COUNT_UNIQUE_VALUES', 'PERCENTAGE_EMPTY', 'PERCENTAGE_NOT_EMPTY'];
const ORDER = [['FIELD_ASC', 'Label A→Z'], ['FIELD_DESC', 'Label Z→A'], ['VALUE_DESC', 'Value high→low'], ['VALUE_ASC', 'Value low→high'], ['FIELD_POSITION_ASC', 'Option order']];
const pretty = (s: string) => s.toLowerCase().replace(/_/g, ' ').replace(/^./, c => c.toUpperCase());

const Check = ({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) => (
  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />{children}</label>
);

const FilterEditor = ({ object, rows, onChange }: { object: CatalogObjectName; rows: FilterRow[]; onChange: (r: FilterRow[]) => void }) => {
  const def = objectDef(object);
  const filterable = def.fields.filter(f => OPERANDS_BY_TYPE[f.type as string] && f.name !== 'id');
  const [saved, setSaved] = useState<SavedFilter[]>([]);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => { listSavedFilters(object).then(setSaved).catch(() => setSaved([])); }, [object]);

  const update = (i: number, patch: Partial<FilterRow>) => onChange(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const fieldOf = (name: string) => def.fields.find(f => f.name === name);

  return (
    <div className="space-y-2">
      {rows.map((r, i) => {
        const f = fieldOf(r.field);
        const operands = OPERANDS_BY_TYPE[f?.type as string] ?? [];
        return (
          <div key={i} className="space-y-1 p-2 rounded-lg border border-gray-200 dark:border-gray-700" data-testid="filter-row">
            <div className="flex gap-1">
              <select aria-label="Filter field" className={input} value={r.field} onChange={e => { const nf = fieldOf(e.target.value)!; update(i, { field: nf.name, operand: OPERANDS_BY_TYPE[nf.type as string][0], value: '' }); }}>
                {filterable.map(x => <option key={x.name} value={x.name}>{x.label}</option>)}
              </select>
              <button aria-label="Remove filter" className="px-2 text-gray-400 hover:text-red-600" onClick={() => onChange(rows.filter((_, j) => j !== i))}><X className="w-4 h-4" /></button>
            </div>
            <select aria-label="Filter operand" className={input} value={r.operand} onChange={e => update(i, { operand: e.target.value as ViewFilterOperand })}>
              {operands.map(o => <option key={o} value={o}>{pretty(o)}</option>)}
            </select>
            {operandNeedsValue(r.operand) && (f?.options ? (
              <div className="flex flex-wrap gap-2" aria-label="Filter values">
                {f.options.map(o => {
                  const cur: string[] = (() => { try { return JSON.parse(r.value || '[]'); } catch { return []; } })();
                  return <Check key={o.value} checked={cur.includes(o.value)} onChange={on => update(i, { value: JSON.stringify(on ? [...cur, o.value] : cur.filter(x => x !== o.value)) })}>{o.label}</Check>;
                })}
              </div>
            ) : isDate(f?.type as FieldMetadataType) ? (
              <input aria-label="Filter value" type="date" className={input} value={r.value ? r.value.slice(0, 10) : ''} onChange={e => update(i, { value: e.target.value ? `${e.target.value}T00:00:00.000Z` : '' })} />
            ) : (
              <input aria-label="Filter value" className={input} type={isNumeric(f?.type as FieldMetadataType) ? 'number' : 'text'} value={r.value} onChange={e => update(i, { value: e.target.value })} />
            ))}
          </div>
        );
      })}
      <button className="inline-flex items-center gap-1 text-sm text-indigo-600" onClick={() => onChange([...rows, { field: filterable[0].name, operand: OPERANDS_BY_TYPE[filterable[0].type as string][0], value: '' }])}><Plus className="w-4 h-4" />Add filter</button>

      <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1">
        <span className={label}>Saved filters</span>
        <div className="flex flex-wrap gap-1">
          {saved.map(s => (
            <span key={s.id} className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 text-xs overflow-hidden">
              <button className="px-2 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => onChange(s.filter as FilterRow[])}>{s.name}{s.scope === 'team' ? ' (team)' : ''}</button>
              <button aria-label={`Delete saved filter ${s.name}`} className="px-1 text-gray-400 hover:text-red-600" onClick={() => deleteSavedFilter(s.id).then(() => setSaved(saved.filter(x => x.id !== s.id))).catch(e => setErr(e.message))}>×</button>
            </span>
          ))}
          {!saved.length && <span className="text-xs text-gray-400">None yet</span>}
        </div>
        {!!rows.length && (
          <div className="flex gap-2 text-xs">
            {(['user', 'team'] as const).map(scope => (
              <button key={scope} className="inline-flex items-center gap-1 text-indigo-600" onClick={() => {
                const name = window.prompt('Name this filter');
                if (!name) return;
                saveFilter(name, object, rows, scope).then(s => setSaved([s, ...saved])).catch(e => setErr(e.message));
              }}><Bookmark className="w-3 h-3" />Save for {scope === 'user' ? 'me' : 'team'}</button>
            ))}
          </div>
        )}
        {err && <p className="text-xs text-red-600">{err}</p>}
      </div>
    </div>
  );
};

type Props = {
  spec: WidgetSpec;
  allowlist: string[];
  onChange: (spec: WidgetSpec) => void;
  onRemove: () => void;
  onClose: () => void;
};

export const WidgetConfigPanel = ({ spec, allowlist, onChange, onRemove, onClose }: Props) => {
  const o = spec.options;
  const def = objectDef(spec.objectName);
  const set = (patch: Partial<WidgetOptions>) => onChange({ ...spec, options: { ...o, ...patch } });
  const isChart = spec.kind === 'bar' || spec.kind === 'line' || spec.kind === 'pie';
  const numeric = def.fields.filter(f => isNumeric(f.type as FieldMetadataType));
  const groupable = def.fields.filter(f => f.name !== 'id' && (f.options || isDate(f.type as FieldMetadataType) || f.type === 'TEXT'));
  const fieldDef = (n: string | null) => def.fields.find(f => f.name === n);
  const groupIsDate = (n: string | null) => !!fieldDef(n) && isDate(fieldDef(n)!.type as FieldMetadataType);
  const operations = numeric.length ? OPERATIONS_NUMERIC : OPERATIONS_OTHER;

  let urlError: string | null = null;
  if (spec.kind === 'iframe' && o.url) {
    try {
      const u = new URL(o.url);
      if (u.protocol !== 'https:') urlError = 'Only https:// pages can be embedded';
      else if (!allowlist.length || !allowlist.some(h => u.hostname === h || u.hostname.endsWith(`.${h}`))) urlError = 'This site is not in the approved embeds list';
    } catch { urlError = 'Enter a valid URL'; }
  }

  return (
    <aside className="fixed right-0 top-0 h-full w-full max-w-sm bg-white dark:bg-gray-900 shadow-2xl p-4 overflow-y-auto z-50 space-y-4" aria-label="Widget settings">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Widget settings</h2>
        <button aria-label="Close settings" onClick={onClose}><X className="w-5 h-5" /></button>
      </div>

      <div><span className={label}>Title</span><input aria-label="Title" className={input} value={spec.title} onChange={e => onChange({ ...spec, title: e.target.value })} /></div>

      {spec.kind !== 'iframe' && spec.kind !== 'aiInsights' && (
        <div>
          <span className={label}>Data</span>
          <select aria-label="Object" className={input} value={spec.objectName} onChange={e => {
            const fresh = defaultWidget(spec.kind, e.target.value as CatalogObjectName);
            onChange({ ...spec, objectName: fresh.objectName, options: { ...fresh.options, useContext: o.useContext, limit: o.limit } });
          }}>
            {CATALOG_OBJECTS.map(c => <option key={c.nameSingular} value={c.nameSingular}>{c.labelPlural}</option>)}
          </select>
        </div>
      )}

      {(isChart || spec.kind === 'aggregate') && (
        <div className="space-y-2">
          <div><span className={label}>Metric</span>
            <select aria-label="Metric" className={input} value={o.operation} onChange={e => set({ operation: e.target.value, aggregateField: e.target.value === 'COUNT' ? null : (o.aggregateField ?? (['SUM', 'AVG', 'MIN', 'MAX'].includes(e.target.value) ? numeric[0]?.name ?? null : def.fields[1].name)) })}>
              {operations.map(op => <option key={op} value={op}>{pretty(op)}</option>)}
            </select>
          </div>
          {o.operation !== 'COUNT' && (
            <div><span className={label}>Of field</span>
              <select aria-label="Metric field" className={input} value={o.aggregateField ?? ''} onChange={e => set({ aggregateField: e.target.value })}>
                {(['SUM', 'AVG', 'MIN', 'MAX'].includes(o.operation) ? numeric : def.fields.filter(f => f.name !== 'id')).map(f => <option key={f.name} value={f.name}>{f.label}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      {isChart && (
        <div className="space-y-2">
          <div><span className={label}>{spec.kind === 'pie' ? 'Slice by' : 'Group by (X axis)'}</span>
            <select aria-label="Group by" className={input} value={o.groupBy ?? ''} onChange={e => set({ groupBy: e.target.value, granularity: groupIsDate(e.target.value) ? 'MONTH' : null })}>
              {groupable.map(f => <option key={f.name} value={f.name}>{f.label}</option>)}
            </select>
          </div>
          {groupIsDate(o.groupBy) && (
            <div><span className={label}>Date granularity</span>
              <select aria-label="Granularity" className={input} value={o.granularity ?? 'MONTH'} onChange={e => set({ granularity: e.target.value })}>{GRANULARITY.map(g => <option key={g} value={g}>{pretty(g)}</option>)}</select>
            </div>
          )}
          {spec.kind !== 'pie' && (
            <div><span className={label}>Then group by (optional)</span>
              <select aria-label="Second group by" className={input} value={o.groupBy2 ?? ''} onChange={e => set({ groupBy2: e.target.value || null, granularity2: groupIsDate(e.target.value) ? 'MONTH' : null })}>
                <option value="">— none —</option>{groupable.filter(f => f.name !== o.groupBy).map(f => <option key={f.name} value={f.name}>{f.label}</option>)}
              </select>
            </div>
          )}
          <div><span className={label}>Sort</span>
            <select aria-label="Sort" className={input} value={o.orderBy} onChange={e => set({ orderBy: e.target.value })}>{ORDER.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
          </div>
          {spec.kind === 'bar' && (
            <div className="grid grid-cols-2 gap-2">
              <div><span className={label}>Direction</span><select aria-label="Direction" className={input} value={o.layout} onChange={e => set({ layout: e.target.value as WidgetOptions['layout'] })}><option value="VERTICAL">Vertical</option><option value="HORIZONTAL">Horizontal</option></select></div>
              <div><span className={label}>Series</span><select aria-label="Series mode" className={input} value={o.groupMode} onChange={e => set({ groupMode: e.target.value as WidgetOptions['groupMode'] })}><option value="STACKED">Stacked</option><option value="GROUPED">Grouped</option></select></div>
            </div>
          )}
          <div className="space-y-1">
            <Check checked={o.omitNull} onChange={v => set({ omitNull: v })}>Hide empty group</Check>
            {spec.kind !== 'pie' && <Check checked={o.cumulative} onChange={v => set({ cumulative: v })}>Cumulative</Check>}
            <Check checked={o.legend} onChange={v => set({ legend: v })}>Show legend</Check>
            <Check checked={o.dataLabels} onChange={v => set({ dataLabels: v })}>Show data labels</Check>
          </div>
        </div>
      )}

      {spec.kind === 'recordList' && (
        <div className="space-y-2">
          <div><span className={label}>Columns</span>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {def.fields.filter(f => f.name !== 'id').map(f => <Check key={f.name} checked={o.columns.includes(f.name)} onChange={v => set({ columns: v ? [...o.columns, f.name] : o.columns.filter(c => c !== f.name) })}>{f.label}</Check>)}
            </div>
          </div>
          <div><span className={label}>Rows</span><input aria-label="Rows" type="number" min={1} max={100} className={input} value={o.limit} onChange={e => set({ limit: Math.min(100, Math.max(1, Number(e.target.value) || 10)) })} /></div>
        </div>
      )}

      {spec.kind === 'iframe' && (
        <div>
          <span className={label}>Page URL (https, approved sites only)</span>
          <input aria-label="URL" className={input} value={o.url} placeholder="https://…" onChange={e => set({ url: e.target.value })} />
          {urlError && <p role="alert" className="mt-1 text-xs text-red-600">{urlError}</p>}
          <p className="mt-1 text-xs text-gray-400">Approved: {allowlist.length ? allowlist.join(', ') : 'none yet (add sites under “Approved embeds”)'}</p>
        </div>
      )}

      {spec.kind !== 'iframe' && spec.kind !== 'aiInsights' && (
        <>
          <div><span className={label}>Filters</span><FilterEditor object={spec.objectName} rows={o.filters} onChange={filters => set({ filters })} /></div>
          <Check checked={o.useContext} onChange={v => set({ useContext: v })}>Filter by the dashboard’s selected record</Check>
        </>
      )}

      <button className="inline-flex items-center gap-1 text-sm text-red-600" onClick={onRemove}><Trash2 className="w-4 h-4" />Remove widget</button>
    </aside>
  );
};
