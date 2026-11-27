import { render, screen } from '@testing-library/react-native';
import { LoadingScreen } from '../LoadingScreen';

describe('LoadingScreen', () => {
  it('shows the branded loading state', async () => {
    await render(<LoadingScreen label="Memuat data..." />);

    expect(screen.getByTestId('loading-screen')).toBeOnTheScreen();
    expect(screen.getByText('Memuat data...')).toBeOnTheScreen();
    expect(screen.getByLabelText('KosFix')).toBeOnTheScreen();
  });
});
