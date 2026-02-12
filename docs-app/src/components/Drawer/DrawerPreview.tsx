import { memo } from 'react';

import type { IconEntry } from '@/lib/icons';

/**
 * Left column of the drawer: large icon preview with restricted badge.
 */
interface DrawerPreviewProps {
  icon: IconEntry;
  Icon: React.ComponentType;
}

export const DrawerPreview = memo(function DrawerPreview({
  icon,
  Icon,
}: DrawerPreviewProps) {
  return (
    <div className="drawer-preview">
      <div className="drawer-preview-box">
        <Icon />
        {icon.restricted && (
          <div className="drawer-restricted-badge" title="This symbol is restricted by Apple">
            ℹ️
          </div>
        )}
      </div>
    </div>
  );
});
