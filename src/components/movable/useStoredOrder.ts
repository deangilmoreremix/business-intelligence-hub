import { useCallback, useEffect, useRef, useState } from 'react';
import { loadPref, readLocalPref, savePref } from '../../lib/prefs';

/** Applies a saved id order to `ids`; unknown/new ids keep their original relative position at the end. */
export const applyOrder = (ids: string[], saved: string[] | null | undefined): string[] => {
  if (!saved?.length) return ids;
  const rank = new Map(saved.map((id, i) => [id, i]));
  const known = ids.filter(id => rank.has(id)).sort((a, b) => rank.get(a)! - rank.get(b)!);
  const fresh = ids.filter(id => !rank.has(id));
  return [...known, ...fresh];
};

/** Moves `sourceId` to the slot of `targetId` (before it when coming from below, after it when coming from above). */
export const moveItem = (order: string[], sourceId: string, targetId: string): string[] => {
  const from = order.indexOf(sourceId); const to = order.indexOf(targetId);
  if (from < 0 || to < 0 || from === to) return order;
  const next = order.filter(id => id !== sourceId);
  next.splice(to, 0, sourceId);
  return next;
};

export const useStoredOrder = (key: string, ids: string[]) => {
  const [saved, setSaved] = useState<string[] | null>(() => readLocalPref<string[]>(key));
  const keyRef = useRef(key);
  keyRef.current = key;
  useEffect(() => { let live = true; loadPref<string[]>(key).then(v => { if (live && v) setSaved(v); }); return () => { live = false; }; }, [key]);

  const ordered = applyOrder(ids, saved);
  const move = useCallback((sourceId: string, targetId: string) => {
    const next = moveItem(applyOrder(ids, saved), sourceId, targetId);
    setSaved(next);
    void savePref(keyRef.current, next);
  }, [ids, saved]);
  const reset = useCallback(() => { setSaved(null); void savePref(keyRef.current, []); }, []);
  return { ordered, move, reset, customised: !!saved?.length };
};
