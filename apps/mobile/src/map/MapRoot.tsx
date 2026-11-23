import Mapbox from '@rnmapbox/maps';
import type React from 'react';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Attribution } from './Attribution';
import { MapFailureView } from './MapFailureView';
import { getMapStyleJSON } from './styles';
import type { CameraHandle, MapError, MapRootProps } from './types';

// Mapbox token initialization
const PUBLIC_MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN;

// Default initial camera: center on Bangalore [77.5946, 12.9716], zoom 11
const DEFAULT_CENTER: [number, number] = [77.5946, 12.9716];
const DEFAULT_ZOOM = 11;

type MapLoadingErrorPayload = Parameters<
  NonNullable<React.ComponentProps<typeof Mapbox.MapView>['onMapLoadingError']>
>[0];

export const MapRoot = forwardRef<CameraHandle, MapRootProps>(function MapRoot(
  {
    theme = 'light',
    initialCamera,
    onReady,
    onError,
    onCameraChange,
    children,
    style,
    testID = 'meridian-map-root',
    simulatedError = null,
  },
  ref,
) {
  const cameraRef = useRef<Mapbox.Camera>(null);
  const [errorState, setErrorState] = useState<MapError | null>(null);
  const [isFollowingUser, setIsFollowingUser] = useState<boolean>(false);

  // Initialize Mapbox Token safely
  useEffect(() => {
    // Check for simulated errors first
    if (simulatedError) {
      const simError: MapError = {
        kind: simulatedError,
        title:
          simulatedError === 'TOKEN_MISSING'
            ? 'Mapbox Token Missing'
            : simulatedError === 'NETWORK_OFFLINE'
              ? 'Device Offline'
              : simulatedError === 'PERMISSION_DENIED'
                ? 'Location Permission Denied'
                : 'Mapbox SDK Initialization Error',
        message:
          simulatedError === 'TOKEN_MISSING'
            ? 'A valid Mapbox public token is required in EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN.'
            : simulatedError === 'NETWORK_OFFLINE'
              ? 'Unable to connect to map tile servers. Please check your internet connection.'
              : simulatedError === 'PERMISSION_DENIED'
                ? 'Location access was denied. Enable location in device settings to use navigation.'
                : 'The Mapbox rendering engine encountered an unrecoverable failure.',
      };
      setErrorState(simError);
      onError?.(simError);
      return;
    }

    if (!PUBLIC_MAPBOX_TOKEN) {
      const tokenError: MapError = {
        kind: 'TOKEN_MISSING',
        title: 'Mapbox Access Token Missing',
        message:
          'EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN is not set. Add your public token to apps/mobile/.env.local.',
      };
      setErrorState(tokenError);
      onError?.(tokenError);
      return;
    }

    try {
      Mapbox.setAccessToken(PUBLIC_MAPBOX_TOKEN);
      Mapbox.setTelemetryEnabled(false);
      setErrorState(null);
    } catch (err) {
      const initError: MapError = {
        kind: 'MAP_INIT_ERROR',
        title: 'Mapbox Initialization Error',
        message: err instanceof Error ? err.message : 'Failed to initialize Mapbox native module',
        originalError: err,
      };
      setErrorState(initError);
      onError?.(initError);
    }
  }, [simulatedError, onError]);

  // Imperative Camera Controls
  useImperativeHandle(
    ref,
    () => ({
      flyTo: (center: [number, number], zoom?: number, durationMs = 1200) => {
        setIsFollowingUser(false);
        cameraRef.current?.setCamera({
          centerCoordinate: center,
          zoomLevel: zoom,
          animationDuration: durationMs,
          animationMode: 'flyTo',
        });
      },
      fitBounds: (ne: [number, number], sw: [number, number], padding = 40, durationMs = 1000) => {
        setIsFollowingUser(false);
        cameraRef.current?.fitBounds(ne, sw, padding, durationMs);
      },
      resetNorth: (durationMs = 500) => {
        cameraRef.current?.setCamera({
          heading: 0,
          animationDuration: durationMs,
        });
      },
      followUser: (enabled: boolean) => {
        setIsFollowingUser(enabled);
      },
      setZoom: (zoom: number, durationMs = 300) => {
        cameraRef.current?.zoomTo(zoom, durationMs);
      },
    }),
    [],
  );

  const handleCameraChanged = useCallback(
    (state: Mapbox.MapState) => {
      if (onCameraChange && state.properties) {
        onCameraChange({
          center: [state.properties.center[0] ?? 0, state.properties.center[1] ?? 0],
          zoom: state.properties.zoom,
          heading: state.properties.heading,
          pitch: state.properties.pitch,
        });
      }
    },
    [onCameraChange],
  );

  const handleLoadingError = useCallback(
    (payload: MapLoadingErrorPayload) => {
      const err: MapError = {
        kind: 'MAP_INIT_ERROR',
        title: 'Map Loading Error',
        message: payload?.error || 'Failed to stream vector tiles or load custom map style.',
        originalError: payload,
      };
      setErrorState(err);
      onError?.(err);
    },
    [onError],
  );

  const handleRetry = useCallback(() => {
    setErrorState(null);
    if (PUBLIC_MAPBOX_TOKEN) {
      try {
        Mapbox.setAccessToken(PUBLIC_MAPBOX_TOKEN);
      } catch (err) {
        setErrorState({
          kind: 'MAP_INIT_ERROR',
          title: 'Mapbox Retry Error',
          message: err instanceof Error ? err.message : 'Retry failed',
        });
      }
    }
  }, []);

  if (errorState) {
    return <MapFailureView error={errorState} theme={theme} onRetry={handleRetry} />;
  }

  // Use custom offline style JSON
  const customStyleJSON = getMapStyleJSON(theme);

  return (
    <View style={[styles.container, style]} testID={testID}>
      <Mapbox.MapView
        style={StyleSheet.absoluteFill}
        styleJSON={customStyleJSON}
        attributionEnabled={true}
        attributionPosition={{ bottom: 8, right: 8 }}
        logoEnabled={true}
        logoPosition={{ bottom: 8, left: 8 }}
        scaleBarEnabled={false}
        compassEnabled={true}
        compassFadeWhenNorth={true}
        compassPosition={{ top: 16, right: 16 }}
        onDidFinishLoadingMap={onReady}
        onMapLoadingError={handleLoadingError}
        onCameraChanged={handleCameraChanged}
        testID="rnmapbox-native-mapview"
      >
        <Mapbox.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: initialCamera?.center || DEFAULT_CENTER,
            zoomLevel: initialCamera?.zoom || DEFAULT_ZOOM,
            heading: initialCamera?.heading || 0,
            pitch: initialCamera?.pitch || 0,
          }}
          followUserLocation={isFollowingUser}
          followUserMode={Mapbox.UserTrackingMode.Follow}
        />
        {children}
      </Mapbox.MapView>

      {/* Attribution Overlay to satisfy Mapbox and OpenStreetMap legal requirements */}
      <Attribution theme={theme} />
    </View>
  );
});
MapRoot.displayName = 'MapRoot';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
});
