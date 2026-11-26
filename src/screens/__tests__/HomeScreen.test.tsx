import { fireEvent, screen } from '@testing-library/react-native';
import { createFakeItemRepository } from '../../test/fakes';
import { renderApp } from '../../test/renderWithProviders';
import { makeItem, makeRecentEvent } from '../../test/factories';

const NOW = new Date('2026-11-25T10:00:00+07:00');

describe('HomeScreen', () => {
  it('shows summary, urgent items, and recent activity', async () => {
    const repository = createFakeItemRepository([
      makeItem({
        id: '1',
        name: 'Lampu kamar mati',
        status: 'rusak',
        priority: 'tinggi',
        targetDate: '2026-11-30',
      }),
      makeItem({
        id: '2',
        name: 'Kursi goyang',
        status: 'dikerjakan',
        priority: 'sedang',
        targetDate: '2026-11-30',
      }),
      makeItem({
        id: '3',
        name: 'Keran dapur',
        status: 'selesai',
        targetDate: '2026-11-01',
      }),
    ]);
    repository.seedEvents([
      makeRecentEvent({
        id: 'e1',
        itemId: '3',
        itemName: 'Keran dapur',
        type: 'status_changed',
        fromStatus: 'dikerjakan',
        toStatus: 'selesai',
      }),
    ]);

    await renderApp({ repository, now: NOW });

    expect(await screen.findByText('Lampu kamar mati')).toBeOnTheScreen();
    expect(screen.getByLabelText('Rusak, 1 barang')).toBeOnTheScreen();
    expect(screen.getByLabelText('Dikerjakan, 1 barang')).toBeOnTheScreen();
    expect(screen.getByLabelText('Selesai, 1 barang')).toBeOnTheScreen();
    expect(screen.getByText('Keran dapur')).toBeOnTheScreen();
    expect(screen.queryByText('Terlambat')).not.toBeOnTheScreen();
  });

  it('shows the empty state and navigates to the form', async () => {
    const repository = createFakeItemRepository([]);
    await renderApp({ repository, now: NOW });

    expect(await screen.findByText('Belum ada barang')).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Tambah barang'));
    expect(await screen.findByText('Tambah Barang')).toBeOnTheScreen();
  });
});
