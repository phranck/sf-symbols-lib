import { useFilteredIcons } from '@/hooks/useFuse';
import { icons } from '@/lib/icons';

import { SearchInput } from './SearchInput';
import { RenderModeSelect } from './RenderModeSelect';
import { CategorySelect } from './CategorySelect';
import { ColorPicker } from './ColorPicker';
import { ThemeToggle } from './ThemeToggle';
import { AboutButton } from './AboutButton';

export function Header() {
  const filteredIcons = useFilteredIcons();

  return (
    <header className="frosted-header">
      <div className="header-top">
        <div className="header-title">
          <h1>SF Symbols</h1>
          <div className="subtext">React component library</div>
        </div>

        <div className="header-controls">
          <SearchInput />
          <RenderModeSelect />
          <CategorySelect />
          <ColorPicker />
          <ThemeToggle />
          <AboutButton />
        </div>
      </div>

      <div className="stats-bar">
        <div className="stat-item">
          Showing{' '}
          <span className="stat-value">
            {filteredIcons.length.toLocaleString()}
          </span>
        </div>
        <div className="stat-item">
          of{' '}
          <span className="stat-value">
            {icons.length.toLocaleString()}
          </span>
        </div>
      </div>
    </header>
  );
}
