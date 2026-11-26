import { fireEvent, screen } from '@testing-library/react-native';
import { makeItem } from '../../test/factories';
import { renderWithProviders } from '../../test/renderWithProviders';
import { ItemCard } from '../ItemCard';

describe('ItemCard', () => {
  it('renders the item, badges, cost, and overdue state', async () => {
    const onPress = jest.fn();
    await renderWithProviders(
      <ItemCard
        item={makeItem({ targetDate: '2026-11-24', estimatedCost: 45000 })}
        today="2026-11-25"
        resolvePhoto={() => null}
        onPress={onPress}
      />,
    );

    expect(screen.getByText('Lampu kamar mati')).toBeOnTheScreen();
    expect(screen.getByText('Elektronik · Kamar')).toBeOnTheScreen();
    expect(screen.getByText('Tinggi')).toBeOnTheScreen();
    expect(screen.getByText('Rusak')).toBeOnTheScreen();
    expect(screen.getByText('Rp 45.000')).toBeOnTheScreen();
    expect(screen.getByText('Terlambat')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Lampu kamar mati' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not show overdue for a completed item', async () => {
    await renderWithProviders(
      <ItemCard
        item={makeItem({ status: 'selesai', targetDate: '2026-11-01' })}
        today="2026-11-25"
        resolvePhoto={() => null}
        onPress={jest.fn()}
      />,
    );

    expect(screen.queryByText('Terlambat')).not.toBeOnTheScreen();
  });
});
