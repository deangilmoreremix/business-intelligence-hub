import { Children, isValidElement, type ReactNode } from 'react';
import { SortableGrid } from './SortableGrid';
import { useStoredOrder } from './useStoredOrder';

type Props = { pageKey: string; arranging: boolean; children: ReactNode; onReset?: () => void };

/**
 * Lets the top-level sections of a page be re-ordered (drag or keyboard) while `arranging` is on.
 * When off, children render exactly as before (no wrappers), so the page looks and behaves as it always did.
 * The order is saved per user and per page.
 */
export const MovableSections = ({ pageKey, arranging, children }: Props) => {
  const nodes = Children.toArray(children);
  const items = nodes.map((node, i) => ({ id: isValidElement(node) && node.key != null ? String(node.key) : `section-${i}`, node }));
  const { ordered, move } = useStoredOrder(`page-sections:${pageKey}`, items.map(i => i.id));
  if (!arranging) {
    // Same elements, no wrappers (parent spacing utilities keep working), just in the saved order.
    const byId = new Map(items.map(i => [i.id, i.node]));
    return <>{ordered.map(id => byId.get(id))}</>;
  }
  const byId = new Map(items.map(i => [i.id, i]));
  const list = ordered.map(id => byId.get(id)!).filter(Boolean);
  return (
    <SortableGrid
      groupId={`page-${pageKey}`}
      items={list}
      onMove={move}
      className="space-y-0 [&>*]:rounded-xl [&>*]:outline [&>*]:outline-2 [&>*]:outline-dashed [&>*]:outline-indigo-300 [&>*]:outline-offset-2 [&>*]:mb-3 [&>*]:cursor-grab"
      renderItem={item => <div data-section-id={item.id}>{item.node}</div>}
    />
  );
};
