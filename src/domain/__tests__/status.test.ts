import { canTransition } from '../status';

describe('canTransition', () => {
  it.each([
    ['rusak', 'dikerjakan', true],
    ['dikerjakan', 'selesai', true],
    ['selesai', 'dikerjakan', true],
    ['rusak', 'selesai', false],
    ['selesai', 'rusak', false],
    ['dikerjakan', 'rusak', false],
  ] as const)('%s -> %s is %s', (from, to, expected) => {
    expect(canTransition(from, to)).toBe(expected);
  });
});
