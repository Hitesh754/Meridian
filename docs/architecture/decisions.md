# Architectural Decision Records (ADR)

## ADR-001: TypeScript on Node.js for Backend API
- **Context:** The backend requires fast I/O, shared schema validation with the mobile app, and rich spatial libraries.
- **Decision:** Use Node.js LTS with Fastify and TypeScript.
- **Rationale:** Fastify provides the lowest overhead among Node HTTP frameworks, first-class JSON schema validation, and Pino logging. TypeScript allows sharing contract types and Zod schemas directly across the monorepo with zero drift.

## ADR-002: PostgreSQL 16 with PostGIS 3.4 for Spatial Computations
- **Context:** Meridian relies heavily on spatial calculations: bounding box queries, corridor buffering (`ST_Buffer`), distance along route (`ST_LineLocatePoint`), and proximity triggers (`ST_DWithin`).
- **Decision:** Use PostgreSQL 16 with PostGIS 3.4 exclusively. Do not introduce H3, Redis GIS, or Elasticsearch in MVP.
- **Rationale:** PostGIS offers proven, mathematically rigorous geodesic calculations natively in SQL with standard GiST indexing on SRID 4326. Keeping a single data store simplifies developer machine memory usage (under 512MB RAM in Docker).

## ADR-003: pnpm-Only Monorepo Architecture
- **Context:** Code is shared between contracts, design tokens, backend API, and mobile client.
- **Decision:** Use pnpm workspaces (`pnpm-workspace.yaml`). Do not use Yarn, npm, or Turborepo.
- **Rationale:** pnpm delivers strict dependency isolation, rapid hard-link installs, and low disk footprint. Expo SDK 52+ natively supports pnpm monorepos with automatic Metro configuration.

## ADR-004: Mapbox Integration and 100 Monthly Active User (MAU) Free Cap
- **Context:** Mapbox powers maps, directions, and place search. The developer cannot spend money, and Mapbox terms forbid exceeding the free tier without paying uncapped overages. Navigation SDK free tier is 100 MAUs / 1,000 monthly trips.
- **Decision:** Use `@rnmapbox/maps` on the mobile client. Route sessions are registered with the Meridian backend; the backend enforces a "Usage Guard" that tracks monthly unique installations and blocks navigation session initiation if approaching the 100 MAU ceiling.
- **Rationale:** Strict budget control protects against unexpected billing while enabling full Mapbox navigation features.

## ADR-005: Thin Map Adapter Module
- **Context:** Mapbox terms mandate that Mapbox data only be rendered on Mapbox maps. However, coupling application UI code directly to `@rnmapbox/maps` creates vendor lock-in.
- **Decision:** Wrap all map views, camera controls, markers, and shapes inside an internal `@meridian/map-adapter` interface.
- **Rationale:** Keeps application screens decoupled. If licensing or free tier limits require switching renderers in a future release, the replacement is isolated to the adapter.

## ADR-006: Stays / Lodging Sourced from Mapbox Place Search Without Fake Pricing
- **Context:** Many travel apps display mocked prices or scraper results that violate hotel terms.
- **Decision:** Stays are discovered via Mapbox Place Search (category: `lodging`). Only genuine metadata (name, address, coordinates, website link) is displayed. No prices are shown. Users tap out to the official website or a search link.
- **Rationale:** Complies with honesty rules: no fake data presented as live. Affiliate prices will only be integrated when approved affiliate partner APIs are contracted.

## ADR-007: "Ticket" Definition as In-App Tracked Record
- **Context:** Users reporting road problems need transparency on issue resolution.
- **Decision:** A "ticket" in Meridian represents an internal, in-app tracked record with a cryptographically verifiable status timeline (open → acknowledged → in_progress → resolved/rejected/duplicate). It is NOT a government or municipal filing unless an official public authority webhook or email gateway is explicitly configured.
- **Rationale:** Avoids misleading users into believing a municipal road crew was automatically dispatched when only an in-app report was filed.

## ADR-008: Seams for NATS, H3, and Machine Learning
- **Context:** Future scaling may require message brokers (NATS), discrete global grid indexing (Uber H3), and automated pothole detection via camera computer vision (ML).
- **Decision:** Abstract event publication into an `EventBus` interface and location indexing into a spatial query service.
- **Rationale:** Allows dropping in NATS or H3 later without modifying core domain entities or HTTP routes.
