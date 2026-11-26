import type { Item, ItemStatus, ItemUpdate, NewItem, RecentEvent, RepairEvent } from './types';

export interface ItemRepository {
  list(): Promise<Item[]>;
  get(id: string): Promise<Item | null>;
  create(input: NewItem): Promise<Item>;
  update(id: string, input: ItemUpdate): Promise<Item>;
  changeStatus(
    id: string,
    next: ItemStatus,
    options?: { actualCost?: number | null },
  ): Promise<Item>;
  setReminder(id: string, reminderAt: string | null, notificationId: string | null): Promise<Item>;
  remove(id: string): Promise<void>;
  eventsFor(id: string): Promise<RepairEvent[]>;
  recentEvents(limit: number): Promise<RecentEvent[]>;
}
