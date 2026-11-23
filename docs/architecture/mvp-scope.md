# Meridian MVP Scope & Implementation Sequence

## 1. Prompt Implementation Roadmap

The Meridian engineering plan is partitioned into isolated, verified prompts:

| Prompt | Name | Core Responsibilities |
| :--- | :--- | :--- |
| **A0** | **Fresh Foundation** | Matrix, architecture, pnpm monorepo, Fastify skeleton, PostGIS Compose, mobile skeleton, CI. |
| **A1** | **Mapbox Integration** | Native Mapbox SDK config, dev-client builds, map rendering adapter, secret token isolation. |
| **M1** | **Mobile UI Foundation** | Navigation shell (Tabs: Stays, Drive, Alerts), theme provider, design token components. |
| **B1** | **Spatial Database Schema** | PostGIS migrations, spatial tables (issues, timeline, route_sessions), GiST indexes, query tests. |
| **B2** | **API Foundation & Usage Guard**| Auth, rate limiting, Zod validation, Mapbox Usage Guard service (100 MAU free tier limiter). |
| **B3** | **Issues & Corridor API** | Issue reporting endpoint, dedupe logic, viewport query, route corridor intersection query. |
| **B4** | **Live Alert Service** | WebSocket push for active route sessions, event dispatcher, reconnection resilience. |
| **M2** | **Mobile Reporting Flow** | GPS integration, driver speed safety gate, one-tap quick reporting, photo upload. |
| **M3** | **Live Alerts on Map** | Rendering road issues on Mapbox, clustering, real-time alert banner and sound effects. |
| **R1** | **Routing & Search Adapters** | Backend proxy for Mapbox Directions & Place Search respecting free-tier limits & terms. |
| **M4** | **Turn-by-Turn Drive Mode** | In-app navigation view, upcoming hazard corridor visualization, linear distance indicator. |
| **H1** | **Stays Place Search API** | Place search for hotels/lodging, sanitization, direct external hotel links. |
| **M5** | **Stays Mobile UI** | Map discovery of lodging along route and destination, detail card, booking link launcher. |
| **Q1** | **Moderation & Admin** | Internal moderation queue, issue timeline inspection, status transition overrides. |
| **Q2** | **Security & Hardening** | Pentest, automated fuzzing, EXIF sanitization verification, load testing on 8GB host. |
| **Q3** | **Release Preparation** | Release builds, store assets, final verification audit report. |

## 2. Mapbox Usage Guard (Free Tier Preservation)

Because Mapbox charges uncapped overages if free tier limits are exceeded, Meridian enforces a zero-cost backend shield:

1. **Quota Monitoring:**
   - Free tier mobile Navigation SDK limit: **100 MAUs per month** (and 1,000 monthly trips).
   - The backend tracks active installation tokens per calendar month in PostgreSQL.
2. **Hard Ceiling Throttling:**
   - At **85 MAUs** (85% quota): Trigger admin alert in logs.
   - At **95 MAUs** (95% quota): Disable new navigation session creation; app falls back to cached directions or alerts only.
3. **Ephemeral Directions Delivery:**
   - The client requests route lines through the backend or authorized client token only after quota validation.
   - Routes are never permanently cached in the DB, in full compliance with Mapbox Product Terms.
