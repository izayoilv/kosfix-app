import { screen } from '@testing-library/react-native';
import { makeEvent } from '../../test/factories';
import { renderWithProviders } from '../../test/renderWithProviders';
import { RepairTimeline } from '../RepairTimeline';

describe('RepairTimeline', () => {
  it('renders status and cost events with dates', async () => {
    await renderWithProviders(
      <RepairTimeline
        events={[
          makeEvent({
            id: '1',
            type: 'created',
            toStatus: 'rusak',
            createdAt: '2026-11-20T03:00:00.000Z',
          }),
          makeEvent({
            id: '2',
            type: 'status_changed',
            fromStatus: 'rusak',
            toStatus: 'dikerjakan',
            createdAt: '2026-11-21T03:00:00.000Z',
          }),
          makeEvent({
            id: '3',
            type: 'cost_recorded',
            note: 'Biaya aktual Rp 40.000',
            createdAt: '2026-11-22T03:00:00.000Z',
          }),
        ]}
      />,
    );

    expect(screen.getByText('Dibuat')).toBeOnTheScreen();
    expect(screen.getByText('Rusak → Dikerjakan')).toBeOnTheScreen();
    expect(screen.getByText('Biaya aktual Rp 40.000')).toBeOnTheScreen();
  });
});
