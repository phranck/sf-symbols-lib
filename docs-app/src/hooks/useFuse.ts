/**
 * Fuzzy search hook using fuse.js.
 *
 * Builds a Fuse index once from the icon catalog and returns filtered
 * results whenever searchQuery or selectedCategory changes.
 *
 * Supports the same query operators as the vanilla JS site:
 *   - `|` for OR  ("folder | file")
 *   - `&` or space for AND ("chevron up", "chevron & up")
 *
 * When the query is empty, all icons (optionally filtered by category)
 * are returned.
 */
import { useMemo } from 'react';
import Fuse, { type IFuseOptions } from 'fuse.js';

import { icons, type IconEntry } from '@/lib/icons';
import { useAppStore } from '@/state/store';

const fuseOptions: IFuseOptions<IconEntry> = {
  keys: [
    { name: 'name', weight: 1.0 },
    { name: 'pascalName', weight: 0.5 },
    { name: 'categories', weight: 0.3 },
  ],
  threshold: 0.3,
  includeScore: false,
  shouldSort: false,
};

/** Singleton Fuse index (built once, reused across renders) */
const fuseIndex = new Fuse(icons as IconEntry[], fuseOptions);

/**
 * Apply category filter to a list of icons.
 */
function filterByCategory(
  entries: ReadonlyArray<IconEntry>,
  category: string,
): ReadonlyArray<IconEntry> {
  if (!category) return entries;
  return entries.filter((e) => e.categories.includes(category));
}

/**
 * Search with OR (`|`) and AND (`&` / space) operator support.
 *
 * "a | b" returns icons matching "a" OR "b".
 * "a b" or "a & b" returns icons matching "a" AND "b".
 * "a | b & c" returns icons matching "(a) OR (b AND c)".
 */
function searchWithOperators(query: string): ReadonlyArray<IconEntry> {
  const trimmed = query.trim();
  if (!trimmed) return icons;

  // Split on OR first
  const orSegments = trimmed.split('|').map((s) => s.trim()).filter(Boolean);

  const resultSet = new Set<IconEntry>();

  for (const segment of orSegments) {
    // Split on AND (& or whitespace)
    const andTokens = segment
      .split('&')
      .flatMap((p) => p.trim().split(/\s+/))
      .filter(Boolean);

    if (andTokens.length === 0) continue;

    if (andTokens.length === 1) {
      // Single token: use Fuse directly
      const results = fuseIndex.search(andTokens[0]);
      for (const r of results) resultSet.add(r.item);
    } else {
      // AND: intersect results of each token
      const sets = andTokens.map((token) => {
        const results = fuseIndex.search(token);
        return new Set(results.map((r) => r.item));
      });

      // Intersect: start with smallest set for efficiency
      sets.sort((a, b) => a.size - b.size);
      const [first, ...rest] = sets;
      for (const item of first) {
        if (rest.every((s) => s.has(item))) {
          resultSet.add(item);
        }
      }
    }
  }

  return [...resultSet];
}

/**
 * Returns the filtered icon list based on current search query and category.
 */
export function useFilteredIcons(): ReadonlyArray<IconEntry> {
  const searchQuery = useAppStore((s) => s.searchQuery);
  const selectedCategory = useAppStore((s) => s.selectedCategory);

  return useMemo(() => {
    const searched = searchWithOperators(searchQuery);
    return filterByCategory(searched, selectedCategory);
  }, [searchQuery, selectedCategory]);
}
