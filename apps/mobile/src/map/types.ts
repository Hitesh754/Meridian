import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export type MapThemeMode = 'light' | 'dark';

export interface CameraPosition {
  center: [number, number]; // [lng, lat]
  zoom: number;
  heading?: number;
  pitch?: number;
}

export interface MapBounds {
  ne: [number, number]; // [lng, lat]
  sw: [number, number]; // [lng, lat]
  padding?: number | [number, number, number, number];
}

export type MapErrorKind =
  | 'TOKEN_MISSING'
  | 'NETWORK_OFFLINE'
  | 'PERMISSION_DENIED'
  | 'MAP_INIT_ERROR'
  | 'SIMULATED_ERROR';

export interface MapError {
  kind: MapErrorKind;
  title: string;
  message: string;
  originalError?: unknown;
}

export interface CameraHandle {
  flyTo: (center: [number, number], zoom?: number, durationMs?: number) => void;
  fitBounds: (
    ne: [number, number],
    sw: [number, number],
    padding?: number,
    durationMs?: number,
  ) => void;
  resetNorth: (durationMs?: number) => void;
  followUser: (enabled: boolean) => void;
  setZoom: (zoom: number, durationMs?: number) => void;
}

export interface MapRootProps {
  theme?: MapThemeMode;
  initialCamera?: Partial<CameraPosition>;
  onReady?: () => void;
  onError?: (error: MapError) => void;
  onCameraChange?: (state: CameraPosition) => void;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /**
   * For testing failure modes in development check screen.
   */
  simulatedError?: MapErrorKind | null;
}

export interface UserLocationLayerProps {
  visible?: boolean;
  theme?: MapThemeMode;
  showsUserHeadingIndicator?: boolean;
}

export interface GeoJSONSourceProps {
  id: string;
  data: GeoJSON.FeatureCollection | GeoJSON.Feature | string;
  cluster?: boolean;
  clusterRadius?: number;
  clusterMaxZoomLevel?: number;
}

export interface CircleLayerProps {
  id: string;
  sourceId: string;
  color?: string;
  radius?: number;
  strokeColor?: string;
  strokeWidth?: number;
  filter?: readonly [string, ...unknown[]];
}

export interface LineLayerProps {
  id: string;
  sourceId: string;
  color?: string;
  width?: number;
  opacity?: number;
  filter?: readonly [string, ...unknown[]];
}

export interface SymbolLayerProps {
  id: string;
  sourceId: string;
  textField?: string | readonly [string, ...unknown[]];
  textSize?: number;
  textColor?: string;
  textHaloColor?: string;
  textHaloWidth?: number;
  iconImage?: string;
  iconSize?: number;
  filter?: readonly [string, ...unknown[]];
}
