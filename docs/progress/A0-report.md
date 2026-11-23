# Prompt A0 Verification Report: Fresh Foundation (Meridian, Mapbox Edition)

**Date:** 2026-11-23  
**Branch:** `main`  
**Author:** Hitesh Choudhary (`hitesh31c@gmail.com`)  
**Workspace:** `C:\Users\Hitesh\Documents\meridian`

---

## 1. Predecessor Check & Environment
- **Git Repo:** Brand-new folder, initialized with `git init -b main`.
- **Git Identity:** User name: `Hitesh Choudhary`, User email: `hitesh31c@gmail.com`.
- **Host OS:** Windows 11 Home, PowerShell 5.1 / Node 22.15.1 / pnpm 10.6.0.
- **Docker & Compose:** Docker Engine 29.9.3, Docker Compose v5.7.0 (WSL2 backend).
- **Physical Resources:** 8 GB RAM physical (~800MB free host baseline, WSL2 capped at 3.67GB, ~30GB free disk space).
- **Port Inspection:** Ports 3000, 5432, 8080, and 8081 verified free before launch.

---

## 2. Key Architecture & Recon Artifacts Produced
- `docs/recon/compatibility-matrix.md`: Verified versions, SPDX licenses, and compatibility statuses for all components.
- `docs/recon/environment.md`: Measured machine facts and resource verdict for 8GB RAM host.
- `docs/recon/mapbox-terms-notes.md`: Rules on Mapbox data rendering, directions caching prohibitions, logo/attribution, and the 100 Mobile MAU free cap.
- `docs/windows-setup.md`: WSL2 memory guidance, Docker Desktop configuration, physical Android USB debugging instructions (`adb reverse tcp:8080 tcp:8080`), and iOS Windows limits.
- `docs/architecture/`:
  - `00-overview.md`: System context diagram and 3 modes (Stays, Drive, Alerts).
  - `decisions.md`: ADRs 001–008 (Fastify, PostGIS, pnpm monorepo, 100 MAU Mapbox cap, map adapter module, stays place search without fake prices, in-app tracked tickets, future seams).
  - `data-model.md`: PostgreSQL schema for `road_issues`, `issue_timeline`, `route_sessions` (SRID 4326, GeoJSON `[lng, lat]`, GiST indexes).
  - `api-conventions.md`: REST `/v1`, UUIDs, UTC timestamps, RFC 9457 `problem+json`, cursor pagination.
  - `road-issues-and-tickets.md`: Issue lifecycle state machine (`open` -> `acknowledged` -> `in_progress` -> `resolved` / `rejected` / `duplicate`), 40m/72h deduplication logic, audit timeline.
  - `route-alerts.md`: Corridor query (`ST_Buffer`, `ST_LineLocatePoint`), active session matching, WebSocket dispatch.
  - `privacy-and-safety.md`: Driving speed gate (>20 km/h: passenger check or one-tap quick report), EXIF stripping, retention rules.
  - `threat-model.md`: Threats T-01 through T-08 with mitigations.
  - `mvp-scope.md`: Prompt roadmap A0 through Q3, Mapbox free-tier guard.
  - `glossary.md`: Domain definitions.

---

## 3. Real Verification Commands & Trimmed Evidence

### 3.1 Docker Compose Stack Startup (`pnpm dev:stack`)
Command:
```powershell
pnpm dev:stack
```
Output:
```
> meridian@0.1.0 dev:stack C:\Users\Hitesh\Documents\meridian
> node scripts/compose.mjs up

[Stack] Building workspace packages...
> tsc -p packages/contracts/tsconfig.json && tsc -p packages/design-tokens/tsconfig.json && tsc -p apps/api/tsconfig.json

[Stack] Preparing isolated production API deployment...
Packages are copied from the content-addressable store to the virtual store.
Progress: resolved 168, reused 89, downloaded 0, added 89, done
[Docker Compose] Running: docker compose -f C:\Users\Hitesh\Documents\meridian\infra\compose\docker-compose.yml --env-file C:\Users\Hitesh\Documents\meridian\.env --profile core up -d --build
 Image meridian-api Built
 Image meridian-migrate Built
 Container meridian-postgres Running
 Container meridian-postgres Healthy
 Container meridian-migrate Started
 Container meridian-migrate Exited (0)
 Container meridian-api Started
```

