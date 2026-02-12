import { useRef, useCallback } from 'react';

import { useAnalytics } from '@/hooks/useAnalytics';
import { useFilteredIcons } from '@/hooks/useFuse';
import { useAppStore } from '@/state/store';

export function SearchInput() {
  const analytics = useAnalytics();
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const filteredIcons = useFilteredIcons();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);

    if (newQuery.trim()) {
      // Track search with result count from filtered icons
      analytics.trackSearch(newQuery, filteredIcons.length);
    }
  }, [setSearchQuery, analytics, filteredIcons.length]);

  return (
    <input
      ref={inputRef}
      id="symbols-search"
      type="search"
      className="search-input"
      placeholder="Search symbols..."
      value={searchQuery}
      onChange={handleChange}
    />
  );
}
