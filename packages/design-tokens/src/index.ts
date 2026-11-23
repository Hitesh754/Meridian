// ==========================================
// MERIDIAN DESIGN SYSTEM TOKENS
// ==========================================

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export type Spacing = typeof spacing;

export const radii = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export type Radii = typeof radii;

export const typography = {
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  bodySm: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodyBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  heading: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },
} as const;

export type Typography = typeof typography;

export const zIndex = {
  base: 0,
  card: 10,
  sticky: 50,
  bottomSheet: 100,
  modal: 200,
  toast: 300,
} as const;

export type ZIndex = typeof zIndex;

export const motion = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

export type Motion = typeof motion;

export interface ColorTokens {
  background: string;
  surface: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryText: string;
  danger: string;
  dangerText: string;
  warning: string;
  warningText: string;
  success: string;
  successText: string;
}

export const lightColors: ColorTokens = {
  background: '#FFFFFF',
  surface: '#F8FAFC',
  surfaceElevated: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#475569',
  border: '#E2E8F0',
  primary: '#1D4ED8',
  primaryText: '#FFFFFF',
  danger: '#B91C1C',
  dangerText: '#FFFFFF',
  warning: '#B45309',
  warningText: '#FFFFFF',
  success: '#047857',
  successText: '#FFFFFF',
};

export const darkColors: ColorTokens = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceElevated: '#334155',
  textPrimary: '#F8FAFC',
  textSecondary: '#E2E8F0',
  textMuted: '#94A3B8',
  border: '#334155',
  primary: '#3B82F6',
  primaryText: '#0F172A',
  danger: '#EF4444',
  dangerText: '#0F172A',
  warning: '#F59E0B',
  warningText: '#0F172A',
  success: '#10B981',
  successText: '#0F172A',
};

export const themes = {
  light: lightColors,
  dark: darkColors,
} as const;

export type ThemeMode = keyof typeof themes;
