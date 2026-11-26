import type {
  Category,
  Item,
  ItemStatus,
  Location,
  Priority,
  RecentEvent,
  RepairEvent,
  RepairEventType,
} from '../domain/types';

export interface ItemRow {
  id: string;
  name: string;
  category: Category;
  location: Location;
  priority: Priority;
  status: ItemStatus;
  notes: string;
  photo_path: string | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  target_date: string | null;
  reminder_at: string | null;
  reminder_notification_id: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface RepairEventRow {
  id: string;
  item_id: string;
  type: RepairEventType;
  from_status: ItemStatus | null;
  to_status: ItemStatus | null;
  note: string | null;
  created_at: string;
}

export interface RecentEventRow extends RepairEventRow {
  item_name: string;
}

export function rowToItem(row: ItemRow): Item {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    location: row.location,
    priority: row.priority,
    status: row.status,
    notes: row.notes,
    photoPath: row.photo_path,
    estimatedCost: row.estimated_cost,
    actualCost: row.actual_cost,
    targetDate: row.target_date,
    reminderAt: row.reminder_at,
    reminderNotificationId: row.reminder_notification_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
  };
}

export function rowToRepairEvent(row: RepairEventRow): RepairEvent {
  return {
    id: row.id,
    itemId: row.item_id,
    type: row.type,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    note: row.note,
    createdAt: row.created_at,
  };
}

export function rowToRecentEvent(row: RecentEventRow): RecentEvent {
  return {
    ...rowToRepairEvent(row),
    itemName: row.item_name,
  };
}
