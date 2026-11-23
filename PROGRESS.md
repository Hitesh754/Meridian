# Meridian Progress Tracking

Current State: Prompt A1 Complete. Mapbox mobile integration, token safety, custom styles, thin map adapter, and verification screen verified.

## Prompt Sequence Status

| Prompt | Name | Status | Description |
|---|---|---|---|
| **A0** | **Fresh Foundation (Meridian, Mapbox Edition)** | **DONE** | Monorepo setup, PostGIS Compose stack, Fastify API skeleton (/healthz, /readyz), Expo mobile skeleton, Zod contracts, design tokens, CI & verification scripts |
| **A1** | **Mapbox Integration** | **DONE** | Mobile Mapbox SDK configuration plugin, token handling, map adapter foundation, custom light/dark styles, /dev/map-check screen |
| **M1** | **Mobile UI Foundation** | PENDING | Three-mode tab navigation (Stays, Drive, Alerts), theme provider, reusable UI |
| **B1** | **Database Schema & Spatial Queries** | PENDING | `road_issues`, `issue_timeline`, `route_sessions` schemas, GiST indexes, spatial queries |
| **B2** | **API Foundation & Usage Guard** | PENDING | Fastify plugins, auth middleware, Mapbox free-tier usage counter guard |
| **B3** | **Issues & Tickets API** | PENDING | Report issue endpoint, deduplication, lifecycle transitions, corridor query |
| **B4** | **Live Alerts System** | PENDING | WebSocket gateway, corridor matching, push notification alerts |
| **M2** | **Real Issue Reporting** | PENDING | Safety-gated reporting flow, EXIF-stripped photo upload, offline queue |
| **M3** | **Live Alerts on Map** | PENDING | Real-time incident pins, cluster layers, proximity alert sound/haptics |
| **R1** | **Directions & Search Adapters** | PENDING | Mapbox Directions & Search API wrappers, rate limiter, cache policy |
| **M4** | **Turn-by-Turn Navigation** | PENDING | Drive mode UI, route corridor live tracking, session cleanup |
| **H1** | **Stays Discovery (Place Search)** | PENDING | Category place search, booking website deep links (zero fake prices) |
| **M5** | **Stays UI Experience** | PENDING | Hotel map cards, filter sheet, booking link confirmation |
| **Q1** | **Moderation & Admin Portal** | PENDING | Moderator dashboard, ticket status changes, audit timeline inspection |
| **Q2** | **Security & Privacy Hardening** | PENDING | EXIF stripping audit, pen-test suite, E2E flow tests |
| **Q3** | **Release & Production Build** | PENDING | EAS Android APK/AAB build, production Docker image, release checklist |

## Verification Milestones Achieved in A0
- [x] Initialized Git repository on `main` branch with verified user credentials.
- [x] Executed local environment audit (Windows 11, 8GB RAM, WSL2 Docker, free ports).
- [x] Verified compatibility matrix against official registries and NPM manifests.
- [x] Created complete architectural documentation in `docs/architecture/` (ADRs, Data Model, Threat Model, API Conventions, Lifecycle, Corridor Alerts, Privacy).
- [x] Implemented `@meridian/contracts` (Zod schemas for `/healthz`, `/readyz`, RFC 9457 `problem+json`, road categories) with 100% unit test coverage.
- [x] Implemented `@meridian/design-tokens` (spacing, radii, typography, dark/light palette) with automated WCAG AA contrast ratio test.
- [x] Built Fastify API service with Postgres/PostGIS connection pool, JSON logging, request tracing, and RFC 9457 errors.
- [x] Implemented reversible migration enabling PostGIS 3.4 on PostgreSQL 16.
- [x] Set up Expo SDK 58 mobile app with Expo Router, expo-dev-client, and live readiness screen. Passed `expo-doctor` (20/20 checks).
- [x] Configured Docker Compose profile `core` with memory limits (512MB PostgreSQL, 256MB API) bound to `127.0.0.1`.
- [x] Built and ran live failure smoke test (`scripts/smoke.mjs`), secrets scanner (`scripts/check-secrets.mjs`), and comprehensive verification pipeline (`scripts/verify.mjs`).

## Verification Milestones Achieved in A1
- [x] Passed Predecessor Check and verified A0 gates and Mapbox terms.
- [x] Confirmed Mapbox Free Tier account limits with user (zero card on file, hard stop at 100 MAUs / 100k directions/geocodes, billing alerts enabled). Recorded in `docs/recon/mapbox-account-notes.md`.
- [x] Configured `@rnmapbox/maps@10.3.19` and `expo-location@~58.0.22` in `apps/mobile/app.json`. Passed `expo-doctor` (20/20 checks passed).
- [x] Established token safety protocol: public token (`pk.*`) via untracked `.env.local`, secret download token (`sk.*`) outside repository in `%USERPROFILE%\.gradle\gradle.properties`. Documented in `docs/mapbox-setup.md`.
- [x] Extended `scripts/check-secrets.mjs` to block `sk.*`, untracked `.env.local` leakage, and `RNMapboxMapsDownloadToken` in `app.json`.
- [x] Extended `@meridian/design-tokens` with comprehensive cartographic color tokens (`lightMapColors`, `darkMapColors`, `mapThemes`) and WCAG 2.1 AA contrast tests. Documented in `docs/design/map-style-spec.md`.
- [x] Created custom original light and dark Mapbox Style specifications in `apps/mobile/src/map/styles/{light,dark}.json`.
- [x] Built isolated Map Adapter in `apps/mobile/src/map/` (`MapRoot`, `LayerHost`, `UserLocationLayer`, `Attribution`, `MapFailureView`, `types`).
- [x] Implemented and verified architectural boundary test `apps/mobile/tests/map-isolation.unit.test.ts` guaranteeing NO outside component imports `@rnmapbox/maps`.
- [x] Implemented local installation tracking UUID (`getOrCreateInstallationId`) using `expo-secure-store` and `expo-crypto`, documented in ADR-009.
- [x] Built interactive Map Verification Screen (`/dev/map-check`) with dynamic pan/zoom telemetry, location acquisition (`expo-location`), theme switching, and honest failure simulation (missing token, offline, SDK error).
- [x] Built Legal / About Screen (`/about`) with required Mapbox, OpenStreetMap, and ODbL attribution notices.
- [x] Created root `NOTICE` file documenting all third-party software and dataset licenses.
- [x] Verified full test suite and pipeline via `pnpm verify` (secrets scan, Biome lint, TypeScript typecheck, Vitest unit tests, Docker Compose failure smoke test, DB integration tests).

