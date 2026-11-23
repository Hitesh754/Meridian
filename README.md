# Meridian

**Meridian** is a mobile-first, road-aware travel platform with three integrated operating modes:

1. **STAYS:** Discover hotels and lodging on an interactive map with direct links to book. No deceptive scraped pricing.
2. **DRIVE:** Car navigation with turn-by-turn guidance and dynamic in-corridor road hazard awareness.
3. **ALERTS:** Report potholes, debris, and road problems, raising tracked in-app tickets with universal visibility for all drivers whose routes intersect them.

---

## Architecture at a Glance

- **Monorepo:** pnpm workspaces (`apps/*`, `packages/*`).
- **Mobile Client (`apps/mobile`):** Expo SDK 58, React Native 0.88, Expo Router, TypeScript, development builds (`expo-dev-client`), Mapbox Maps SDK (`@rnmapbox/maps`).
- **Backend API (`apps/api`):** Node.js LTS (Node 22), Fastify 5, TypeScript, Pino JSON logging, RFC 9457 Problem Details.
- **Data & Spatial Store:** PostgreSQL 16 with PostGIS 3.4 (`postgis/postgis:16-3.4`). All spatial coordinates in SRID 4326.
- **Infrastructure (`infra/compose`):** Docker Compose (core profile: PostgreSQL + PostGIS, migration runner, API).
- **Quality Gates:** Biome linter/formatter, Vitest unit and integration test runner, secret-leak checker.

---

## Quick Start

### 1. Prerequisites
- Windows 11 with WSL2 enabled and Docker Desktop running.
- Node.js LTS (v22+) and pnpm (via Corepack).
- (Optional) Physical Android device with USB debugging enabled.

### 2. Install Dependencies
```powershell
corepack enable
corepack prepare pnpm@10.6.0 --activate
pnpm install
```

### 3. Start Local Infrastructure
```powershell
cp .env.example .env
pnpm dev:stack
```

Verify readiness:
```powershell
curl.exe -i http://127.0.0.1:8080/readyz
```

### 4. Run Mobile App
```powershell
cd apps/mobile
pnpm start
```
Connect your physical phone via USB and run `adb reverse tcp:8080 tcp:8080` and `adb reverse tcp:8081 tcp:8081`.

### 5. Verification Suite
```powershell
pnpm verify
```

---

## Documentation Links
- [Compatibility Matrix](file:///c:/Users/Hitesh/Documents/meridian/docs/recon/compatibility-matrix.md)
- [Environment Report](file:///c:/Users/Hitesh/Documents/meridian/docs/recon/environment.md)
- [Mapbox Terms Notes](file:///c:/Users/Hitesh/Documents/meridian/docs/recon/mapbox-terms-notes.md)
- [Windows & WSL2 Setup Guide](file:///c:/Users/Hitesh/Documents/meridian/docs/windows-setup.md)
- [Architecture Overview](file:///c:/Users/Hitesh/Documents/meridian/docs/architecture/00-overview.md)
- [Architectural Decisions (ADR)](file:///c:/Users/Hitesh/Documents/meridian/docs/architecture/decisions.md)
- [Data Model & Schema](file:///c:/Users/Hitesh/Documents/meridian/docs/architecture/data-model.md)
- [API Conventions](file:///c:/Users/Hitesh/Documents/meridian/docs/architecture/api-conventions.md)
- [Road Issues & Tickets](file:///c:/Users/Hitesh/Documents/meridian/docs/architecture/road-issues-and-tickets.md)
- [Route Alerts & Corridor Engine](file:///c:/Users/Hitesh/Documents/meridian/docs/architecture/route-alerts.md)
- [Privacy & Driver Safety](file:///c:/Users/Hitesh/Documents/meridian/docs/architecture/privacy-and-safety.md)
- [Threat Model](file:///c:/Users/Hitesh/Documents/meridian/docs/architecture/threat-model.md)
- [MVP Scope & Prompt Plan](file:///c:/Users/Hitesh/Documents/meridian/docs/architecture/mvp-scope.md)
- [Glossary](file:///c:/Users/Hitesh/Documents/meridian/docs/architecture/glossary.md)
- [Progress Log](file:///c:/Users/Hitesh/Documents/meridian/PROGRESS.md)
