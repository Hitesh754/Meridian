# Meridian Progress Report: Prompt A1 — Mapbox Integration, Tokens and Custom Map Style

**Date:** 2026-11-23  
**Prompt:** A1  
**Author:** Staff Mobile Engineer & Cartographer  
**Git Branch:** `main`  
**Verdict:** **SUCCESS — ALL A1 DELIVERABLES AND VERIFICATION GATES PASSED**

---

## 1. Executive Summary

Prompt A1 successfully integrates the Mapbox Maps SDK (`@rnmapbox/maps@10.3.19`) into the Meridian mobile client with zero token leakage, an isolated map adapter layer, custom accessible cartography (light & dark), a compliant attribution interface, and a robust developer verification screen (`/dev/map-check`) with honest failure handling.

All operations strictly honor the zero-cost rule and Mapbox Free Tier constraints (100 Mobile MAUs, 100,000 directions/mo, 100,000 search requests/mo).

---

## 2. Predecessor Check & Human Gate

1. **Predecessor Check:** Verified `docs/progress/A0-report.md`, `docs/recon/mapbox-terms-notes.md`, and `docs/recon/compatibility-matrix.md` exist with no blockers.
2. **Human Gate Confirmed:**
   - **Billing & Limits:** Developer confirmed zero credit card on file; Mapbox account denies requests / hard stops at free limits.
   - **Confirmed Quotas:** 100 Monthly Active Users (Mobile Navigation SDK), 100,000 Directions requests/month, 100,000 Geocoding/Search requests/month.
   - **Alerts:** Usage notifications enabled in Mapbox dashboard.
   - Recorded formally in `docs/recon/mapbox-account-notes.md`.

---

## 3. Key Tasks Executed

### 3.1 Token Safety & Secret Scanner
- **Public Token (`pk.*`):** Sourced strictly via `process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` from untracked `apps/mobile/.env.local`. `.env.example` provides empty placeholders only.
- **Secret Download Token (`sk.*`):** Stored completely outside the repository in `%USERPROFILE%\.gradle\gradle.properties` (`MAPBOX_DOWNLOADS_TOKEN=sk...`).
- **Secret Scanner (`scripts/check-secrets.mjs`):** Extended to verify:
  1. No `sk.*` or `pk.*` tokens exist in git-tracked or staged files.
  2. `.env.local` is never tracked by git.
  3. `RNMapboxMapsDownloadToken` is never set in `apps/mobile/app.json`.
- **Validation:**
  ```powershell
  node scripts/check-secrets.mjs
  # [check-secrets] Scanning git-tracked and staged files for forbidden Mapbox tokens...
  # [check-secrets] All git-tracked files verified clean of secrets.
  git grep -nE "sk\.[A-Za-z0-9]" -- . ":!docs"
  # (Exit code 1, zero occurrences)
  ```

### 3.2 Native SDK Configuration & Expo Dev Client
- Pinned and installed:
  - `@rnmapbox/maps@10.3.19` (MIT)
  - `expo-location@~58.0.22` (MIT)
  - `expo-secure-store@~58.0.3` (MIT)
  - `expo-crypto@~58.0.8` (MIT)
- Updated `apps/mobile/app.json` with config plugins and Android fine/coarse location permissions.
- Ran `npx expo-doctor` inside `apps/mobile`: **20/20 checks passed**.
- Documented Gradle memory optimizations for Windows 11 8GB RAM (`org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m`, `org.gradle.workers.max=2`) and physical Android phone USB debugging (`adb reverse tcp:8080 tcp:8080`) in `docs/mapbox-setup.md`.

### 3.3 Custom Map Look & Cartographic Design System
- Extended `packages/design-tokens` with complete map color tokens (`lightMapColors`, `darkMapColors`, `mapThemes`) satisfying WCAG 2.1 AA contrast requirements (>= 4.5:1 for all text labels against road and terrain backgrounds).
- Created offline-capable custom Mapbox Style JSON specifications in `apps/mobile/src/map/styles/`:
  - `light.json`: Quiet slate-50 ground (`#F8F9FA`), soft water (`#C8DCED`), amber motorway (`#F59E0B`), high-contrast slate-700 road labels.
  - `dark.json`: Deep night slate-900 ground (`#0F172A`), midnight navy water (`#0B2545`), amber motorway, slate-200 road labels.
- Published full cartographic design specification in `docs/design/map-style-spec.md`.

