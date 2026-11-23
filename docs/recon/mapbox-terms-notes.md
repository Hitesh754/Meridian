# Mapbox Terms of Service & Product Terms Analysis

Date: 2026-11-23  
Document Scope: Evaluation of Mapbox legal constraints for the Meridian project free-tier operation.  
Primary Sources:  
- Mapbox Terms of Service: https://www.mapbox.com/legal/tos  
- Mapbox Product Terms: https://www.mapbox.com/legal/product-terms  
- Mapbox Pricing: https://www.mapbox.com/pricing  

## 1. Summary of Verified Legal Rules

### (a) Rendering Mapbox Data on Non-Mapbox Maps
- **Strict Prohibition:** Under Mapbox Product Terms (Mapping APIs & Studio Styles), styles designed in Mapbox Studio and data served from Mapbox APIs (vector tiles, raster tiles, geocodes, directions) may **only** be rendered on a Mapbox Map (using official Mapbox SDKs or Mapbox GL JS).
- **No Cross-Rendering:** Meridian must never take Mapbox vector/raster tiles, route lines, or search results and display them on Google Maps, Apple Maps, Leaflet without Mapbox tiles, or MapLibre.
- **Architecture Implication:** Meridian uses `@rnmapbox/maps` directly for all map visualization. The map adapter layer encapsulates the Mapbox SDK but does not mix renderers.

### (b) Caching & Storing Directions, Search, and Geocoding Results
- **Navigation & Directions APIs:** Customers **shall not** export, download, cache, or store results from any request made to a Navigation API (Directions, Map Matching, Matrix).
- **Temporary vs. Permanent Geocoding:**
  - *Temporary Geocodes:* Must NOT be exported, stored, or cached. May only be displayed ephemerally to end users or used to position results on a map during an active session.
  - *Permanent Geocodes:* Permitted only with explicit permanent geocode endpoints and licensing for internal operations. Meridian will only use standard search/geocoding ephemerally.
- **Architecture Implication:** The Meridian backend will NOT cache or persist turn-by-turn routes or raw search geometry in PostgreSQL. Only the origin/destination or user-selected point (for stays and reports) will be stored in Meridian's own tables with our own UUIDs and coordinates.

### (c) Attribution and Logo Display
- **Mandatory Branding:** All applications displaying Mapbox content must clearly display the Mapbox logo and proper copyright attribution (including OpenStreetMap contributors) at all times.
- In `@rnmapbox/maps`, the attribution and logo are enabled by default (`logoEnabled={true}`, `attributionEnabled={true}`). They must NEVER be hidden, cropped, or obscured.

### (d) Monthly Active User (MAU) Counting & Model
- **Maps Mobile SDK:** Billed on Monthly Active Users (MAUs). An MAU is defined as a unique user installation/session that initializes the Mapbox SDK within a given calendar month billing period.
  - Free Tier: Up to **25,000 MAUs** per month for standard mobile map viewing.
- **Navigation SDK:**
  - Free Tier: Up to **100 MAUs** per month (or up to 1,000 monthly trips under metered billing).
- **No Cross-Cycle Tracking:** Mapbox does not build user profiles across cycles; MAU metrics are purely used for billing quota enforcement.

### (e) What Happens at Free-Tier Limits
- **Uncapped Overage Risk:** If an account exceeds free tier limits without caps, Mapbox bills overage rates per additional 1,000 MAUs or requests.
- **Strict Money Rule Defense:** Because the developer CANNOT spend money and uncapped overage is forbidden:
  1. The Meridian backend will implement a **Usage Guard** service.
  2. The backend tracks active installations and tokens per calendar month.
  3. When approaching the 100 MAU / monthly quota threshold (e.g. at 90%), the backend alerts and rejects routing token issuance or throttles routing calls to prevent reaching uncapped billable overages.
  4. Client-side navigation sessions require authorization from the Meridian API usage guard before initiating turn-by-turn sessions.

## 2. Compliance Checklist for Meridian

- [x] All Mapbox vectors, raster styles, and geometry are rendered exclusively inside `@rnmapbox/maps`.
- [x] Logo and OpenStreetMap attribution will remain visible in all map views.
- [x] Directions API responses are piped directly to client navigation state without database caching.
- [x] Hotel listings use place search results for coordinates and names with external booking links; no scraped or cached price data.
- [x] Usage Guard architecture designed in ADR to cap usage strictly below the 100 MAU limit.
