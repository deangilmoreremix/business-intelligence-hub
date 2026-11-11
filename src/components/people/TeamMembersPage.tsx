import { useCallback, useEffect, useState } from 'react';
import { PageWrapper } from '../layout/PageWrapper';
import { GlassCard } from '../ui/GlassCard';
import Avatar from '../ui/Avatar';
import { supabase } from '../../lib/supabase';
import { usePeoplePhotos } from '../../store/peoplePhotos';
import { PersonImageUpload } from './PersonImageUpload';

interface Member { id: string; name: string; role: string | null; status: 'online' | 'offline' | 'away' | 'busy'; avatar_url: string | null }

/** Team members shown across the app (Win Rate, Smart Followups, …); upload a photo for each. */
export const TeamMembersPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    const { data, error: e } = await supabase.from('team_members').select('*').order('name');
    if (e) setError(e.message); else { setMembers((data ?? []) as Member[]); setError(null); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  return (
    <PageWrapper title="Team Members" description="Upload a photo for each team member; it replaces the stock photo everywhere" onBack={onBack} appTheme="indigo">
      {error && <p role="alert" className="mb-3 text-sm text-red-600">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {members.map(m => (
          <div key={m.id} data-testid="team-member"><GlassCard className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Avatar alt={m.name} fallback={m.name} status={m.status} size="lg" />
              <div><div className="font-semibold">{m.name}</div><div className="text-sm text-gray-500">{m.role}</div></div>
            </div>
            <PersonImageUpload
              folder="team"
              value={m.avatar_url}
              onChange={async url => {
                const { error: e } = await supabase.from('team_members').update({ avatar_url: url, updated_at: new Date().toISOString() }).eq('id', m.id);
                if (e) throw new Error(e.message);
                usePeoplePhotos.getState().set(m.name, url);
                await load();
              }}
            />
          </GlassCard></div>
        ))}
      </div>
    </PageWrapper>
  );
};
