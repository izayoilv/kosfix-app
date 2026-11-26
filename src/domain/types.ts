export const ITEM_STATUSES = ['rusak', 'dikerjakan', 'selesai'] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

export const PRIORITIES = ['rendah', 'sedang', 'tinggi'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const CATEGORIES = ['elektronik', 'furnitur', 'kamar_mandi', 'bangunan', 'lainnya'] as const;
export type Category = (typeof CATEGORIES)[number];

export const LOCATIONS = ['kamar', 'kamar_mandi', 'dapur', 'area_umum'] as const;
export type Location = (typeof LOCATIONS)[number];

export type RepairEventType = 'created' | 'status_changed' | 'cost_recorded';

export interface Item {
  id: string;
  name: string;
  category: Category;
  location: Location;
  priority: Priority;
  status: ItemStatus;
  notes: string;
  photoPath: string | null;
  estimatedCost: number | null;
  actualCost: number | null;
  targetDate: string | null;
  reminderAt: string | null;
  reminderNotificationId: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface NewItem {
  name: string;
  category: Category;
  location: Location;
  priority: Priority;
  notes: string;
  photoPath: string | null;
  estimatedCost: number | null;
  actualCost: number | null;
  targetDate: string | null;
  reminderAt: string | null;
}

export interface ItemUpdate extends NewItem {}

export interface ItemFormValues {
  name: string;
  category: Category;
  location: Location;
  priority: Priority;
  notes: string;
  estimatedCost: string;
  actualCost: string;
  targetDate: string | null;
  reminderEnabled: boolean;
  reminderAt: string | null;
  photoPath: string | null;
}

export interface RepairEvent {
  id: string;
  itemId: string;
  type: RepairEventType;
  fromStatus: ItemStatus | null;
  toStatus: ItemStatus | null;
  note: string | null;
  createdAt: string;
}

export interface RecentEvent extends RepairEvent {
  itemName: string;
}

export interface CategoryCount {
  category: Category;
  count: number;
}

export interface ItemStats {
  total: number;
  rusak: number;
  dikerjakan: number;
  selesai: number;
  estimatedTotal: number;
  actualTotal: number;
  categories: CategoryCount[];
}

export type ValidationErrors = Partial<Record<keyof ItemFormValues, string>>;
