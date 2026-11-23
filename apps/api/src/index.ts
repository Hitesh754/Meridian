import { buildApp } from './app.js';
import { loadConfig } from './config.js';
import { createDatabasePool } from './db/pool.js';

async function start() {
  const config = loadConfig();
  const db = createDatabasePool(config.DATABASE_URL);
  const app = buildApp(config, db);

  // Graceful shutdown handling
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  for (const signal of signals) {
    process.on(signal, async () => {
      app.log.info({ signal }, `Received ${signal}, initiating graceful shutdown...`);
      try {
        await app.close();
        await db.close();
        app.log.info('Graceful shutdown completed successfully.');
        process.exit(0);
      } catch (err) {
        app.log.error({ err }, 'Error during graceful shutdown');
        process.exit(1);
      }
    });
  }

  try {
    const address = await app.listen({
      port: config.PORT,
      host: config.HOST,
    });
    app.log.info({ address }, `Meridian API started and listening on ${address}`);
  } catch (err) {
    app.log.fatal({ err }, 'Meridian API failed to bind/start');
    process.exit(1);
  }
}

start();
