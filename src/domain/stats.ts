import { CATEGORIES } from './types';
import type { Item, ItemStats } from './types';

export function computeStats(items: Item[]): ItemStats {
  const counts = new Map(CATEGORIES.map((category) => [category, 0]));

  let estimatedTotal = 0;
  let actualTotal = 0;

  for (const item of items) {
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    estimatedTotal += item.estimatedCost ?? 0;
    actualTotal += item.actualCost ?? 0;
  }

  const categories = CATEGORIES.map((category) => ({
    category,
    count: counts.get(category) ?? 0,
  })).sort((a, b) => {
    if (a.count !== b.count) {
      return b.count - a.count;
    }

    return CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category);
  });

  return {
    total: items.length,
    rusak: items.filter((item) => item.status === 'rusak').length,
    dikerjakan: items.filter((item) => item.status === 'dikerjakan').length,
    selesai: items.filter((item) => item.status === 'selesai').length,
    estimatedTotal,
    actualTotal,
    categories,
  };
}
