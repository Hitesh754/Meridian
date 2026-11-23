import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { darkMapStyle, lightMapStyle } from '../src/map/styles';

const MOBILE_ROOT = path.resolve(process.cwd(), 'apps', 'mobile');
const SRC_MAP_DIR = path.resolve(MOBILE_ROOT, 'src', 'map');

function getFilesRecursively(dir: string, extensions: string[]): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) {
    return results;
  }
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const dirent of list) {
    const fullPath = path.resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      if (dirent.name === 'node_modules' || dirent.name === '.expo' || dirent.name === 'dist') {
        continue;
      }
      results = results.concat(getFilesRecursively(fullPath, extensions));
    } else if (extensions.some((ext) => dirent.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

describe('Map Adapter Isolation & Boundary Test', () => {
  it('enforces that NO component outside apps/mobile/src/map imports @rnmapbox/maps', () => {
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    const searchDirs = [
      path.resolve(MOBILE_ROOT, 'app'),
      path.resolve(MOBILE_ROOT, 'src', 'utils'),
      path.resolve(MOBILE_ROOT, 'src', 'components'),
      path.resolve(MOBILE_ROOT, 'src', 'hooks'),
    ];

    const violations: { file: string; line: string }[] = [];

    for (const dir of searchDirs) {
      const files = getFilesRecursively(dir, extensions);
      for (const file of files) {
        // Skip files inside src/map
        if (file.startsWith(SRC_MAP_DIR)) {
          continue;
        }

        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i] ?? '';
          if (
            line.includes('@rnmapbox/maps') &&
            (line.includes('import ') || line.includes('require('))
          ) {
            violations.push({
              file: path.relative(MOBILE_ROOT, file),
              line: `Line ${i + 1}: ${line.trim()}`,
            });
          }
        }
      }
    }

    expect(
      violations,
      `Forbidden direct @rnmapbox/maps imports found outside src/map:\n${JSON.stringify(violations, null, 2)}`,
    ).toHaveLength(0);
  });

  describe('Custom Mapbox Style Specifications', () => {
    it('verifies that light and dark styles are valid Mapbox v8 schemas', () => {
      expect(lightMapStyle.version).toBe(8);
      expect(darkMapStyle.version).toBe(8);
      expect(lightMapStyle.name).toBe('Meridian Light');
      expect(darkMapStyle.name).toBe('Meridian Dark');
      expect(lightMapStyle.sources['mapbox-streets']).toBeDefined();
      expect(darkMapStyle.sources['mapbox-streets']).toBeDefined();
    });

    it('verifies key thematic layers exist in both light and dark styles', () => {
      const requiredLayerIds = [
        'background',
        'water',
        'landuse-greenery',
        'building',
        'road-motorway',
        'road-primary',
        'road-secondary',
        'road-local',
        'road-label',
        'place-label',
      ];

      const lightLayerIds = lightMapStyle.layers.map((l: { id: string }) => l.id);
      const darkLayerIds = darkMapStyle.layers.map((l: { id: string }) => l.id);

      for (const id of requiredLayerIds) {
        expect(lightLayerIds).toContain(id);
        expect(darkLayerIds).toContain(id);
      }
    });
  });
});
