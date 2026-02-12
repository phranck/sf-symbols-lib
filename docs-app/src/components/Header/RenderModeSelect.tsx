import { useAppStore, type RenderMode } from '@/state/store';

export function RenderModeSelect() {
  const renderMode = useAppStore((s) => s.renderMode);
  const setRenderMode = useAppStore((s) => s.setRenderMode);

  return (
    <div className="control-group">
      <label className="control-label">Render Mode</label>
      <select
        className="control-select"
        value={renderMode}
        onChange={(e) => setRenderMode(e.target.value as RenderMode)}
      >
        <option value="dualtone">Dualtone</option>
        <option value="monochrome">Monochrome</option>
      </select>
    </div>
  );
}
