import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';
import { FeedbackProvider } from '../../shell/FeedbackProvider';
import { RootNavigator } from '../../shell/RootNavigator';
import type { RootStackParamList } from '../../shell/RootNavigator';
import { ServicesProvider } from '../../shell/ServicesProvider';
import {
  createFakeItemRepository,
  createFakeNotifications,
  createFakePhotos,
} from '../../test/fakes';
import { lightTheme } from '../../theme/lightTheme';
import { navigationTheme } from '../../theme/navigationTheme';

const NOW = new Date('2026-11-25T10:00:00+07:00');

describe('ItemFormScreen navigation', () => {
  it('replaces the form with the new item detail', async () => {
    const repository = createFakeItemRepository();
    const navigationRef = createNavigationContainerRef<RootStackParamList>();

    await render(
      <PaperProvider theme={lightTheme}>
        <ServicesProvider
          services={{
            repository,
            notifications: createFakeNotifications(),
            photos: createFakePhotos(),
            now: () => NOW,
          }}
        >
          <FeedbackProvider>
            <NavigationContainer ref={navigationRef} theme={navigationTheme.light}>
              <RootNavigator initialRouteName="ItemForm" initialParams={{}} />
            </NavigationContainer>
          </FeedbackProvider>
        </ServicesProvider>
      </PaperProvider>,
    );

    await fireEvent.changeText(screen.getByLabelText('Nama barang'), 'Lampu baru');
    await fireEvent.press(screen.getByRole('button', { name: 'Simpan' }));

    await waitFor(() => {
      expect(navigationRef.getRootState()?.routes.map((route) => route.name)).toEqual([
        'ItemDetail',
      ]);
    });
  });
});
