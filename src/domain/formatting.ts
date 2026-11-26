const JAKARTA_TIME_ZONE = 'Asia/Jakarta';

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: JAKARTA_TIME_ZONE,
});

const dateTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: JAKARTA_TIME_ZONE,
});

const dateKeyFormatter = new Intl.DateTimeFormat('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: JAKARTA_TIME_ZONE,
});

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  maximumFractionDigits: 0,
});

function toDate(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatRupiah(value: number | null): string {
  if (value === null) {
    return '—';
  }

  return `Rp ${rupiahFormatter.format(value)}`;
}

export function parseRupiahInput(input: string): number | null {
  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return null;
  }

  if (trimmed.includes('-')) {
    return Number.NaN;
  }

  const digits = trimmed.replace(/[^\d]/g, '');

  if (digits.length === 0) {
    return Number.NaN;
  }

  return Number(digits);
}

export function formatDate(isoDate: string | null): string {
  if (isoDate === null) {
    return '—';
  }

  const date = toDate(isoDate);
  return date === null ? '—' : dateFormatter.format(date);
}

export function formatDateTime(iso: string | null): string {
  if (iso === null) {
    return '—';
  }

  const date = toDate(iso);
  return date === null ? '—' : dateTimeFormatter.format(date);
}

export function formatRelativeTime(iso: string, now: Date): string {
  const date = toDate(iso);

  if (date === null) {
    return '—';
  }

  const elapsedMs = Math.max(0, now.getTime() - date.getTime());
  const minutes = Math.floor(elapsedMs / 60_000);

  if (minutes < 1) {
    return 'Baru saja';
  }

  if (minutes < 60) {
    return `${minutes} menit lalu`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} jam lalu`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} hari lalu`;
  }

  return formatDate(iso);
}

export function localDateKey(date: Date): string {
  const parts = dateKeyFormatter.formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}
