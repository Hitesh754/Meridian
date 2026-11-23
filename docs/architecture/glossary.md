# Meridian Architectural Glossary

- **ADR (Architectural Decision Record):** A documented architectural design choice detailing context, decision, and consequences.
- **Corridor Buffer:** A geographic polygon constructed around a route line (e.g., `ST_Buffer(route_line, 250m)`) used to identify hazards relevant to a driver.
- **Deduplication Radius:** The geographic threshold (default 40 meters) within which two reports of the same category are merged rather than duplicated.
- **EXIF (Exchangeable Image File Format):** Metadata embedded inside image files containing camera details, timestamp, and potentially sensitive GPS location.
- **GiST (Generalized Search Tree):** PostgreSQL index structure optimized for multi-dimensional spatial queries on geometries and geographies.
- **Linear Referencing (`ST_LineLocatePoint`):** A mathematical PostGIS function that determines where a point falls along a route line as a fraction between 0.0 (start) and 1.0 (end).
- **MAU (Monthly Active User):** Mapbox's billing unit representing a unique user installation accessing the SDK within a calendar month. Free tier navigation allows 100 MAUs.
- **One-Tap Quick Report:** A simplified UI mode presented when vehicle motion is detected (> 20 km/h) allowing rapid hazard logging without distracting typing.
- **RFC 9457:** IETF specification for HTTP Problem Details (`application/problem+json`) defining standardized error payloads.
- **SRID 4326:** Spatial Reference System Identifier representing the WGS 84 geographic coordinate system (standard GPS coordinates: longitude, latitude).
- **Tracked Ticket:** An in-app audit entity representing a reported road issue and its lifecycle timeline.
- **Usage Guard:** A backend enforcement service that tracks third-party API consumption and throttles requests before reaching billable overage thresholds.
