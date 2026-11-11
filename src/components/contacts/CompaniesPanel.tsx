import React, { useCallback, useEffect, useState } from 'react';
import { Building2, Plus } from 'lucide-react';
import { createCompany, listCompanies, type Company } from '../../services/contactService';
import { supabase } from '../../lib/supabase';
import { PersonImageUpload } from '../people/PersonImageUpload';

export const CompaniesPanel: React.FC<{ btn: string }> = ({ btn }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: '', domain: '', industry: '' });
  const [logoFor, setLogoFor] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try { setCompanies(await listCompanies()); setError(null); } catch (e) { setError(e instanceof Error ? e.message : 'Failed to load companies'); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  return (
    <div>
      <form
        className="flex flex-wrap gap-2 mb-4"
        onSubmit={async e => {
          e.preventDefault();
          try { await createCompany(draft); setDraft({ name: '', domain: '', industry: '' }); await refresh(); }
          catch (err) { setError(err instanceof Error ? err.message : 'Failed to create company'); }
        }}
      >
        <input required aria-label="Company name" placeholder="Company name" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className="py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm" />
        <input aria-label="Domain" placeholder="domain.com" value={draft.domain} onChange={e => setDraft({ ...draft, domain: e.target.value })} className="py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm" />
        <input aria-label="Industry" placeholder="Industry" value={draft.industry} onChange={e => setDraft({ ...draft, industry: e.target.value })} className="py-2 px-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm" />
        <button type="submit" className={btn}><Plus className="w-4 h-4" />Add company</button>
      </form>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/50"><tr><th className="px-3 py-2 text-left">Company</th><th className="px-3 py-2 text-left">Logo</th><th className="px-3 py-2 text-left">Domain</th><th className="px-3 py-2 text-left">Industry</th><th className="px-3 py-2 text-left">Contacts</th></tr></thead>
          <tbody>
            {companies.map(c => (
              <tr key={c.id} className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 flex items-center gap-2"><Building2 className="w-4 h-4 text-gray-400" />{c.name}</td>
                <td className="px-3 py-2">
                  {logoFor === c.id ? (
                    <div className="flex items-start gap-2">
                      <PersonImageUpload folder="companies" value={c.logo_url} onChange={async url => {
                        const { error: e } = await supabase.from('companies').update({ logo_url: url }).eq('id', c.id);
                        if (e) throw new Error(e.message);
                        await refresh();
                      }} />
                      <button className="text-xs underline" onClick={() => setLogoFor(null)}>Done</button>
                    </div>
                  ) : (
                    <button className="inline-flex items-center gap-2" aria-label={`Change logo for ${c.name}`} onClick={() => setLogoFor(c.id)}>
                      {c.logo_url ? <img src={c.logo_url} alt={`${c.name} logo`} className="w-8 h-8 rounded object-cover" /> : <span className="w-8 h-8 rounded bg-gray-100 dark:bg-gray-800 inline-flex items-center justify-center text-xs text-gray-400">+</span>}
                      <span className="text-xs underline">{c.logo_url ? 'Change' : 'Upload'}</span>
                    </button>
                  )}
                </td>
                <td className="px-3 py-2">{c.domain}</td><td className="px-3 py-2">{c.industry}</td><td className="px-3 py-2">{c.contactCount}</td>
              </tr>
            ))}
            {!companies.length && <tr><td colSpan={5} className="px-3 py-8 text-center text-gray-500">No companies yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
