import type { Category, ItemStatus, Location, Priority } from './types';

export const CATEGORY_LABELS: Record<Category, string> = {
  elektronik: 'Elektronik',
  furnitur: 'Furnitur',
  kamar_mandi: 'Kamar mandi',
  bangunan: 'Bangunan',
  lainnya: 'Lainnya',
};

export const LOCATION_LABELS: Record<Location, string> = {
  kamar: 'Kamar',
  kamar_mandi: 'Kamar mandi',
  dapur: 'Dapur',
  area_umum: 'Area umum',
};

export const STATUS_LABELS: Record<ItemStatus, string> = {
  rusak: 'Rusak',
  dikerjakan: 'Dikerjakan',
  selesai: 'Selesai',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  rendah: 'Rendah',
  sedang: 'Sedang',
  tinggi: 'Tinggi',
};
