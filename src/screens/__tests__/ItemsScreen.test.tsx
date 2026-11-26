import { fireEvent, screen } from '@testing-library/react-native';
import { createFakeItemRepository } from '../../test/fakes';
import { makeItem } from '../../test/factories';
import { renderApp } from '../../test/renderWithProviders';

const NOW = new Date('2026-11-25T10:00:00+07:00');

async function renderItems() {
  const repository = createFakeItemRepository([
    makeItem({
      id: '1',
      name: 'Lampu kamar mati',
      category: 'elektronik',
      status: 'rusak',
      targetDate: '2026-11-30',
    }),
    makeItem({
      id: '2',
      name: 'Kursi goyang',
      category: 'furnitur',
      status: 'dikerjakan',
      targetDate: '2026-11-30',
    }),
    makeItem({
      id: '3',
      name: 'Keran dapur',
      category: 'kamar_mandi',
      status: 'selesai',
      targetDate: '2026-11-01',
      notes: 'Keran bocor.',
    }),
  ]);

  await renderApp({ repository, now: NOW });
  await fireEvent.press(screen.getByRole('button', { name: /Barang, tab/ }));
  await screen.findByText('Lampu kamar mati');

  return repository;
}

describe('ItemsScreen', () => {
  it('lists all items', async () => {
    await renderItems();

    expect(await screen.findByText('Lampu kamar mati')).toBeOnTheScreen();
    expect(screen.getByText('Kursi goyang')).toBeOnTheScreen();
    expect(screen.getByText('Keran dapur')).toBeOnTheScreen();
  });

  it('filters by search query', async () => {
    await renderItems();

    await fireEvent.changeText(screen.getByPlaceholderText('Cari nama atau catatan...'), 'kursi');

    expect(await screen.findByText('Kursi goyang')).toBeOnTheScreen();
    expect(screen.queryByText('Lampu kamar mati')).not.toBeOnTheScreen();
  });

  it('filters by status chip', async () => {
    await renderItems();

    await fireEvent.press(screen.getByRole('button', { name: 'Selesai' }));

    expect(await screen.findByText('Keran dapur')).toBeOnTheScreen();
    expect(screen.queryByText('Lampu kamar mati')).not.toBeOnTheScreen();
  });

  it('filters by category menu', async () => {
    await renderItems();

    await fireEvent.press(screen.getByRole('button', { name: 'Kategori Furnitur' }));

    expect(await screen.findByText('Kursi goyang')).toBeOnTheScreen();
    expect(screen.queryByText('Lampu kamar mati')).not.toBeOnTheScreen();
  });

  it('shows a no-results state and resets filters', async () => {
    await renderItems();

    await fireEvent.changeText(screen.getByPlaceholderText('Cari nama atau catatan...'), 'lampu');
    await fireEvent.press(screen.getByRole('button', { name: 'Selesai' }));

    expect(await screen.findByText('Tidak ada barang yang cocok')).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Reset filter'));

    expect(await screen.findByText('Lampu kamar mati')).toBeOnTheScreen();
  });

  it('opens item detail', async () => {
    await renderItems();

    await fireEvent.press(screen.getByRole('button', { name: 'Lampu kamar mati' }));

    expect(await screen.findByText('Mulai perbaikan')).toBeOnTheScreen();
  });

  it('does not show overdue for a completed item', async () => {
    await renderItems();

    expect(screen.queryByText('Terlambat')).not.toBeOnTheScreen();
  });

  it('opens the add form from the FAB', async () => {
    await renderItems();

    await fireEvent.press(screen.getByLabelText('Tambah barang'));

    expect(await screen.findByText('Tambah Barang')).toBeOnTheScreen();
  });
});
