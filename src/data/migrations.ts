import type { SQLiteDatabase } from 'expo-sqlite';

const SCHEMA_VERSION = 1;

const INITIAL_SCHEMA = `
CREATE TABLE IF NOT EXISTS app_meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('elektronik','furnitur','kamar_mandi','bangunan','lainnya')),
  location TEXT NOT NULL CHECK (location IN ('kamar','kamar_mandi','dapur','area_umum')),
  priority TEXT NOT NULL CHECK (priority IN ('rendah','sedang','tinggi')),
  status TEXT NOT NULL CHECK (status IN ('rusak','dikerjakan','selesai')),
  notes TEXT NOT NULL DEFAULT '',
  photo_path TEXT,
  estimated_cost INTEGER CHECK (estimated_cost IS NULL OR estimated_cost >= 0),
  actual_cost INTEGER CHECK (actual_cost IS NULL OR actual_cost >= 0),
  target_date TEXT,
  reminder_at TEXT,
  reminder_notification_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE TABLE IF NOT EXISTS repair_events (
  id TEXT PRIMARY KEY NOT NULL,
  item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('created','status_changed','cost_recorded')),
  from_status TEXT,
  to_status TEXT,
  note TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_priority ON items(priority);
CREATE INDEX IF NOT EXISTS idx_repair_events_item_id ON repair_events(item_id, created_at DESC);
`;

export async function migrate(db: SQLiteDatabase): Promise<void> {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const version = result?.user_version ?? 0;

  if (version >= SCHEMA_VERSION) {
    return;
  }

  await db.execAsync(INITIAL_SCHEMA);
  await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
}
