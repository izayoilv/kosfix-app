import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';
import { LOCATION_LABELS } from '../domain/labels';
import { shouldScheduleReminder } from '../domain/reminder';
import type { Item } from '../domain/types';
import type { NotificationService, PermissionResult, ScheduleResult } from './types';

const CHANNEL_ID = 'perbaikan';

function permissionResult(status: Notifications.NotificationPermissionsStatus): PermissionResult {
  return {
    granted: status.granted,
    canAskAgain: status.canAskAgain,
  };
}

function errorReason(error: unknown): string {
  return error instanceof Error ? error.message : 'notification-failed';
}

export function configureNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export function createExpoNotificationService(): NotificationService {
  async function ensureChannel(): Promise<void> {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Pengingat perbaikan',
      importance: AndroidImportance.HIGH,
    });
  }

  async function getPermission(): Promise<PermissionResult> {
    return permissionResult(await Notifications.getPermissionsAsync());
  }

  async function requestPermission(): Promise<PermissionResult> {
    await ensureChannel();
    const current = await Notifications.getPermissionsAsync();

    if (current.granted) {
      return permissionResult(current);
    }

    return permissionResult(await Notifications.requestPermissionsAsync());
  }

  async function schedule(item: Item): Promise<ScheduleResult> {
    if (!shouldScheduleReminder(item, new Date()) || item.reminderAt === null) {
      return { ok: false, reason: 'not-scheduled' };
    }

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Pengingat perbaikan',
          body: `${item.name} di ${LOCATION_LABELS[item.location]}`,
          data: { itemId: item.id },
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(item.reminderAt),
          channelId: CHANNEL_ID,
        },
      });

      return { ok: true, id };
    } catch (error) {
      return { ok: false, reason: errorReason(error) };
    }
  }

  async function cancel(id: string | null): Promise<void> {
    if (id === null) {
      return;
    }

    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {
      // A missing notification is already canceled from the app's point of view.
    }
  }

  async function syncForItem(item: Item, previousId: string | null): Promise<ScheduleResult> {
    await cancel(previousId);
    return schedule(item);
  }

  function observe(onOpen: (itemId: string) => void): () => void {
    const handleResponse = (response: Notifications.NotificationResponse) => {
      const itemId = response.notification.request.content.data?.itemId;

      if (typeof itemId === 'string' && itemId.length > 0) {
        onOpen(itemId);
      }
    };

    const subscription = Notifications.addNotificationResponseReceivedListener(handleResponse);

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response !== null) {
        handleResponse(response);
        void Notifications.clearLastNotificationResponseAsync();
      }
    });

    return () => {
      subscription.remove();
    };
  }

  return {
    ensureChannel,
    getPermission,
    requestPermission,
    schedule,
    cancel,
    syncForItem,
    observe,
  };
}
