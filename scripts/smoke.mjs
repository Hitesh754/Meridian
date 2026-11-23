#!/usr/bin/env node
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const composeFile = path.resolve(__dirname, '../infra/compose/docker-compose.yml');
const envFile = path.resolve(__dirname, '../.env');

function execCompose(cmd) {
  return execSync(`docker compose -f "${composeFile}" --env-file "${envFile}" ${cmd}`, {
    stdio: 'pipe',
    encoding: 'utf-8',
  });
}

async function waitForHttp(url, expectedStatus, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (res.status === expectedStatus) {
        const body = await res.json().catch(() => null);
        return { ok: true, status: res.status, body, headers: res.headers };
      }
    } catch {
      // Connection pending
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Timeout waiting for ${url} to return status ${expectedStatus}`);
}

async function runSmoke() {
  console.log('[smoke] Starting smoke test suite...');

  // Step 1: Ensure stack is running
  console.log('[smoke] Step 1: Ensuring docker stack is running...');
  execCompose('--profile core up -d');

  console.log('[smoke] Waiting for /readyz to return 200 OK...');
  const readyResult = await waitForHttp('http://127.0.0.1:8080/readyz', 200, 45000);
  console.log('[smoke] /readyz responded 200 OK:', readyResult.body?.status);
  if (readyResult.body?.dependencies?.postgres?.status !== 'healthy') {
    throw new Error('Postgres dependency was not reported healthy');
  }
  if (readyResult.body?.dependencies?.postgis?.status !== 'healthy') {
    throw new Error('PostGIS dependency was not reported healthy');
  }

  // Step 2: Stop postgres
  console.log('[smoke] Step 2: Stopping postgres container to simulate database failure...');
  execCompose('stop postgres');

  console.log('[smoke] Waiting for /readyz to return 503 Service Unavailable...');
  const unreadyResult = await waitForHttp('http://127.0.0.1:8080/readyz', 503, 20000);
  console.log('[smoke] /readyz correctly responded 503:', unreadyResult.body?.title);

  if (!unreadyResult.body?.detail?.includes('postgres')) {
    throw new Error(
      `Expected error detail to name postgres, received: ${unreadyResult.body?.detail}`,
    );
  }

  // Step 3: Restore postgres
  console.log('[smoke] Step 3: Restarting postgres container...');
  execCompose('start postgres');

  console.log('[smoke] Waiting for /readyz to recover to 200 OK...');
  const recoveredResult = await waitForHttp('http://127.0.0.1:8080/readyz', 200, 30000);
  console.log('[smoke] /readyz recovered to 200 OK:', recoveredResult.body?.status);

  console.log('\n[smoke] SUCCESS: All smoke test assertions passed verified!');
  process.exit(0);
}

runSmoke().catch((err) => {
  console.error('\n[smoke] FAILED:', err.message);
  process.exit(1);
});
