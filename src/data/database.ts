import * as SQLite from 'expo-sqlite';
import type { SQLiteDatabase } from 'expo-sqlite';

export async function openDatabase(): Promise<SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync('kosfix.db');
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  return db;
}
