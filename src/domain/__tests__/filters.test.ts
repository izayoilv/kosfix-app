import { filterItems, sortItems } from '../filters';
import { makeItem } from '../../test/factories';

describe('filterItems', () => {
  const items = [
    makeItem({ id: '1', name: 'Lampu kamar mati', notes: 'Saklar rusak', status: 'rusak' }),
    makeItem({
      id: '2',
      name: 'Kran bocor',
      notes: 'Kamar mandi',
      status: 'dikerjakan',
      category: 'kamar_mandi',
    }),
    makeItem({
      id: '3',
      name: 'Kursi goyang',
      notes: 'Furnitur',
      status: 'selesai',
      category: 'furnitur',
    }),
  ];

  it('matches name case-insensitively and trims the query', () => {
    expect(filterItems(items, { query: '  LAMPU ', status: 'semua', category: 'semua' })).toEqual([
      items[0],
    ]);
  });

  it('matches notes as well as name', () => {
    expect(filterItems(items, { query: 'saklar', status: 'semua', category: 'semua' })).toEqual([
      items[0],
    ]);
  });

  it('combines status and category filters', () => {
    expect(
      filterItems(items, { query: '', status: 'dikerjakan', category: 'kamar_mandi' }),
    ).toEqual([items[1]]);
  });

  it('returns an empty array when nothing matches', () => {
    expect(filterItems(items, { query: 'tidak ada', status: 'semua', category: 'semua' })).toEqual(
      [],
    );
  });

  it('does not mutate the input array', () => {
    const original = [...items];
    filterItems(items, { query: 'lampu', status: 'semua', category: 'semua' });
    expect(items).toEqual(original);
  });
});

describe('sortItems', () => {
  const items = [
    makeItem({
      id: 'low',
      priority: 'rendah',
      createdAt: '2026-11-20T00:00:00.000Z',
      targetDate: '2026-11-30',
    }),
    makeItem({
      id: 'high-old',
      priority: 'tinggi',
      createdAt: '2026-11-19T00:00:00.000Z',
      targetDate: '2026-11-22',
    }),
    makeItem({
      id: 'high-new',
      priority: 'tinggi',
      createdAt: '2026-11-21T00:00:00.000Z',
      targetDate: null,
    }),
  ];

  it('sorts by priority, then newest', () => {
    expect(sortItems(items, 'priority').map((item) => item.id)).toEqual([
      'high-new',
      'high-old',
      'low',
    ]);
  });

  it('sorts newest first by createdAt', () => {
    expect(sortItems(items, 'newest').map((item) => item.id)).toEqual([
      'high-new',
      'low',
      'high-old',
    ]);
  });

  it('sorts target date ascending with null last', () => {
    expect(sortItems(items, 'target').map((item) => item.id)).toEqual([
      'high-old',
      'low',
      'high-new',
    ]);
  });
});
