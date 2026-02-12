import { useCallback } from 'react';

import { useAnalytics } from '@/hooks/useAnalytics';
import { categories } from '@/lib/catalog';
import { useAppStore } from '@/state/store';

export function CategorySelect() {
  const analytics = useAnalytics();
  const selectedCategory = useAppStore((s) => s.selectedCategory);
  const setSelectedCategory = useAppStore((s) => s.setSelectedCategory);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    if (newCategory) {
      analytics.trackCategoryChange(newCategory);
    }
    setSelectedCategory(newCategory);
  }, [setSelectedCategory, analytics]);

  return (
    <div className="control-group">
      <label className="control-label">Category</label>
      <select
        className="control-select"
        value={selectedCategory}
        onChange={handleChange}
      >
        <option value="">All</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  );
}
