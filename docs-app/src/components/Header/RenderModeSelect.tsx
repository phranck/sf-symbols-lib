import { useCallback } from 'react';

import { useAnalytics } from '@/hooks/useAnalytics';
import { useAppStore, type RenderMode } from '@/state/store';

export function RenderModeSelect() {
  const analytics = useAnalytics();
  const renderMode = useAppStore((s) => s.renderMode);
  const setRenderMode = useAppStore((s) => s.setRenderMode);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = e.target.value as RenderMode;
    analytics.trackRenderModeSwitch(newMode);
    setRenderMode(newMode);
  }, [setRenderMode, analytics]);

  return (
    <div className="control-group">
      <label className="control-label">Render Mode</label>
      <select
        className="control-select"
        value={renderMode}
        onChange={handleChange}
      >
        <option value="dualtone">Dualtone</option>
        <option value="monochrome">Monochrome</option>
      </select>
    </div>
  );
}
