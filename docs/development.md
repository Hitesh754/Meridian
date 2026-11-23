# Meridian Development Workflow

## Day-to-Day Development Commands

### Monorepo Workspaces
Meridian uses pnpm workspaces. Commands can be run at root or filtered by package:
```powershell
# Run across all packages
pnpm lint
pnpm typecheck
pnpm test

# Run for specific workspace
pnpm --filter @meridian/api build
pnpm --filter @meridian/mobile doctor
```

### Database Management
Migrations are managed with `node-pg-migrate` and executed against PostgreSQL + PostGIS:
```powershell
# Apply pending migrations
pnpm db:migrate

# Roll back the most recent migration step
pnpm db:migrate:down

# Direct SQL query via docker compose
docker compose -f infra/compose/docker-compose.yml --env-file .env exec postgres psql -U meridian_dev -d meridian -c "SELECT postgis_version();"
```

### Docker Compose Stack
```powershell
# Start database and API
pnpm dev:stack

# Check container status
docker compose -f infra/compose/docker-compose.yml --env-file .env ps

# Stop containers
pnpm dev:stack:down

# Complete reset (destroys data volume with confirmation)
pnpm dev:stack:reset
```

### Physical Android Debugging
When testing on a physical phone connected over USB:
```powershell
# Verify device connection
adb devices

# Forward API and Metro ports
adb reverse tcp:8080 tcp:8080
adb reverse tcp:8081 tcp:8081
```

### Secret Verification
To guarantee that no Mapbox secret access tokens (`sk.*`) or unparameterized tokens enter git:
```powershell
node scripts/check-secrets.mjs
```
