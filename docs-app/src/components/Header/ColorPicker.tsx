import { useRef, useState, useEffect, useCallback } from 'react';

import { useAnalytics } from '@/hooks/useAnalytics';
import { useAppStore, COLOR_PALETTE, THEME_COLOR } from '@/state/store';

export function ColorPicker() {
  const analytics = useAnalytics();
  const iconColor = useAppStore((s) => s.iconColor);
  const setIconColor = useAppStore((s) => s.setIconColor);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [handleClickOutside]);

  const selectColor = useCallback((color: string) => {
    analytics.trackColorPickerChange(color);
    setIconColor(color);
    setOpen(false);
  }, [setIconColor, analytics]);

  const isThemeColor = iconColor === THEME_COLOR;

  return (
    <div className="control-group">
      <label className="control-label">Color</label>
      <div
        ref={ref}
        className={`color-selector${open ? ' open' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
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
    </div>
  );
}
