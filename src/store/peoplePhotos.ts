import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { teamMembers } from '../data/teamMembers';

const key = (n?: string | null) => (n ?? '').trim().toLowerCase();
/** Pages often pass only the stock photo URL (or initials), so team photos are also indexed by that stock URL. */
const stockKey = (name: string) => { const m = teamMembers.find(t => key(t.name) === key(name)); return m?.avatar ? key(`src:${m.avatar}`) : null; };

interface PeoplePhotosState {
  photos: Record<string, string>;
  load: () => Promise<void>;
  set: (name: string, url: string | null) => void;
}

/** name -> uploaded photo URL (contacts + team members). `Avatar` prefers these over the stock photos. */
export const usePeoplePhotos = create<PeoplePhotosState>()((set) => ({
  photos: {},
  load: async () => {
    try {
      const [contacts, team] = await Promise.all([
        supabase.from('contacts').select('first_name,last_name,avatar_url').not('avatar_url', 'is', null),
        supabase.from('team_members').select('name,avatar_url').not('avatar_url', 'is', null),
      ]);
      const next: Record<string, string> = {};
      for (const c of (contacts.data ?? []) as Array<{ first_name: string; last_name: string; avatar_url: string }>) next[key(`${c.first_name} ${c.last_name}`)] = c.avatar_url;
      for (const t of (team.data ?? []) as Array<{ name: string; avatar_url: string }>) { next[key(t.name)] = t.avatar_url; const sk = stockKey(t.name); if (sk) next[sk] = t.avatar_url; }
      set({ photos: next });
    } catch { /* offline / tables missing: keep stock photos */ }
  },
  set: (name, url) => set(s => {
    const photos = { ...s.photos };
    const keys = [key(name), stockKey(name)].filter((k): k is string => !!k);
    for (const k of keys) { if (url) photos[k] = url; else delete photos[k]; }
    return { photos };
  }),
}));

export const usePhotoFor = (name?: string | null): string | undefined => usePeoplePhotos(s => s.photos[key(name)]);
