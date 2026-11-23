import { describe, expect, it } from 'vitest';
import {
  type ColorTokens,
  darkColors,
  lightColors,
  motion,
  radii,
  spacing,
  typography,
  zIndex,
} from '../src/index.js';

/**
 * Calculates relative luminance according to W3C WCAG 2.1 specs:
 * https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
function getRelativeLuminance(hexColor: string): number {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

  const rLinear = toLinear(r);
  const gLinear = toLinear(g);
  const bLinear = toLinear(b);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculates contrast ratio between two hex colors:
 * (L1 + 0.05) / (L2 + 0.05) where L1 is the lighter of the two.
 */
function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hex1);
  const lum2 = getRelativeLuminance(hex2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('Design Tokens: Scales Structure', () => {
  it('has a consistent 4px spacing scale', () => {
    expect(spacing.xs).toBe(4);
    expect(spacing.sm).toBe(8);
    expect(spacing.md).toBe(16);
    expect(spacing.lg).toBe(24);
    expect(spacing.xl).toBe(32);
    expect(spacing.xxl).toBe(48);
  });

  it('has radii, z-index and typography scales defined', () => {
    expect(radii.full).toBe(9999);
    expect(zIndex.modal).toBeGreaterThan(zIndex.card);
    expect(typography.heading.fontSize).toBe(28);
    expect(motion.normal).toBe(250);
  });
});

describe('Design Tokens: Colors and Accessibility (WCAG AA)', () => {
  const colorKeys: (keyof ColorTokens)[] = [
    'background',
    'surface',
    'surfaceElevated',
    'textPrimary',
    'textSecondary',
    'textMuted',
    'border',
    'primary',
    'primaryText',
    'danger',
    'dangerText',
    'warning',
    'warningText',
    'success',
    'successText',
  ];

  it('contains identical semantic token keys in light and dark modes', () => {
    for (const key of colorKeys) {
      expect(lightColors[key]).toBeDefined();
      expect(darkColors[key]).toBeDefined();
    }
  });

  describe('Light Theme Contrast Ratios (WCAG AA >= 4.5:1)', () => {
    it('meets AA for textPrimary on background', () => {
      const ratio = getContrastRatio(lightColors.textPrimary, lightColors.background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('meets AA for textPrimary on surface', () => {
      const ratio = getContrastRatio(lightColors.textPrimary, lightColors.surface);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('meets AA for textSecondary on background', () => {
      const ratio = getContrastRatio(lightColors.textSecondary, lightColors.background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('meets AA for primaryText on primary', () => {
      const ratio = getContrastRatio(lightColors.primaryText, lightColors.primary);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('meets AA for dangerText on danger', () => {
      const ratio = getContrastRatio(lightColors.dangerText, lightColors.danger);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('meets AA for warningText on warning', () => {
      const ratio = getContrastRatio(lightColors.warningText, lightColors.warning);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('meets AA for successText on success', () => {
      const ratio = getContrastRatio(lightColors.successText, lightColors.success);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe('Dark Theme Contrast Ratios (WCAG AA >= 4.5:1)', () => {
    it('meets AA for textPrimary on background', () => {
      const ratio = getContrastRatio(darkColors.textPrimary, darkColors.background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('meets AA for textPrimary on surface', () => {
      const ratio = getContrastRatio(darkColors.textPrimary, darkColors.surface);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('meets AA for textSecondary on background', () => {
      const ratio = getContrastRatio(darkColors.textSecondary, darkColors.background);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('meets AA for primaryText on primary', () => {
      const ratio = getContrastRatio(darkColors.primaryText, darkColors.primary);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('meets AA for dangerText on danger', () => {
      const ratio = getContrastRatio(darkColors.dangerText, darkColors.danger);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('meets AA for warningText on warning', () => {
      const ratio = getContrastRatio(darkColors.warningText, darkColors.warning);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('meets AA for successText on success', () => {
      const ratio = getContrastRatio(darkColors.successText, darkColors.success);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });
});
