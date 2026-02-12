import { useAppStore } from '@/state/store';

export function ThemeToggle() {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <span id="theme-toggle-icon">
        {theme === 'light' ? '\u{1F319}' : '\u{2600}\u{FE0F}'}
      </span>
    </button>
  );
}
