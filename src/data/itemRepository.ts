import * as Crypto from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';
import { formatRupiah } from '../domain/formatting';
import type { ItemRepository } from '../domain/repository';
import { canTransition } from '../domain/status';
import type {
  Item,
  ItemStatus,
  ItemUpdate,
  NewItem,
  RecentEvent,
  RepairEvent,
} from '../domain/types';
import {
  rowToItem,
  rowToRecentEvent,
  rowToRepairEvent,
  type ItemRow,
  type RecentEventRow,
  type RepairEventRow,
} from './mappers';

export interface RepositoryDeps {
  now: () => Date;
  id: () => string;
}

const INSERT_ITEM = `
INSERT INTO items (
  id, name, category, location, priority, status, notes, photo_path,
  estimated_cost, actual_cost, target_date, reminder_at, reminder_notification_id,
  created_at, updated_at, completed_at
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const UPDATE_ITEM = `
UPDATE items SET
  name = ?, category = ?, location = ?, priority = ?, notes = ?, photo_path = ?,
  estimated_cost = ?, actual_cost = ?, target_date = ?, reminder_at = ?, updated_at = ?
WHERE id = ?
`;

const INSERT_EVENT = `
INSERT INTO repair_events (id, item_id, type, from_status, to_status, note, created_at)
VALUES (?, ?, ?, ?, ?, ?, ?)
`;

export function createSqliteItemRepository(
  db: SQLiteDatabase,
  overrides: Partial<RepositoryDeps> = {},
): ItemRepository {
  const deps: RepositoryDeps = {
    now: () => new Date(),
    id: () => Crypto.randomUUID(),
    ...overrides,
  };

  async function get(id: string): Promise<Item | null> {
    const row = await db.getFirstAsync<ItemRow>('SELECT * FROM items WHERE id = ?', id);
    return row === null ? null : rowToItem(row);
  }

  async function insertEvent(event: RepairEvent): Promise<void> {
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

  async function list(): Promise<Item[]> {
    const rows = await db.getAllAsync<ItemRow>('SELECT * FROM items ORDER BY created_at DESC');
    return rows.map(rowToItem);
  }

  async function create(input: NewItem): Promise<Item> {
    const timestamp = deps.now().toISOString();
    const item: Item = {
      id: deps.id(),
      ...input,
      status: 'rusak',
      reminderNotificationId: null,
      createdAt: timestamp,
      updatedAt: timestamp,
      completedAt: null,
    };

    await db.withTransactionAsync(async () => {
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

      await insertEvent({
        id: deps.id(),
        itemId: item.id,
        type: 'created',
        fromStatus: null,
        toStatus: 'rusak',
        note: null,
        createdAt: timestamp,
      });

      if (item.actualCost !== null) {
        await insertEvent({
          id: deps.id(),
          itemId: item.id,
          type: 'cost_recorded',
          fromStatus: null,
          toStatus: null,
          note: `Biaya aktual ${formatRupiah(item.actualCost)}`,
          createdAt: timestamp,
        });
      }
    });

    return item;
  }

  async function update(id: string, input: ItemUpdate): Promise<Item> {
    const existing = await get(id);

    if (existing === null) {
      throw new Error('Item not found');
    }

    const timestamp = deps.now().toISOString();
    const actualCostChanged = input.actualCost !== existing.actualCost;

    await db.withTransactionAsync(async () => {
      await db.runAsync(UPDATE_ITEM, [
        input.name,
        input.category,
        input.location,
        input.priority,
        input.notes,
        input.photoPath,
        input.estimatedCost,
        input.actualCost,
        input.targetDate,
        input.reminderAt,
        timestamp,
        id,
      ]);

      if (actualCostChanged && input.actualCost !== null) {
        await insertEvent({
          id: deps.id(),
          itemId: id,
          type: 'cost_recorded',
          fromStatus: null,
          toStatus: null,
          note: `Biaya aktual ${formatRupiah(input.actualCost)}`,
          createdAt: timestamp,
        });
      }
    });

    const updated = await get(id);

    if (updated === null) {
      throw new Error('Item not found after update');
    }

    return updated;
  }

  async function changeStatus(
    id: string,
    next: ItemStatus,
    options: { actualCost?: number | null } = {},
  ): Promise<Item> {
    const existing = await get(id);

    if (existing === null) {
      throw new Error('Item not found');
    }

    if (!canTransition(existing.status, next)) {
      throw new Error(`Cannot transition from ${existing.status} to ${next}`);
    }

    const now = deps.now();
    const timestamp = now.toISOString();
    const nextActualCost =
      options.actualCost === undefined ? existing.actualCost : options.actualCost;
    const actualCostChanged = nextActualCost !== existing.actualCost;
    const completedAt = next === 'selesai' ? timestamp : null;
    const reminderAt = next === 'selesai' ? null : existing.reminderAt;
    const reminderNotificationId = next === 'selesai' ? null : existing.reminderNotificationId;

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `UPDATE items SET
          status = ?, actual_cost = ?, completed_at = ?, reminder_at = ?,
          reminder_notification_id = ?, updated_at = ?
        WHERE id = ?`,
        [next, nextActualCost, completedAt, reminderAt, reminderNotificationId, timestamp, id],
      );

      if (actualCostChanged && nextActualCost !== null) {
        await insertEvent({
          id: deps.id(),
          itemId: id,
          type: 'cost_recorded',
          fromStatus: null,
          toStatus: null,
          note: `Biaya aktual ${formatRupiah(nextActualCost)}`,
          createdAt: timestamp,
        });
      }

      await insertEvent({
        id: deps.id(),
        itemId: id,
        type: 'status_changed',
        fromStatus: existing.status,
        toStatus: next,
        note: null,
        createdAt: new Date(now.getTime() + 1).toISOString(),
      });
    });

    const updated = await get(id);

    if (updated === null) {
      throw new Error('Item not found after status change');
    }

    return updated;
  }

  async function setReminder(
    id: string,
    reminderAt: string | null,
    notificationId: string | null,
  ): Promise<Item> {
    await db.runAsync(
      'UPDATE items SET reminder_at = ?, reminder_notification_id = ?, updated_at = ? WHERE id = ?',
      [reminderAt, notificationId, deps.now().toISOString(), id],
    );

    const updated = await get(id);

    if (updated === null) {
      throw new Error('Item not found after reminder update');
    }

    return updated;
  }

  async function remove(id: string): Promise<void> {
    await db.runAsync('DELETE FROM items WHERE id = ?', id);
  }

  async function eventsFor(id: string): Promise<RepairEvent[]> {
    const rows = await db.getAllAsync<RepairEventRow>(
      'SELECT * FROM repair_events WHERE item_id = ? ORDER BY created_at DESC',
      id,
    );
    return rows.map(rowToRepairEvent);
  }

  async function recentEvents(limit: number): Promise<RecentEvent[]> {
    const rows = await db.getAllAsync<RecentEventRow>(
      `SELECT e.*, i.name AS item_name
       FROM repair_events e
       JOIN items i ON i.id = e.item_id
       ORDER BY e.created_at DESC
       LIMIT ?`,
      limit,
    );
    return rows.map(rowToRecentEvent);
  }

  return {
    list,
    get,
    create,
    update,
    changeStatus,
    setReminder,
    remove,
    eventsFor,
    recentEvents,
  };
}
