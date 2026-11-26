import { createSqliteItemRepository } from '../data/itemRepository';
import { openDatabase } from '../data/database';
import { migrate } from '../data/migrations';
import { seedIfNeeded } from '../data/seed';
import {
  configureNotificationHandler,
  createExpoNotificationService,
} from '../services/notifications';
import { createExpoPhotoService } from '../services/photos';
import type { Services } from '../services/types';

export async function createAppServices(): Promise<Services> {
  const db = await openDatabase();
  await migrate(db);
  await seedIfNeeded(db);

  const notifications = createExpoNotificationService();
  await notifications.ensureChannel();
  configureNotificationHandler();

  return {
    repository: createSqliteItemRepository(db),
    notifications,
    photos: createExpoPhotoService(),
    now: () => new Date(),
  };
}
