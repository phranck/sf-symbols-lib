import { useRef } from 'react';

import { useAppStore } from '@/state/store';

export function SearchInput() {
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <input
      ref={inputRef}
      id="symbols-search"
      type="search"
      className="search-input"
      placeholder="Search symbols..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  );
}
