import { buildSeedData } from '../seed';

const NOW = new Date('2026-11-25T10:00:00+07:00');

describe('buildSeedData', () => {
  it('creates seven items with the designed status mix', () => {
    const { items } = buildSeedData(NOW);
    expect(items).toHaveLength(7);
    expect(items.filter((item) => item.status === 'rusak')).toHaveLength(4);
    expect(items.filter((item) => item.status === 'dikerjakan')).toHaveLength(1);
    expect(items.filter((item) => item.status === 'selesai')).toHaveLength(2);
  });

  it('creates at least one overdue open item and two completed costs', () => {
    const { items } = buildSeedData(NOW);
    expect(items.some((item) => item.targetDate === '2026-11-23' && item.status === 'rusak')).toBe(
      true,
    );
    expect(items.filter((item) => item.actualCost !== null)).toHaveLength(2);
  });

  it('creates matching created and status events', () => {
    const { items, events } = buildSeedData(NOW);
    expect(events.filter((event) => event.type === 'created')).toHaveLength(items.length);
    expect(events.some((event) => event.type === 'status_changed')).toBe(true);
  });
});
