# Meridian Architecture: Overview

## 1. Context Diagram

```mermaid
flowchart TD
    User["Mobile User (Driver / Passenger)"]
    Admin["Moderator / Ops"]
    
    subgraph Client["Mobile Client (Expo + React Native)"]
        UI["Three App Modes:\n1. STAYS\n2. DRIVE\n3. ALERTS"]
        MapAdapter["Map Adapter Layer"]
        RNMapbox["@rnmapbox/maps"]
        LocationSvc["Location & Speed Watcher"]
    end
    
    subgraph Backend["Meridian Platform (Fastify + Node LTS)"]
        API["Fastify REST API (/v1)"]
        UsageGuard["Mapbox Usage Guard & MAU Tracker"]
        SpatialSvc["Spatial Corridor & Alert Service"]
        TicketEngine["Issue & Ticket State Engine"]
        WS["WebSocket Server (Live Alerts)"]
    end
    
    subgraph DataStore["Data Tier"]
        PG[("PostgreSQL 16 + PostGIS 3.4\n(SRID 4326, Spatial Indexes)")]
    end
    
    subgraph ThirdParty["External Services (Free Tier)"]
        MapboxAPI["Mapbox Navigation & Place Search APIs\n(Direct client / gated token)"]
        ExpoPush["Expo Push Service\n(Background notifications)"]
    end

    User --> UI
    Admin --> API
    UI --> LocationSvc
    UI --> MapAdapter
    MapAdapter --> RNMapbox
    RNMapbox --> MapboxAPI
    
    UI -->|REST /v1, RFC 9457| API
    UI <-->|WebSocket Alerts| WS
    
    API --> UsageGuard
    API --> SpatialSvc
    API --> TicketEngine
    
    SpatialSvc --> PG
    TicketEngine --> PG
    WS --> SpatialSvc
    
    Backend -.-> ExpoPush
```

## 2. The Three Application Modes

### Mode 1: STAYS
- **Purpose:** Discover lodging and accommodations along travel corridors and destinations.
- **Data Source:** Mapbox Place Search (category: `hotel`, `motel`, `lodging`).
- **No Deceptive Pricing:** Meridian displays place names, coordinates, ratings, and phone/address info with a direct external link to the hotel's official website or a plain search link. Zero scraped prices or fake booking forms. Affiliate rates will only appear after legitimate booking platform affiliate agreements are established.

### Mode 2: DRIVE
- **Purpose:** Car navigation and active hazard awareness.
- **Features:** Turn-by-turn routing powered by Mapbox Directions. Route line is registered ephemerally as a corridor session. Real-time proximity warnings alert the driver when approaching potholes, debris, or hazards along the travel corridor.

### Mode 3: ALERTS
- **Purpose:** Citizen and driver road issue reporting and crowdsourced hazard tracking.
- **Features:** Report potholes, road hazards, traffic obstacles, and signal failures.
- **Tracked Tickets:** Every valid report creates an in-app tracked ticket with a public audit timeline.
- **Universal Visibility:** Active reports are visible to all users browsing the map and automatically intersected with active navigation corridors.
