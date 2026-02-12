/**
 * Custom category dropdown with SF Symbol icons.
 *
 * Replaces the native <select> with a styled dropdown that shows
 * a representative SF Symbol icon next to each category name.
 * Displays ~10 items in view, rest scrollable.
 * Supports keyboard navigation (ArrowUp/Down, Enter, Escape).
 */
import { createElement, useCallback, useEffect, useRef, useState } from 'react';

import { useClickOutside } from '@/hooks/useClickOutside';
import { useIconsReady } from '@/hooks/useIconsReady';
import { analytics } from '@/lib/analytics';
import { categories } from '@/lib/catalog';
import { CATEGORY_ICONS } from '@/lib/categoryIcons';
import { getIconComponent } from '@/lib/icons';
import { useAppStore } from '@/state/store';

/** Total number of items: "All" + each category. */
const ITEM_COUNT = 1 + categories.length;

export function CategorySelect() {
  const selectedCategory = useAppStore((s) => s.selectedCategory);
  const setSelectedCategory = useAppStore((s) => s.setSelectedCategory);
  const renderMode = useAppStore((s) => s.renderMode);
  const iconsReady = useIconsReady();
  const openDropdownStore = useAppStore((s) => s.openDropdown);
  const setOpenDropdown = useAppStore((s) => s.setOpenDropdown);

  const open = openDropdownStore === 'category';
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Compute initial focused index from currently selected category
  const getSelectedIndex = useCallback(() => {
    if (!selectedCategory) return 0;
    const idx = categories.indexOf(selectedCategory);
    return idx >= 0 ? idx + 1 : 0;
  }, [selectedCategory]);

  // Open/close with focus management
  const openDropdown = useCallback(() => {
    const idx = getSelectedIndex();
    setOpenDropdown('category');
    setFocusedIndex(idx);
    requestAnimationFrame(() => {
      itemRefs.current[idx]?.scrollIntoView({ block: 'nearest' });
      itemRefs.current[idx]?.focus();
    });
  }, [getSelectedIndex, setOpenDropdown]);

  const closeDropdown = useCallback(() => {
    setOpenDropdown(null);
    setFocusedIndex(-1);
  }, [setOpenDropdown]);

  useClickOutside(ref, closeDropdown, open);

  const handleSelect = useCallback(
    (category: string) => {
      if (category) {
        analytics.trackCategoryChange(category);
      }
      setSelectedCategory(category);
      closeDropdown();
    },
    [setSelectedCategory, closeDropdown],
  );

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          e.stopPropagation();
          closeDropdown();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev < ITEM_COUNT - 1 ? prev + 1 : 0;
            itemRefs.current[next]?.scrollIntoView({ block: 'nearest' });
            itemRefs.current[next]?.focus();
            return next;
          });
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev > 0 ? prev - 1 : ITEM_COUNT - 1;
            itemRefs.current[next]?.scrollIntoView({ block: 'nearest' });
            itemRefs.current[next]?.focus();
            return next;
          });
          break;
        case 'Enter':
          e.preventDefault();
          e.stopPropagation();
          setFocusedIndex((prev) => {
            if (prev >= 0 && prev < ITEM_COUNT) {
              const category = prev === 0 ? '' : categories[prev - 1];
              handleSelect(category);
            }
            return prev;
          });
          break;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleSelect, closeDropdown]);

  const displayLabel = selectedCategory || 'All';

  return (
    <div ref={ref} className="category-dropdown">
      <button
        className="category-dropdown-trigger"
        onClick={(e) => {
          e.stopPropagation();
          if (open) closeDropdown(); else openDropdown();
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
        type="button"
      >
        <span className="category-dropdown-label">{displayLabel}</span>
        <svg className="category-dropdown-chevron" viewBox="0 0 12 8" aria-hidden="true">
          <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </button>

      {open && (
        <div ref={listRef} className="category-dropdown-list" role="listbox">
          <button
            ref={(el) => { itemRefs.current[0] = el; }}
            className={`category-dropdown-item${!selectedCategory ? ' selected' : ''}${focusedIndex === 0 ? ' focused' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleSelect('');
            }}
            role="option"
            aria-selected={!selectedCategory}
            tabIndex={focusedIndex === 0 ? 0 : -1}
            type="button"
          >
            <span className="category-dropdown-item-label">All</span>
          </button>

          {categories.map((cat, i) => {
            const itemIndex = i + 1;
            const pascalName = CATEGORY_ICONS[cat];
            const Icon = iconsReady && pascalName
              ? getIconComponent(pascalName, renderMode)
              : undefined;

            return (
              <button
                key={cat}
                ref={(el) => { itemRefs.current[itemIndex] = el; }}
                className={`category-dropdown-item${selectedCategory === cat ? ' selected' : ''}${focusedIndex === itemIndex ? ' focused' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(cat);
                }}
                role="option"
                aria-selected={selectedCategory === cat}
                tabIndex={focusedIndex === itemIndex ? 0 : -1}
                type="button"
              >
                <span className="category-dropdown-icon">
                  {Icon ? createElement(Icon) : null}
                </span>
                <span className="category-dropdown-item-label">{cat}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
