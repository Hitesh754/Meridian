import Mapbox from '@rnmapbox/maps';
import type React from 'react';
import type {
  CircleLayerProps,
  GeoJSONSourceProps,
  LineLayerProps,
  SymbolLayerProps,
} from './types';

type MapboxCircleFilter = React.ComponentProps<typeof Mapbox.CircleLayer>['filter'];
type MapboxLineFilter = React.ComponentProps<typeof Mapbox.LineLayer>['filter'];
type MapboxSymbolFilter = React.ComponentProps<typeof Mapbox.SymbolLayer>['filter'];

/**
 * Declarative LayerHost components for registering GeoJSON sources and layers
 * without consumers directly importing the Mapbox SDK.
 */

export function GeoJSONSource({
  id,
  data,
  cluster = false,
  clusterRadius = 50,
  clusterMaxZoomLevel = 14,
  children,
}: GeoJSONSourceProps & { children?: React.ReactElement | React.ReactElement[] }) {
  const shape = typeof data === 'string' ? JSON.parse(data) : data;

  return (
    <Mapbox.ShapeSource
      id={id}
      shape={shape}
      cluster={cluster}
      clusterRadius={clusterRadius}
      clusterMaxZoomLevel={clusterMaxZoomLevel}
    >
      {children}
    </Mapbox.ShapeSource>
  );
}

export function CircleLayer({
  id,
  sourceId,
  color = '#2563EB',
  radius = 6,
  strokeColor = '#FFFFFF',
  strokeWidth = 2,
  filter,
}: CircleLayerProps) {
  return (
    <Mapbox.CircleLayer
      id={id}
      sourceID={sourceId}
      filter={filter as unknown as MapboxCircleFilter}
      style={{
        circleColor: color,
        circleRadius: radius,
        circleStrokeColor: strokeColor,
        circleStrokeWidth: strokeWidth,
      }}
    />
  );
}

export function LineLayer({
  id,
  sourceId,
  color = '#2563EB',
  width = 4,
  opacity = 1,
  filter,
}: LineLayerProps) {
  return (
    <Mapbox.LineLayer
      id={id}
      sourceID={sourceId}
      filter={filter as unknown as MapboxLineFilter}
      style={{
        lineColor: color,
        lineWidth: width,
        lineOpacity: opacity,
        lineCap: 'round',
        lineJoin: 'round',
      }}
    />
  );
}

export function SymbolLayer({
  id,
  sourceId,
  textField,
  textSize = 12,
  textColor = '#0F172A',
  textHaloColor = '#FFFFFF',
  textHaloWidth = 2,
  iconImage,
  iconSize = 1,
  filter,
}: SymbolLayerProps) {
  return (
    <Mapbox.SymbolLayer
      id={id}
      sourceID={sourceId}
      filter={filter as unknown as MapboxSymbolFilter}
      style={{
        textField: textField as unknown as string,
        textSize,
        textColor,
        textHaloColor,
        textHaloWidth,
        iconImage: iconImage as unknown as string,
        iconSize,
        iconAllowOverlap: false,
        textAllowOverlap: false,
      }}
    />
  );
}

export const LayerHost = {
  GeoJSONSource,
  CircleLayer,
  LineLayer,
  SymbolLayer,
};
