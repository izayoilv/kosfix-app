import { parseRupiahInput } from './formatting';
import type { ItemFormValues, ValidationErrors } from './types';

export const MAX_COST = 999_999_999;

export function costInputError(label: string, value: string): string | undefined {
  if (value.trim().length === 0) {
    return undefined;
  }

  const parsed = parseRupiahInput(value);

  if (
    parsed === null ||
    Number.isNaN(parsed) ||
    !Number.isInteger(parsed) ||
    parsed < 0 ||
    parsed > MAX_COST
  ) {
    return `${label} harus berupa angka.`;
  }

  return undefined;
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
}

export function validateItemForm(values: ItemFormValues, now: Date): ValidationErrors {
  const errors: ValidationErrors = {};
  const name = values.name.trim();

  if (name.length < 3 || name.length > 60) {
    errors.name = 'Nama barang wajib diisi (3–60 karakter).';
  }

  if (values.notes.length > 500) {
    errors.notes = 'Catatan maksimal 500 karakter.';
  }

  const estimatedError = costInputError('Biaya estimasi', values.estimatedCost);
  if (estimatedError !== undefined) {
    errors.estimatedCost = estimatedError;
  }

  const actualError = costInputError('Biaya aktual', values.actualCost);
  if (actualError !== undefined) {
    errors.actualCost = actualError;
  }

  if (values.targetDate !== null && !isValidDate(values.targetDate)) {
    errors.targetDate = 'Tanggal target tidak valid.';
  }

  if (values.reminderEnabled) {
    if (values.reminderAt === null || values.reminderAt.trim().length === 0) {
      errors.reminderAt = 'Pengingat harus di masa depan.';
    } else {
      const reminder = new Date(values.reminderAt);
      if (Number.isNaN(reminder.getTime()) || reminder.getTime() <= now.getTime()) {
        errors.reminderAt = 'Pengingat harus di masa depan.';
      }
    }
  }

  return errors;
}
