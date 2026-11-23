import { darkMapColors, lightMapColors } from '@meridian/design-tokens';
import Mapbox from '@rnmapbox/maps';
import type { UserLocationLayerProps } from './types';

/**
 * Meridian User Location Puck
 * Wraps Mapbox LocationPuck with application design tokens and pulsing accuracy circle.
 */
export function UserLocationLayer({
  visible = true,
  theme = 'light',
  showsUserHeadingIndicator = true,
}: UserLocationLayerProps) {
  if (!visible) {
    return null;
  }

  const mapColors = theme === 'dark' ? darkMapColors : lightMapColors;

  return (
    <Mapbox.LocationPuck
      puckBearingEnabled={showsUserHeadingIndicator}
      puckBearing="heading"
      pulsing={{
        isEnabled: true,
        color: mapColors.userLocationHalo,
        radius: 'accuracy',
      }}
    />
  );
}
