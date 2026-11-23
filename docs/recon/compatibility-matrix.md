# Meridian Compatibility Matrix

Date: 2026-11-23  
Author: Meridian Platform Architecture  
Status: VERIFIED (All components verified with live npm registry and Docker registry manifests)

## Component Versions & Compatibility Status

| Component | Verified Version | Source URL | SPDX License | Status | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Node.js LTS** | `v22.15.1` (installed) | https://nodejs.org | MIT | OK | Node 22 LTS active on Windows host |
| **pnpm** | `10.6.0` | https://pnpm.io | MIT | OK | Managed via Corepack 0.32.0 |
| **Docker Engine & CLI** | `29.9.3` | https://docs.docker.com | Apache-2.0 | OK | Running on Windows 11 with WSL2 backend |
| **Docker Compose** | `v5.7.0` | https://docs.docker.com/compose | Apache-2.0 | OK | Compose v2 specification |
| **PostgreSQL + PostGIS Image** | `postgis/postgis:16-3.4` | https://hub.docker.com/r/postgis/postgis | GPL-2.0 / PostgreSQL | OK | Verified amd64 manifest; stable PostgreSQL 16 with PostGIS 3.4 |
| **Expo SDK** | `58.0.26` | https://www.npmjs.com/package/expo | MIT | OK | Full monorepo support with Metro auto-config |
| **React Native** | `0.88.1` | https://www.npmjs.com/package/react-native | MIT | OK | Standard RN version paired with Expo 58 |
| **React** | `19.3.0` | https://www.npmjs.com/package/react | MIT | OK | Peer dependency of React Native 0.88 |
| **Expo Router** | `58.0.32` | https://www.npmjs.com/package/expo-router | MIT | OK | File-based routing for Expo 58 |
| **expo-dev-client** | `58.0.21` | https://www.npmjs.com/package/expo-dev-client | MIT | OK | Required for custom native runtime (Mapbox) |
| **Mapbox Maps SDK for RN** | `@rnmapbox/maps@10.3.19` | https://github.com/rnmapbox/maps | MIT | OK | PeerDeps: `expo >=47.0.0`, `react-native >=0.79`. Compatible with RN 0.88 & Expo 58 |
| **react-native-reanimated** | `4.8.0` | https://www.npmjs.com/package/react-native-reanimated | MIT | OK | PeerDeps: `react-native: 0.87 - 0.89`, `react-native-worklets: 0.14.x` |
| **react-native-worklets** | `0.14.0` | https://www.npmjs.com/package/react-native-worklets | MIT | OK | Required companion for Reanimated 4 |
| **react-native-gesture-handler**| `3.5.0` | https://www.npmjs.com/package/react-native-gesture-handler | MIT | OK | Supports React 19 & RN 0.88 |
| **react-native-screens** | `4.30.1` | https://www.npmjs.com/package/react-native-screens | MIT | OK | Required by Expo Router |
| **react-native-safe-area-context**| `5.11.1` | https://www.npmjs.com/package/react-native-safe-area-context | MIT | OK | Required for safe edge-to-edge layouts |
| **@gorhom/bottom-sheet** | `5.2.14` | https://www.npmjs.com/package/@gorhom/bottom-sheet | MIT | OK | Supports Reanimated 4 (`>=3.16.0 \|\| >=4.0.0-`). Decided over custom sheet |
| **Fastify** | `5.12.8` | https://www.npmjs.com/package/fastify | MIT | OK | Ultra-low overhead, native schema validation support |
| **Zod** | `4.6.7` | https://www.npmjs.com/package/zod | MIT | OK | Contract validation shared between API and mobile |
| **node-pg-migrate** | `9.0.0` | https://www.npmjs.com/package/node-pg-migrate | MIT | OK | Dedicated reversible SQL migrations; seamless PostGIS support |
| **pg (node-postgres)** | `8.23.1` | https://www.npmjs.com/package/pg | MIT | OK | Standard PostgreSQL client pool |
| **Biome** | `2.6.8` | https://biomejs.dev | MIT OR Apache-2.0 | OK | Fast Rust-based linter and formatter; tiny memory footprint |
| **Vitest** | `5.1.1` | https://vitest.dev | MIT | OK | Native ESM and TS test runner for API, contracts and design-tokens |
| **@testing-library/react-native** | `14.1.0` | https://callstack.github.io/react-native-testing-library | MIT | OK | For React Native component verification |

## Blocker Assessment
No component status is marked `BLOCKER`. `@rnmapbox/maps` 10.3.19 satisfies `react-native >= 0.79` and `expo >= 47.0.0`.
Development builds (`expo-dev-client`) will be used because Expo Go cannot bundle custom native C++/Java/Obj-C Mapbox binaries.
