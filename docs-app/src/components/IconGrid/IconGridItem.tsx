import { memo, type ComponentType } from 'react';

import type { IconEntry } from '@/lib/icons';

interface IconGridItemProps {
  icon: IconEntry;
  Icon: ComponentType;
  isSelected: boolean;
  isFocused: boolean;
  onClick: (icon: IconEntry) => void;
}

export const IconGridItem = memo(function IconGridItem({
  icon,
  Icon,
  isSelected,
  isFocused,
  onClick,
}: IconGridItemProps) {
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
      title={icon.name}
      data-sf-key={icon.name}
      tabIndex={isFocused ? 0 : -1}
      onClick={() => onClick(icon)}
    >
      <Icon />
      {icon.restricted && (
        <div className="card-info-icon" title="This symbol is restricted by Apple">
          &#x24D8;
        </div>
      )}
    </div>
  );
});
