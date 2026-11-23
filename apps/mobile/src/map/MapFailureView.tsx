import {
  type ColorTokens,
  darkColors,
  lightColors,
  radii,
  spacing,
  typography,
} from '@meridian/design-tokens';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { MapError, MapThemeMode } from './types';

interface MapFailureViewProps {
  error: MapError;
  theme?: MapThemeMode;
  onRetry?: () => void;
}

export function MapFailureView({ error, theme = 'light', onRetry }: MapFailureViewProps) {
  const colors: ColorTokens = theme === 'dark' ? darkColors : lightColors;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]} testID="map-failure-view">
      <View
        style={[styles.card, { backgroundColor: colors.background, borderColor: colors.border }]}
      >
        <View style={[styles.badge, { backgroundColor: colors.danger }]}>
          <Text style={[styles.badgeText, { color: colors.dangerText }]}>
            {error.kind.replace('_', ' ')}
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.textPrimary }]}>{error.title}</Text>
        <Text style={[styles.message, { color: colors.textSecondary }]}>{error.message}</Text>

        {error.kind === 'TOKEN_MISSING' && (
          <View
            style={[
              styles.hintBox,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.hintTitle, { color: colors.textPrimary }]}>
              Token Setup Instructions:
            </Text>
            <Text style={[styles.hintText, { color: colors.textMuted }]}>
              1. Add your public token (`pk.*`) to `apps/mobile/.env.local`:{'\n'}
              {'   '}EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.xxx{'\n'}
              2. For local Android builds, put your secret token (`sk.*`) in
              `%USERPROFILE%\.gradle\gradle.properties`.{'\n'}
              3. Restart Metro bundler (`pnpm start --clear`).
            </Text>
          </View>
        )}

        {onRetry && (
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={onRetry}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Retry loading map"
          >
            <Text style={[styles.retryButtonText, { color: colors.primaryText }]}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xxs,
    borderRadius: radii.full,
    marginBottom: spacing.md,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    ...typography.title,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.bodySm,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  hintBox: {
    width: '100%',
    padding: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  hintTitle: {
    ...typography.bodyBold,
    marginBottom: spacing.xs,
    fontSize: 13,
  },
  hintText: {
    ...typography.caption,
    lineHeight: 18,
    fontFamily: 'monospace',
  },
  retryButton: {
    width: '100%',
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
  retryButtonText: {
    ...typography.bodyBold,
  },
});
