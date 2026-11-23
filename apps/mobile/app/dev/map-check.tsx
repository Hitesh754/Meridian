import {
  type ColorTokens,
  darkColors,
  lightColors,
  radii,
  spacing,
  typography,
} from '@meridian/design-tokens';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  type CameraHandle,
  type CameraPosition,
  type MapErrorKind,
  MapRoot,
  type MapThemeMode,
  UserLocationLayer,
} from '../../src/map';
import { getOrCreateInstallationId } from '../../src/utils/installation';

export default function DevMapCheckScreen() {
  const router = useRouter();
  const mapRef = useRef<CameraHandle>(null);

  const [theme, setTheme] = useState<MapThemeMode>('light');
  const [cameraState, setCameraState] = useState<CameraPosition>({
    center: [77.5946, 12.9716],
    zoom: 11,
    heading: 0,
    pitch: 0,
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isMapReady, setIsMapReady] = useState<boolean>(false);
  const [installationId, setInstallationId] = useState<string>('');
  const [simulatedError, setSimulatedError] = useState<MapErrorKind | null>(null);

  const colors: ColorTokens = theme === 'dark' ? darkColors : lightColors;

  // Load installation ID on mount
  useEffect(() => {
    getOrCreateInstallationId()
      .then(setInstallationId)
      .catch(() => {});
  }, []);

  const handleLocateMe = useCallback(async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Denied',
          'Permission to access location was denied. To enable, update your app settings.',
        );
        setIsLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { longitude, latitude } = location.coords;
      mapRef.current?.flyTo([longitude, latitude], 15, 1200);
    } catch (err) {
      Alert.alert(
        'Location Error',
        err instanceof Error ? err.message : 'Unable to acquire location',
      );
    } finally {
      setIsLocating(false);
    }
  }, []);

  const handleResetNorth = useCallback(() => {
    mapRef.current?.resetNorth(600);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Floating Control Bar */}
      <View
        style={[
          styles.topBar,
          {
            backgroundColor:
              theme === 'dark' ? 'rgba(15, 23, 42, 0.92)' : 'rgba(255, 255, 255, 0.92)',
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.topBarRow}>
          <TouchableOpacity
            style={[styles.smallButton, { borderColor: colors.border }]}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Back to Readiness"
          >
            <Text style={[styles.smallButtonText, { color: colors.textPrimary }]}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>
              Map Verification
            </Text>
            <Text style={[styles.screenSubtitle, { color: colors.textSecondary }]}>
              {isMapReady ? '● Map Ready' : '○ Loading Engine...'}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.smallButton, { borderColor: colors.border }]}
            onPress={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
            accessibilityRole="button"
            accessibilityLabel="Toggle Map Theme"
          >
            <Text style={[styles.smallButtonText, { color: colors.textPrimary }]}>
              {theme === 'light' ? '🌙 Dark' : '☀ Light'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Telemetry & Readouts */}
        <View style={styles.telemetryRow}>
          <Text style={[styles.telemetryText, { color: colors.textMuted }]}>
            Center: [{cameraState.center[0].toFixed(4)}, {cameraState.center[1].toFixed(4)}]
          </Text>
          <Text style={[styles.telemetryText, { color: colors.textMuted }]}>
            Zoom: {cameraState.zoom.toFixed(2)}
          </Text>
          <Text style={[styles.telemetryText, { color: colors.textMuted }]}>
            Heading: {cameraState.heading ? `${cameraState.heading.toFixed(0)}°` : '0°'}
          </Text>
        </View>

        {installationId ? (
          <Text
            style={[styles.installIdText, { color: colors.textMuted }]}
            numberOfLines={1}
            ellipsizeMode="middle"
          >
            Client UUID (ADR-009): {installationId}
          </Text>
        ) : null}
      </View>

      {/* Map Surface */}
      <View style={styles.mapContainer}>
        <MapRoot
          ref={mapRef}
          theme={theme}
          onReady={() => setIsMapReady(true)}
          onCameraChange={setCameraState}
          simulatedError={simulatedError}
          testID="dev-map-check-root"
        >
          {/* User Location Puck */}
          <UserLocationLayer theme={theme} />
        </MapRoot>

        {/* Right Action Floating Controls */}
        <View style={styles.floatingControls}>
          <TouchableOpacity
            style={[
              styles.floatingCircleButton,
              {
                backgroundColor:
                  theme === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                borderColor: colors.border,
              },
            ]}
            onPress={handleLocateMe}
            disabled={isLocating}
            accessibilityRole="button"
            accessibilityLabel="Locate current position"
          >
            {isLocating ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={[styles.controlIconText, { color: colors.primary }]}>🎯</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.floatingCircleButton,
              {
                backgroundColor:
                  theme === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                borderColor: colors.border,
              },
            ]}
            onPress={handleResetNorth}
            accessibilityRole="button"
            accessibilityLabel="Reset north orientation"
          >
            <Text style={[styles.controlIconText, { color: colors.textPrimary }]}>🧭</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.floatingCircleButton,
              {
                backgroundColor:
                  theme === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                borderColor: colors.border,
              },
            ]}
            onPress={() => router.push('/about')}
            accessibilityRole="button"
            accessibilityLabel="Open Legal Notices"
          >
            <Text style={[styles.controlIconText, { color: colors.textPrimary }]}>ℹ</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Failure Mode Simulation Drawer */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor:
              theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.bottomTitle, { color: colors.textPrimary }]}>
          Honest Failure Simulation:
        </Text>
        <View style={styles.simButtonsRow}>
          <TouchableOpacity
            style={[
              styles.simButton,
              simulatedError === 'TOKEN_MISSING' && { backgroundColor: colors.danger },
              { borderColor: colors.border },
            ]}
            onPress={() =>
              setSimulatedError((prev) => (prev === 'TOKEN_MISSING' ? null : 'TOKEN_MISSING'))
            }
          >
            <Text
              style={[
                styles.simButtonText,
                {
                  color:
                    simulatedError === 'TOKEN_MISSING' ? colors.dangerText : colors.textPrimary,
                },
              ]}
            >
              Missing Token
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.simButton,
              simulatedError === 'NETWORK_OFFLINE' && { backgroundColor: colors.danger },
              { borderColor: colors.border },
            ]}
            onPress={() =>
              setSimulatedError((prev) => (prev === 'NETWORK_OFFLINE' ? null : 'NETWORK_OFFLINE'))
            }
          >
            <Text
              style={[
                styles.simButtonText,
                {
                  color:
                    simulatedError === 'NETWORK_OFFLINE' ? colors.dangerText : colors.textPrimary,
                },
              ]}
            >
              Offline
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.simButton,
              simulatedError === 'MAP_INIT_ERROR' && { backgroundColor: colors.danger },
              { borderColor: colors.border },
            ]}
            onPress={() =>
              setSimulatedError((prev) => (prev === 'MAP_INIT_ERROR' ? null : 'MAP_INIT_ERROR'))
            }
          >
            <Text
              style={[
                styles.simButtonText,
                {
                  color:
                    simulatedError === 'MAP_INIT_ERROR' ? colors.dangerText : colors.textPrimary,
                },
              ]}
            >
              SDK Init Error
            </Text>
          </TouchableOpacity>

          {simulatedError && (
            <TouchableOpacity
              style={[styles.simButton, { backgroundColor: colors.primary }]}
              onPress={() => setSimulatedError(null)}
            >
              <Text style={[styles.simButtonText, { color: colors.primaryText }]}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    zIndex: 20,
  },
  topBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
  },
  screenTitle: {
    ...typography.subtitle,
    fontSize: 16,
  },
  screenSubtitle: {
    ...typography.caption,
    fontSize: 11,
  },
  smallButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  smallButtonText: {
    ...typography.caption,
    fontWeight: '600',
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  telemetryText: {
    ...typography.caption,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  installIdText: {
    ...typography.caption,
    fontSize: 10,
    marginTop: spacing.xxs,
    fontFamily: 'monospace',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  floatingControls: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    gap: spacing.sm,
    zIndex: 15,
  },
  floatingCircleButton: {
    width: 44,
    height: 44,
    borderRadius: radii.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  controlIconText: {
    fontSize: 18,
  },
  bottomBar: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    zIndex: 20,
  },
  bottomTitle: {
    ...typography.caption,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  simButtonsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  simButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  simButtonText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
  },
});