### 3.2 Docker Compose PS Status
Command:
```powershell
docker compose -f infra/compose/docker-compose.yml --env-file .env ps
```
Output:
```
NAME                IMAGE                    COMMAND                  SERVICE    STATUS                        PORTS
meridian-api        meridian-api             "docker-entrypoint.s…"   api        Up 8 seconds (healthy)        127.0.0.1:8080->8080/tcp
meridian-postgres   postgis/postgis:16-3.4   "docker-entrypoint.s…"   postgres   Up About a minute (healthy)   127.0.0.1:5432->5432/tcp
```

### 3.3 API Health & Readiness Endpoints
Command:
```powershell
curl.exe -i http://127.0.0.1:8080/healthz
curl.exe -i http://127.0.0.1:8080/readyz
```
Output:
```http
HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
content-length: 92

{"status":"ok","timestamp":"2026-11-23T14:51:58.186Z","uptime":17.079599695,"service":"api"}

HTTP/1.1 200 OK
content-type: application/json; charset=utf-8
content-length: 209

{"status":"ready","timestamp":"2026-11-23T14:51:58.246Z","uptime":17.139503366,"service":"api","dependencies":{"postgres":{"status":"healthy","latencyMs":2.06},"postgis":{"status":"healthy","latencyMs":2.39}}}
```

### 3.4 Direct PostGIS Version Query in Container
Command:
```powershell
docker compose -f infra/compose/docker-compose.yml --env-file .env exec postgres psql -U meridian_dev -d meridian -c "SELECT postgis_full_version();"
```
Output:
```
                                                                                               postgis_full_version                                                                                               
------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
 POSTGIS="3.4.3 e365945" [EXTENSION] PGSQL="160" GEOS="3.9.0-CAPI-1.16.2" PROJ="7.2.1 NETWORK_ENABLED=OFF URL_ENDPOINT=https://cdn.proj.org USER_WRITABLE_DIRECTORY=/var/lib/postgresql/.local/share/proj"
(1 row)
```

### 3.5 Reversible PostGIS Migrations (Down & Up)
Command:
```powershell
pnpm db:migrate:down; pnpm db:migrate
```
Output:
```
[Database Migration] Running direction: DOWN...
### MIGRATION 1700000000000_enable_postgis (DOWN) ###
DROP EXTENSION IF EXISTS "postgis" CASCADE;
DELETE FROM "public"."pgmigrations" WHERE name='1700000000000_enable_postgis';
[Database Migration] DOWN succeeded. Processed 1 migration(s).

[Database Migration] Running direction: UP...
### MIGRATION 1700000000000_enable_postgis (UP) ###
CREATE EXTENSION IF NOT EXISTS "postgis";
INSERT INTO "public"."pgmigrations" (name, run_on) VALUES ('1700000000000_enable_postgis', NOW());
[Database Migration] UP succeeded. Processed 1 migration(s).
```

### 3.6 Automated Smoke Test (Failure Simulation & Recovery)
Command:
```powershell
node scripts/smoke.mjs
```
Output:
```
[smoke] Starting smoke test suite...
[smoke] Step 1: Ensuring docker stack is running...
[smoke] Waiting for /readyz to return 200 OK...
[smoke] /readyz responded 200 OK: ready
[smoke] Step 2: Stopping postgres container to simulate database failure...
[smoke] Waiting for /readyz to return 503 Service Unavailable...
[smoke] /readyz correctly responded 503: Service Unavailable
[smoke] Step 3: Restarting postgres container...
[smoke] Waiting for /readyz to recover to 200 OK...
[smoke] /readyz recovered to 200 OK: ready
[smoke] SUCCESS: All smoke test assertions passed verified!
```

### 3.7 Secrets Leak Scan
Command:
```powershell
node scripts/check-secrets.mjs
```
Output:
```
[check-secrets] Scanning git-tracked files for forbidden Mapbox tokens...
[check-secrets] All git-tracked files verified clean of secrets.
```

### 3.8 Unit & Integration Tests
Command:
```powershell
pnpm test
pnpm test:integration
```
Output:
```
 ✓ packages/design-tokens/tests/tokens.test.ts (17 tests) 14ms
 ✓ packages/contracts/tests/contracts.test.ts (9 tests) 38ms
 ✓ apps/api/tests/health.unit.test.ts (4 tests) 377ms
 Test Files  3 passed (3)
      Tests  30 passed (30)

 ✓ apps/api/tests/api.integration.test.ts (2 tests) 293ms
 Test Files  1 passed (1)
      Tests  2 passed (2)
```

