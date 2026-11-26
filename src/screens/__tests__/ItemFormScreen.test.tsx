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

  it('shows a load error and retries', async () => {
    const repository = createFakeItemRepository([makeItem()]);
    jest.spyOn(repository, 'get').mockRejectedValueOnce(new Error('db'));

    await renderApp({
      repository,
      now: NOW,
      initialRouteName: 'ItemForm',
      initialParams: { itemId: 'item-1' },
    });

    expect(await screen.findByText('Data gagal dimuat')).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Coba lagi'));

    expect(await screen.findByDisplayValue('Lampu kamar mati')).toBeOnTheScreen();
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
    expect(await screen.findByText('Barang ditambahkan.')).toBeOnTheScreen();
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
    expect(await screen.findByText('Perubahan disimpan.')).toBeOnTheScreen();
  });

  it('shows a message when the camera permission is denied', async () => {
    const photos = createFakePhotos();
    jest.spyOn(photos, 'pickFromCamera').mockRejectedValue(new Error('photo-permission'));
    await renderForm(null, { photos });

    await fireEvent.press(screen.getByText('Kamera'));

    expect(await screen.findByText('Izin kamera tidak aktif')).toBeOnTheScreen();
  });

  it('replaces an existing photo without deleting the freshly saved file', async () => {
    const photos = createFakePhotos();
    photos.setNextPick('file:///cache/replacement.jpg');
    const { repository } = await renderForm(makeItem({ photoPath: 'photos/item-1.jpg' }), {
      photos,
    });

    await fireEvent.press(screen.getByText('Ganti foto'));
    await fireEvent.press(screen.getByRole('button', { name: 'Simpan' }));
    await screen.findByText('Mulai perbaikan');

    expect(photos.saved).toEqual([{ tempUri: 'file:///cache/replacement.jpg', itemId: 'item-1' }]);
    expect(photos.removed).not.toContain('photos/item-1.jpg');
    expect((await repository.get('item-1'))?.photoPath).toBe('photos/item-1.jpg');
  });

  it('replaces an existing photo from the gallery', async () => {
    const photos = createFakePhotos();
    photos.setNextPick('file:///cache/gallery.jpg');
    const { repository } = await renderForm(makeItem({ photoPath: 'photos/item-1.jpg' }), {
      photos,
    });

    await fireEvent.press(screen.getByText('Galeri'));
    await fireEvent.press(screen.getByRole('button', { name: 'Simpan' }));
    await screen.findByText('Mulai perbaikan');

    expect(photos.saved).toEqual([{ tempUri: 'file:///cache/gallery.jpg', itemId: 'item-1' }]);
    expect(photos.removed).not.toContain('photos/item-1.jpg');
    expect((await repository.get('item-1'))?.photoPath).toBe('photos/item-1.jpg');
  });

  it('restores a pending picker result on mount', async () => {
    const photos = createFakePhotos();
    photos.setPendingPick('file:///cache/pending.jpg');
    await renderForm(null, { photos });

    expect(await screen.findByLabelText('Foto barang')).toBeOnTheScreen();
  });

  it('still saves the item when photo copy fails', async () => {
    const photos = createFakePhotos();
    photos.setNextPick('file:///cache/pick.jpg');
    jest.spyOn(photos, 'save').mockRejectedValue(new Error('copy'));
    const { repository } = await renderForm(null, { photos });

    await fireEvent.changeText(screen.getByLabelText('Nama barang'), 'Lampu baru');
    await fireEvent.press(screen.getByText('Kamera'));
    await fireEvent.press(screen.getByRole('button', { name: 'Simpan' }));
    await screen.findByText('Mulai perbaikan');

    expect(await screen.findByText('Foto gagal disimpan')).toBeOnTheScreen();
    expect((await repository.list())[0].photoPath).toBeNull();
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

  it('starts with the reminder off when notification permission is denied', async () => {
    const notifications = createFakeNotifications();
    notifications.setPermission({ granted: false, canAskAgain: true });
    const { repository } = await renderForm(makeItem({ reminderAt: '2026-11-26T09:00:00+07:00' }), {
      notifications,
    });
    const setReminderSpy = jest.spyOn(repository, 'setReminder');

    expect(await screen.findByText('Izin pengingat tidak aktif')).toBeOnTheScreen();
    expect(screen.getByLabelText('Aktifkan pengingat').props.value).toBe(false);

    await fireEvent.press(screen.getByRole('button', { name: 'Simpan' }));

    expect(setReminderSpy).toHaveBeenCalledWith('item-1', null, null);
  });

  it('schedules a future reminder and stores its id', async () => {
    const { repository, notifications } = await renderForm();
    const requestPermission = jest.spyOn(notifications, 'requestPermission');

    await fireEvent.changeText(screen.getByLabelText('Nama barang'), 'Lampu baru');
    await fireEvent(screen.getByLabelText('Aktifkan pengingat'), 'valueChange', true);
    await fireEvent.press(screen.getByRole('button', { name: 'Simpan' }));
    await screen.findByText('Mulai perbaikan');

    expect(requestPermission).toHaveBeenCalled();
    expect(notifications.scheduled).toHaveLength(1);
    expect((await repository.list())[0].reminderNotificationId).toBe(notifications.scheduled[0]);
  });

  it('rejects a past reminder date', async () => {
    const { repository } = await renderForm();
    const createSpy = jest.spyOn(repository, 'create');

    await fireEvent.changeText(screen.getByLabelText('Nama barang'), 'Lampu baru');
    await fireEvent(screen.getByLabelText('Aktifkan pengingat'), 'valueChange', true);
    await fireEvent.press(screen.getByRole('button', { name: 'Tanggal pengingat' }));
    await fireEvent(
      screen.getByTestId('reminder-date-picker'),
      'onChange',
      { type: 'set' },
      new Date('2020-01-01T09:00:00+07:00'),
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Simpan' }));

    expect(await screen.findByText('Pengingat harus di masa depan.')).toBeOnTheScreen();
    expect(createSpy).not.toHaveBeenCalled();
  });

  it('defaults a reminder to the next future 09.00 when the target is today', async () => {
    await renderForm();

    await fireEvent.press(screen.getByRole('button', { name: 'Pilih tanggal' }));
    await fireEvent(
      screen.getByTestId('target-picker'),
      'onChange',
      { type: 'set' },
      new Date('2026-11-25T09:00:00+07:00'),
    );
    await fireEvent(screen.getByLabelText('Aktifkan pengingat'), 'valueChange', true);

    expect(await screen.findByText('26 Nov 2026, 09.00')).toBeOnTheScreen();
  });

  it('lets the user pick a reminder time', async () => {
    await renderForm();

    await fireEvent(screen.getByLabelText('Aktifkan pengingat'), 'valueChange', true);
    expect(await screen.findByText('26 Nov 2026, 09.00')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Waktu pengingat' }));
    await fireEvent(
      screen.getByTestId('reminder-time-picker'),
      'onChange',
      { type: 'set' },
      new Date('2026-11-26T14:30:00+07:00'),
    );

    expect(await screen.findByText('26 Nov 2026, 14.30')).toBeOnTheScreen();
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