### 3.4 Isolated Map Adapter (`apps/mobile/src/map/`)
- Encapsulated the entire native Mapbox SDK inside `apps/mobile/src/map/`:
  - `MapRoot.tsx`: Base container managing token initialization, camera, theme changes, and error fallbacks.
  - `CameraHandle`: Imperative camera controls (`flyTo`, `fitBounds`, `resetNorth`, `followUser`, `setZoom`).
  - `UserLocationLayer.tsx`: Location puck with pulsing accuracy circle.
  - `LayerHost.tsx`: Declarative GeoJSON host (`GeoJSONSource`, `CircleLayer`, `LineLayer`, `SymbolLayer`) supporting pin/route/ticket clustering without outside imports.
  - `Attribution.tsx`: Persistent Mapbox and OpenStreetMap legal links.
  - `MapFailureView.tsx`: Honest accessible error UI with retry action.
- **Architectural Boundary Enforcement:** Created `apps/mobile/tests/map-isolation.unit.test.ts` scanning all files outside `src/map/`. Asserts that zero components outside `src/map` import `@rnmapbox/maps`.

### 3.5 Local Installation Tracking (ADR-009)
- Implemented `apps/mobile/src/utils/installation.ts` (`getOrCreateInstallationId()`).
- Uses `expo-secure-store` and `expo-crypto.randomUUID()` to persist a pure random UUIDv4 in the secure device Keystore.
- Complete privacy: ZERO hardware IDs, IMEI, or Android IDs accessed.
- Prepares client interface for Prompt B2's backend usage guard to enforce the 100 Mobile MAU free tier ceiling.
- Documented in `docs/architecture/decisions.md` (ADR-009).

### 3.6 Dev Map Check Screen (`/dev/map-check`) & Legal (`/about`)
- Built `apps/mobile/app/dev/map-check.tsx`:
  - Renders `MapRoot` with custom styling and light/dark theme switch.
  - Live pan/zoom telemetry: center `[lng, lat]`, zoom level, heading.
  - "Locate Me" button requesting real permissions via `expo-location` and flying camera to user coordinates.
  - Reset North orientation button.
  - Honest failure simulation drawer testing: Missing Token, Network Offline, and SDK Init Error with in-place error cards and retry action.
- Built `apps/mobile/app/about.tsx`: Comprehensive legal attribution for Mapbox, OpenStreetMap (ODbL / CC-BY-SA 2.0), and open-source licenses.
- Created repository root `NOTICE` file.
- Updated `apps/mobile/app/index.tsx` with navigation links to `/dev/map-check` and `/about`.

---

## 4. Verification Evidence

The full verification suite was executed via `pnpm verify`:

```
============================================================
[VERIFY STEP] Check Secrets: node scripts/check-secrets.mjs
============================================================
[check-secrets] Scanning git-tracked and staged files for forbidden Mapbox tokens...
[check-secrets] All git-tracked files verified clean of secrets.

============================================================
[VERIFY STEP] Biome Lint: pnpm lint
============================================================
> biome check .
Checked 48 files in 79ms. No fixes applied.

============================================================
[VERIFY STEP] Typecheck: pnpm typecheck
============================================================
> tsc -p packages/contracts/tsconfig.json --noEmit && tsc -p packages/design-tokens/tsconfig.json --noEmit && tsc -p apps/api/tsconfig.json --noEmit && tsc -p apps/mobile/tsconfig.json --noEmit
(Exited with status 0, zero errors)

============================================================
[VERIFY STEP] Unit Tests: pnpm test
============================================================
 ✓ packages/design-tokens/tests/tokens.test.ts (20 tests)
 ✓ apps/mobile/tests/map-isolation.unit.test.ts (3 tests)
 ✓ packages/contracts/tests/contracts.test.ts (9 tests)
 ✓ apps/api/tests/health.unit.test.ts (4 tests)
 Test Files  4 passed (4)
      Tests  36 passed (36)

============================================================
[VERIFY STEP] Compose Smoke Test: node scripts/smoke.mjs
============================================================
[smoke] Starting smoke test suite...
[smoke] Step 1: Ensuring docker stack is running...
[smoke] /readyz responded 200 OK: ready
[smoke] Step 2: Stopping postgres container to simulate database failure...
[smoke] /readyz correctly responded 503: Service Unavailable
[smoke] Step 3: Restarting postgres container...
[smoke] /readyz recovered to 200 OK: ready
[smoke] SUCCESS: All smoke test assertions passed verified!

============================================================
[VERIFY STEP] Integration Tests: pnpm test:integration
============================================================
 ✓ apps/api/tests/api.integration.test.ts (2 tests)
 Test Files  1 passed (1)
      Tests  2 passed (2)

============================================================
ALL MERIDIAN VERIFICATION GATES PASSED SUCCESSFULLY!
============================================================
```

