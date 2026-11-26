import type { ItemStatus } from './types';

const TRANSITIONS: Record<ItemStatus, ItemStatus[]> = {
  rusak: ['dikerjakan'],
  dikerjakan: ['selesai'],
  selesai: ['dikerjakan'],
};

export function canTransition(from: ItemStatus, to: ItemStatus): boolean {
  return TRANSITIONS[from].includes(to);
}
