import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatRupiah,
  localDateKey,
  parseRupiahInput,
} from '../formatting';

describe('rupiah formatting', () => {
  it('formats integer rupiah with grouping', () => {
    expect(formatRupiah(45000)).toBe('Rp 45.000');
    expect(formatRupiah(0)).toBe('Rp 0');
    expect(formatRupiah(null)).toBe('—');
  });

  it('parses grouped input and treats empty as null', () => {
    expect(parseRupiahInput('Rp 45.000')).toBe(45000);
    expect(parseRupiahInput('')).toBeNull();
    expect(Number.isNaN(parseRupiahInput('abc'))).toBe(true);
    expect(Number.isNaN(parseRupiahInput('-5000'))).toBe(true);
  });
});

describe('date formatting', () => {
  it('formats a date in WIB', () => {
    expect(formatDate('2026-11-24')).toBe('24 Nov 2026');
    expect(formatDate(null)).toBe('—');
  });

  it('formats a datetime in WIB', () => {
    expect(formatDateTime('2026-11-24T02:00:00.000Z')).toBe('24 Nov 2026, 09.00');
    expect(formatDateTime(null)).toBe('—');
  });

  it('formats relative time and falls back after seven days', () => {
    const now = new Date('2026-11-25T10:00:00+07:00');
    expect(formatRelativeTime('2026-11-25T09:59:30+07:00', now)).toBe('Baru saja');
    expect(formatRelativeTime('2026-11-25T09:55:00+07:00', now)).toBe('5 menit lalu');
    expect(formatRelativeTime('2026-11-25T08:00:00+07:00', now)).toBe('2 jam lalu');
    expect(formatRelativeTime('2026-11-22T10:00:00+07:00', now)).toBe('3 hari lalu');
    expect(formatRelativeTime('2026-11-10T10:00:00+07:00', now)).toBe('10 Nov 2026');
  });

  it('uses the WIB day for the date key', () => {
    expect(localDateKey(new Date('2026-11-24T17:00:00.000Z'))).toBe('2026-11-25');
  });
});
