import type { MapThemeMode } from '../types';
import darkStyle from './dark.json';
import lightStyle from './light.json';

export const lightMapStyle = lightStyle;
export const darkMapStyle = darkStyle;

export const lightStyleJSON = JSON.stringify(lightStyle);
export const darkStyleJSON = JSON.stringify(darkStyle);

export const DEFAULT_STYLE_URLS = {
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11',
} as const;

/**
 * Returns the serialized Mapbox Style JSON for the specified theme.
 */
export function getMapStyleJSON(theme: MapThemeMode = 'light'): string {
  return theme === 'dark' ? darkStyleJSON : lightStyleJSON;
}

/**
 * Returns standard remote Mapbox style URL fallback.
 */
export function getMapStyleURL(theme: MapThemeMode = 'light'): string {
  return DEFAULT_STYLE_URLS[theme];
}
