import {
  type ColorTokens,
  darkColors,
  lightColors,
  radii,
  spacing,
  typography,
} from '@meridian/design-tokens';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { MapThemeMode } from './types';

interface AttributionProps {
  theme?: MapThemeMode;
  onPressAbout?: () => void;
}

/**
 * Meridian Map Attribution Control
 * Complements native Mapbox ornaments by providing a direct, accessible legal attribution link.
 * Mandated by Mapbox Terms of Service and OpenStreetMap licensing requirements.
 */
export function Attribution({ theme = 'light', onPressAbout }: AttributionProps) {
  const colors: ColorTokens = theme === 'dark' ? darkColors : lightColors;

  const handleOpenOSM = () => {
    Linking.openURL('https://www.openstreetmap.org/copyright').catch(() => {});
  };

  const handleOpenMapboxLegal = () => {
    Linking.openURL('https://www.mapbox.com/about/maps/').catch(() => {});
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            theme === 'dark' ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)',
          borderColor: colors.border,
        },
      ]}
      testID="map-attribution-bar"
    >
      <TouchableOpacity
        onPress={handleOpenMapboxLegal}
        accessibilityRole="link"
        accessibilityLabel="Mapbox legal notices"
      >
        <Text style={[styles.legalText, { color: colors.textSecondary }]}>© Mapbox</Text>
      </TouchableOpacity>
      <Text style={[styles.divider, { color: colors.textMuted }]}>•</Text>
      <TouchableOpacity
        onPress={handleOpenOSM}
        accessibilityRole="link"
        accessibilityLabel="OpenStreetMap contributors copyright notice"
      >
        <Text style={[styles.legalText, { color: colors.textSecondary }]}>© OpenStreetMap</Text>
      </TouchableOpacity>
      {onPressAbout && (
        <>
          <Text style={[styles.divider, { color: colors.textMuted }]}>•</Text>
          <TouchableOpacity
            onPress={onPressAbout}
            accessibilityRole="button"
            accessibilityLabel="Legal details"
          >
            <Text style={[styles.legalText, { color: colors.primary, fontWeight: '600' }]}>
              Legal
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.sm,
    borderWidth: 1,
    zIndex: 10,
  },
  legalText: {
    ...typography.caption,
    fontSize: 10,
    lineHeight: 14,
  },
  divider: {
    marginHorizontal: spacing.xxs,
    fontSize: 10,
  },
});
