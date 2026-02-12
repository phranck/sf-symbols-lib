import { useRef, useCallback, memo } from 'react';

import { analytics } from '@/lib/analytics';
import { useAppStore } from '@/state/store';

export const SearchInput = memo(function SearchInput() {
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);

    if (newQuery.trim()) {
      analytics.trackSearch(newQuery, -1);
    }
  }, [setSearchQuery]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      inputRef.current?.blur();
    }
  }, []);

  return (
    <input
      ref={inputRef}
      id="symbols-search"
      type="search"
      className="search-input"
      placeholder="Search symbols..."
      value={searchQuery}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  );
});
