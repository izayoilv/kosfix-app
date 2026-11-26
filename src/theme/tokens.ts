export const lightColors = {
  primary: '#0F766E',
  onPrimary: '#FFFFFF',
  primaryContainer: '#CCFBF1',
  onPrimaryContainer: '#042F2E',
  secondary: '#B45309',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#FEF3C7',
  onSecondaryContainer: '#451A03',
  background: '#F8FAFC',
  onBackground: '#0F172A',
  surface: '#FFFFFF',
  onSurface: '#0F172A',
  surfaceVariant: '#E2E8F0',
  onSurfaceVariant: '#475569',
  outline: '#64748B',
  error: '#B91C1C',
  onError: '#FFFFFF',
  errorContainer: '#FEE2E2',
  onErrorContainer: '#7F1D1D',
  success: '#15803D',
  successContainer: '#DCFCE7',
  onSuccessContainer: '#14532D',
  warning: '#B45309',
  warningContainer: '#FEF3C7',
  onWarningContainer: '#78350F',
} as const;

export const darkColors = {
  primary: '#5EEAD4',
  onPrimary: '#042F2E',
  primaryContainer: '#115E59',
  onPrimaryContainer: '#CCFBF1',
  secondary: '#FBBF24',
  onSecondary: '#451A03',
  secondaryContainer: '#78350F',
  onSecondaryContainer: '#FEF3C7',
  background: '#0B1220',
  onBackground: '#F8FAFC',
  surface: '#111C2E',
  onSurface: '#F8FAFC',
  surfaceVariant: '#1E293B',
  onSurfaceVariant: '#CBD5E1',
  outline: '#94A3B8',
  error: '#FCA5A5',
  onError: '#450A0A',
  errorContainer: '#7F1D1D',
  onErrorContainer: '#FEE2E2',
  success: '#86EFAC',
  successContainer: '#14532D',
  onSuccessContainer: '#DCFCE7',
  warning: '#FCD34D',
  warningContainer: '#78350F',
  onWarningContainer: '#FEF3C7',
} as const;

type ColorName = keyof typeof lightColors;

export const lightPaperColors = { ...lightColors } as Record<ColorName, string>;
export const darkPaperColors = { ...darkColors } as Record<ColorName, string>;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  card: 12,
  sheet: 16,
  pill: 999,
} as const;

export type Tone = {
  background: string;
  foreground: string;
};

export const statusPalette: Record<
  'light' | 'dark',
  Record<'rusak' | 'dikerjakan' | 'selesai', Tone>
> = {
  light: {
    rusak: { background: lightColors.errorContainer, foreground: lightColors.onErrorContainer },
    dikerjakan: {
      background: lightColors.warningContainer,
      foreground: lightColors.onWarningContainer,
    },
    selesai: {
      background: lightColors.successContainer,
      foreground: lightColors.onSuccessContainer,
    },
  },
  dark: {
    rusak: { background: darkColors.errorContainer, foreground: darkColors.onErrorContainer },
    dikerjakan: {
      background: darkColors.warningContainer,
      foreground: darkColors.onWarningContainer,
    },
    selesai: {
      background: darkColors.successContainer,
      foreground: darkColors.onSuccessContainer,
    },
  },
};

export const priorityPalette: Record<
  'light' | 'dark',
  Record<'rendah' | 'sedang' | 'tinggi', Tone>
> = {
  light: {
    rendah: { background: lightColors.surfaceVariant, foreground: lightColors.onSurfaceVariant },
    sedang: {
      background: lightColors.warningContainer,
      foreground: lightColors.onWarningContainer,
    },
    tinggi: { background: lightColors.errorContainer, foreground: lightColors.onErrorContainer },
  },
  dark: {
    rendah: { background: darkColors.surfaceVariant, foreground: darkColors.onSurfaceVariant },
    sedang: { background: darkColors.warningContainer, foreground: darkColors.onWarningContainer },
    tinggi: { background: darkColors.errorContainer, foreground: darkColors.onErrorContainer },
  },
};
