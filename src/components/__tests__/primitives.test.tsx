import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders } from '../../test/renderWithProviders';
import { EmptyState } from '../EmptyState';
import { MoneyText } from '../MoneyText';
import { OverdueLabel } from '../OverdueLabel';
import { PriorityBadge } from '../PriorityBadge';
import { StatTile } from '../StatTile';
import { StatusBadge } from '../StatusBadge';

describe('shared primitives', () => {
  it('renders status labels', async () => {
    await renderWithProviders(<StatusBadge status="rusak" />);
    expect(screen.getByText('Rusak')).toBeOnTheScreen();
  });

  it('renders priority labels', async () => {
    await renderWithProviders(<PriorityBadge priority="tinggi" />);
    expect(screen.getByText('Tinggi')).toBeOnTheScreen();
  });

  it('shows the overdue label only when visible', async () => {
    const { rerender } = await renderWithProviders(<OverdueLabel visible />);
    expect(screen.getByText('Terlambat')).toBeOnTheScreen();
    await rerender(<OverdueLabel visible={false} />);
    expect(screen.queryByText('Terlambat')).not.toBeOnTheScreen();
  });

  it('formats money and handles null', async () => {
    const { rerender } = await renderWithProviders(<MoneyText value={45000} />);
    expect(screen.getByText('Rp 45.000')).toBeOnTheScreen();
    await rerender(<MoneyText value={null} />);
    expect(screen.getByText('—')).toBeOnTheScreen();
  });

  it('renders a stat tile with an accessible label', async () => {
    await renderWithProviders(<StatTile label="Rusak" value="3" unit="barang" />);
    expect(screen.getByLabelText('Rusak, 3 barang')).toBeOnTheScreen();
  });

  it('renders an empty state and handles its action', async () => {
    const onAction = jest.fn();
    await renderWithProviders(
      <EmptyState
        icon="package-variant-closed"
        title="Belum ada barang"
        body="Tambahkan barang pertama."
        actionLabel="Tambah barang"
        onAction={onAction}
      />,
    );
    fireEvent.press(screen.getByText('Tambah barang'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
