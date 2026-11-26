import type { ReactElement } from 'react';
import { PaperProvider } from 'react-native-paper';
import { render } from '@testing-library/react-native';
import { lightTheme } from '../theme/lightTheme';

export function renderWithProviders(ui: ReactElement) {
  return render(<PaperProvider theme={lightTheme}>{ui}</PaperProvider>);
}