---

## 5. Changed Files Summary

| File | Status | Description |
|---|---|---|
| `docs/recon/mapbox-account-notes.md` | Created | Confirmed account limits (100 MAUs, 100k directions/geocodes, no card, hard stop) |
| `docs/mapbox-setup.md` | Created | Token setup guide, 8GB RAM Gradle settings, USB debugging (`adb reverse`) |
| `docs/design/map-style-spec.md` | Created | Cartographic styling specification, road hierarchy, color tokens |
| `docs/architecture/decisions.md` | Modified | Added ADR-009 for Client Installation ID usage accounting |
| `NOTICE` | Created | Third-party notices and attribution (Mapbox, OSM, ODbL, React Native, PostGIS) |
| `scripts/check-secrets.mjs` | Modified | Extended to detect `sk.*`, `.env.local` tracking, and `RNMapboxMapsDownloadToken` |
| `packages/design-tokens/src/index.ts` | Modified | Added `lightMapColors`, `darkMapColors`, `mapThemes` |
| `packages/design-tokens/tests/tokens.test.ts` | Modified | Added tests for map tokens and WCAG 2.1 AA contrast |
| `apps/mobile/package.json` | Modified | Added `@rnmapbox/maps`, `expo-location`, `expo-secure-store`, `expo-crypto` |
| `apps/mobile/app.json` | Modified | Configured `@rnmapbox/maps` and `expo-location` plugins and Android permissions |
| `apps/mobile/tsconfig.json` | Modified | Added `resolveJsonModule`, excluded `tests/**` from Expo build |
| `apps/mobile/src/map/types.ts` | Created | Strongly-typed map contracts, camera handles, layer definitions, error kinds |
| `apps/mobile/src/map/styles/light.json` | Created | Custom Light Mapbox style JSON with Meridian token palette |
| `apps/mobile/src/map/styles/dark.json` | Created | Custom Dark Mapbox style JSON with Meridian token palette |
| `apps/mobile/src/map/styles/index.ts` | Created | Style JSON and remote URL helpers |
| `apps/mobile/src/map/MapRoot.tsx` | Created | Root map adapter component with token guard and camera handling |
| `apps/mobile/src/map/LayerHost.tsx` | Created | Declarative layer registration for sources, circles, lines, and symbols |
| `apps/mobile/src/map/UserLocationLayer.tsx` | Created | Native LocationPuck wrapper with pulsing accuracy halo |
| `apps/mobile/src/map/Attribution.tsx` | Created | Mapbox and OpenStreetMap attribution overlay |
| `apps/mobile/src/map/MapFailureView.tsx` | Created | Honest error card with setup instructions and retry button |
| `apps/mobile/src/map/index.ts` | Created | Map adapter barrel export |
| `apps/mobile/src/utils/installation.ts` | Created | Persistent anonymous client UUID generator (`getOrCreateInstallationId`) |
| `apps/mobile/tests/map-isolation.unit.test.ts` | Created | Architecture isolation test enforcing zero outside imports of `@rnmapbox/maps` |
| `apps/mobile/app/dev/map-check.tsx` | Created | Developer verification screen with live telemetry and failure simulators |
| `apps/mobile/app/about.tsx` | Created | Legal notices, Mapbox and OSM terms, telemetry disclosure |
| `apps/mobile/app/index.tsx` | Modified | Added navigation buttons to `/dev/map-check` and `/about` |
| `PROGRESS.md` | Modified | Updated status to Prompt A1 Complete |
| `pnpm-lock.yaml` | Modified | Pinned dependency tree |

---

## 6. Deviations, Known Risks & Next Steps

### 6.1 Deviations
- None. All tasks strictly followed Prompt A1 specifications.

### 6.2 Known Risks
- **Mapbox 100 Mobile MAU Limit:** Exceeding 100 unique installations within a monthly billing cycle will cause Mapbox to deny tile requests (since no card is on file). Prompt B2 will establish the backend usage guard to track and enforce this ceiling before mobile clients initiate navigation sessions.
- **Gradle RAM Consumption on 8 GB Machine:** Building native Android development builds locally consumes significant RAM. The documented heap settings (`-Xmx2048m -XX:MaxMetaspaceSize=512m`) must be respected when running `npx expo run:android`.

### 6.3 Next Steps (Prompt M1)
- Proceed to **Prompt M1 — Mobile UI Foundation**:
  - Implement three-mode tab navigation (`STAYS`, `DRIVE`, `ALERTS`).
  - Implement application theme provider consuming `@meridian/design-tokens`.
  - Build reusable UI sheet, button, card, and modal primitives.
