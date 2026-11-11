import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactGridLayout, { useContainerWidth, verticalCompactor } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import {
  BarChart3, LineChart, PieChart, Hash, Table2, Globe, Sparkles, Plus, Save, Pencil, Eye, Trash2, Users, User, X, Copy, ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../layout/PageWrapper';
import { GlassCard } from '../ui/GlassCard';
import { ModernButton } from '../ui/ModernButton';
import { AIAnalysisSection } from '../ai/AIAnalysisSection';
import { useTheme } from '../../contexts/ThemeContext';
import { TwentyWidgetHost, createTwentyStore } from '../../vendor/twenty-adapter/TwentyWidgetHost';
import { createDashboardApolloClient } from '../../vendor/twenty-adapter/apolloLink';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import '../../vendor/twenty-adapter/twenty-theme';
import './theme-bridge.css';
import {
  defaultWidget, newId, objectDef, toTwentyWidget, type ContextRecord, type DashboardLayout, type WidgetKind, type WidgetSpec,
} from './model';
import {
  createDashboard, deleteDashboard, listDashboards, loadAllowlist, saveAllowlist, saveDashboard, type SavedDashboard, type Scope,
} from './persistence';
import { recordLabel, searchRecords, type RecordRow } from './records';
import { RecordListWidget } from './RecordListWidget';
import { WidgetConfigPanel } from './WidgetConfigPanel';
import { WidgetErrorBoundary } from './WidgetErrorBoundary';
import { CATALOG_OBJECTS, type CatalogObjectName } from '../../vendor/twenty-adapter/metadata';
import { cn } from '../../lib/utils';

const KINDS: Array<{ kind: WidgetKind; label: string; icon: React.ComponentType<{ className?: string }>; hint: string }> = [
  { kind: 'bar', label: 'Bar chart', icon: BarChart3, hint: 'Compare groups' },
  { kind: 'line', label: 'Line chart', icon: LineChart, hint: 'Trend over time' },
  { kind: 'pie', label: 'Pie chart', icon: PieChart, hint: 'Distribution' },
  { kind: 'aggregate', label: 'Number', icon: Hash, hint: 'Count, sum, average…' },
  { kind: 'recordList', label: 'Record list', icon: Table2, hint: 'Underlying records' },
  { kind: 'iframe', label: 'Embedded page', icon: Globe, hint: 'Approved sites only' },
  { kind: 'aiInsights', label: 'AI insights', icon: Sparkles, hint: 'GPT analysis' },
];

const TWENTY_KINDS: WidgetKind[] = ['bar', 'line', 'pie', 'aggregate', 'iframe'];

const starterWidgets = (): WidgetSpec[] => {
  const a = defaultWidget('aggregate', 'contact'); a.title = 'Total contacts'; a.grid = { x: 0, y: 0, w: 3, h: 3 };
  const b = defaultWidget('aggregate', 'deal'); b.title = 'Pipeline value'; b.options = { ...b.options, operation: 'SUM', aggregateField: 'value' }; b.grid = { x: 3, y: 0, w: 3, h: 3 };
  const c = defaultWidget('pie', 'contact'); c.title = 'Contacts by status'; c.grid = { x: 6, y: 0, w: 6, h: 6 };
  const d = defaultWidget('line', 'contact'); d.title = 'New contacts per month'; d.grid = { x: 0, y: 3, w: 6, h: 5 };
  const e = defaultWidget('bar', 'deal'); e.title = 'Deal value by stage'; e.options = { ...e.options, operation: 'SUM', aggregateField: 'value' }; e.grid = { x: 6, y: 6, w: 6, h: 5 };
  const f = defaultWidget('recordList', 'contact'); f.title = 'Latest contacts'; f.grid = { x: 0, y: 8, w: 6, h: 6 };
  return [a, b, c, d, e, f];
};

const ContextPicker = ({ value, onChange }: { value: ContextRecord | null | undefined; onChange: (c: ContextRecord | null) => void }) => {
  const [object, setObject] = useState<CatalogObjectName>(value?.object ?? 'contact');
  const [text, setText] = useState('');
  const [results, setResults] = useState<RecordRow[]>([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    let live = true;
    searchRecords(object, text).then(r => live && setResults(r)).catch(() => live && setResults([]));
    return () => { live = false; };
  }, [open, object, text]);
  return (
    <div className="relative">
      <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        {value ? <>Context: <b>{value.label}</b></> : 'Record context'}
      </button>
      {value && <button aria-label="Clear context" className="ml-1 text-gray-400 hover:text-red-600" onClick={() => onChange(null)}><X className="w-4 h-4 inline" /></button>}
      {open && (
        <div className="absolute z-40 mt-1 w-72 p-2 rounded-xl bg-white dark:bg-gray-900 shadow-xl border border-gray-200 dark:border-gray-700 space-y-2">
          <select aria-label="Context object" className="w-full py-1 px-2 rounded border border-gray-200 dark:border-gray-700 bg-transparent text-sm" value={object} onChange={e => setObject(e.target.value as CatalogObjectName)}>
            {CATALOG_OBJECTS.map(o => <option key={o.nameSingular} value={o.nameSingular}>{o.labelSingular}</option>)}
          </select>
          <input aria-label="Search records" className="w-full py-1 px-2 rounded border border-gray-200 dark:border-gray-700 bg-transparent text-sm" placeholder="Search…" value={text} onChange={e => setText(e.target.value)} />
          <ul className="max-h-48 overflow-auto text-sm">
            {results.map(r => <li key={r.id}><button className="w-full text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => { onChange({ object, id: r.id, label: recordLabel(object, r) }); setOpen(false); }}>{recordLabel(object, r)}</button></li>)}
            {!results.length && <li className="px-2 py-1 text-gray-400">No matches</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

export const DashboardBuilder: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [scope, setScope] = useState<Scope>('user');
  const [dashboards, setDashboards] = useState<SavedDashboard[]>([]);
  const [current, setCurrent] = useState<SavedDashboard | null>(null);
  const [name, setName] = useState('');
  const [layout, setLayout] = useState<DashboardLayout>({ widgets: [] });
  const [editing, setEditing] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const [allowlist, setAllowlist] = useState<string[]>([]);
  const [showEmbeds, setShowEmbeds] = useState(false);
  const [embedText, setEmbedText] = useState('');
  const { width, containerRef, mounted } = useContainerWidth();
  const client = useMemo(() => createDashboardApolloClient(), []);
  const layoutId = current?.id ?? 'draft';
  const store = useMemo(() => createTwentyStore([], layoutId), [layoutId]);
  const flash = (m: string) => { setInfo(m); setTimeout(() => setInfo(null), 4000); };

  const guard = useCallback(async (fn: () => Promise<void>) => {
    setError(null);
    try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong'); }
  }, []);

  /* ----- load dashboards for the scope; create a starter one when empty ----- */
  const loadScope = useCallback(async (s: Scope) => {
    await guard(async () => {
      let list = await listDashboards(s);
      if (!list.length && s === 'user') list = [await createDashboard('My dashboard', 'user', { widgets: starterWidgets(), context: null })];
      setDashboards(list);
      const first = list[0] ?? null;
      setCurrent(first);
      setName(first?.name ?? '');
      setLayout(first?.layout ?? { widgets: [] });
      setDirty(false);
      setEditing(false);
    });
  }, [guard]);

  useEffect(() => { void loadScope(scope); }, [scope, loadScope]);
  useEffect(() => { loadAllowlist().then(setAllowlist).catch(() => undefined); }, []);

  /* ----- keep Twenty's page-layout state in sync (synchronously, before widgets render) ----- */
  useMemo(() => {
    const widgets = layout.widgets.filter(w => TWENTY_KINDS.includes(w.kind)).map(w => toTwentyWidget(w, layout.context));
    store.set(pageLayoutPersistedComponentState.atomFamily({ instanceId: layoutId }), {
      id: layoutId, name, type: 'DASHBOARD', tabs: [{ id: `${layoutId}-tab`, title: 'Main', position: 0, widgets }],
    } as never);
  }, [layout, layoutId, name, store]);

  const update = (next: DashboardLayout) => { setLayout(next); setDirty(true); };
  const updateWidget = (w: WidgetSpec) => update({ ...layout, widgets: layout.widgets.map(x => (x.id === w.id ? w : x)) });
  const selected = layout.widgets.find(w => w.id === selectedId) ?? null;

  const addWidget = (kind: WidgetKind) => {
    const w = defaultWidget(kind, 'contact');
    update({ ...layout, widgets: [...layout.widgets, w] });
    setSelectedId(w.id); setShowGallery(false); setEditing(true);
  };

  const save = () => guard(async () => {
    if (!current) return;
    setSaving(true);
    try {
      const saved = await saveDashboard(current.id, { name, layout });
      setCurrent(saved); setDashboards(ds => ds.map(d => (d.id === saved.id ? saved : d))); setDirty(false); flash('Dashboard saved');
    } finally { setSaving(false); }
  });

  const create = () => guard(async () => {
    const n = window.prompt('Name the new dashboard', 'New dashboard');
    if (!n) return;
    const d = await createDashboard(n, scope, { widgets: [], context: null });
    setDashboards(ds => [d, ...ds]); setCurrent(d); setName(d.name); setLayout(d.layout); setDirty(false); setEditing(true);
  });

  const duplicateToScope = () => guard(async () => {
    const target: Scope = scope === 'user' ? 'team' : 'user';
    await createDashboard(`${name} (copy)`, target, layout);
    flash(`Copied to ${target === 'team' ? 'team' : 'my'} dashboards`);
  });

  const remove = () => guard(async () => {
    if (!current || !window.confirm(`Delete “${current.name}”?`)) return;
    await deleteDashboard(current.id);
    await loadScope(scope);
  });

  const switchTo = (id: string) => {
    if (dirty && !window.confirm('Discard unsaved changes?')) return;
    const d = dashboards.find(x => x.id === id);
    if (d) { setCurrent(d); setName(d.name); setLayout(d.layout); setDirty(false); setSelectedId(null); }
  };

  const saveEmbeds = () => guard(async () => {
    const hosts = embedText.split(/[\s,]+/).filter(Boolean);
    await saveAllowlist(hosts);
    setAllowlist(await loadAllowlist()); setShowEmbeds(false); flash('Approved embeds updated');
  });

  /* ----- grid ----- */
  const gridLayout = layout.widgets.map(w => ({ i: w.id, x: w.grid.x, y: w.grid.y, w: w.grid.w, h: w.grid.h, minW: 2, minH: 2 }));
  const onLayoutChange = (next: readonly { i: string; x: number; y: number; w: number; h: number }[]) => {
    if (!editing) return;
    const byId = new Map(next.map(n => [n.i, n]));
    const changed = layout.widgets.some(w => { const n = byId.get(w.id); return n && (n.x !== w.grid.x || n.y !== w.grid.y || n.w !== w.grid.w || n.h !== w.grid.h); });
    if (!changed) return;
    update({ ...layout, widgets: layout.widgets.map(w => { const n = byId.get(w.id); return n ? { ...w, grid: { x: n.x, y: n.y, w: n.w, h: n.h } } : w; }) });
  };

  const openRecord = (r: RecordRow, obj: CatalogObjectName) => navigate(`/objects/${objectDef(obj).namePlural}?filter[id][is]=${encodeURIComponent(`["${r.id}"]`)}`);

  const renderWidget = (w: WidgetSpec) => {
    if (w.kind === 'recordList') return <RecordListWidget spec={w} context={layout.context} onOpenRecord={r => openRecord(r, w.objectName)} />;
    if (w.kind === 'aiInsights') return <div className="p-2 overflow-auto h-full"><AIAnalysisSection appId={`dashboard-${w.id}`} analysisType="analytics" title="AI insights" description="Analysis of your contacts and deals" /></div>;
    if (w.kind === 'iframe') {
      const host = (() => { try { return new URL(w.options.url).hostname; } catch { return ''; } })();
      const ok = host && allowlist.some(h => host === h || host.endsWith(`.${h}`)) && w.options.url.startsWith('https://');
      if (!ok) return <p className="p-4 text-sm text-gray-500">{w.options.url ? 'This page is not on the approved embeds list.' : 'Choose a page to embed in the widget settings.'}</p>;
    }
    return (
      <div className={cn('twenty-bridge', isDark ? 'dark' : 'light')} data-testid={`widget-${w.kind}`}>
        <TwentyWidgetHost widget={toTwentyWidget(w, layout.context)} layoutId={layoutId} store={store} client={client} editing={editing} />
      </div>
    );
  };

  const btn = 'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50';

  return (
    <PageWrapper title="Dashboard Builder" description="Drag-and-drop dashboards with configurable charts on your live contacts and deals" onBack={onBack} appTheme="indigo">
      {error && <p role="alert" className="mb-3 text-sm text-red-600">{error}</p>}
      {info && <p role="status" className="mb-3 text-sm text-emerald-600">{info}</p>}

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="inline-flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700" role="tablist" aria-label="Dashboard scope">
          {(['user', 'team'] as const).map(s => (
            <button key={s} role="tab" aria-selected={scope === s} onClick={() => { if (!dirty || window.confirm('Discard unsaved changes?')) setScope(s); }}
              className={cn('px-3 py-1.5 text-sm inline-flex items-center gap-1', scope === s ? 'bg-indigo-600 text-white' : 'bg-white/70 dark:bg-gray-800')}>
              {s === 'user' ? <User className="w-4 h-4" /> : <Users className="w-4 h-4" />}{s === 'user' ? 'Mine' : 'Team'}
            </button>
          ))}
        </div>
        <select aria-label="Dashboard" className="py-1.5 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm" value={current?.id ?? ''} onChange={e => switchTo(e.target.value)}>
          {dashboards.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        {current && <input aria-label="Dashboard name" className="py-1.5 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm" value={name} onChange={e => { setName(e.target.value); setDirty(true); }} />}
        <button className={btn} onClick={create}><Plus className="w-4 h-4" />New</button>
        <button className={btn} disabled={!current} onClick={duplicateToScope}><Copy className="w-4 h-4" />Copy to {scope === 'user' ? 'team' : 'mine'}</button>
        <button className={btn} disabled={!current} onClick={remove}><Trash2 className="w-4 h-4" />Delete</button>
        <span className="flex-1" />
        <ContextPicker value={layout.context} onChange={c => update({ ...layout, context: c })} />
        <button className={btn} onClick={() => { setEmbedText(allowlist.join('\n')); setShowEmbeds(s => !s); }}><ShieldCheck className="w-4 h-4" />Approved embeds</button>
        <button className={btn} onClick={() => setShowGallery(s => !s)} disabled={!current}><Plus className="w-4 h-4" />Add widget</button>
        <button className={btn} onClick={() => { setEditing(e => !e); setSelectedId(null); }} disabled={!current} aria-pressed={editing}>
          {editing ? <><Eye className="w-4 h-4" />View</> : <><Pencil className="w-4 h-4" />Edit layout</>}
        </button>
        <ModernButton onClick={save} loading={saving} disabled={!dirty || !current}><Save className="w-4 h-4" />Save{dirty ? ' •' : ''}</ModernButton>
      </div>

      {showEmbeds && (
        <GlassCard className="p-4 mb-4">
          <p className="text-sm mb-2">One hostname per line. Only these sites can be embedded in an Embedded page widget (https only).</p>
          <textarea aria-label="Approved embed hosts" className="w-full h-24 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm" value={embedText} onChange={e => setEmbedText(e.target.value)} />
          <div className="mt-2 flex gap-2"><ModernButton size="sm" onClick={saveEmbeds}>Save</ModernButton><ModernButton size="sm" variant="ghost" onClick={() => setShowEmbeds(false)}>Cancel</ModernButton></div>
        </GlassCard>
      )}

      {showGallery && (
        <GlassCard className="p-4 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3" role="menu" aria-label="Widget gallery">
            {KINDS.map(k => (
              <button key={k.kind} role="menuitem" onClick={() => addWidget(k.kind)} className="text-left p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20">
                <k.icon className="w-5 h-5 text-indigo-600 mb-1" /><div className="font-medium text-sm">{k.label}</div><div className="text-xs text-gray-500">{k.hint}</div>
              </button>
            ))}
          </div>
        </GlassCard>
      )}

      {editing && <p className="mb-2 text-xs text-gray-500">Drag widgets by their header to move them, drag a corner to resize, click the gear to configure.</p>}
      {layout.context && <p className="mb-2 text-xs text-indigo-600">Widgets set to “filter by selected record” are showing data for {layout.context.label}.</p>}

      <div ref={containerRef as React.RefObject<HTMLDivElement>} data-testid="dashboard-grid">
        {mounted && (
          <ReactGridLayout
            width={width}
            layout={gridLayout}
            gridConfig={{ cols: 12, rowHeight: 56, margin: [16, 16], containerPadding: [0, 0] }}
            dragConfig={{ enabled: editing, handle: '.widget-drag-handle' }}
            resizeConfig={{ enabled: editing }}
            compactor={verticalCompactor}
            onLayoutChange={onLayoutChange}
          >
            {layout.widgets.map(w => (
              <div key={w.id} data-testid="widget" data-widget-id={w.id}>
                <GlassCard className={cn('h-full flex flex-col overflow-hidden', selectedId === w.id && 'ring-2 ring-indigo-500')}>
                  <div className={cn('flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-gray-800', editing && 'widget-drag-handle cursor-move')}>
                    <h3 className="flex-1 text-sm font-semibold truncate">{w.title}</h3>
                    {editing && (
                      <>
                        <button aria-label={`Configure ${w.title}`} className="text-gray-500 hover:text-indigo-600 text-xs px-1" onMouseDown={e => e.stopPropagation()} onClick={() => setSelectedId(w.id)}>⚙</button>
                        <button aria-label={`Remove ${w.title}`} className="text-gray-400 hover:text-red-600" onMouseDown={e => e.stopPropagation()} onClick={() => { update({ ...layout, widgets: layout.widgets.filter(x => x.id !== w.id) }); if (selectedId === w.id) setSelectedId(null); }}><X className="w-4 h-4" /></button>
                      </>
                    )}
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <WidgetErrorBoundary resetKey={JSON.stringify(w)}>{renderWidget(w)}</WidgetErrorBoundary>
                  </div>
                </GlassCard>
              </div>
            ))}
          </ReactGridLayout>
        )}
      </div>
      {!layout.widgets.length && current && <p className="text-center text-gray-500 py-12">No widgets yet. Use “Add widget” to start.</p>}

      {selected && (
        <WidgetConfigPanel
          spec={selected}
          allowlist={allowlist}
          onChange={updateWidget}
          onRemove={() => { update({ ...layout, widgets: layout.widgets.filter(x => x.id !== selected.id) }); setSelectedId(null); }}
          onClose={() => setSelectedId(null)}
        />
      )}
    </PageWrapper>
  );
};

// keep the unused helper reachable for tests that build widgets programmatically
export { newId };
