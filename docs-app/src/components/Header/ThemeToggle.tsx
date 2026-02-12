import { useCallback } from 'react';

import { useAnalytics } from '@/hooks/useAnalytics';
import { useAppStore } from '@/state/store';

export function ThemeToggle() {
  const analytics = useAnalytics();
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);

  const handleToggle = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    analytics.trackThemeToggle(newTheme);
    toggleTheme();
  }, [theme, toggleTheme, analytics]);

  return (
    <button
      className="theme-toggle"
      onClick={handleToggle}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span id="theme-toggle-icon">
        {theme === 'light' ? '\u{1F319}' : '\u{2600}\u{FE0F}'}
      </span>
    </button>
  );
}
