import {
  type ColorTokens,
  darkColors,
  lightColors,
  radii,
  spacing,
  typography,
} from '@meridian/design-tokens';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AboutScreen() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const colors: ColorTokens = isDarkMode ? darkColors : lightColors;

  const openUrl = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.backButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={[styles.backButtonText, { color: colors.textPrimary }]}>← Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeToggle,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={() => setIsDarkMode((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel="Toggle Theme"
          >
            <Text style={[styles.themeToggleText, { color: colors.textPrimary }]}>
              {isDarkMode ? '☀ Light' : '🌙 Dark'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.title, { color: colors.textPrimary }]}>About & Legal Notices</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Meridian • Road-Aware Travel
        </Text>

        {/* Mapbox Legal Section */}
        <View
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Mapbox Maps & Geocoding
          </Text>
          <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
            Map tiles, cartographic styling, road geometry, and search data are powered by Mapbox.
            All Mapbox data is rendered exclusively on Mapbox maps in strict compliance with Mapbox
            Product Terms of Service.
          </Text>
          <TouchableOpacity
            style={[styles.linkButton, { borderColor: colors.border }]}
            onPress={() => openUrl('https://www.mapbox.com/about/maps/')}
          >
            <Text style={[styles.linkText, { color: colors.primary }]}>
              Mapbox Legal & Attribution Notices ↗
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.linkButton, { borderColor: colors.border }]}
            onPress={() => openUrl('https://www.mapbox.com/legal/tos/')}
          >
            <Text style={[styles.linkText, { color: colors.primary }]}>
              Mapbox Terms of Service ↗
            </Text>
          </TouchableOpacity>
        </View>

        {/* OpenStreetMap Section */}
        <View
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>OpenStreetMap Data</Text>
          <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
            Meridian uses map data © OpenStreetMap contributors under the Open Database License
            (ODbL). The cartography in our custom Mapbox styles is licensed under CC-BY-SA 2.0.
          </Text>
          <TouchableOpacity
            style={[styles.linkButton, { borderColor: colors.border }]}
            onPress={() => openUrl('https://www.openstreetmap.org/copyright')}
          >
            <Text style={[styles.linkText, { color: colors.primary }]}>
              OpenStreetMap Copyright & License ↗
            </Text>
          </TouchableOpacity>
        </View>

        {/* Free Tier Usage & Privacy Section */}
        <View
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Telemetry & Device Privacy
          </Text>
          <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
            Mapbox anonymous telemetry is disabled by default in Meridian.
            {'\n\n'}
            Meridian identifies installations using an anonymous, randomly generated UUID (ADR-009)
            to count monthly active devices strictly against our Mapbox free-tier quota (100 MAUs).
            No hardware IDs, IMEI numbers, or device fingerprints are ever accessed or stored.
          </Text>
        </View>

        {/* Software Licenses */}
        <View
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Third-Party Software
          </Text>
          <Text style={[styles.cardBody, { color: colors.textMuted }]}>
            • @rnmapbox/maps (MIT License){'\n'}• Expo SDK & React Native (MIT License){'\n'}•
            Fastify (MIT License){'\n'}• PostgreSQL & PostGIS (PostgreSQL License / GPLv2)
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  backButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  backButtonText: {
    ...typography.caption,
    fontWeight: '600',
  },
  themeToggle: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  themeToggleText: {
    ...typography.caption,
    fontWeight: '600',
  },
  title: {
    ...typography.title,
    marginBottom: spacing.xxs,
  },
  subtitle: {
    ...typography.caption,
    marginBottom: spacing.lg,
  },
  card: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.subtitle,
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  cardBody: {
    ...typography.bodySm,
    lineHeight: 22,
  },
  linkButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
  },
  linkText: {
    ...typography.bodySm,
    fontWeight: '600',
  },
});
