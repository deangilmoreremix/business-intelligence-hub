import React, { useCallback, useEffect, useState } from 'react';
import { Building2, Plus } from 'lucide-react';
import { createCompany, listCompanies, type Company } from '../../services/contactService';

export const CompaniesPanel: React.FC<{ btn: string }> = ({ btn }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: '', domain: '', industry: '' });

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
          <thead className="bg-gray-50 dark:bg-gray-800/50"><tr><th className="px-3 py-2 text-left">Company</th><th className="px-3 py-2 text-left">Domain</th><th className="px-3 py-2 text-left">Industry</th><th className="px-3 py-2 text-left">Contacts</th></tr></thead>
          <tbody>
            {companies.map(c => (
              <tr key={c.id} className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-3 py-2 flex items-center gap-2"><Building2 className="w-4 h-4 text-gray-400" />{c.name}</td>
                <td className="px-3 py-2">{c.domain}</td><td className="px-3 py-2">{c.industry}</td><td className="px-3 py-2">{c.contactCount}</td>
              </tr>
            ))}
            {!companies.length && <tr><td colSpan={4} className="px-3 py-8 text-center text-gray-500">No companies yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
