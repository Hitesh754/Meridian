#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const composeFile = path.resolve(rootDir, 'infra/compose/docker-compose.yml');
const envFile = path.resolve(rootDir, '.env');
const deployDir = path.resolve(rootDir, 'apps/api/deploy');

const action = process.argv[2] ?? 'up';

function run(cmd, args, cwd = rootDir) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', cwd, shell: true });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function runCompose(args) {
  const fullArgs = ['compose', '-f', composeFile, '--env-file', envFile, ...args];
  console.log(`[Docker Compose] Running: docker ${fullArgs.join(' ')}`);
  const result = spawnSync('docker', fullArgs, { stdio: 'inherit', cwd: rootDir, shell: true });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (action === 'up') {
  console.log('[Stack] Building workspace packages...');
  run('pnpm', ['run', 'build']);

  console.log('[Stack] Preparing isolated production API deployment...');
  if (fs.existsSync(deployDir)) {
    fs.rmSync(deployDir, { recursive: true, force: true });
  }
  run('pnpm', ['--filter=@meridian/api', '--prod', '--legacy', 'deploy', 'apps/api/deploy']);

  runCompose(['--profile', 'core', 'up', '-d', '--build']);
} else if (action === 'down') {
  runCompose(['--profile', 'core', 'down']);
} else if (action === 'reset') {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    'WARNING: Resetting will destroy PostgreSQL containers and all data volumes!\nType "YES" to proceed: ',
    (answer) => {
      rl.close();
      if (answer.trim() === 'YES') {
        console.log('Destroying containers and volumes...');
        runCompose(['--profile', 'core', 'down', '-v']);
        console.log('Reset complete.');
      } else {
        console.log('Reset aborted.');
      }
    },
  );
} else {
  console.error(`Unknown action: ${action}. Use up, down, or reset.`);
  process.exit(1);
}
