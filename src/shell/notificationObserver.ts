import { useEffect } from 'react';
import type { NavigationContainerRef } from '@react-navigation/native';
import { useServices } from './ServicesProvider';
import type { RootStackParamList } from './RootNavigator';

export function useNotificationObserver(
  navigationRef: NavigationContainerRef<RootStackParamList>,
): void {
  const { notifications, repository } = useServices();

  useEffect(() => {
    const unsubscribe = notifications.observe((itemId) => {
      if (itemId.length === 0) {
        return;
      }

      void repository
        .get(itemId)
        .then((item) => {
          if (item !== null && navigationRef.isReady()) {
            navigationRef.navigate('ItemDetail', { itemId: item.id });
          }
        })
        .catch(() => undefined);
    });

    return unsubscribe;
  }, [navigationRef, notifications, repository]);
}

export function NotificationObserver({
  navigationRef,
}: {
  navigationRef: NavigationContainerRef<RootStackParamList>;
}) {
  useNotificationObserver(navigationRef);
  return null;
}
