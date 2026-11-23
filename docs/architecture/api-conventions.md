# Meridian API Conventions

## 1. Protocol & Base URL
- All business endpoints are versioned under `/v1` (e.g., `https://api.meridian.app/v1`).
- Operational endpoints are exposed at root: `GET /healthz` (liveness), `GET /readyz` (readiness).
- Character encoding: UTF-8.
- Timestamps: ISO 8601 strings in UTC (`YYYY-MM-DDTHH:mm:ss.sssZ`).

## 2. Spatial Conventions
- Coordinate Reference System: **WGS 84 (EPSG:4326 / SRID 4326)**.
- GeoJSON format: Longitude first, then Latitude: `[longitude, latitude]`.
- Point schema example:
  ```json
  {
    "type": "Point",
    "coordinates": [-122.4194, 37.7749]
  }
  ```
- Bounding box parameter convention:
  `bbox=minLng,minLat,maxLng,maxLat` (e.g., `bbox=-122.52,37.70,-122.35,37.82`).

## 3. Identifiers
- All resource IDs are generated on the server using **UUIDv4** strings.
- Client cannot supply its own entity ID for persistence.

## 4. Error Handling (RFC 9457 Problem Details)
All error responses return `application/problem+json` with HTTP status >= 400:
```json
{
  "type": "https://api.meridian.app/v1/problems/invalid-corridor",
  "title": "Invalid Corridor Buffer",
  "status": 400,
  "detail": "Corridor buffer must be between 50 and 1000 meters.",
  "instance": "/v1/routes/sessions",
  "code": "INVALID_CORRIDOR_BUFFER",
  "invalidParams": [
    {
      "name": "corridorBufferMeters",
      "reason": "Expected number <= 1000, received 2500"
    }
  ]
}
```
**Security Rule:** Internal database errors or stack traces are NEVER exposed in production problem details.

## 5. Cursor Pagination
Collection endpoints with potential high volume use opaque cursor pagination:
- Request: `GET /v1/issues?cursor=eyJjcmVhdGVkQXQiOiIyMDI2...&limit=50`
- Response:
  ```json
  {
    "items": [...],
    "pageInfo": {
      "hasMore": true,
      "nextCursor": "eyJjcmVhdGVkQXQiOiIyMDI2..."
    }
  }
  ```
- No offset/limit queries on spatial tables to prevent query degradation on large tables.

## 6. Request Tracing
- Every HTTP request receives or forwards an `X-Request-Id` header (UUID).
- Pino logger binds the request ID to all logs generated during request execution.
