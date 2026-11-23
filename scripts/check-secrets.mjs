#!/usr/bin/env node
import { execSync } from 'node:child_process';
import fs from 'node:fs';

console.log('[check-secrets] Scanning git-tracked and staged files for forbidden Mapbox tokens...');

// Pattern for Mapbox secret tokens: sk.<chars>
const SECRET_TOKEN_REGEX = /sk\.[a-zA-Z0-9_\-.]{20,}/g;

// Pattern for Mapbox public tokens: pk.<chars>
const PUBLIC_TOKEN_REGEX = /pk\.[a-zA-Z0-9_\-.]{20,}/g;

// Files allowed to mention placeholder variable names without actual tokens
const ALLOWED_EXAMPLE_FILES = new Set(['.env.example']);

let trackedFiles = [];
try {
  const output = execSync('git ls-files', { encoding: 'utf-8' });
  trackedFiles = output
    .split('\n')
    .map((f) => f.trim())
    .filter(Boolean);
} catch (err) {
  console.error('[check-secrets] Failed to get git-tracked files:', err);
  process.exit(1);
}

const violations = [];

// 1. Verify that .env.local is not tracked by git
if (trackedFiles.includes('.env.local') || trackedFiles.includes('apps/mobile/.env.local')) {
  violations.push({
    file: '.env.local',
    line: 1,
    type: 'FORBIDDEN_ENV_FILE_TRACKED (.env.local must be gitignored)',
  });
}

// 2. Scan every tracked file for actual secret or public token strings
for (const filePath of trackedFiles) {
  if (!fs.existsSync(filePath)) continue;

  const stats = fs.statSync(filePath);
  if (stats.isDirectory() || stats.size > 2 * 1024 * 1024) continue; // Skip large or binary files

  const content = fs.readFileSync(filePath, 'utf-8');

  // Check app.json specifically for RNMapboxMapsDownloadToken
  if (filePath.endsWith('app.json')) {
    if (content.includes('RNMapboxMapsDownloadToken')) {
      violations.push({
        file: filePath,
        line: 1,
        type: 'FORBIDDEN_APP_JSON_DOWNLOAD_TOKEN (Mapbox secret token must not be in app.json)',
      });
    }
  }

  // Scan file contents line by line
  const lines = content.split('\n');
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex];

    // Check for secret tokens anywhere in the repo
    if (SECRET_TOKEN_REGEX.test(line)) {
      violations.push({
        file: filePath,
        line: lineIndex + 1,
        type: 'SECRET_TOKEN_DETECTED (sk.*)',
      });
    }

    // Check for public tokens outside allowed .env.example
    if (
      !ALLOWED_EXAMPLE_FILES.has(filePath) &&
      !filePath.startsWith('docs/') &&
      PUBLIC_TOKEN_REGEX.test(line)
    ) {
      violations.push({
        file: filePath,
        line: lineIndex + 1,
        type: 'PUBLIC_TOKEN_LEAK (pk.*)',
      });
    }
  }
}

if (violations.length > 0) {
  console.error('\n[FATAL] Secret check failed! Forbidden tokens found in git-tracked files:');
  for (const v of violations) {
    console.error(`  - ${v.file}:${v.line} [${v.type}]`);
  }
  console.error('\nMapbox secret tokens (sk.*) must NEVER be committed to version control.');
  console.error(
    'Public tokens (pk.*) must only be passed via untracked .env.local environment variables.',
  );
  console.error('Download tokens must live outside the repo in ~/.gradle/gradle.properties.');
  process.exit(1);
}

console.log('[check-secrets] All git-tracked files verified clean of secrets.');
process.exit(0);
