# Mapbox Account Notes & Free-Tier Limits

**Verification Date:** 2026-11-23  
**Verified By:** User confirmation (Human Gate check for Prompt A1)  
**Status:** Verified Clean (Zero Financial Risk)

---

## 1. Billing & Payment Status
- **Payment Card on File:** **NONE**.
- **Overage Behavior:** When account reaches monthly free-tier volume caps, Mapbox automatically stops serving requests / returns HTTP 429 / 403.
- **Uncapped Overage Risk:** **ZERO**. Because no payment card is attached, no surprise charges or uncapped bills can occur.
- **Service Continuity Rule:** Because the service will hard-stop at the limits, the application must stay well within limits to avoid service disruptions.

---

## 2. Monthly Free Tier Volumes (Dashboard Confirmed)
| Service / API | Dashboard Monthly Free Limit | Meridian MVP Expected Consumption | Headroom / Safety Margin |
|---|---|---|---|
| **Mobile Navigation SDK** | **100 Monthly Active Users (MAU)** | < 10 dev installations | > 90% headroom (Critical Cap) |
| **Maps SDK (Mobile)** | **25,000 MAUs** (standard map display) | < 10 dev installations | > 99% headroom |
| **Directions API** | **100,000 requests / month** | < 1,000 dev requests | > 99% headroom |
| **Geocoding / Search API** | **100,000 requests / month** | < 1,000 dev requests | > 99% headroom |
| **Static Images API** | **50,000 requests / month** | Not used in MVP | 100% headroom |

---

## 3. Usage Notifications & Alert Thresholds
- **Alert Status:** **ENABLED**.
- **Delivery Channel:** Account owner email.
- **Configured Thresholds:** Standard Mapbox billing alert thresholds trigger email warnings as monthly volume approaches free-tier ceilings.

---

## 4. Architectural Rules for Meridian
1. **Never commit Mapbox tokens:**
   - Public access token (`pk.*`) is strictly provided via untracked `.env.local` as `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`.
   - Secret download token (`sk.*`) for native Android Gradle SDK artifact resolution is stored exclusively outside git in `%USERPROFILE%\.gradle\gradle.properties`.
2. **Local Installation Counting (Task 5.6):**
   - Meridian client generates a local, privacy-preserving UUID `installation_id`.
   - The backend usage guard (to be implemented in prompt `B2`) tracks active installation count to prevent exceeding the 100 MAU free tier cap.
3. **Map Rendering Constraint:**
   - Mapbox data (Directions, Search, POIs) must only be rendered on Mapbox maps per Mapbox TOS section 3.2.
