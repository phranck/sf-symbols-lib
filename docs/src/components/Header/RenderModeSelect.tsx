import { useCallback } from 'react';

import { analytics } from '@/lib/analytics';
import { useAppStore, type RenderMode } from '@/state/store';

export function RenderModeSelect() {
  const renderMode = useAppStore((s) => s.renderMode);
  const setRenderMode = useAppStore((s) => s.setRenderMode);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = e.target.value as RenderMode;
    analytics.trackRenderModeSwitch(newMode);
    setRenderMode(newMode);
  }, [setRenderMode]);

  return (
    <select
      className="control-select"
      value={renderMode}
      onChange={handleChange}
    >
      <option value="dualtone">Dualtone</option>
      <option value="monochrome">Monochrome</option>
    </select>
  );
}
