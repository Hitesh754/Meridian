# Meridian Threat Model

| Threat | Description | Impact | Mitigation Strategy | Owning Prompt |
| :--- | :--- | :--- | :--- | :--- |
| **T-01: Spam & Fake Reports** | Bad actor floods the map with fake potholes or hazard markers. | Map clutter, user panic, lost trust. | Client velocity check, rate limiting per IP/device (max 5 reports/hour), deduplication radius matching, moderator queue. | B2, B3, Q1 |
| **T-02: Location Spoofing** | Attacker calls API with forged coordinates far from their real location. | False alerts placed in distant cities. | Require device location timestamp alignment, speed anomaly checks, and minimum confirmations before promoting to high severity. | B2, B3 |
| **T-03: Confirmation Fraud** | Sybil attack using script to upvote/confirm an issue to trigger false alerts. | Bogus hazards verified. | Salted hash of hardware/app identifier, device cooldown per issue (1 confirmation per device ID), rate-limit IP subnets. | B3, Q2 |
| **T-04: Malicious Uploads** | Attacker uploads malicious payloads or illegal image binaries disguised as photos. | Server compromise or legal liability. | Strict MIME-type checking, image re-encoding via Sharp/libvips, EXIF stripping, size limits (max 5MB). | B3, Q2 |
| **T-05: Scraping & Harvest** | Automated scrapers download all road hazards and hotel locations. | Database load, third-party term violations. | Rate limits on `/v1/issues` viewport queries; mandatory cursor pagination; no unbounded queries. | B2, Q2 |
| **T-06: Mapbox Token Theft** | Attacker extracts public Mapbox token (`pk.`) from mobile app and drains quota. | Account quota exhaustion. | Mapbox URL/bundle ID restriction (scoped to app package name `app.meridian.mobile`); backend Usage Guard. | A1, B2 |
| **T-07: Secret Token Leak** | Secret download token (`sk.`) committed to GitHub repository. | Account compromise, unauthorized billing. | Pre-commit git hooks, `scripts/check-secrets.mjs` running in CI and verify script; strict rejection of `sk.` strings. | A0, CI |
| **T-08: Moderator Abuse** | Rogue moderator marks legitimate issues rejected or censors areas. | Suppressed hazards, unsafe roads. | Immutable `issue_timeline` recording moderator ID, action, and rationale; multi-moderator consensus for bulk actions. | Q1 |
