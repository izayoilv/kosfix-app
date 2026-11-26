jest.mock('../app/bootstrap', () => ({
  createAppServices: jest.fn(),
}));

import { fireEvent, render, screen } from '@testing-library/react-native';
import App from '../../App';
import type { Services } from '../services/types';
import { createFakeItemRepository, createFakeNotifications, createFakePhotos } from '../test/fakes';

const NOW = new Date('2026-11-25T10:00:00+07:00');

function makeServices(): Services {
  return {
    repository: createFakeItemRepository([]),
    notifications: createFakeNotifications(),
    photos: createFakePhotos(),
    now: () => NOW,
  };
}

describe('App', () => {
  it('shows loading and then the home screen', async () => {
    let resolveServices: (services: Services) => void = () => undefined;
    const createServices = jest.fn(
      () =>
        new Promise<Services>((resolve) => {
          resolveServices = resolve;
        }),
    );

    await render(<App createServices={createServices} />);

    expect(screen.getByText('Memuat data...')).toBeOnTheScreen();

    resolveServices(makeServices());

    expect(await screen.findByText('Belum ada barang')).toBeOnTheScreen();
  });

  it('shows an error state and retries', async () => {
    const createServices = jest.fn();
    createServices.mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce(makeServices());

    await render(<App createServices={createServices} />);

    expect(await screen.findByText('Data gagal dimuat')).toBeOnTheScreen();

    await fireEvent.press(screen.getByText('Coba lagi'));

    expect(await screen.findByText('Belum ada barang')).toBeOnTheScreen();
  });
});
