import { useRef, useCallback } from 'react';

import { useClickOutside } from '@/hooks/useClickOutside';
import { analytics } from '@/lib/analytics';
import { COLOR_PALETTE, THEME_COLOR, useAppStore } from '@/state/store';

export function ColorPicker() {
  const iconColor = useAppStore((s) => s.iconColor);
  const setIconColor = useAppStore((s) => s.setIconColor);
  const openDropdown = useAppStore((s) => s.openDropdown);
  const setOpenDropdown = useAppStore((s) => s.setOpenDropdown);

  const open = openDropdown === 'color';
  const ref = useRef<HTMLDivElement>(null);

  const closeDropdown = useCallback(() => setOpenDropdown(null), [setOpenDropdown]);
  useClickOutside(ref, closeDropdown, open);

  const selectColor = useCallback((color: string) => {
    analytics.trackColorPickerChange(color);
    setIconColor(color);
    setOpenDropdown(null);
  }, [setIconColor, setOpenDropdown]);

  const isThemeColor = iconColor === THEME_COLOR;

  return (
    <div
      ref={ref}
      className={`color-selector${open ? ' open' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        setOpenDropdown(open ? null : 'color');
      }}
      tabIndex={0}
      role="button"
      aria-expanded={open}
      aria-label="Select icon color"
    >
        <div
          className="color-selected"
          style={
            isThemeColor
              ? {
                  background: 'transparent',
                  border: '2px dashed var(--border-muted)',
                  color: 'inherit',
                }
              : { background: iconColor }
          }
        >
          {isThemeColor ? 'T' : ''}
        </div>

        <div className="color-dropdown">
          <div className="color-grid">
            {/* Theme color option */}
            <div
              className={`color-option${iconColor === THEME_COLOR ? ' selected' : ''}`}
              title="Theme color (currentColor)"
              onClick={(e) => {
                e.stopPropagation();
                selectColor(THEME_COLOR);
              }}
            >
              T
            </div>

            {/* Color swatches */}
            {COLOR_PALETTE.map((color) => (
              <div
                key={color}
                className={`color-option${iconColor === color ? ' selected' : ''}`}
                style={{ backgroundColor: color }}
                title={color}
                onClick={(e) => {
                  e.stopPropagation();
                  selectColor(color);
                }}
              />
            ))}
          </div>
        </div>
      </div>
  );
}
