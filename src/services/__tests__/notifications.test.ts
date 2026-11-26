jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  addNotificationResponseReceivedListener: jest.fn(),
  getLastNotificationResponseAsync: jest.fn(),
  clearLastNotificationResponseAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DATE: 'date' },
  AndroidImportance: { HIGH: 4 },
}));

import * as Notifications from 'expo-notifications';
import { makeItem } from '../../test/factories';
import { createExpoNotificationService } from '../notifications';

const scheduleMock = Notifications.scheduleNotificationAsync as jest.Mock;
const cancelMock = Notifications.cancelScheduledNotificationAsync as jest.Mock;
const getPermissionsMock = Notifications.getPermissionsAsync as jest.Mock;
const requestPermissionsMock = Notifications.requestPermissionsAsync as jest.Mock;
const channelMock = Notifications.setNotificationChannelAsync as jest.Mock;
const addListenerMock = Notifications.addNotificationResponseReceivedListener as jest.Mock;
const lastResponseMock = Notifications.getLastNotificationResponseAsync as jest.Mock;
const clearLastResponseMock = Notifications.clearLastNotificationResponseAsync as jest.Mock;

const FUTURE = '2027-01-01T09:00:00+07:00';
const PAST = '2020-01-01T09:00:00+07:00';

beforeEach(() => {
  jest.clearAllMocks();
  getPermissionsMock.mockResolvedValue({ granted: true, canAskAgain: false });
  requestPermissionsMock.mockResolvedValue({ granted: true, canAskAgain: false });
  scheduleMock.mockResolvedValue('notif-1');
  addListenerMock.mockReturnValue({ remove: jest.fn() });
  lastResponseMock.mockResolvedValue(null);
});

describe('notification service', () => {
  it('reads permission without prompting', async () => {
    const service = createExpoNotificationService();

    await expect(service.getPermission()).resolves.toEqual({
      granted: true,
      canAskAgain: false,
    });
    expect(getPermissionsMock).toHaveBeenCalledTimes(1);
    expect(requestPermissionsMock).not.toHaveBeenCalled();
  });

  it('creates the Android channel before requesting permission', async () => {
    getPermissionsMock.mockResolvedValue({ granted: false, canAskAgain: true });
    const service = createExpoNotificationService();

    await expect(service.requestPermission()).resolves.toEqual({
      granted: true,
      canAskAgain: false,
    });
    expect(channelMock).toHaveBeenCalledWith(
      'perbaikan',
      expect.objectContaining({ importance: 4 }),
    );
    expect(channelMock.mock.invocationCallOrder[0]).toBeLessThan(
      requestPermissionsMock.mock.invocationCallOrder[0],
    );
  });

  it('schedules a future reminder with the item id', async () => {
    const service = createExpoNotificationService();
    const item = makeItem({ reminderAt: FUTURE });

    await expect(service.schedule(item)).resolves.toEqual({ ok: true, id: 'notif-1' });
    expect(scheduleMock).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          title: 'Pengingat perbaikan',
          data: { itemId: 'item-1' },
        }),
        trigger: expect.objectContaining({
          type: 'date',
          channelId: 'perbaikan',
        }),
      }),
    );
  });

  it('does not schedule completed or past reminders', async () => {
    const service = createExpoNotificationService();

    await expect(
      service.schedule(makeItem({ status: 'selesai', reminderAt: FUTURE })),
    ).resolves.toEqual({ ok: false, reason: 'not-scheduled' });
    await expect(service.schedule(makeItem({ reminderAt: PAST }))).resolves.toEqual({
      ok: false,
      reason: 'not-scheduled',
    });
    expect(scheduleMock).not.toHaveBeenCalled();
  });

  it('cancels only real ids', async () => {
    const service = createExpoNotificationService();

    await service.cancel(null);
    expect(cancelMock).not.toHaveBeenCalled();

    await service.cancel('notif-1');
    expect(cancelMock).toHaveBeenCalledWith('notif-1');
  });

  it('cancels the previous id before syncing', async () => {
    const service = createExpoNotificationService();

    await service.syncForItem(makeItem({ reminderAt: FUTURE }), 'old-notif');

    expect(cancelMock).toHaveBeenCalledWith('old-notif');
    expect(cancelMock.mock.invocationCallOrder[0]).toBeLessThan(
      scheduleMock.mock.invocationCallOrder[0],
    );
  });

  it('forwards notification taps and clears the last response', async () => {
    const onOpen = jest.fn();
    const response = {
      notification: { request: { content: { data: { itemId: 'item-1' } } } },
    };
    lastResponseMock.mockResolvedValue(response);
    const service = createExpoNotificationService();

    const unsubscribe = service.observe(onOpen);
    await Promise.resolve();

    expect(onOpen).toHaveBeenCalledWith('item-1');
    expect(clearLastResponseMock).toHaveBeenCalled();

    unsubscribe();
    expect(addListenerMock.mock.results[0].value.remove).toHaveBeenCalled();
  });

  it('returns a typed failure when scheduling rejects', async () => {
    scheduleMock.mockRejectedValueOnce(new Error('native failure'));
    const service = createExpoNotificationService();

    await expect(service.schedule(makeItem({ reminderAt: FUTURE }))).resolves.toEqual({
      ok: false,
      reason: 'native failure',
    });
  });
});
