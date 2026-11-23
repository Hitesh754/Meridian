import type { FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app.js';
import type { Config } from '../src/config.js';
import type { DatabasePool } from '../src/db/pool.js';

const mockConfig: Config = {
  PORT: 8080,
  HOST: '0.0.0.0',
  NODE_ENV: 'test',
  LOG_LEVEL: 'fatal',
  DATABASE_URL: 'postgres://user:pass@localhost:5432/testdb',
};

function createMockDb(overrides?: Partial<DatabasePool>): DatabasePool {
  return {
    async query() {
      return { rows: [], command: 'SELECT', rowCount: 0, oid: 0, fields: [] };
    },
    async ping() {
      return { healthy: true, latencyMs: 1.5 };
    },
    async checkPostGis() {
      return { healthy: true, version: '3.4.2', latencyMs: 2.1 };
    },
    async close() {},
    ...overrides,
  };
}

describe('API Health Routes (Unit Tests)', () => {
  let app: FastifyInstance | null = null;

  afterEach(async () => {
    if (app) {
      await app.close();
      app = null;
    }
  });

  it('GET /healthz returns 200 with ok status', async () => {
    const db = createMockDb();
    app = buildApp(mockConfig, db);

    const response = await app.inject({
      method: 'GET',
      url: '/healthz',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe('ok');
    expect(body.service).toBe('api');
    expect(body.uptime).toBeTypeOf('number');
  });

  it('GET /readyz returns 200 when all dependencies are healthy', async () => {
    const db = createMockDb();
    app = buildApp(mockConfig, db);

    const response = await app.inject({
      method: 'GET',
      url: '/readyz',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe('ready');
    expect(body.dependencies.postgres.status).toBe('healthy');
    expect(body.dependencies.postgis.status).toBe('healthy');
  });

  it('GET /readyz returns 503 problem+json when postgres is unhealthy', async () => {
    const db = createMockDb({
      async ping() {
        return { healthy: false, latencyMs: 5000, error: 'Connection refused' };
      },
    });
    app = buildApp(mockConfig, db);

    const response = await app.inject({
      method: 'GET',
      url: '/readyz',
    });

    expect(response.statusCode).toBe(503);
    expect(response.headers['content-type']).toContain('application/problem+json');
    const body = JSON.parse(response.body);
    expect(body.status).toBe(503);
    expect(body.title).toBe('Service Unavailable');
    expect(body.detail).toContain('postgres');
    expect(body.detail).not.toContain('localhost:5432'); // No connection string leak
    expect(body.dependencies.postgres.status).toBe('unhealthy');
  });

  it('GET /readyz returns 503 problem+json when postgis is unhealthy', async () => {
    const db = createMockDb({
      async checkPostGis() {
        return {
          healthy: false,
          latencyMs: 12,
          error: 'function postgis_version() does not exist',
        };
      },
    });
    app = buildApp(mockConfig, db);

    const response = await app.inject({
      method: 'GET',
      url: '/readyz',
    });

    expect(response.statusCode).toBe(503);
    expect(response.headers['content-type']).toContain('application/problem+json');
    const body = JSON.parse(response.body);
    expect(body.status).toBe(503);
    expect(body.detail).toContain('postgis');
  });
});
