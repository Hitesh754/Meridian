# Mapbox Setup, Tokens & Native Build Guide

**Target Environment:** Windows 11 (8 GB RAM physical), PowerShell, Android physical device or Emulator.  
**Version:** Meridian Prompt A1  
**Free Tier Boundary:** 100 Mobile Navigation SDK MAUs, 100k Directions/mo, 100k Search/mo. Zero card on file.

---

## 1. Mapbox Tokens Architecture

Meridian requires two distinct tokens for operation:
1. **Public Access Token (`pk.*`):** Used at runtime by the mobile client to request vector tiles, styles, and glyphs from Mapbox APIs.
2. **Secret Download Token (`sk.*` with `Downloads:Read`):** Used exclusively by the Android Gradle build system at compile time to authenticate against the private Mapbox Maven repository (`https://api.mapbox.com/downloads/v2/releases/maven`).

```
                    ┌────────────────────────────┐
                    │      Mapbox Dashboard      │
                    └──────────────┬─────────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
   [Public Access Token (pk.*)]              [Secret Download Token (sk.*)]
   • Scope: Default public                   • Scope: Downloads:Read ONLY
   • Location: apps/mobile/.env.local        • Location: %USERPROFILE%\.gradle\gradle.properties
   • Loaded via: EXPO_PUBLIC_MAPBOX_...      • Read by: Android Gradle Maven build
   • In repo? NO (Gitignored)                • In repo? NO (Outside repository completely)
```

---

## 2. Setting Up the Secret Download Token (`sk.*`) Outside the Repository

The secret download token must **NEVER** exist inside the project repository, `app.json`, `.env`, or commit history.

### Windows PowerShell Setup Steps:
1. Open Mapbox Account Dashboard -> **Tokens** -> Click **Create a token**.
2. Name the token: `meridian-gradle-downloads`.
3. Check **ONLY** the `Downloads:Read` secret scope.
4. Copy the generated secret token (`sk.ey...`).
5. Run the following commands in PowerShell on your Windows machine:

```powershell
# Ensure user-level .gradle directory exists
$gradleDir = "$HOME\.gradle"
if (-not (Test-Path $gradleDir)) {
    New-Item -ItemType Directory -Path $gradleDir | Out-Null
}

# Append the download token to ~/.gradle/gradle.properties
$gradleProps = Join-Path $gradleDir "gradle.properties"
Add-Content -Path $gradleProps -Value "`nMAPBOX_DOWNLOADS_TOKEN=<YOUR_SECRET_TOKEN_HERE>"

# Verify file exists outside repository
Get-Content $gradleProps | Select-String "MAPBOX_DOWNLOADS_TOKEN"
```

> [!IMPORTANT]
> Do NOT paste the token into this chat or any tracked file. The Gradle script reads `MAPBOX_DOWNLOADS_TOKEN` automatically from `$HOME/.gradle/gradle.properties`.

---

## 3. Setting Up the Public Access Token (`pk.*`)

1. In Mapbox Dashboard -> **Tokens**, copy your Default Public Token (or create a scoped token named `meridian-mobile-public`).
2. Mobile scoping recommendations:
   - For Android, restrict the token by Package Name: `app.meridian.mobile` with SHA-256 fingerprint if releasing to production.
   - For local development, leave unrestricted or use IP restriction if available.
3. In `apps/mobile/`, create an untracked `.env.local` file:

```bash
# apps/mobile/.env.local (Gitignored)
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.YOUR_PUBLIC_TOKEN_HERE
```

4. Verify that `.env.local` is never tracked by git:
```powershell
git status --short
# Must NOT list apps/mobile/.env.local
```

---

## 4. Gradle & RAM Optimization for 8 GB Windows Machines

Running Android Gradle builds alongside Docker and VS Code on 8 GB RAM requires strict memory caps to prevent Out-Of-Memory (OOM) thrashing.

Add or verify the following properties in `$HOME\.gradle\gradle.properties`:

```properties
# Cap Gradle JVM heap to 2GB to leave headroom for Windows OS and Metro
org.gradle.jvmargs=-Xmx2048m -XX:MaxMetaspaceSize=512m -XX:+HeapDumpOnOutOfMemoryError

# Limit Gradle concurrent worker threads to 2
org.gradle.workers.max=2

# Enable parallel and caching to speed up subsequent builds
org.gradle.parallel=true
org.gradle.caching=true
```

---

## 5. Physical Android Device Setup (USB Debugging)

To run and debug the app on a physical Android device:
1. Enable **Developer Options** and **USB Debugging** on your phone.
2. Connect your phone via USB and authorize the computer.
3. Verify adb sees your device:
   ```powershell
   adb devices
   ```
4. Reverse ports so your phone can reach Metro (8081) and Fastify API (8080) on localhost:
   ```powershell
   adb reverse tcp:8080 tcp:8080
   adb reverse tcp:8081 tcp:8081
   ```

---

## 6. Build and Run Commands

### Development Server:
```powershell
pnpm --filter @meridian/mobile start
```

### Prebuild Native Android Code:
```powershell
cd apps/mobile
npx expo prebuild --platform android --clean
```

### Run Native Build on Connected Phone / Emulator:
```powershell
npx expo run:android
```

---

## 7. Troubleshooting & Verification

| Issue | Cause | Fix |
|---|---|---|
| `Could not resolve com.mapbox.maps:android` | Missing or invalid `MAPBOX_DOWNLOADS_TOKEN` | Verify `$HOME\.gradle\gradle.properties` contains `MAPBOX_DOWNLOADS_TOKEN=sk.xxx` with `Downloads:Read` scope. |
| `Gradle daemon OOM / OutOfMemoryError` | Heap allocation too large for 8GB RAM | Set `org.gradle.jvmargs=-Xmx2048m` in `gradle.properties` and reduce workers to 2. |
| Map displays blank or HTTP 401 | Missing `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN` | Create `apps/mobile/.env.local` with valid `pk.*` token. |
| `Connection refused: /readyz` on phone | Port 8080 not forwarded | Run `adb reverse tcp:8080 tcp:8080` in terminal. |
| Secret scan failure | Forbidden token tracked | Run `node scripts/check-secrets.mjs` and remove tracked token. |
