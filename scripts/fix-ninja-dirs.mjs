import fs from 'node:fs';
import path from 'node:path';

function fixNinjaDirs(ninjaFilePath) {
  if (!fs.existsSync(ninjaFilePath)) {
    console.log(`Not found: ${ninjaFilePath}`);
    return;
  }
  console.log(`Processing: ${ninjaFilePath}`);
  const content = fs.readFileSync(ninjaFilePath, 'utf8');
  const baseDir = path.dirname(path.resolve(ninjaFilePath));

  // Regex to match build targets like: build CMakeFiles/reanimated.dir/.../foo.cpp.o: ...
  const lines = content.split('\n');
  const dirSet = new Set();

  for (const line of lines) {
    if (line.startsWith('build CMakeFiles/')) {
      const match = line.match(/^build\s+(CMakeFiles\/[^\:]+?)\.o:/);
      if (match) {
        const objPath = match[1];
        const dirName = path.dirname(objPath);
        dirSet.add(dirName);
      }
    }
  }

  console.log(`Found ${dirSet.size} unique object directories.`);
  for (const relDir of dirSet) {
    const fullPath = path.join(baseDir, relDir);
    // Use \\?\ prefix for Windows long path support
    const longPath = fullPath.startsWith('\\\\?\\') ? fullPath : `\\\\?\\${fullPath}`;
    if (!fs.existsSync(longPath)) {
      fs.mkdirSync(longPath, { recursive: true });
      console.log(`Created: ${relDir}`);
    }
  }
  console.log('Finished creating all ninja output directories.');
}

// Find all build.ninja files in node_modules/react-native-reanimated and node_modules/@rnmapbox/maps
function findNinjaFiles(startDir) {
  const results = [];
  function walk(current) {
    if (!fs.existsSync(current)) return;
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name === 'build.ninja') {
        results.push(full);
      }
    }
  }
  walk(startDir);
  return results;
}

const ninjaFiles = [
  ...findNinjaFiles('node_modules/react-native-reanimated/android/.cxx'),
  ...findNinjaFiles('node_modules/@rnmapbox/maps/android/.cxx'),
  ...findNinjaFiles('apps/mobile/android/app/.cxx')
];

console.log(`Found ${ninjaFiles.length} build.ninja files.`);
for (const f of ninjaFiles) {
  fixNinjaDirs(f);
}
