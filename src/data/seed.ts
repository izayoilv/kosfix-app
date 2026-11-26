import type { SQLiteDatabase } from 'expo-sqlite';
import { localDateKey } from '../domain/formatting';
import type { Item, RepairEvent } from '../domain/types';

function dateKeyOffset(now: Date, days: number): string {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  return localDateKey(date);
}

function timestampOffset(now: Date, days: number): string {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function buildSeedData(now: Date): { items: Item[]; events: RepairEvent[] } {
  const createdAt = timestampOffset(now, -12);
  const updatedAt = now.toISOString();

  const items: Item[] = [
    {
      id: 'seed-lampu',
      name: 'Lampu kamar mati',
      category: 'elektronik',
      location: 'kamar',
      priority: 'tinggi',
      status: 'rusak',
      notes: 'Lampu utama mati, sudah cek saklar.',
      photoPath: null,
      estimatedCost: 45000,
      actualCost: null,
      targetDate: dateKeyOffset(now, 1),
      reminderAt: null,
      reminderNotificationId: null,
      createdAt,
      updatedAt,
      completedAt: null,
    },
    {
      id: 'seed-kran',
      name: 'Kran kamar mandi bocor',
      category: 'kamar_mandi',
      location: 'kamar_mandi',
      priority: 'tinggi',
      status: 'rusak',
      notes: 'Air menetes terus, perlu seal baru.',
      photoPath: null,
      estimatedCost: 150000,
      actualCost: null,
      targetDate: dateKeyOffset(now, -2),
      reminderAt: null,
      reminderNotificationId: null,
      createdAt,
      updatedAt,
      completedAt: null,
    },
    {
      id: 'seed-kursi',
      name: 'Kursi belajar goyang',
      category: 'furnitur',
      location: 'kamar',
      priority: 'sedang',
      status: 'dikerjakan',
      notes: 'Salah satu kaki longgar.',
      photoPath: null,
      estimatedCost: 80000,
      actualCost: null,
      targetDate: dateKeyOffset(now, 5),
      reminderAt: null,
      reminderNotificationId: null,
      createdAt: timestampOffset(now, -8),
      updatedAt: timestampOffset(now, -2),
      completedAt: null,
    },
    {
      id: 'seed-lemari',
      name: 'Pintu lemari pakaian macet',
      category: 'furnitur',
      location: 'kamar',
      priority: 'sedang',
      status: 'rusak',
      notes: 'Pintu sulit dibuka, rel perlu diluruskan.',
      photoPath: null,
      estimatedCost: 60000,
      actualCost: null,
      targetDate: dateKeyOffset(now, 7),
      reminderAt: null,
      reminderNotificationId: null,
      createdAt,
      updatedAt,
      completedAt: null,
    },
    {
      id: 'seed-keran-dapur',
      name: 'Keran dapur longgar',
      category: 'lainnya',
      location: 'dapur',
      priority: 'rendah',
      status: 'selesai',
      notes: 'Sudah dikencangkan.',
      photoPath: null,
      estimatedCost: 35000,
      actualCost: 40000,
      targetDate: dateKeyOffset(now, -5),
      reminderAt: null,
      reminderNotificationId: null,
      createdAt: timestampOffset(now, -15),
      updatedAt: timestampOffset(now, -5),
      completedAt: timestampOffset(now, -5),
    },
    {
      id: 'seed-stopkontak',
      name: 'Stop kontak kamar longgar',
      category: 'elektronik',
      location: 'kamar',
      priority: 'tinggi',
      status: 'selesai',
      notes: 'Stop kontak sudah diganti.',
      photoPath: null,
      estimatedCost: 75000,
      actualCost: 70000,
      targetDate: dateKeyOffset(now, -8),
      reminderAt: null,
      reminderNotificationId: null,
      createdAt: timestampOffset(now, -18),
      updatedAt: timestampOffset(now, -8),
      completedAt: timestampOffset(now, -8),
    },
    {
      id: 'seed-cat',
      name: 'Cat dinding kamar mengelupas',
      category: 'bangunan',
      location: 'kamar',
      priority: 'rendah',
      status: 'rusak',
      notes: 'Area dekat jendela perlu dicat ulang.',
      photoPath: null,
      estimatedCost: 200000,
      actualCost: null,
      targetDate: dateKeyOffset(now, 14),
      reminderAt: null,
      reminderNotificationId: null,
      createdAt,
      updatedAt,
      completedAt: null,
    },
  ];

  const events: RepairEvent[] = [];

  for (const item of items) {
    events.push({
      id: `event-created-${item.id}`,
      itemId: item.id,
      type: 'created',
      fromStatus: null,
      toStatus: 'rusak',
      note: null,
      createdAt: item.createdAt,
    });
  }

  events.push(
    {
      id: 'event-kursi-progress',
      itemId: 'seed-kursi',
      type: 'status_changed',
      fromStatus: 'rusak',
      toStatus: 'dikerjakan',
      note: null,
      createdAt: timestampOffset(now, -2),
    },
    {
      id: 'event-keran-progress',
      itemId: 'seed-keran-dapur',
      type: 'status_changed',
      fromStatus: 'rusak',
      toStatus: 'dikerjakan',
      note: null,
      createdAt: timestampOffset(now, -6),
    },
    {
      id: 'event-keran-done',
      itemId: 'seed-keran-dapur',
      type: 'status_changed',
      fromStatus: 'dikerjakan',
      toStatus: 'selesai',
      note: null,
      createdAt: timestampOffset(now, -5),
    },
    {
      id: 'event-keran-cost',
      itemId: 'seed-keran-dapur',
      type: 'cost_recorded',
      fromStatus: null,
      toStatus: null,
      note: 'Biaya aktual Rp 40.000',
      createdAt: timestampOffset(now, -5),
    },
    {
      id: 'event-stopkontak-progress',
      itemId: 'seed-stopkontak',
      type: 'status_changed',
      fromStatus: 'rusak',
      toStatus: 'dikerjakan',
      note: null,
      createdAt: timestampOffset(now, -9),
    },
    {
      id: 'event-stopkontak-done',
      itemId: 'seed-stopkontak',
      type: 'status_changed',
      fromStatus: 'dikerjakan',
      toStatus: 'selesai',
      note: null,
      createdAt: timestampOffset(now, -8),
    },
    {
      id: 'event-stopkontak-cost',
      itemId: 'seed-stopkontak',
      type: 'cost_recorded',
      fromStatus: null,
      toStatus: null,
      note: 'Biaya aktual Rp 70.000',
      createdAt: timestampOffset(now, -8),
    },
  );

  return { items, events };
}

const INSERT_ITEM = `
INSERT OR IGNORE INTO items (
  id, name, category, location, priority, status, notes, photo_path,
  estimated_cost, actual_cost, target_date, reminder_at, reminder_notification_id,
  created_at, updated_at, completed_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const INSERT_EVENT = `
INSERT OR IGNORE INTO repair_events (
  id, item_id, type, from_status, to_status, note, created_at
) VALUES (?, ?, ?, ?, ?, ?, ?)
`;

export async function seedIfNeeded(db: SQLiteDatabase, now = new Date()): Promise<void> {
  const seeded = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_meta WHERE key = ?',
    'seed_version',
  );

  if (seeded !== null) {
    return;
  }

  const { items, events } = buildSeedData(now);

  await db.withTransactionAsync(async () => {
    for (const item of items) {
      await db.runAsync(INSERT_ITEM, [
        item.id,
        item.name,
        item.category,
        item.location,
        item.priority,
        item.status,
        item.notes,
        item.photoPath,
        item.estimatedCost,
        item.actualCost,
        item.targetDate,
        item.reminderAt,
        item.reminderNotificationId,
        item.createdAt,
        item.updatedAt,
        item.completedAt,
      ]);
    }

    for (const event of events) {
      await db.runAsync(INSERT_EVENT, [
        event.id,
        event.itemId,
        event.type,
        event.fromStatus,
        event.toStatus,
        event.note,
        event.createdAt,
      ]);
    }

    await db.runAsync(
      'INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)',
      'seed_version',
      '1',
    );
  });
}
