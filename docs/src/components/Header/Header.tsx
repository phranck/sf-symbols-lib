import { AboutButton } from './AboutButton';
import { CategorySelect } from './CategorySelect';
import { ColorPicker } from './ColorPicker';
import { RenderModeSelect } from './RenderModeSelect';
import { SearchInput } from './SearchInput';
import { StatsBar } from './StatsBar';
import { ThemeToggle } from './ThemeToggle';

export function Header() {
  return (
    <header className="frosted-header">
      {/* Row 1: title + search + action buttons */}
      <div className="header-top">
        <div className="header-title">
          <h1 className="h4 mb-0">SF Symbols Library Preview</h1>
          <div className="subtext small">Interactive preview of SF Symbols 7.3</div>
        </div>

        <div className="header-actions">
          <SearchInput />
          <ThemeToggle />
          <AboutButton />
        </div>
      </div>

      {/* Row 3: filters + stats */}
      <div className="header-filters">
        <div className="control-group">
          <label className="control-label">Render Mode</label>
          <RenderModeSelect />
        </div>

        <div className="control-group">
          <label className="control-label">Category</label>
          <CategorySelect />
        </div>

        <div className="control-group">
          <label className="control-label">Color</label>
          <ColorPicker />
        </div>

        <StatsBar />
      </div>
    </header>
  );
}
