import type { ItemRepository } from '../domain/repository';
import { canTransition } from '../domain/status';
import type { Item, ItemStatus, ItemUpdate, NewItem, RecentEvent } from '../domain/types';
import type {
  NotificationService,
  PermissionResult,
  PhotoStore,
  ScheduleResult,
} from '../services/types';

export type FakeItemRepository = ItemRepository & {
  seedEvents: (events: RecentEvent[]) => void;
};

let idCounter = 0;

function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

export function createFakeItemRepository(initialItems: Item[] = []): FakeItemRepository {
  let items = initialItems.map((item) => ({ ...item }));
  let events: RecentEvent[] = [];

  const find = (id: string) => items.find((item) => item.id === id);

  return {
    seedEvents: (nextEvents) => {
      events = [...events, ...nextEvents];
    },
    list: async () => [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    get: async (id) => find(id) ?? null,
    create: async (input: NewItem) => {
      const timestamp = new Date().toISOString();
      const item: Item = {
        id: nextId('fake'),
        ...input,
        status: 'rusak',
        reminderNotificationId: null,
        createdAt: timestamp,
        updatedAt: timestamp,
        completedAt: null,
      };
      items = [...items, item];
      events = [
        ...events,
        {
          id: nextId('event'),
          itemId: item.id,
          type: 'created',
          fromStatus: null,
          toStatus: 'rusak',
          note: null,
          createdAt: timestamp,
          itemName: item.name,
        },
      ];
      return item;
    },
    update: async (id: string, input: ItemUpdate) => {
      const existing = find(id);
      if (existing === undefined) throw new Error('Item not found');
      const timestamp = new Date().toISOString();
      const updated: Item = { ...existing, ...input, updatedAt: timestamp };
      items = items.map((item) => (item.id === id ? updated : item));
      return updated;
    },
    changeStatus: async (id, next: ItemStatus, options = {}) => {
      const existing = find(id);
      if (existing === undefined) throw new Error('Item not found');
      if (!canTransition(existing.status, next)) throw new Error('Invalid transition');
      const timestamp = new Date().toISOString();
      const updated: Item = {
        ...existing,
        status: next,
        actualCost: options.actualCost === undefined ? existing.actualCost : options.actualCost,
        completedAt: next === 'selesai' ? timestamp : null,
        reminderAt: next === 'selesai' ? null : existing.reminderAt,
        reminderNotificationId: next === 'selesai' ? null : existing.reminderNotificationId,
        updatedAt: timestamp,
      };
      items = items.map((item) => (item.id === id ? updated : item));
      events = [
        ...events,
        {
          id: nextId('event'),
          itemId: id,
          type: 'status_changed',
          fromStatus: existing.status,
          toStatus: next,
          note: null,
          createdAt: timestamp,
          itemName: updated.name,
        },
      ];
      return updated;
    },
    setReminder: async (id, reminderAt, notificationId) => {
      const existing = find(id);
      if (existing === undefined) throw new Error('Item not found');
      const updated: Item = {
        ...existing,
        reminderAt,
        reminderNotificationId: notificationId,
        updatedAt: new Date().toISOString(),
      };
      items = items.map((item) => (item.id === id ? updated : item));
      return updated;
    },
    remove: async (id) => {
      items = items.filter((item) => item.id !== id);
      events = events.filter((event) => event.itemId !== id);
    },
    eventsFor: async (id) =>
      events
        .filter((event) => event.itemId === id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    recentEvents: async (limit) => events.slice(0, limit),
  };
}

export type FakeNotifications = NotificationService & {
  scheduled: string[];
  cancelled: string[];
  setPermission: (permission: PermissionResult) => void;
  setScheduleFailure: (failure: string | null) => void;
  open: (itemId: string) => void;
};

export function createFakeNotifications(): FakeNotifications {
  let permission: PermissionResult = { granted: true, canAskAgain: true };
  let scheduleFailure: string | null = null;
  let scheduled: string[] = [];
  let cancelled: string[] = [];
  let observer: ((itemId: string) => void) | null = null;

  const service: FakeNotifications = {
    get scheduled() {
      return scheduled;
    },
    get cancelled() {
      return cancelled;
    },
    ensureChannel: async () => undefined,
    getPermission: async () => permission,
    requestPermission: async () => permission,
    schedule: async (item): Promise<ScheduleResult> => {
      if (scheduleFailure !== null) return { ok: false, reason: scheduleFailure };
      if (item.status === 'selesai' || item.reminderAt === null) {
        return { ok: false, reason: 'not-scheduled' };
      }
      const id = nextId('notification');
      scheduled = [...scheduled, id];
      return { ok: true, id };
    },
    cancel: async (id) => {
      if (id !== null) cancelled = [...cancelled, id];
    },
    syncForItem: async (item, previousId) => {
      if (previousId !== null) {
        cancelled = [...cancelled, previousId];
      }
      return service.schedule(item);
    },
    observe: (onOpen) => {
      observer = onOpen;
      return () => {
        observer = null;
      };
    },
    setPermission: (next) => {
      permission = next;
    },
    setScheduleFailure: (failure) => {
      scheduleFailure = failure;
    },
    open: (itemId) => {
      observer?.(itemId);
    },
  };

  return service;
}

export type FakePhotos = PhotoStore & {
  saved: { tempUri: string; itemId: string }[];
  removed: (string | null)[];
  setNextPick: (uri: string | null) => void;
  setPendingPick: (uri: string | null) => void;
};

export function createFakePhotos(): FakePhotos {
  let nextPick: string | null = null;
  let pendingPick: string | null = null;
  let saved: { tempUri: string; itemId: string }[] = [];
  let removed: (string | null)[] = [];

  const pick = async () => nextPick;
  const photoService: FakePhotos = {
    get saved() {
      return saved;
    },
    get removed() {
      return removed;
    },
    pickFromCamera: pick,
    pickFromLibrary: pick,
    restorePendingPickerResult: async () => pendingPick,
    save: async (tempUri, itemId) => {
      saved = [...saved, { tempUri, itemId }];
      return `photos/${itemId}.jpg`;
    },
    remove: async (path) => {
      removed = [...removed, path];
    },
    resolve: (path) => (path === null ? null : `file:///documents/${path}`),
    setNextPick: (uri) => {
      nextPick = uri;
    },
    setPendingPick: (uri) => {
      pendingPick = uri;
    },
  };

  return photoService;
}
