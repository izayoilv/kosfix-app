import { render, waitFor } from '@testing-library/react-native';
import type { NavigationContainerRef } from '@react-navigation/native';
import { ServicesProvider } from '../ServicesProvider';
import { useNotificationObserver } from '../notificationObserver';
import type { RootStackParamList } from '../RootNavigator';
import {
  createFakeItemRepository,
  createFakeNotifications,
  createFakePhotos,
} from '../../test/fakes';
import { makeItem } from '../../test/factories';

const NOW = new Date('2026-11-25T10:00:00+07:00');

function makeRef() {
  return {
    isReady: () => true,
    navigate: jest.fn(),
  } as unknown as NavigationContainerRef<RootStackParamList>;
}

function ObserverHost({
  navigationRef,
}: {
  navigationRef: NavigationContainerRef<RootStackParamList>;
}) {
  useNotificationObserver(navigationRef);
  return null;
}

function servicesFor(repositoryItems = [makeItem()]) {
  return {
    repository: createFakeItemRepository(repositoryItems),
    notifications: createFakeNotifications(),
    photos: createFakePhotos(),
    now: () => NOW,
  };
}

describe('useNotificationObserver', () => {
  it('opens an existing item', async () => {
    const services = servicesFor();
    const navigationRef = makeRef();

    await render(
      <ServicesProvider services={services}>
        <ObserverHost navigationRef={navigationRef} />
      </ServicesProvider>,
    );

    services.notifications.open('item-1');

    await waitFor(() => {
      expect(navigationRef.navigate).toHaveBeenCalledWith('ItemDetail', { itemId: 'item-1' });
    });
  });

  it('ignores an item that no longer exists', async () => {
    const services = servicesFor([]);
    const navigationRef = makeRef();

    await render(
      <ServicesProvider services={services}>
        <ObserverHost navigationRef={navigationRef} />
      </ServicesProvider>,
    );

    services.notifications.open('missing');

    await waitFor(() => {
      expect(navigationRef.navigate).not.toHaveBeenCalled();
    });
  });

  it('unsubscribes on unmount', async () => {
    const services = servicesFor();
    const navigationRef = makeRef();

    const { unmount } = await render(
      <ServicesProvider services={services}>
        <ObserverHost navigationRef={navigationRef} />
      </ServicesProvider>,
    );

    await unmount();

    await waitFor(() => {
      expect(services.notifications.unsubscribeCount).toBe(1);
    });
  });
});
