import type { Item } from './types';

export function isOverdue(item: Item, today: string): boolean {
  return item.status !== 'selesai' && item.targetDate !== null && item.targetDate < today;
}

export function isUrgent(item: Item, today: string): boolean {
  return item.status !== 'selesai' && (item.priority === 'tinggi' || isOverdue(item, today));
}
