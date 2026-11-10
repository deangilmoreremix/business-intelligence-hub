import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Plus, Download, Upload, Sparkles, Mail, Trash2, X, Copy, ImageIcon, Globe } from 'lucide-react';
import { PageWrapper } from '../layout/PageWrapper';
import { useContactStore, type Contact } from '../../store/contactStore';
import { supabase } from '../../lib/supabase';
import {
  scoreContact, draftEmail, enrichContact, applyEnrichment, type EnrichmentResult, findDuplicates, askAboutContacts, generateContactAvatar,
  type LeadScore, type DuplicateGroup,
} from '../../services/contactAIService';

type SortKey = 'name' | 'company' | 'crmStatus' | 'createdAt';
const STATUSES = ['all', 'lead', 'prospect', 'customer', 'inactive'] as const;

const toCSV = (rows: Contact[]) =>
  ['first_name,last_name,email,phone,company,status']
    .concat(rows.map(c => [c.firstName, c.lastName, c.email, c.phone, c.company, c.crmStatus]
      .map(v => `"${(v ?? '').toString().replace(/"/g, '""')}"`).join(',')))
    .join('\n');

const parseCSV = (text: string) =>
  text.split(/\r?\n/).slice(1).filter(Boolean).map(line => {
    const cells = (line.match(/("([^"]|"")*"|[^,]*)(,|$)/g) ?? []).map(c => c.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"'));
    return { firstName: cells[0] || '', lastName: cells[1], email: cells[2], phone: cells[3], company: cells[4], crmStatus: (cells[5] || 'lead') as Contact['crmStatus'] };
  }).filter(r => r.firstName);

export const ContactsHub: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { contacts, isLoading, error, loadContactsFromSupabase, createContact, deleteContact } = useContactStore();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<(typeof STATUSES)[number]>('all');
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'createdAt', dir: -1 });
  const [selected, setSelected] = useState<Contact | null>(null);
  const [notes, setNotes] = useState<{ id: string; body: string; created_at: string }[]>([]);
  const [noteText, setNoteText] = useState('');
  const [score, setScore] = useState<LeadScore | null>(null);
  const [email, setEmail] = useState<{ subject: string; body: string } | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [enrich, setEnrich] = useState<EnrichmentResult | null>(null);
  const [accept, setAccept] = useState<Set<keyof EnrichmentResult>>(new Set());
  const [dupes, setDupes] = useState<DuplicateGroup[] | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState({ firstName: '', lastName: '', email: '', company: '' });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadContactsFromSupabase(); }, [loadContactsFromSupabase]);

  const rows = useMemo(() => {
    const q = query.toLowerCase();
    return Object.values(contacts)
      .filter(c => (status === 'all' || c.crmStatus === status) &&
        (!q || [c.name, c.email, c.company, c.phone].some(v => v?.toLowerCase().includes(q))))
      .sort((a, b) => ((a[sort.key] ?? '') > (b[sort.key] ?? '') ? 1 : -1) * sort.dir);
  }, [contacts, query, status, sort]);

  const run = async <T,>(label: string, fn: () => Promise<T>, set: (v: T) => void) => {
    setBusy(label); setAiError(null);
    try { set(await fn()); } catch (e: any) { setAiError(e?.message || 'AI request failed'); } finally { setBusy(null); }
  };

  const open = async (c: Contact) => {
    setSelected(c); setEnrich(null); setScore(null); setEmail(null); setAvatar(null);
    const { data } = await supabase.from('contact_notes').select('*').eq('contact_id', c.id).order('created_at', { ascending: false });
    setNotes(data ?? []);
  };

  const addNote = async () => {
    if (!selected || !noteText.trim()) return;
    const { data } = await supabase.from('contact_notes').insert({ contact_id: selected.id, body: noteText.trim() }).select().single();
    if (data) setNotes([data, ...notes]);
    setNoteText('');
  };

  const persistScore = async (s: LeadScore) => {
    setScore(s);
    if (selected) await supabase.from('contacts').update({ lead_score: s.score, ai_summary: s.summary, ai_next_action: s.nextAction }).eq('id', selected.id);
  };

  const ENRICH_FIELDS: Array<[keyof EnrichmentResult, string]> = [
    ['jobTitle', 'Job title'], ['company', 'Company'], ['city', 'City'], ['linkedinUrl', 'LinkedIn'],
    ['twitterUrl', 'X / Twitter'], ['website', 'Website'], ['bio', 'Bio'],
  ];

  const showEnrichment = (r: EnrichmentResult) => {
    setEnrich(r);
    setAccept(new Set(ENRICH_FIELDS.map(([k]) => k).filter(k => (r[k] as string)?.trim() && r.confidence !== 'low')));
  };

  const saveEnrichment = async () => {
    if (!selected || !enrich) return;
    setBusy('apply'); setAiError(null);
    try {
      await applyEnrichment(selected.id, enrich, [...accept]);
      await loadContactsFromSupabase();
      setEnrich(null);
    } catch (e: any) { setAiError(e?.message || 'Failed to save'); } finally { setBusy(null); }
  };

  const onImport = async (f?: File) => {
    if (!f) return;
    for (const r of parseCSV(await f.text())) await createContact(r);
  };

  const th = (label: string, key: SortKey) => (
    <th className="px-3 py-2 text-left cursor-pointer select-none" onClick={() => setSort(s => ({ key, dir: s.key === key ? (-s.dir as 1 | -1) : 1 }))}>
      {label}{sort.key === key ? (sort.dir === 1 ? ' ▲' : ' ▼') : ''}
    </th>
  );
  const btn = 'inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-white/70 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 disabled:opacity-50';

  return (
    <PageWrapper title="Advanced Contacts" description="Search, score and engage contacts with AI (OpenAI Responses API)" onBack={onBack} appTheme="indigo">
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search contacts…" className="pl-8 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value as any)} className="py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm">
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className={btn} onClick={() => setShowNew(v => !v)}><Plus className="w-4 h-4" />New</button>
        <button className={btn} onClick={() => fileRef.current?.click()}><Upload className="w-4 h-4" />Import CSV</button>
        <input ref={fileRef} type="file" accept=".csv" hidden onChange={e => onImport(e.target.files?.[0])} />
        <button className={btn} onClick={() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([toCSV(rows)], { type: 'text/csv' })); a.download = 'contacts.csv'; a.click(); }}><Download className="w-4 h-4" />Export</button>
        <button className={btn} disabled={busy === 'dupes'} onClick={() => run('dupes', () => findDuplicates(Object.values(contacts)), setDupes)}><Copy className="w-4 h-4" />Find duplicates</button>
      </div>

      {showNew && (
        <form className="flex flex-wrap gap-2 mb-4" onSubmit={async e => { e.preventDefault(); await createContact(draft); setDraft({ firstName: '', lastName: '', email: '', company: '' }); setShowNew(false); }}>
          {(['firstName', 'lastName', 'email', 'company'] as const).map(k => (
            <input key={k} required={k === 'firstName'} placeholder={k} value={draft[k]} onChange={e => setDraft({ ...draft, [k]: e.target.value })} className="py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm" />
          ))}
          <button className={btn} type="submit">Save</button>
        </form>
      )}

      <div className="flex gap-2 mb-4">
        <input value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask AI about your contacts (e.g. which leads have no email?)" className="flex-1 py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm" />
        <button className={btn} disabled={!question || busy === 'ask'} onClick={() => run('ask', () => askAboutContacts(question, rows), setAnswer)}><Sparkles className="w-4 h-4" />Ask</button>
      </div>
      {answer && <p className="mb-4 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-sm whitespace-pre-wrap">{answer}</p>}
      {(aiError || error) && <p className="mb-4 text-sm text-red-600">{aiError || error}</p>}
      {dupes && <p className="mb-4 text-sm">{dupes.length ? dupes.map(d => `${d.reason}: ${d.ids.map(i => contacts[i]?.name).join(', ')}`).join(' · ') : 'No duplicates found.'}</p>}

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/50"><tr>{th('Name', 'name')}<th className="px-3 py-2 text-left">Email</th>{th('Company', 'company')}{th('Status', 'crmStatus')}{th('Created', 'createdAt')}</tr></thead>
          <tbody>
            {rows.map(c => (
              <tr key={c.id} onClick={() => open(c)} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 cursor-pointer">
                <td className="px-3 py-2">{c.name}</td><td className="px-3 py-2">{c.email}</td><td className="px-3 py-2">{c.company}</td>
                <td className="px-3 py-2">{c.crmStatus}</td><td className="px-3 py-2">{c.createdAt?.slice(0, 10)}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={5} className="px-3 py-8 text-center text-gray-500">{isLoading ? 'Loading…' : 'No contacts'}</td></tr>}
          </tbody>
        </table>
      </div>

      {selected && (
        <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl p-5 overflow-y-auto z-50">
          <button className="absolute right-4 top-4" onClick={() => setSelected(null)} aria-label="Close"><X className="w-5 h-5" /></button>
          {avatar && <img src={avatar} alt="" className="w-20 h-20 rounded-full mb-3" />}
          <h2 className="text-xl font-semibold">{selected.name}</h2>
          <p className="text-sm text-gray-500">{selected.email} · {selected.company}</p>
          <div className="flex flex-wrap gap-2 my-4">
            <button className={btn} disabled={busy === 'score'} onClick={() => run('score', () => scoreContact(selected, notes.map(n => n.body)), persistScore)}><Sparkles className="w-4 h-4" />{busy === 'score' ? 'Scoring…' : 'AI score'}</button>
            <button className={btn} disabled={busy === 'enrich'} onClick={() => run('enrich', () => enrichContact(selected), showEnrichment)}><Globe className="w-4 h-4" />{busy === 'enrich' ? 'Searching web…' : 'Enrich from web'}</button>
            <button className={btn} disabled={busy === 'email'} onClick={() => run('email', () => draftEmail(selected, 'Follow up and book a call'), setEmail)}><Mail className="w-4 h-4" />Draft email</button>
            <button className={btn} disabled={busy === 'avatar'} onClick={() => run('avatar', () => generateContactAvatar(selected), setAvatar)}><ImageIcon className="w-4 h-4" />Avatar</button>
            <button className={btn} onClick={async () => { await deleteContact(selected.id); setSelected(null); }}><Trash2 className="w-4 h-4" />Delete</button>
          </div>
          {enrich && (
            <div className="p-3 mb-3 rounded-lg border border-emerald-300 dark:border-emerald-700 text-sm">
              <b>{enrich.found ? `Public info found (${enrich.confidence} confidence)` : 'No reliable public match found'}</b>
              {enrich.found && ENRICH_FIELDS.filter(([k]) => (enrich[k] as string)?.trim()).map(([k, label]) => (
                <label key={k} className="flex gap-2 mt-1 items-start">
                  <input type="checkbox" checked={accept.has(k)} onChange={e => { const n = new Set(accept); e.target.checked ? n.add(k) : n.delete(k); setAccept(n); }} />
                  <span><b>{label}:</b> {enrich[k] as string}</span>
                </label>
              ))}
              {enrich.notes && <p className="mt-2 text-gray-500">{enrich.notes}</p>}
              {!!enrich.sources.length && <details className="mt-2"><summary className="cursor-pointer">Sources ({enrich.sources.length})</summary><ul className="list-disc pl-5 break-all">{enrich.sources.map(u => <li key={u}><a className="underline" href={u} target="_blank" rel="noreferrer noopener">{u}</a></li>)}</ul></details>}
              <div className="flex gap-2 mt-3">
                {enrich.found && <button className={btn} disabled={!accept.size || busy === 'apply'} onClick={saveEnrichment}>Save selected</button>}
                <button className={btn} onClick={() => setEnrich(null)}>Dismiss</button>
              </div>
            </div>
          )}
          {(selected.jobTitle || selected.linkedinUrl || selected.website || selected.bio) && (
            <div className="text-sm mb-3 space-y-0.5">
              {selected.jobTitle && <p>{selected.jobTitle}{selected.city ? ` · ${selected.city}` : ''}</p>}
              {selected.bio && <p className="text-gray-500">{selected.bio}</p>}
              {[selected.linkedinUrl, selected.twitterUrl, selected.website].filter(Boolean).map(u => <a key={u} className="block underline break-all" href={u} target="_blank" rel="noreferrer noopener">{u}</a>)}
              {selected.enrichedAt && <p className="text-xs text-gray-400">Enriched {selected.enrichedAt.slice(0, 10)}</p>}
            </div>
          )}
          {score && <div className="p-3 mb-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-sm"><b>{score.score}/100 ({score.tier})</b><p>{score.summary}</p><ul className="list-disc pl-5">{score.reasons.map((r, i) => <li key={i}>{r}</li>)}</ul><p className="mt-1"><b>Next:</b> {score.nextAction}</p></div>}
          {email && <div className="p-3 mb-3 rounded-lg border border-gray-200 dark:border-gray-700 text-sm"><b>{email.subject}</b><p className="whitespace-pre-wrap mt-1">{email.body}</p></div>}
          <h3 className="font-medium mt-4 mb-2">Notes</h3>
          <div className="flex gap-2 mb-2"><input value={noteText} onChange={e => setNoteText(e.target.value)} className="flex-1 py-1.5 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm" placeholder="Add a note" /><button className={btn} onClick={addNote}>Add</button></div>
          <ul className="space-y-2 text-sm">{notes.map(n => <li key={n.id} className="p-2 rounded bg-gray-50 dark:bg-gray-800">{n.body}<div className="text-xs text-gray-400">{n.created_at.slice(0, 16).replace('T', ' ')}</div></li>)}</ul>
        </aside>
      )}
    </PageWrapper>
  );
};
