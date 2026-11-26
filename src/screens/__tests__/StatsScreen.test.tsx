import { fireEvent, screen, within } from '@testing-library/react-native';
import { createFakeItemRepository } from '../../test/fakes';
import { makeItem } from '../../test/factories';
import { renderApp } from '../../test/renderWithProviders';

const NOW = new Date('2026-11-25T10:00:00+07:00');

async function renderStats(
  items = [
    makeItem({ id: '1', status: 'rusak', estimatedCost: 45000, actualCost: null }),
    makeItem({
      id: '2',
      status: 'rusak',
      estimatedCost: 80000,
      actualCost: null,
      category: 'furnitur',
    }),
    makeItem({
      id: '3',
      status: 'dikerjakan',
      estimatedCost: 35000,
      actualCost: 40000,
      category: 'bangunan',
    }),
    makeItem({ id: '4', status: 'selesai', estimatedCost: null, actualCost: null }),
  ],
) {
  const repository = createFakeItemRepository(items);
  await renderApp({ repository, now: NOW });
  await fireEvent.press(screen.getByRole('button', { name: /Statistik, tab/ }));

  return repository;
}

describe('StatsScreen', () => {
  it('shows an empty state when there is no data', async () => {
    await renderStats([]);

    expect(await screen.findByText('Belum ada data untuk dihitung')).toBeOnTheScreen();
  });

  it('shows totals, status counts, and costs', async () => {
    await renderStats();

    expect(await screen.findByText('Total 4 barang')).toBeOnTheScreen();
    expect(screen.getByTestId('status-count-rusak')).toHaveTextContent('2');
    expect(screen.getByTestId('status-count-dikerjakan')).toHaveTextContent('1');
    expect(screen.getByTestId('status-count-selesai')).toHaveTextContent('1');
    expect(screen.getByTestId('estimated-total')).toHaveTextContent('Rp 160.000');
    expect(screen.getByTestId('actual-total')).toHaveTextContent('Rp 40.000');
  });

  it('shows all five category rows and puts the highest count first', async () => {
    await renderStats();

    const rows = await screen.findAllByTestId('category-row');
    expect(rows).toHaveLength(5);
    expect(within(rows[0]).getByText('Elektronik')).toBeOnTheScreen();
    expect(within(rows[3]).getByText('Kamar mandi')).toBeOnTheScreen();
    expect(within(rows[4]).getByText('Lainnya')).toBeOnTheScreen();
  });
});
