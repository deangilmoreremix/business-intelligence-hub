import { DragDropProvider } from '@dnd-kit/react';
import { closestCenter } from '@dnd-kit/collision';
import type { ReactNode } from 'react';
import { DragDropItemSortableCell } from '@/ui/utilities/drag-and-drop/components/DragDropItemSortableCell';
import { DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION } from '@/ui/utilities/drag-and-drop/constants/DndKitProviderPluginsWithoutDropAnimation';
import { DND_KIT_SENSORS } from '@/ui/utilities/drag-and-drop/constants/DndKitSensors';
import '../../vendor/twenty-adapter/twenty-theme';

type Props<T extends { id: string }> = {
  items: T[];
  groupId: string;
  className?: string;
  disabled?: boolean;
  onMove: (sourceId: string, targetId: string) => void;
  renderItem: (item: T, index: number) => ReactNode;
};

/**
 * Drag-to-reorder grid built on Twenty's drag-and-drop primitives (sortable cell, sensors, provider plugins).
 * Items can move freely (grid), pointer or keyboard.
 */
export function SortableGrid<T extends { id: string }>({ items, groupId, className, disabled, onMove, renderItem }: Props<T>) {
  return (
    <DragDropProvider<{ droppableId: string; index: number }>
      sensors={DND_KIT_SENSORS}
      // cast: the vendored plugin list is typed against Twenty's pinned dnd-kit build
      plugins={DND_KIT_PROVIDER_PLUGINS_WITHOUT_DROP_ANIMATION as never}
      onDragEnd={event => {
        if (event.canceled) return;
        const source = event.operation.source; const target = event.operation.target;
        if (!source || !target || source.id === target.id) return;
        onMove(String(source.id), String(target.id));
      }}
    >
      <div className={className} data-testid={`sortable-${groupId}`}>
        {items.map((item, index) => (
          <DragDropItemSortableCell
            key={item.id}
            id={item.id}
            index={index}
            group={groupId}
            type={groupId}
            accept={groupId}
            disabled={disabled}
            restrictMovementTo="none"
            collisionDetector={closestCenter}
            fadeSourceWhileDragging
          >
            {renderItem(item, index)}
          </DragDropItemSortableCell>
        ))}
      </div>
    </DragDropProvider>
  );
}
