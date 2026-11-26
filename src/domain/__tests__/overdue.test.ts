import { isOverdue, isUrgent } from '../overdue';
import { makeItem } from '../../test/factories';

describe('overdue and urgent', () => {
  it('marks an open item with a past target as overdue', () => {
    const item = makeItem({ status: 'rusak', targetDate: '2026-11-24' });
    expect(isOverdue(item, '2026-11-25')).toBe(true);
  });

  it('does not mark today as overdue', () => {
    const item = makeItem({ status: 'rusak', targetDate: '2026-11-25' });
    expect(isOverdue(item, '2026-11-25')).toBe(false);
  });

  it('never marks a completed item overdue', () => {
    const item = makeItem({ status: 'selesai', targetDate: '2026-11-01' });
    expect(isOverdue(item, '2026-11-25')).toBe(false);
  });

  it('treats high-priority open items as urgent', () => {
    const item = makeItem({ status: 'rusak', priority: 'tinggi', targetDate: null });
    expect(isUrgent(item, '2026-11-25')).toBe(true);
  });

  it('treats overdue open items as urgent', () => {
    const item = makeItem({
      status: 'dikerjakan',
      priority: 'rendah',
      targetDate: '2026-11-24',
    });
    expect(isUrgent(item, '2026-11-25')).toBe(true);
  });

  it('never treats completed items as urgent', () => {
    const item = makeItem({
      status: 'selesai',
      priority: 'tinggi',
      targetDate: '2026-11-01',
    });
    expect(isUrgent(item, '2026-11-25')).toBe(false);
  });

  it('does not mark an item without a target as overdue', () => {
    const item = makeItem({ status: 'rusak', targetDate: null });
    expect(isOverdue(item, '2026-11-25')).toBe(false);
  });
});
