/**
 * Theme side-effect hook.
 *
 * Syncs the Zustand theme state with the DOM:
 * - Toggles `soft-dark` class on `<html>` for dark mode
 * - Updates `--symbol-color` CSS variable when color or theme changes
 * - Briefly adds `theme-switching` class to suppress CSS transitions
 */
import { useEffect } from 'react';

import { useAppStore, THEME_COLOR } from '@/state/store';

export function useTheme(): void {
  const theme = useAppStore((s) => s.theme);
  const iconColor = useAppStore((s) => s.iconColor);

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('theme-switching');

    if (theme === 'dark') {
      root.classList.add('soft-dark');
    } else {
      root.classList.remove('soft-dark');
    }

    // Re-enable transitions after one frame
    requestAnimationFrame(() => {
      root.classList.remove('theme-switching');
    });
  }, [theme]);

  // Sync --symbol-color CSS variable
  useEffect(() => {
    if (iconColor === THEME_COLOR) {
      const themeColor =
        getComputedStyle(document.documentElement)
          .getPropertyValue('--fg-default')
          .trim() || 'currentColor';
      document.documentElement.style.setProperty('--symbol-color', themeColor);
    } else {
      document.documentElement.style.setProperty('--symbol-color', iconColor);
    }
  }, [iconColor, theme]);
}
