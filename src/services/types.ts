import type { ItemRepository } from '../domain/repository';
import type { Item } from '../domain/types';

export interface PermissionResult {
  granted: boolean;
  canAskAgain: boolean;
}

export type ScheduleResult = { ok: true; id: string } | { ok: false; reason: string };

export interface NotificationService {
  ensureChannel(): Promise<void>;
  getPermission(): Promise<PermissionResult>;
  requestPermission(): Promise<PermissionResult>;
  schedule(item: Item): Promise<ScheduleResult>;
  cancel(id: string | null): Promise<void>;
  syncForItem(item: Item, previousId: string | null): Promise<ScheduleResult>;
  observe(onOpen: (itemId: string) => void): () => void;
}

export interface PhotoStore {
  pickFromCamera(): Promise<string | null>;
  pickFromLibrary(): Promise<string | null>;
  restorePendingPickerResult(): Promise<string | null>;
  save(tempUri: string, itemId: string): Promise<string>;
  remove(path: string | null): Promise<void>;
  resolve(path: string | null): string | null;
}

export interface Services {
  repository: ItemRepository;
  notifications: NotificationService;
  photos: PhotoStore;
  now: () => Date;
}
