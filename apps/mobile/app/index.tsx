import type { ProblemDetails, ReadyResponse } from '@meridian/contracts';
import {
  type ColorTokens,
  darkColors,
  lightColors,
  radii,
  spacing,
  typography,
} from '@meridian/design-tokens';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080';

type ReadinessState =
  | { kind: 'loading' }
  | { kind: 'ready'; data: ReadyResponse }
  | { kind: 'unready'; problem: ProblemDetails }
  | { kind: 'unreachable'; error: string };

export default function ReadinessScreen() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [state, setState] = useState<ReadinessState>({ kind: 'loading' });

  const colors: ColorTokens = isDarkMode ? darkColors : lightColors;

  const fetchReadiness = useCallback(async () => {
    setState({ kind: 'loading' });
    try {
      const response = await fetch(`${API_BASE_URL}/readyz`, {
        headers: {
          Accept: 'application/json, application/problem+json',
        },
      });

      if (response.ok) {
        const data = (await response.json()) as ReadyResponse;
        setState({ kind: 'ready', data });
      } else {
        const problem = (await response.json()) as ProblemDetails;
        setState({ kind: 'unready', problem });
      }
    } catch (err) {
      setState({
        kind: 'unreachable',
        error: err instanceof Error ? err.message : 'Network request failed',
      });
    }
  }, []);

  useEffect(() => {
    fetchReadiness();
  }, [fetchReadiness]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Bar */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Meridian</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Foundation Readiness Monitor
            </Text>
          </View>
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

        {/* API Endpoint Banner */}
        <View
          style={[
            styles.endpointCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.endpointLabel, { color: colors.textMuted }]}>
            TARGET API ENDPOINT
          </Text>
          <Text style={[styles.endpointValue, { color: colors.primary }]}>
            {API_BASE_URL}/readyz
          </Text>
        </View>

        {/* State Visualizer */}
        {state.kind === 'loading' && (
          <View
            style={[
              styles.statusCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.statusText, { color: colors.textPrimary, marginTop: spacing.md }]}>
              Querying API readiness & PostGIS extension...
            </Text>
          </View>
        )}

        {state.kind === 'ready' && (
          <View
            style={[
              styles.statusCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={[styles.badge, { backgroundColor: colors.success }]}>
              <Text style={[styles.badgeText, { color: colors.successText }]}>
                ✓ STACK READY (200 OK)
              </Text>
            </View>

            <View style={styles.detailList}>
              <Text style={[styles.detailItem, { color: colors.textPrimary }]}>
                Service: <Text style={{ color: colors.textSecondary }}>{state.data.service}</Text>
              </Text>
              <Text style={[styles.detailItem, { color: colors.textPrimary }]}>
                Uptime:{' '}
                <Text style={{ color: colors.textSecondary }}>{state.data.uptime.toFixed(1)}s</Text>
              </Text>
              <Text style={[styles.detailItem, { color: colors.textPrimary }]}>
                PostgreSQL:{' '}
                <Text style={{ color: colors.success }}>
                  {state.data.dependencies.postgres?.status} (
                  {state.data.dependencies.postgres?.latencyMs}ms)
                </Text>
              </Text>
              <Text style={[styles.detailItem, { color: colors.textPrimary }]}>
                PostGIS Extension:{' '}
                <Text style={{ color: colors.success }}>
                  {state.data.dependencies.postgis?.status} (
                  {state.data.dependencies.postgis?.latencyMs}ms)
                </Text>
              </Text>
            </View>
          </View>
        )}

        {state.kind === 'unready' && (
          <View
            style={[
              styles.statusCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={[styles.badge, { backgroundColor: colors.warning }]}>
              <Text style={[styles.badgeText, { color: colors.warningText }]}>⚠ UNREADY (503)</Text>
            </View>
            <Text style={[styles.errorTitle, { color: colors.danger }]}>{state.problem.title}</Text>
            <Text style={[styles.errorDetail, { color: colors.textSecondary }]}>
              {state.problem.detail}
            </Text>
            <Text style={[styles.errorDetail, { color: colors.textMuted }]}>
              Code: {state.problem.code || 'UNKNOWN'}
            </Text>
          </View>
        )}

        {state.kind === 'unreachable' && (
          <View
            style={[
              styles.statusCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={[styles.badge, { backgroundColor: colors.danger }]}>
              <Text style={[styles.badgeText, { color: colors.dangerText }]}>✕ UNREACHABLE</Text>
            </View>
            <Text style={[styles.errorTitle, { color: colors.danger }]}>
              Cannot Connect to Backend
            </Text>
            <Text style={[styles.errorDetail, { color: colors.textSecondary }]}>{state.error}</Text>

            <View
              style={[
                styles.hintBox,
                { backgroundColor: colors.background, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.hintTitle, { color: colors.textPrimary }]}>
                Connection Troubleshooting:
              </Text>
              <Text style={[styles.hintText, { color: colors.textMuted }]}>
                • Physical Android (USB): run `adb reverse tcp:8080 tcp:8080`{'\n'}• Android
                Emulator: use `http://10.0.2.2:8080`{'\n'}• LAN / Wi-Fi: use
                `http://&lt;YOUR_PC_LAN_IP&gt;:8080`{'\n'}• Verify stack is running: `pnpm
                dev:stack`
              </Text>
            </View>
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={fetchReadiness}
          activeOpacity={0.8}
        >
          <Text style={[styles.actionButtonText, { color: colors.primaryText }]}>
            Recheck Readiness
          </Text>
        </TouchableOpacity>

        {/* Mapbox Dev Verification Navigation */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              marginTop: spacing.sm,
            },
          ]}
          onPress={() => router.push('/dev/map-check')}
          activeOpacity={0.8}
        >
          <Text style={[styles.actionButtonText, { color: colors.textPrimary }]}>
            🗺 Open Map Verification (/dev/map-check)
          </Text>
        </TouchableOpacity>

        {/* Legal & About Screen */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              borderWidth: 1,
              marginTop: spacing.sm,
            },
          ]}
          onPress={() => router.push('/about')}
          activeOpacity={0.8}
        >
          <Text style={[styles.actionButtonText, { color: colors.textSecondary }]}>
            ⚖ Legal & Attribution Notices (/about)
          </Text>
        </TouchableOpacity>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    ...typography.caption,
    marginTop: spacing.xxs,
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
  endpointCard: {
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  endpointLabel: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  endpointValue: {
    ...typography.bodyBold,
    marginTop: spacing.xs,
  },
  statusCard: {
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  statusText: {
    ...typography.body,
    textAlign: 'center',
  },
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    marginBottom: spacing.md,
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  detailList: {
    width: '100%',
    marginTop: spacing.sm,
  },
  detailItem: {
    ...typography.body,
    marginBottom: spacing.xs,
  },
  errorTitle: {
    ...typography.subtitle,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  errorDetail: {
    ...typography.bodySm,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  hintBox: {
    width: '100%',
    padding: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  hintTitle: {
    ...typography.bodyBold,
    marginBottom: spacing.xs,
  },
  hintText: {
    ...typography.caption,
    lineHeight: 18,
  },
  actionButton: {
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    ...typography.bodyBold,
  },
});
