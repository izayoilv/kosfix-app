import type { Item, RepairEvent } from '../domain/types';

const BASE_TIME = '2026-11-20T03:00:00.000Z';

export function makeItem(overrides: Partial<Item> = {}): Item {
  return {
    id: 'item-1',
    name: 'Lampu kamar mati',
    category: 'elektronik',
    location: 'kamar',
    priority: 'tinggi',
    status: 'rusak',
    notes: 'Lampu utama mati.',
    photoPath: null,
    estimatedCost: 45000,
    actualCost: null,
    targetDate: '2026-11-24',
    reminderAt: null,
    reminderNotificationId: null,
    createdAt: BASE_TIME,
    updatedAt: BASE_TIME,
    completedAt: null,
    ...overrides,
  };
}

export function makeEvent(overrides: Partial<RepairEvent> = {}): RepairEvent {
  return {
    id: 'event-1',
    itemId: 'item-1',
    type: 'created',
    fromStatus: null,
    toStatus: 'rusak',
    note: null,
    createdAt: BASE_TIME,
    ...overrides,
  };
}
