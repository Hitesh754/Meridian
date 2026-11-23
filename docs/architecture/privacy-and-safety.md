# Privacy and Driver Safety Architecture

> [!NOTE]
> This document describes technical privacy and safety safeguards implemented in the Meridian architecture. It is not formal legal advice.

## 1. Driver Safety Guidelines

Distracted driving is a life-safety hazard. The Meridian mobile client adheres to strict safety-in-motion controls:

### Motion Detection & Speed Thresholds
- The app subscribes to device GPS velocity updates.
- **Speed Gate:** When speed exceeds `SAFETY_SPEED_THRESHOLD_MPS` (default: 5.5 m/s, approx. 20 km/h or 12.5 mph):
  1. Detailed text input fields and typing controls are disabled.
  2. The UI displays a modal: **"Are you a passenger?"**
  3. If "Passenger" is confirmed, standard reporting controls unlock.
  4. If "Driver" or no response:
     - The interface shifts into **One-Tap Quick Report Mode**.
     - Quick Report presents 3 high-contrast, oversized category buttons: `[ Pothole ]`, `[ Debris ]`, `[ Hazard ]`.
     - A single tap captures the current GPS coordinate with zero typing.
     - Voice confirmation chime confirms receipt without requiring visual attention.

## 2. User Privacy & Location Data Minimization

### Ephemeral Route Sessions
- Route corridors (LineStrings) submitted to `POST /v1/routes/sessions` are stored with an explicit expiration timestamp (`expires_at`).
- Sessions are strictly decoupled from user accounts; they use an ephemeral random installation token.
- Expired route sessions are hard-deleted by an automated database purge query. Meridian does NOT retain user origin-destination history.

### Location Fuzzing on Public Viewports
- High-precision GPS coordinates are mapped to road segments.
- Public viewport API responses do not expose individual reporter IDs or IP addresses.

### Media & Photo Handling
- If a photo is submitted with a report:
  1. All EXIF metadata (camera serial, exact timestamp, embedded GPS coordinates) is stripped server-side prior to public storage.
  2. Photos are scanned for basic content validity.
  3. Only the sanitized image is served publicly.

### Right to Deletion
- Users may request removal of any report originated from their installation device identifier.
