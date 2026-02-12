/**
 * Virtualized icon grid using @tanstack/react-virtual.
 *
 * Renders only the visible rows of icons, keeping DOM node count around
 * ~100 regardless of total icon count (7,007). The grid is responsive:
 * column count is derived from container width and card size (140px + 16px gap).
 */
import { useRef, useCallback, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

import { useAppStore } from '@/state/store';
import { useFilteredIcons } from '@/hooks/useFuse';
import type { IconEntry } from '@/lib/icons';

import { IconGridItem } from './IconGridItem';

const CARD_SIZE = 140;
const GAP = 16;
const CELL = CARD_SIZE + GAP;

function useColumnCount(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [columns, setColumns] = useState(6);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        const cols = Math.max(1, Math.floor((width + GAP) / CELL));
        setColumns(cols);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [containerRef]);

  return columns;
}

export function IconGrid() {
  const renderMode = useAppStore((s) => s.renderMode);
  const selectedIcon = useAppStore((s) => s.selectedIcon);
  const focusedIndex = useAppStore((s) => s.focusedIndex);
  const openDrawer = useAppStore((s) => s.openDrawer);

  const filteredIcons = useFilteredIcons();
  const scrollRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const columns = useColumnCount(gridRef);

  const rowCount = Math.ceil(filteredIcons.length / columns);
  const ROW_HEIGHT = CELL;

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  const handleIconClick = useCallback(
    (icon: IconEntry) => {
      openDrawer(icon);
    },
    [openDrawer],
  );

  return (
    <div
      ref={scrollRef}
      style={{
        height: '100%',
        overflow: 'auto',
        contain: 'strict',
      }}
    >
      <div
        ref={gridRef}
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const startIdx = virtualRow.index * columns;
          const rowIcons = filteredIcons.slice(startIdx, startIdx + columns);

          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, ${CARD_SIZE}px)`,
                gap: `${GAP}px`,
                justifyContent: 'center',
              }}
            >
              {rowIcons.map((icon, colIdx) => {
                const globalIdx = startIdx + colIdx;
                const Icon =
                  renderMode === 'dualtone'
                    ? icon.DualtoneIcon
                    : icon.MonochromeIcon;

                return (
                  <IconGridItem
                    key={icon.pascalName}
                    icon={icon}
                    Icon={Icon}
                    isSelected={selectedIcon?.pascalName === icon.pascalName}
                    isFocused={focusedIndex === globalIdx}
                    onClick={handleIconClick}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
