import { memo } from 'react';

import { useFilteredIcons } from '@/hooks/useFuse';
import { icons } from '@/lib/icons';

export const StatsBar = memo(function StatsBar() {
  const filteredIcons = useFilteredIcons();

  return (
    <div className="stats-bar">
      <div className="stat-item">
        <span>Showing:</span>
        <span className="stat-value">
          {filteredIcons.length.toLocaleString()}
        </span>
      </div>
      <div className="stat-item">
        <span>Total:</span>
        <span className="stat-value">
          {icons.length.toLocaleString()}
        </span>
      </div>
    </div>
  );
});
