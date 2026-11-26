import type { Category, Item, ItemStatus, Priority } from './types';

export interface ItemFilter {
  query: string;
  status: ItemStatus | 'semua';
  category: Category | 'semua';
}

export type SortKey = 'priority' | 'newest' | 'target';

const PRIORITY_RANK: Record<Priority, number> = {
  rendah: 1,
  sedang: 2,
  tinggi: 3,
};

function newestFirst(a: Item, b: Item): number {
  return b.createdAt.localeCompare(a.createdAt);
}

export function filterItems(items: Item[], filter: ItemFilter): Item[] {
  const query = filter.query.trim().toLowerCase();

  return items.filter((item) => {
    if (filter.status !== 'semua' && item.status !== filter.status) {
      return false;
    }

    if (filter.category !== 'semua' && item.category !== filter.category) {
      return false;
    }

    if (query.length === 0) {
      return true;
    }

    return item.name.toLowerCase().includes(query) || item.notes.toLowerCase().includes(query);
  });
}

export function sortItems(items: Item[], sort: SortKey): Item[] {
  const sorted = [...items];

  if (sort === 'newest') {
    return sorted.sort(newestFirst);
  }

  if (sort === 'target') {
    return sorted.sort((a, b) => {
      if (a.targetDate === null && b.targetDate === null) {
        return newestFirst(a, b);
      }

      if (a.targetDate === null) {
        return 1;
      }

      if (b.targetDate === null) {
        return -1;
      }

      return a.targetDate.localeCompare(b.targetDate) || newestFirst(a, b);
    });
  }

  return sorted.sort((a, b) => {
    return PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority] || newestFirst(a, b);
  });
}
