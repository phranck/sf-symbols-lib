/**
 * Virtualized icon grid using @tanstack/react-virtual.
 *
 * Renders only the visible rows of icons, keeping DOM node count around
 * ~100 regardless of total icon count (7,007). The grid is responsive:
 * column count is derived from container width and card size (140px + 16px gap).
 */
import { useRef, useCallback, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

import { useAnalytics } from '@/hooks/useAnalytics';
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
  const analytics = useAnalytics();
  const renderMode = useAppStore((s) => s.renderMode);
  const selectedIcon = useAppStore((s) => s.selectedIcon);
  const focusedIndex = useAppStore((s) => s.focusedIndex);
  const openDrawer = useAppStore((s) => s.openDrawer);
  const setFocusedIndex = useAppStore((s) => s.setFocusedIndex);
  const setLoadingInitial = useAppStore((s) => s.setLoadingInitial);

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
      analytics.trackIconSelect(icon.pascalName);
      openDrawer(icon);
    },
    [openDrawer, analytics],
  );

  // Handle keyboard navigation: arrow keys to move focus, Enter to open drawer
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (filteredIcons.length === 0) return;

      const key = e.key;
      const isArrowKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key);
      const isEnter = key === 'Enter';

      if (!isArrowKey && !isEnter) return;

      // Handle arrow key navigation
      if (isArrowKey) {
        e.preventDefault();
        let newIndex = focusedIndex;

        if (focusedIndex === -1) {
          // If no focus yet, start at first icon
          newIndex = 0;
        } else {
          // Calculate new index based on arrow key
          if (key === 'ArrowUp') {
            newIndex = Math.max(0, focusedIndex - columns);
          } else if (key === 'ArrowDown') {
            newIndex = Math.min(filteredIcons.length - 1, focusedIndex + columns);
          } else if (key === 'ArrowLeft') {
            newIndex = focusedIndex > 0 ? focusedIndex - 1 : focusedIndex;
          } else if (key === 'ArrowRight') {
            newIndex = focusedIndex < filteredIcons.length - 1 ? focusedIndex + 1 : focusedIndex;
          }
        }

        // Update focus and scroll to card
        setFocusedIndex(newIndex);

        // Schedule scroll-into-view after render
        setTimeout(() => {
          const card = scrollRef.current?.querySelector(
            `[data-sf-key="${filteredIcons[newIndex].name}"]`,
          ) as HTMLElement | null;
          if (card) {
            card.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }
        }, 0);
      }

      // Handle Enter key to open drawer
      if (isEnter && focusedIndex >= 0 && focusedIndex < filteredIcons.length) {
        e.preventDefault();
        analytics.trackIconSelect(filteredIcons[focusedIndex].pascalName);
        openDrawer(filteredIcons[focusedIndex]);
      }
    },
    [filteredIcons, focusedIndex, columns, setFocusedIndex, openDrawer, analytics],
  );

  // Signal end of initial loading once virtualizer is ready
  useEffect(() => {
    if (rowVirtualizer.getTotalSize() > 0) {
      setLoadingInitial(false);
    }
  }, [rowVirtualizer.getTotalSize(), setLoadingInitial]);

  return (
    <div
      ref={scrollRef}
      onKeyDown={handleKeyDown}
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
