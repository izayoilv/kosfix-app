import type { Item } from './types';

export function shouldScheduleReminder(item: Item, now: Date): boolean {
  if (item.status === 'selesai' || item.reminderAt === null) {
    return false;
  }

  const reminder = new Date(item.reminderAt);
  return !Number.isNaN(reminder.getTime()) && reminder.getTime() > now.getTime();
}

export function isReminderExpired(item: Item, now: Date): boolean {
  if (item.reminderAt === null) {
    return false;
  }

  const reminder = new Date(item.reminderAt);
  return !Number.isNaN(reminder.getTime()) && reminder.getTime() <= now.getTime();
}
