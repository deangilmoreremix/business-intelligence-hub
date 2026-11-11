import { useEffect, useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { gqlFilterFor, objectDef, type ContextRecord, type WidgetSpec } from './model';
import { countRecords, fetchRecords, type RecordRow } from './records';

const fmt = (v: unknown) => {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) return v.slice(0, 10);
  return String(v);
};

/** Underlying records of a widget (contacts / deals / companies) with the same filters the charts use. */
export const RecordListWidget = ({ spec, context, onOpenRecord }: { spec: WidgetSpec; context?: ContextRecord | null; onOpenRecord?: (r: RecordRow) => void }) => {
  const def = objectDef(spec.objectName);
  const filter = useMemo(() => gqlFilterFor(spec, context), [spec, context]);
  const filterKey = JSON.stringify(filter);
  const [rows, setRows] = useState<RecordRow[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const columns = spec.options.columns.length ? spec.options.columns : def.fields.slice(1, 5).map(f => f.name);

  useEffect(() => {
    let live = true;
    setLoading(true);
    Promise.all([fetchRecords(spec.objectName, filter, { limit: spec.options.limit }), countRecords(spec.objectName, filter)])
      .then(([r, c]) => { if (live) { setRows(r); setTotal(c); setError(null); } })
      .catch(e => live && setError(e instanceof Error ? e.message : 'Failed to load records'))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- filterKey is the serialised filter
  }, [spec.objectName, filterKey, spec.options.limit]);

  if (error) return <p className="p-3 text-sm text-red-600" role="alert">{error}</p>;
  return (
    <div className="h-full flex flex-col text-sm">
      <div className="overflow-auto flex-1">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/80 text-left">
            <tr>{columns.map(c => <th key={c} className="px-3 py-2 font-medium">{def.fields.find(f => f.name === c)?.label ?? c}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} data-testid="record-row" className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer" onClick={() => onOpenRecord?.(r)}>
                {columns.map(c => <td key={c} className="px-3 py-1.5">{fmt(r[c])}</td>)}
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={columns.length} className="px-3 py-6 text-center text-gray-500">{loading ? 'Loading…' : 'No records'}</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
        <span>{rows.length} of {total}</span>
        <Link className="inline-flex items-center gap-1 hover:underline" to={`/objects/${def.namePlural}`}>Open all <ExternalLink className="w-3 h-3" /></Link>
      </div>
    </div>
  );
};
