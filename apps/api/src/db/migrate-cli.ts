import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runner } from 'node-pg-migrate';
import { loadConfig } from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const direction = (process.argv[2] ?? 'up') as 'up' | 'down';
  const config = loadConfig();

  // Migrations directory located at apps/api/migrations
  const migrationsDir = path.resolve(__dirname, '../../migrations');

  console.log(`[Database Migration] Running direction: ${direction.toUpperCase()}...`);
  try {
    const results = await runner({
      databaseUrl: config.DATABASE_URL,
      dir: migrationsDir,
      direction,
      migrationsTable: 'pgmigrations',
      count: direction === 'down' ? 1 : Infinity,
      verbose: true,
      singleTransaction: true,
    });
    console.log(
      `[Database Migration] ${direction.toUpperCase()} succeeded. Processed ${results.length} migration(s).`,
    );
    process.exit(0);
  } catch (err) {
    console.error(`[Database Migration] ${direction.toUpperCase()} FAILED:`, err);
    process.exit(1);
  }
}

main();
