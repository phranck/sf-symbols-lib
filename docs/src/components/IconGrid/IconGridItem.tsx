import { createElement, memo, useCallback } from 'react';

import { useIconsReady } from '@/hooks/useIconsReady';
import type { IconEntry } from '@/lib/icons';
import { getIconComponent } from '@/lib/icons';
import type { RenderMode } from '@/state/store';

/** Renders the resolved icon component via createElement to avoid react-hooks/static-components lint error. */
const IconRenderer = memo(function IconRenderer({
  pascalName,
  renderMode,
}: {
  pascalName: string;
  renderMode: RenderMode;
}) {
  // Subscribe to loading changes so we re-render when a new mode finishes loading.
  // Without this, memo blocks re-renders since pascalName and renderMode stay the same.
  useIconsReady();
  const Icon = getIconComponent(pascalName, renderMode);
  if (!Icon) return null;
  return createElement(Icon);
});

interface IconGridItemProps {
  icon: IconEntry;
  renderMode: RenderMode;
  isSelected: boolean;
  isFocused: boolean;
  onClick: (icon: IconEntry) => void;
}

export const IconGridItem = memo(function IconGridItem({
  icon,
  renderMode,
  isSelected,
  isFocused,
  onClick,
}: IconGridItemProps) {
  const iconsReady = useIconsReady();

  const handleClick = useCallback(() => {
    onClick(icon);
  }, [onClick, icon]);

  const className = [
    'card',
    isSelected && 'selected',
    isFocused && 'focused',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={className}
      data-sf-key={icon.name}
      tabIndex={isFocused ? 0 : -1}
      onClick={handleClick}
    >
      {iconsReady ? (
        <IconRenderer pascalName={icon.pascalName} renderMode={renderMode} />
      ) : null}
      {icon.restricted && (
        <div className="card-info-icon" title="This symbol is restricted by Apple">
          &#x24D8;
        </div>
      )}
    </div>
  );
});
