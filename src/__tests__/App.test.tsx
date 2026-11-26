import { render, screen } from '@testing-library/react-native';
import App from '../../App';

describe('App', () => {
  it('renders the KosFix wordmark', async () => {
    await render(<App />);

    expect(screen.getByText('KosFix')).toBeOnTheScreen();
  });
});
