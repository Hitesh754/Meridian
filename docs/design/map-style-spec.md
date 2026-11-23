# Meridian Map Style Specification

**Document Version:** 1.0.0  
**Status:** Approved  
**Last Updated:** 2026-11-23  
**Package Reference:** `@meridian/design-tokens` (`lightMapColors`, `darkMapColors`, `mapThemes`)

---

## 1. Cartographic Design Philosophy

Meridian is a road-aware travel app focused on three core pillars:
1. **STAYS:** Discovering hotels on the map.
2. **DRIVE:** Real-time road navigation.
3. **ALERTS:** Live crowdsourced hazard tickets (potholes, accidents, road damage).

To achieve maximum visual clarity without cognitive overload, the Meridian basemap follows a "canvas-first" aesthetic:
- **Calm, Low-Saturation Ground:** Land cover and waterbodies use muted, desaturated tones so foreground user overlays (active routes, hazard markers, hotel pins) pop with unambiguous prominence.
- **Strict Road Hierarchy:** Expressways and motorways are visually dominant with high-contrast warm hues, while primary, secondary, and local roads transition through a clearly weighted hierarchy.
- **Muted POIs:** Generic commercial POIs (cafes, retail, generic businesses) are suppressed from default zoom levels. Only critical navigation landmarks (major cities, transport junctions) remain visible, keeping visual clutter minimal until user-demanded layers (stays and alerts) are activated.
- **Strict Accessibility (WCAG 2.1 AA):** All road and place labels maintain at least a 4.5:1 contrast ratio against their underlying halo and background ground fills.

---

## 2. Map Color Token Mapping

All colors are formally defined and typechecked in `packages/design-tokens/src/index.ts`.

| Token Name | Light Theme Hex | Dark Theme Hex | Cartographic Purpose |
| :--- | :--- | :--- | :--- |
| `land` | `#F8F9FA` | `#0F172A` | Background ground fill; quiet neutral canvas |
| `water` | `#C8DCED` | `#0B2545` | Soft, recognizable inland and marine water |
| `greenery` | `#E2F0D9` | `#132A22` | Parks, reserves, natural forest |
| `building` | `#ECEFF1` | `#1E293B` | Subtle 2D building footprints |
| `roadMotorway` | `#F59E0B` | `#F59E0B` | Major highways / motorways (amber warning/speed tier) |
| `roadMotorwayCasing` | `#D97706` | `#B45309` | High-contrast motorway boundary casing |
| `roadPrimary` | `#FFFFFF` | `#334155` | Arterial routes / primary roads |
| `roadSecondary` | `#FFFFFF` | `#243248` | Secondary collector roads |
| `roadLocal` | `#FFFFFF` | `#1E293B` | Local residential streets |
| `roadCasing` | `#CBD5E1` | `#090D16` | Structural road edges preventing visual blend |
| `roadLabel` | `#334155` | `#E2E8F0` | High-contrast road names (Slate 700 / Slate 200) |
| `roadLabelHalo` | `#FFFFFF` | `#0F172A` | Crisp protective halo ensuring label legibility |
| `placeLabel` | `#0F172A` | `#F8FAFC` | Major city and town labels (Slate 900 / Slate 50) |
| `placeLabelHalo` | `#FFFFFF` | `#0F172A` | Contrasting buffer around place labels |
| `poiIcon` | `#94A3B8` | `#64748B` | Subtle iconography for transport nodes |
| `poiLabel` | `#64748B` | `#94A3B8` | Subtle text labels for essential landmarks |
| `routeLine` | `#2563EB` | `#38BDF8` | Active navigation path (Royal Blue / Cyan Blue) |
| `routeCasing` | `#1D4ED8` | `#0284C7` | Route highlight border |
| `userLocationPuck` | `#0284C7` | `#38BDF8` | Live GPS location indicator |
| `userLocationHalo` | `rgba(2, 132, 199, 0.25)` | `rgba(56, 189, 248, 0.25)` | GPS accuracy confidence circle |
| `alertPothole` | `#EF4444` | `#F87171` | High-priority road hazard / pothole alert |
| `stayHotel` | `#8B5CF6` | `#A78BFA` | Verified hotel / lodging marker |

---

## 3. Road Hierarchy Rules

1. **Motorways (`roadMotorway`):**
   - Rendered with warm amber fill (`#F59E0B`) and a distinct dark casing (`#D97706` / `#B45309`).
   - Line width scales from 3px (zoom 6) to 12px (zoom 18).
2. **Primary Arterials (`roadPrimary`):**
   - Solid fill with casing; scales from 2px (zoom 8) to 8px (zoom 18).
3. **Secondary Arterials (`roadSecondary`):**
   - Solid fill with subtle casing; visible starting at zoom 10.
4. **Local Streets (`roadLocal`):**
   - Visible starting at zoom 12; minimal casing to maintain crisp readability without turning dense cities into solid grey.

---

## 4. Layer Organization in Custom Styles

Styles are organized into distinct Mapbox style layers:
1. `background`: Global background ground (`land`).
2. `water`: Polygon water bodies and ocean fills (`water`).
3. `landuse`: Green spaces and parks (`greenery`).
4. `building`: 2D structural footprint fills (`building`).
5. `road-casing`: Structural road outlines (`roadCasing`, `roadMotorwayCasing`).
6. `road`: Filled road geometries (`roadLocal`, `roadSecondary`, `roadPrimary`, `roadMotorway`).
7. `road-label`: Shielded and plain road names with halos (`roadLabel`, `roadLabelHalo`).
8. `place-label`: City, town, and neighborhood labels with halos (`placeLabel`, `placeLabelHalo`).
9. `user-overlays`: Dedicated upper slots reserved for active route line (`routeLine`), hotel pins (`stayHotel`), and road hazard tickets (`alertPothole`).

---

## 5. Offline Fallback Strategy

The app stores self-contained light and dark Mapbox Style JSON representations inside `apps/mobile/src/map/styles/`. When connected to the network and configured with a valid Mapbox public token, the map can stream vector tiles from standard Mapbox endpoints or self-hosted vector sources while adhering to the token limits documented in `docs/recon/mapbox-account-notes.md`.
