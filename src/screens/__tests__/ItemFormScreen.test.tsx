import { fireEvent, screen } from '@testing-library/react-native';
import {
  createFakeItemRepository,
  createFakeNotifications,
  createFakePhotos,
} from '../../test/fakes';
import type { FakeNotifications, FakePhotos } from '../../test/fakes';
import { makeItem } from '../../test/factories';
import { renderApp } from '../../test/renderWithProviders';
import type { Item } from '../../domain/types';

const NOW = new Date('2026-11-25T10:00:00+07:00');

async function renderForm(
  item: Item | null = null,
  options: { notifications?: FakeNotifications; photos?: FakePhotos } = {},
) {
  const repository = createFakeItemRepository(item === null ? [] : [item]);
  const notifications = options.notifications ?? createFakeNotifications();
  const photos = options.photos ?? createFakePhotos();

  await renderApp({
    repository,
    now: NOW,
    notifications,
    photos,
    initialRouteName: 'ItemForm',
    initialParams: item === null ? {} : { itemId: item.id },
  });

  if (item !== null) {
    await screen.findByDisplayValue(item.name);
  } else {
    await screen.findByText('Tambah Barang');
  }

  return { repository, notifications, photos };
}

describe('ItemFormScreen', () => {
  it('renders the add form with defaults', async () => {
    await renderForm();

    expect(screen.getByText('Tambah Barang')).toBeOnTheScreen();
    expect(screen.getByLabelText('Nama barang')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Simpan' })).toBeOnTheScreen();
  });

  it('blocks save with an empty name', async () => {
    const { repository } = await renderForm();
    const createSpy = jest.spyOn(repository, 'create');

    await fireEvent.press(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByText('Nama barang wajib diisi (3–60 karakter).')).toBeOnTheScreen();
    expect(createSpy).not.toHaveBeenCalled();
  });

  it('creates an item and replaces the form with its detail screen', async () => {
    const { repository } = await renderForm();

    await fireEvent.changeText(screen.getByLabelText('Nama barang'), 'Lampu baru');
    await fireEvent.changeText(screen.getByLabelText('Estimasi biaya'), '45.000');
    await fireEvent.press(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByText('Mulai perbaikan')).toBeOnTheScreen();
    const items = await repository.list();
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ name: 'Lampu baru', estimatedCost: 45000 });
  });

  it('prefills and updates an existing item', async () => {
    const { repository } = await renderForm(makeItem());

    expect(screen.getByDisplayValue('Lampu kamar mati')).toBeOnTheScreen();
    await fireEvent.changeText(screen.getByLabelText('Nama barang'), 'Lampu baru');
    await fireEvent.press(screen.getByRole('button', { name: 'Simpan' }));

    expect((await repository.get('item-1'))?.name).toBe('Lampu baru');
  });

  it('picks and saves a photo', async () => {
    const photos = createFakePhotos();
    photos.setNextPick('file:///cache/pick.jpg');
    const { repository } = await renderForm(null, { photos });

    await fireEvent.changeText(screen.getByLabelText('Nama barang'), 'Lampu baru');
    await fireEvent.press(screen.getByText('Kamera'));

    expect(await screen.findByLabelText('Foto barang')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Simpan' }));
    await screen.findByText('Mulai perbaikan');

    expect(photos.saved).toEqual([
      { tempUri: 'file:///cache/pick.jpg', itemId: (await repository.list())[0].id },
    ]);
  });

  it('turns the reminder off when permission is denied', async () => {
    const notifications = createFakeNotifications();
    notifications.setPermission({ granted: false, canAskAgain: true });
    await renderForm(null, { notifications });

    await fireEvent(screen.getByLabelText('Aktifkan pengingat'), 'valueChange', true);

    expect(await screen.findByText('Izin pengingat tidak aktif')).toBeOnTheScreen();
    expect(screen.getByLabelText('Aktifkan pengingat').props.value).toBe(false);
  });

  it('schedules a future reminder and stores its id', async () => {
    const { repository, notifications } = await renderForm();

    await fireEvent.changeText(screen.getByLabelText('Nama barang'), 'Lampu baru');
    await fireEvent(screen.getByLabelText('Aktifkan pengingat'), 'valueChange', true);
    await fireEvent.press(screen.getByRole('button', { name: 'Simpan' }));
    await screen.findByText('Mulai perbaikan');

    expect(notifications.scheduled).toHaveLength(1);
    expect((await repository.list())[0].reminderNotificationId).toBe(notifications.scheduled[0]);
  });

  it('rejects a past reminder date', async () => {
    const { repository } = await renderForm();
    const createSpy = jest.spyOn(repository, 'create');

    await fireEvent.changeText(screen.getByLabelText('Nama barang'), 'Lampu baru');
    await fireEvent(screen.getByLabelText('Aktifkan pengingat'), 'valueChange', true);
    await fireEvent.press(screen.getByRole('button', { name: 'Pilih waktu' }));
    await fireEvent(
      screen.getByTestId('reminder-picker'),
      'onChange',
      { type: 'set' },
      new Date('2020-01-01T09:00:00+07:00'),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByText('Pengingat harus di masa depan.')).toBeOnTheScreen();
    expect(createSpy).not.toHaveBeenCalled();
  });

  it('still saves the item when scheduling fails', async () => {
    const notifications = createFakeNotifications();
    notifications.setScheduleFailure('gagal');
    const { repository } = await renderForm(null, { notifications });

    await fireEvent.changeText(screen.getByLabelText('Nama barang'), 'Lampu baru');
    await fireEvent(screen.getByLabelText('Aktifkan pengingat'), 'valueChange', true);
    await fireEvent.press(screen.getByRole('button', { name: 'Simpan' }));
    await screen.findByText('Mulai perbaikan');

    expect(await screen.findByText('Pengingat gagal dijadwalkan')).toBeOnTheScreen();
    expect((await repository.list())[0].reminderNotificationId).toBeNull();
  });

  it('starts with the reminder off for an expired reminder', async () => {
    const { repository } = await renderForm(makeItem({ reminderAt: '2026-11-24T09:00:00+07:00' }));
    const setReminderSpy = jest.spyOn(repository, 'setReminder');

    expect(screen.getByLabelText('Aktifkan pengingat').props.value).toBe(false);
    await fireEvent.press(screen.getByRole('button', { name: 'Simpan' }));

    expect(setReminderSpy).toHaveBeenCalledWith('item-1', null, null);
  });
});
