import type { ReactElement } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import { render } from '@testing-library/react-native';
import { FeedbackProvider } from '../shell/FeedbackProvider';
import { RootNavigator } from '../shell/RootNavigator';
import { ServicesProvider } from '../shell/ServicesProvider';
import type { ItemRepository } from '../domain/repository';
import type { NotificationService, PhotoStore } from '../services/types';
import { navigationTheme } from '../theme/navigationTheme';
import { lightTheme } from '../theme/lightTheme';
import { createFakeNotifications, createFakePhotos } from './fakes';

export function renderWithProviders(ui: ReactElement) {
  return render(<PaperProvider theme={lightTheme}>{ui}</PaperProvider>);
}

export type RenderAppOptions = {
  repository: ItemRepository;
  now: Date;
  notifications?: NotificationService;
  photos?: PhotoStore;
  initialRouteName?: 'Tabs' | 'ItemDetail' | 'ItemForm';
  initialParams?: { itemId?: string };
};

export function renderApp(options: RenderAppOptions) {
  const services = {
    repository: options.repository,
    notifications: options.notifications ?? createFakeNotifications(),
    photos: options.photos ?? createFakePhotos(),
    now: () => options.now,
  };

  return render(
    <PaperProvider theme={lightTheme}>
      <ServicesProvider services={services}>
        <FeedbackProvider>
          <NavigationContainer theme={navigationTheme.light}>
            <RootNavigator
              initialRouteName={options.initialRouteName}
              initialParams={options.initialParams}
            />
          </NavigationContainer>
        </FeedbackProvider>
      </ServicesProvider>
    </PaperProvider>,
  );
}
