# Meridian Environment Assessment

Date: 2026-11-23  
Target Machine: Windows 11 Home/Pro (8 GB RAM physical)

## Measured Facts

| Metric | Measured Value | Notes |
| :--- | :--- | :--- |
| **Operating System** | Windows 11 | PowerShell 5.1/7.x |
| **Physical RAM (Total)**| 8,065,780 KB (~7.69 GB / 8 GB physical) | Win32_OperatingSystem TotalVisibleMemorySize |
| **Physical RAM (Free)** | ~808,828 KB (~0.8 GB - 1.2 GB active headroom) | Measured baseline under desktop load |
| **Disk (C: Drive)** | Total ~288 GB, Free: ~30.7 GB | Adequate for dev dependencies & containers |
| **Docker Engine** | 29.9.3 | Running with WSL2 backend |
| **Docker Compose** | v5.7.0 | Integrated Compose plugin |
| **WSL2 Memory Assigned**| 3.673 GiB (~3.76 GB) | Default 50% physical RAM ceiling |
| **Required Ports** | 3000, 5432, 8080, 8081 | All checked and verified FREE |

## Resource Allocation & Feasibility Verdict

Running PostgreSQL + PostGIS, Fastify API, and Metro bundler concurrently on an 8 GB Windows machine is feasible under disciplined memory management:

1. **PostgreSQL + PostGIS (Docker Container):**
   - Memory limit capped at `512MB` (with `shared_buffers = 128MB`, `work_mem = 4MB`).
   - PostGIS query execution for corridor buffering and point checks uses minimal RAM for dev workloads.
2. **Fastify API (Node.js):**
   - Low footprint Node 22 process consuming ~60MB - 120MB.
3. **Metro Bundler (Expo Mobile):**
   - Consumes ~300MB - 600MB during JS bundling.
4. **Linter & Tooling (Biome):**
   - Biome uses <50MB RAM compared to ESLint/Prettier (which can take 500MB+).
5. **Verdict:**
   - Total dev runtime consumption: ~1.0 GB - 1.2 GB.
   - WSL2 must be capped at 3.0 GB to 3.5 GB in `%USERPROFILE%\.wslconfig` to guarantee Windows 11 host retains at least 4.5 GB for OS tasks, browser, and emulator/USB bridge.