### 3.9 Lint & Full Typecheck
Command:
```powershell
pnpm lint
pnpm typecheck
```
Output:
```
> biome check .
Checked 34 files in 22ms. No fixes applied.

> tsc -p packages/contracts/tsconfig.json --noEmit && tsc -p packages/design-tokens/tsconfig.json --noEmit && tsc -p apps/api/tsconfig.json --noEmit && tsc -p apps/mobile/tsconfig.json --noEmit
(exit code 0, no errors)
```

### 3.10 Mobile Expo Doctor Verification
Command:
```powershell
cd apps/mobile; npx expo-doctor
```
Output:
```
Running 20 checks on your project...
20/20 checks passed. No issues detected!
```

### 3.11 Full Verification Pipeline (`pnpm verify`)
Command:
```powershell
pnpm verify
```
Output:
```
Starting Meridian Complete Verification Suite...
============================================================
[VERIFY STEP] Check Secrets: node scripts/check-secrets.mjs -> PASSED
[VERIFY STEP] Biome Lint: pnpm lint -> PASSED
[VERIFY STEP] Typecheck: pnpm typecheck -> PASSED
[VERIFY STEP] Unit Tests: pnpm test -> PASSED (30 tests)
[VERIFY STEP] Compose Smoke Test: node scripts/smoke.mjs -> PASSED
[VERIFY STEP] Integration Tests: pnpm test:integration -> PASSED (2 tests)
============================================================
ALL MERIDIAN VERIFICATION GATES PASSED SUCCESSFULLY!
============================================================
```

### 3.12 Package Security Audit (`pnpm audit`)
Command:
```powershell
pnpm audit
```
Output:
```
No known vulnerabilities found
```

---

## 4. Key Deviations, Adjustments & Rationale
1. **Container Build Strategy (`pnpm deploy`):**  
   Inside Alpine Linux on WSL2, running `pnpm install` across the entire hoisted monorepo downloaded 650+ packages, hitting intermittent network stalls. We leveraged pnpm v10's official isolated deployment mechanism: `pnpm --filter=@meridian/api --prod --legacy deploy apps/api/deploy`. This stages a lightweight (26MB) directory containing only production dependencies and compiled packages. The Docker build context transferred in 0.8s, producing a deterministic, non-root, multi-stage production runner image that builds and boots in seconds without downloading anything during Docker build.
2. **PostGIS Down Migration Cascade:**  
   The official `postgis/postgis:16-3.4` Docker image pre-installs `postgis_topology` and `postgis_tiger_geocoder`, which depend on the `postgis` core extension. A simple `DROP EXTENSION postgis` failed with PostgreSQL error `2BP01`. Adding `cascade: true` to `pgm.dropExtension('postgis', { ifExists: true, cascade: true })` cleanly enables reversible rollbacks.
3. **Vitest Integration Config Exclusion:**  
   Because `apps/api/deploy` contains a replica of `apps/api/tests/api.integration.test.ts`, Vitest was configured with `exclude: ['**/deploy/**', ...]` so integration tests only execute once against the root project source.
4. **Dependency Overrides for Audit:**  
   `glob` (<14.0.2) and `minimatch` (<11.0.1) vulnerabilities in transitive dependencies of `node-pg-migrate` and `expo` were cleanly resolved using `pnpm.overrides` in root `package.json`, yielding `No known vulnerabilities found`.

---

## 5. Risk Assessment
1. **Host Memory Headroom (8GB RAM):**  
   Docker Desktop with WSL2, PostgreSQL (512MB limit), Fastify API (256MB limit), and Metro Bundler consume approximately 1.5–2GB of memory. On an 8GB machine with background Windows tasks, developers should keep browser tabs minimal and follow `docs/windows-setup.md` `.wslconfig` recommendations.
2. **Mapbox 100 Mobile MAU Free Ceiling:**  
   The Mobile Navigation SDK strictly limits monthly active users to 100 on the free tier. Future prompt `B2` must implement the usage guard counter and client throttling before public distribution.
3. **Physical Android Device Network Routing:**  
   When connecting a physical Android phone over USB debugging, developer must run `adb reverse tcp:8080 tcp:8080` (API) and `adb reverse tcp:8081 tcp:8081` (Metro), or configure Windows Firewall for LAN IP access.
