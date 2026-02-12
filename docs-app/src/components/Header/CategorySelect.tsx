import { useAppStore } from '@/state/store';
import { categories } from '@/lib/catalog';

export function CategorySelect() {
  const selectedCategory = useAppStore((s) => s.selectedCategory);
  const setSelectedCategory = useAppStore((s) => s.setSelectedCategory);

  return (
    <div className="control-group">
      <label className="control-label">Category</label>
      <select
        className="control-select"
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
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
