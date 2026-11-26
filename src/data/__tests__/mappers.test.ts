import { rowToItem, rowToRepairEvent } from '../mappers';

describe('row mappers', () => {
  it('maps an item row with all columns', () => {
    const item = rowToItem({
      id: 'item-1',
      name: 'Lampu kamar mati',
      category: 'elektronik',
      location: 'kamar',
      priority: 'tinggi',
      status: 'rusak',
      notes: 'Lampu utama mati.',
      photo_path: 'photos/item-1.jpg',
      estimated_cost: 45000,
      actual_cost: null,
      target_date: '2026-11-24',
      reminder_at: '2026-11-24T09:00:00+07:00',
      reminder_notification_id: 'notif-1',
      created_at: '2026-11-20T03:00:00.000Z',
      updated_at: '2026-11-20T03:00:00.000Z',
      completed_at: null,
    });

    expect(item).toMatchObject({
      id: 'item-1',
      photoPath: 'photos/item-1.jpg',
      estimatedCost: 45000,
      actualCost: null,
      reminderNotificationId: 'notif-1',
      completedAt: null,
    });
  });

  it('maps a repair event row', () => {
    expect(
      rowToRepairEvent({
        id: 'event-1',
        item_id: 'item-1',
        type: 'status_changed',
        from_status: 'rusak',
        to_status: 'dikerjakan',
        note: null,
        created_at: '2026-11-21T03:00:00.000Z',
      }),
    ).toEqual({
      id: 'event-1',
      itemId: 'item-1',
      type: 'status_changed',
      fromStatus: 'rusak',
      toStatus: 'dikerjakan',
      note: null,
      createdAt: '2026-11-21T03:00:00.000Z',
    });
  });
});
