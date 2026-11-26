import { fireEvent, screen } from '@testing-library/react-native';
import { createFakeItemRepository, createFakeNotifications } from '../../test/fakes';
import type { FakeNotifications } from '../../test/fakes';
import { makeItem, makeRecentEvent } from '../../test/factories';
import { renderApp } from '../../test/renderWithProviders';
import type { Item } from '../../domain/types';

const NOW = new Date('2026-11-25T10:00:00+07:00');

async function renderDetail(
  item: Item | null,
  options: { notifications?: FakeNotifications; itemId?: string } = {},
) {
  const itemId = options.itemId ?? item?.id ?? 'item-1';
  const repository = createFakeItemRepository(item === null ? [] : [item]);
  const notifications = options.notifications ?? createFakeNotifications();

  if (item !== null) {
    repository.seedEvents([
      makeRecentEvent({
        id: `event-${item.id}`,
        itemId: item.id,
        itemName: item.name,
        type: 'created',
        toStatus: 'rusak',
        createdAt: '2026-11-20T03:00:00.000Z',
      }),
    ]);
  }

  await renderApp({
    repository,
    now: NOW,
    notifications,
    initialRouteName: 'ItemDetail',
    initialParams: { itemId },
  });

  return { repository, notifications };
}

describe('ItemDetailScreen', () => {
  it('renders item details and the start action', async () => {
    await renderDetail(makeItem());

    expect(await screen.findByText('Lampu kamar mati')).toBeOnTheScreen();
    expect(screen.getByText('Elektronik · Kamar')).toBeOnTheScreen();
    expect(screen.getByText('Tinggi')).toBeOnTheScreen();
    expect(screen.getByText('Rusak')).toBeOnTheScreen();
    expect(screen.getByText('Rp 45.000')).toBeOnTheScreen();
    expect(screen.getByText('Lampu utama mati.')).toBeOnTheScreen();
    expect(screen.getByText('Dibuat')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Mulai perbaikan' })).toBeOnTheScreen();
  });

  it('starts a repair', async () => {
    const { repository } = await renderDetail(makeItem());

    await fireEvent.press(screen.getByRole('button', { name: 'Mulai perbaikan' }));

    expect((await repository.get('item-1'))?.status).toBe('dikerjakan');
    expect(await screen.findByText('Tandai selesai')).toBeOnTheScreen();
  });

  it('completes a repair with an actual cost', async () => {
    const { repository } = await renderDetail(makeItem({ status: 'dikerjakan' }));

    await fireEvent.press(screen.getByRole('button', { name: 'Tandai selesai' }));

    await fireEvent.changeText(screen.getByLabelText('Biaya aktual'), '40000');
    await fireEvent.press(screen.getByTestId('confirm-complete'));

    expect((await repository.get('item-1'))?.status).toBe('selesai');
    expect((await repository.get('item-1'))?.actualCost).toBe(40000);
    expect(await screen.findByText('Buka kembali')).toBeOnTheScreen();
  });

  it('reopens a completed repair', async () => {
    const { repository } = await renderDetail(makeItem({ status: 'selesai' }));

    await fireEvent.press(screen.getByRole('button', { name: 'Buka kembali' }));

    expect((await repository.get('item-1'))?.status).toBe('dikerjakan');
    expect(await screen.findByText('Tandai selesai')).toBeOnTheScreen();
  });

  it('opens the edit form', async () => {
    await renderDetail(makeItem());

    await fireEvent.press(screen.getByRole('button', { name: 'Ubah' }));

    expect(await screen.findByText('Tambah Barang')).toBeOnTheScreen();
  });

  it('deletes the item after confirmation', async () => {
    const { repository } = await renderDetail(makeItem());

    await fireEvent.press(screen.getByRole('button', { name: 'Hapus' }));
    await fireEvent.press(screen.getByTestId('confirm-delete'));

    expect(await repository.get('item-1')).toBeNull();
  });

  it('shows a not-found state for a missing item', async () => {
    await renderDetail(null, { itemId: 'missing-item' });

    expect(await screen.findByText('Barang tidak ditemukan')).toBeOnTheScreen();
  });

  it('shows an expired reminder', async () => {
    await renderDetail(makeItem({ reminderAt: '2026-11-24T09:00:00+07:00' }));

    expect(await screen.findByText('Pengingat sudah lewat')).toBeOnTheScreen();
  });

  it('warns when notification permission is inactive', async () => {
    const notifications = createFakeNotifications();
    notifications.setPermission({ granted: false, canAskAgain: true });

    await renderDetail(makeItem({ reminderAt: '2026-11-26T09:00:00+07:00' }), {
      notifications,
    });

    expect(await screen.findByText('Izin pengingat tidak aktif')).toBeOnTheScreen();
  });

  it('does not show overdue for a completed item', async () => {
    await renderDetail(makeItem({ status: 'selesai', targetDate: '2026-11-01' }));

    expect(screen.queryByText('Terlambat')).not.toBeOnTheScreen();
  });
});
