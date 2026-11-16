import { useState, type ReactNode } from 'react';
import { Move } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { savePref } from '../../lib/prefs';

/** Arrange toggle + reset for pages that don't use PageWrapper (same behaviour as PageWrapper's header control). */
export const usePageArrange = (): { arranging: boolean; pageKey: string; button: ReactNode } => {
  const { pathname } = useLocation();
  const [arranging, setArranging] = useState(false);
  const reset = () => { void savePref(`page-sections:${pathname}`, []).then(() => window.location.reload()); };
  const button = (
    <div className="flex gap-2 items-center">
      <button type="button" onClick={() => setArranging(a => !a)} aria-pressed={arranging} title="Rearrange the sections of this page" data-testid="arrange-toggle"
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
        <Move className="w-4 h-4" />{arranging ? 'Done' : 'Arrange'}
      </button>
      {arranging && <button type="button" onClick={reset} data-testid="arrange-reset" className="px-3 py-1.5 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">Reset</button>}
    </div>
  );
  return { arranging, pageKey: pathname, button };
};
