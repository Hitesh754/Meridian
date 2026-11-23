import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { createDatabasePool, type DatabasePool } from '../src/db/pool.js';

describe('API Integration with PostgreSQL + PostGIS', () => {
  let db: DatabasePool;
  let app: ReturnType<typeof buildApp>;

  beforeAll(async () => {
    const config = loadConfig();
    db = createDatabasePool(config.DATABASE_URL);
    app = buildApp(config, db);
  });

  afterAll(async () => {
    if (app) await app.close();
    if (db) await db.close();
  });

  it('GET /healthz returns 200 ok', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/healthz',
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe('ok');
    expect(body.service).toBe('api');
  });

  it('GET /readyz returns 200 with PostGIS verified in database', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/readyz',
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.status).toBe('ready');
    expect(body.dependencies.postgres.status).toBe('healthy');
    expect(body.dependencies.postgis.status).toBe('healthy');
  });
});
