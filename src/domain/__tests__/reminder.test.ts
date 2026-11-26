import { isReminderExpired, shouldScheduleReminder } from '../reminder';
import { makeItem } from '../../test/factories';

const NOW = new Date('2026-11-25T10:00:00+07:00');

describe('reminder rules', () => {
  it('schedules a future reminder for an open item', () => {
    const item = makeItem({ status: 'rusak', reminderAt: '2026-11-26T09:00:00+07:00' });
    expect(shouldScheduleReminder(item, NOW)).toBe(true);
    expect(isReminderExpired(item, NOW)).toBe(false);
  });

  it('does not schedule for a completed item', () => {
    const item = makeItem({ status: 'selesai', reminderAt: '2026-11-26T09:00:00+07:00' });
    expect(shouldScheduleReminder(item, NOW)).toBe(false);
  });

  it('does not schedule a past reminder', () => {
    const item = makeItem({ status: 'rusak', reminderAt: '2026-11-25T09:00:00+07:00' });
    expect(shouldScheduleReminder(item, NOW)).toBe(false);
    expect(isReminderExpired(item, NOW)).toBe(true);
  });

  it('treats no reminder as neither scheduled nor expired', () => {
    const item = makeItem({ reminderAt: null });
    expect(shouldScheduleReminder(item, NOW)).toBe(false);
    expect(isReminderExpired(item, NOW)).toBe(false);
  });
});
