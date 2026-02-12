import { createElement, useCallback } from 'react';

import { IconButton } from '@/components/IconButton';
import { useIconsReady } from '@/hooks/useIconsReady';
import { analytics } from '@/lib/analytics';
import { getIconComponent } from '@/lib/icons';
import { useAppStore } from '@/state/store';

export function ThemeToggle() {
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const renderMode = useAppStore((s) => s.renderMode);
  const iconsReady = useIconsReady();

  const handleToggle = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    analytics.trackThemeToggle(newTheme);
    toggleTheme();
  }, [theme, toggleTheme]);

  const iconName = theme === 'light' ? 'SFMoonFill' : 'SFSunMaxFill';
  const Icon = iconsReady ? getIconComponent(iconName, renderMode) : undefined;

  return (
    <IconButton
      icon={
        Icon
          ? createElement(Icon)
          : <span id="theme-toggle-icon">
              {theme === 'light' ? '\u{1F319}' : '\u{2600}\u{FE0F}'}
            </span>
      }
      onClick={handleToggle}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    />
  );
}
