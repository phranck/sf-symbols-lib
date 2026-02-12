/**
 * Icon grid component - renders all filtered icons in a responsive flex grid.
 * Includes keyboard navigation (arrow keys, Enter, Escape) matching the old vanilla JS version.
 *
 * Icon components are loaded asynchronously. The grid renders card shells
 * immediately; each card fills in its SVG once visible (IntersectionObserver)
 * and the icon modules have finished loading.
 */
import { useCallback, useRef } from 'react';

import { useFilteredIcons } from '@/hooks/useFuse';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { analytics } from '@/lib/analytics';
import type { IconEntry } from '@/lib/icons';
import { useAppStore } from '@/state/store';

import { IconGridItem } from './IconGridItem';

export function IconGrid() {
  const renderMode = useAppStore((s) => s.renderMode);
  const selectedIcon = useAppStore((s) => s.selectedIcon);
  const focusedIndex = useAppStore((s) => s.focusedIndex);
  const setFocusedIndex = useAppStore((s) => s.setFocusedIndex);
  const openPreview = useAppStore((s) => s.openPreview);

  const gridRef = useRef<HTMLDivElement>(null);
  const filteredIcons = useFilteredIcons();

  useKeyboardNavigation({ gridRef, icons: filteredIcons });

  // Mouse click: select only (blue ring), no keyboard focus (orange ring)
  const handleIconClick = useCallback(
    (icon: IconEntry) => {
      analytics.trackIconSelect(icon.pascalName);
      setFocusedIndex(-1);
      openPreview(icon);
    },
    [openPreview, setFocusedIndex],
  );

  return (
    <div ref={gridRef} className="icon-grid">
      {filteredIcons.map((icon, index) => (
        <IconGridItem
          key={icon.pascalName}
          icon={icon}
          renderMode={renderMode}
          isSelected={selectedIcon?.pascalName === icon.pascalName}
          isFocused={focusedIndex === index}
          onClick={handleIconClick}
        />
      ))}
    </div>
  );
}
