import { useCallback, memo } from 'react';

import { useAnalytics } from '@/hooks/useAnalytics';
import type { IconEntry } from '@/lib/icons';
import { useAppStore } from '@/state/store';

/**
 * Middle column of the drawer: icon metadata and copy buttons.
 *
 * Displays symbol name, Apple name, categories, and copy buttons.
 * Copy actions trigger toast notifications via the store.
 */
interface DrawerInfoProps {
  icon: IconEntry;
}

/** Convert dot-separated name to capitalized Apple Name: "arrow.down" → "Arrow Down" */
function toAppleName(name: string): string {
  return name
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export const DrawerInfo = memo(function DrawerInfo({ icon }: DrawerInfoProps) {
  const analytics = useAnalytics();
  const setToastMessage = useAppStore((s) => s.setToastMessage);

  const handleCopySymbolName = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(icon.name);
      analytics.trackIconCopy(icon.name, 'name');
      setToastMessage(`Copied: ${icon.name}`);
    } catch {
      setToastMessage('Copy failed. Try again.');
    }
  }, [icon.name, setToastMessage, analytics]);

  const handleCopyAppleName = useCallback(async () => {
    const appleName = toAppleName(icon.name);
    try {
      await navigator.clipboard.writeText(appleName);
      analytics.trackIconCopy(icon.name, 'appleName');
      setToastMessage(`Copied: ${appleName}`);
    } catch {
      setToastMessage('Copy failed. Try again.');
    }
  }, [icon.name, setToastMessage, analytics]);

  const appleName = toAppleName(icon.name);

  return (
    <div className="drawer-info">
      <div className="info-section">
        <label className="drawer-label">Symbol Name</label>
        <div className="info-row">
          <code className="info-code">{icon.name}</code>
          <button
            className="info-copy-btn"
            onClick={handleCopySymbolName}
            title="Copy symbol name"
          >
            📋
          </button>
        </div>
      </div>

      <div className="info-section">
        <label className="drawer-label">Apple Name</label>
        <div className="info-row">
          <code className="info-code">{appleName}</code>
          <button
            className="info-copy-btn"
            onClick={handleCopyAppleName}
            title="Copy Apple name"
          >
            📋
          </button>
        </div>
      </div>

      {icon.categories.length > 0 && (
        <div className="info-section">
          <label className="drawer-label">Categories</label>
          <div className="info-tags">
            {icon.categories.map((category) => (
              <span key={category} className="info-tag">
                {category}
              </span>
            ))}
          </div>
        </div>
      )}

      {icon.restricted && (
        <div className="info-section info-restricted">
          <label className="drawer-label">Apple Restriction</label>
          <p className="info-text">
            This symbol is restricted by Apple and may have additional usage guidelines.
          </p>
        </div>
      )}
    </div>
  );
});
