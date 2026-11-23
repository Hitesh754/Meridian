# Windows 11 & Development Setup Guide

This guide establishes the host environment configuration for running the Meridian monorepo on an 8 GB Windows 11 machine with WSL2, Docker Desktop, an Android physical device, and remote iOS builds.

## 1. WSL2 Memory Cap Configuration

To prevent Docker Desktop's WSL2 VM (`vmmem`) from exhausting system memory on an 8 GB host, configure a strict memory ceiling.

Create or edit `%USERPROFILE%\.wslconfig` (e.g. `C:\Users\Hitesh\.wslconfig`):

```ini
# Settings documented at https://learn.microsoft.com/en-us/windows/wsl/wsl-config
[wsl2]
# Starting point: 3.5GB memory cap leaves ~4.5GB for Windows host & developer tools
memory=3584MB

# Limit virtual processors to prevent CPU saturation
processors=2

# Swap space allocated on disk to absorb memory spikes
swap=2GB

# Turn off GUI integration if not needed to reduce memory
guiApplications=false
```

After modifying `.wslconfig`, restart WSL from PowerShell as Administrator:
```powershell
wsl --shutdown
```

## 2. Docker Desktop Settings

1. **General:**
   - Uncheck "Start Docker Desktop when you log in" to conserve boot memory.
2. **Resources > WSL Integration:**
   - Ensure "Use the WSL 2 based engine" is checked.
   - Enable integration with your primary distro.
3. **Container limits:**
   - Docker Compose enforces container memory limits via `mem_limit: 512m` for Postgres and `mem_limit: 256m` for API containers in `infra/compose/docker-compose.yml`.

## 3. Physical Android Device Setup (Primary Development Target)

Because an Android emulator consumes ~1.5 GB - 2 GB of RAM, a physical Android device is the recommended and primary test device.

1. **Enable Developer Options & USB Debugging:**
   - On the Android phone: Settings > About Phone > Tap "Build Number" 7 times.
   - Settings > System > Developer Options > Enable "USB Debugging".
2. **Connect via USB & Port Forwarding:**
   - Connect the phone via USB cable and accept the debugging prompt.
   - Run `adb devices` to verify the connection.
   - Reverse ports so the phone can access localhost on the dev machine:
     ```powershell
     adb reverse tcp:8080 tcp:8080   # Meridian Fastify API
     adb reverse tcp:8081 tcp:8081   # Metro bundler
     ```
   - In this mode, the mobile app connects to `http://localhost:8080/readyz` seamlessly.
3. **Connect via LAN (Alternative to USB):**
   - Find your host Windows LAN IP:
     ```powershell
     Get-NetIPAddress -InterfaceAlias 'Wi-Fi*' -AddressFamily IPv4 | Select-Object IPAddress
     ```
   - Set the API URL in mobile configuration to `http://<YOUR_LAN_IP>:8080`.
   - **Windows Firewall Note:** Windows Defender Firewall may block incoming LAN connections on port 8080 and 8081. If connecting over Wi-Fi, add an inbound firewall rule for Node or allow private network connections:
     ```powershell
     # Run in elevated PowerShell if LAN connection times out:
     New-NetFirewallRule -DisplayName "Meridian Dev Ports" -Direction Inbound -LocalPort 8080,8081 -Protocol TCP -Action Allow
     ```

## 4. Android Emulator (Secondary Fallback)

If using an emulator instead of a physical phone:
- Use IP `10.0.2.2` to reach the Windows host loopback (e.g., `http://10.0.2.2:8080`).

## 5. iOS Builds on Windows (Cloud / EAS Service)

- **Official Expo Rule:** Native iOS binaries cannot be compiled locally on Windows because Xcode requires macOS.
- **Expo Documentation Citation:** Per [Expo Building Standalone Apps](https://docs.expo.dev/build/introduction/), iOS builds from Windows machines must use **EAS Build** (Expo Application Services) cloud builders or remote macOS CI runners.
- Local mobile development, UI testing, and TypeScript verification run directly on Windows via Metro.
