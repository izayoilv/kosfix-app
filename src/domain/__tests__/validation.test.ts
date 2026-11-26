import { validateItemForm } from '../validation';
import type { ItemFormValues } from '../types';

const validValues: ItemFormValues = {
  name: 'Lampu kamar mati',
  category: 'elektronik',
  location: 'kamar',
  priority: 'tinggi',
  notes: 'Lampu utama mati.',
  estimatedCost: '45.000',
  actualCost: '',
  targetDate: '2026-11-30',
  reminderEnabled: false,
  reminderAt: null,
  photoPath: null,
};

const NOW = new Date('2026-11-25T10:00:00+07:00');

describe('validateItemForm', () => {
  it('accepts a valid form', () => {
    expect(validateItemForm(validValues, NOW)).toEqual({});
  });

  it('requires a 3–60 character name', () => {
    expect(validateItemForm({ ...validValues, name: '  ' }, NOW).name).toContain('3–60');
    expect(validateItemForm({ ...validValues, name: 'ab' }, NOW).name).toContain('3–60');
  });

  it('rejects notes over 500 characters', () => {
    expect(validateItemForm({ ...validValues, notes: 'x'.repeat(501) }, NOW).notes).toContain(
      '500',
    );
  });

  it('rejects invalid costs but accepts empty', () => {
    expect(validateItemForm({ ...validValues, estimatedCost: 'abc' }, NOW).estimatedCost).toContain(
      'angka',
    );
    expect(validateItemForm({ ...validValues, actualCost: 'abc' }, NOW).actualCost).toContain(
      'angka',
    );
    expect(
      validateItemForm({ ...validValues, estimatedCost: '' }, NOW).estimatedCost,
    ).toBeUndefined();
  });

  it('enforces the rupiah upper bound and accepts zero', () => {
    expect(
      validateItemForm({ ...validValues, estimatedCost: '0' }, NOW).estimatedCost,
    ).toBeUndefined();
    expect(
      validateItemForm({ ...validValues, estimatedCost: '999.999.999' }, NOW).estimatedCost,
    ).toBeUndefined();
    expect(
      validateItemForm({ ...validValues, estimatedCost: '1.000.000.000' }, NOW).estimatedCost,
    ).toContain('angka');
  });

  it('requires a future reminder when the switch is on', () => {
    expect(
      validateItemForm(
        { ...validValues, reminderEnabled: true, reminderAt: '2026-11-25T09:00:00+07:00' },
        NOW,
      ).reminderAt,
    ).toContain('masa depan');
  });

  it('requires a reminder value when the switch is on', () => {
    expect(
      validateItemForm({ ...validValues, reminderEnabled: true, reminderAt: null }, NOW).reminderAt,
    ).toContain('masa depan');
  });
});
