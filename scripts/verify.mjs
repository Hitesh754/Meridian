#!/usr/bin/env node
import { spawnSync } from 'node:child_process';

function runStep(name, command, args) {
  console.log(`\n============================================================`);
  console.log(`[VERIFY STEP] ${name}: ${command} ${args.join(' ')}`);
  console.log(`============================================================`);
  const result = spawnSync(command, args, { stdio: 'inherit', shell: true });
  if (result.status !== 0) {
    console.error(`\n[VERIFY FAILED] Step "${name}" exited with status ${result.status}`);
    process.exit(result.status ?? 1);
  }
}

console.log('Starting Meridian Complete Verification Suite...\n');

// 1. Check Secrets
runStep('Check Secrets', 'node', ['scripts/check-secrets.mjs']);

// 2. Biome Lint & Format Check
runStep('Biome Lint', 'pnpm', ['lint']);

// 3. TypeScript Typecheck
runStep('Typecheck', 'pnpm', ['typecheck']);

// 4. Unit Tests
runStep('Unit Tests', 'pnpm', ['test']);

// 5. Smoke Test (Docker Compose live failure simulation)
runStep('Compose Smoke Test', 'node', ['scripts/smoke.mjs']);

// 6. Integration Tests against live DB
runStep('Integration Tests', 'pnpm', ['test:integration']);

console.log('\n============================================================');
console.log('ALL MERIDIAN VERIFICATION GATES PASSED SUCCESSFULLY!');
console.log('============================================================\n');
process.exit(0);
