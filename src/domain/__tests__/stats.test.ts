import { computeStats } from '../stats';
import { makeItem } from '../../test/factories';

describe('computeStats', () => {
  it('counts statuses and sums known costs', () => {
    const items = [
      makeItem({ status: 'rusak', estimatedCost: 45000, actualCost: null }),
      makeItem({ id: '2', status: 'dikerjakan', estimatedCost: 80000, actualCost: null }),
      makeItem({ id: '3', status: 'selesai', estimatedCost: 35000, actualCost: 40000 }),
      makeItem({ id: '4', status: 'selesai', estimatedCost: null, actualCost: null }),
    ];

    expect(computeStats(items)).toMatchObject({
      total: 4,
      rusak: 1,
      dikerjakan: 1,
      selesai: 2,
      estimatedTotal: 160000,
      actualTotal: 40000,
    });
  });

  it('returns zeroes for an empty list and all categories with zero counts', () => {
    const stats = computeStats([]);
    expect(stats).toMatchObject({
      total: 0,
      rusak: 0,
      dikerjakan: 0,
      selesai: 0,
      estimatedTotal: 0,
      actualTotal: 0,
    });
    expect(stats.categories.map((entry) => entry.count)).toEqual([0, 0, 0, 0, 0]);
  });

  it('sorts category counts descending, then by category order', () => {
    const items = [
      makeItem({ category: 'elektronik' }),
      makeItem({ id: '2', category: 'elektronik' }),
      makeItem({ id: '3', category: 'furnitur' }),
      makeItem({ id: '4', category: 'bangunan' }),
      makeItem({ id: '5', category: 'bangunan' }),
    ];
    expect(computeStats(items).categories).toEqual([
      { category: 'elektronik', count: 2 },
      { category: 'bangunan', count: 2 },
      { category: 'furnitur', count: 1 },
      { category: 'kamar_mandi', count: 0 },
      { category: 'lainnya', count: 0 },
    ]);
  });
});
