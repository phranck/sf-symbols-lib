/**
 * Top-level application layout.
 *
 * Wires up the theme side-effect hook and renders the main structure:
 * Header, icon grid (main content), drawer, footer, and modals.
 *
 * Components are stubbed as placeholders for Phase 4.
 */
import { useTheme } from '@/hooks/useTheme';
import { useFilteredIcons } from '@/hooks/useFuse';
import { useAppStore } from '@/state/store';
import { categories } from '@/lib/catalog';

export function App() {
  useTheme();

  const filteredIcons = useFilteredIcons();
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const selectedCategory = useAppStore((s) => s.selectedCategory);
  const setSelectedCategory = useAppStore((s) => s.setSelectedCategory);
  const variant = useAppStore((s) => s.variant);
  const setVariant = useAppStore((s) => s.setVariant);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);

  return (
    <>
      {/* Header */}
      <header className="frosted-header">
        <div className="header-top">
          <div className="header-title">
            <h1>SF Symbols</h1>
            <div className="subtext">
              React component library
            </div>
          </div>

          <div className="header-controls">
            {/* Search */}
            <input
              type="search"
              className="search-input"
              placeholder="Search symbols..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Variant select */}
            <div className="control-group">
              <label className="control-label">Variant</label>
              <select
                className="control-select"
                value={variant}
                onChange={(e) =>
                  setVariant(e.target.value as 'dualtone' | 'monochrome')
                }
              >
                <option value="dualtone">Dualtone</option>
                <option value="monochrome">Monochrome</option>
              </select>
            </div>

            {/* Category select */}
            <div className="control-group">
              <label className="control-label">Category</label>
              <select
                className="control-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme toggle */}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          </div>
        </div>

        {/* Stats bar */}
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
              {/* total from icons, not filteredIcons */}
              7,007
            </span>
          </div>
        </div>
      </header>

      {/* Main content: icon grid (Phase 4) */}
      <main>
        <div className="icon-grid">
          {filteredIcons.slice(0, 100).map((icon) => {
            const Icon =
              variant === 'dualtone' ? icon.DualtoneIcon : icon.MonochromeIcon;
            return (
              <div key={icon.pascalName} className="card" title={icon.name}>
                <Icon />
              </div>
            );
          })}
          {filteredIcons.length > 100 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--fg-muted)' }}>
              Showing first 100 of {filteredIcons.length.toLocaleString()} icons.
              Virtual scrolling comes in Phase 4.
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="site-footer">
        SF Symbols Library by
        <a
          href="https://github.com/phranck"
          target="_blank"
          rel="noopener noreferrer"
        >
          phranck
        </a>
      </footer>
    </>
  );
}
