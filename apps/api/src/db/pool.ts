import pg from 'pg';

const { Pool } = pg;

export interface DatabasePool {
  query<T extends pg.QueryResultRow = pg.QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<pg.QueryResult<T>>;
  ping(): Promise<{ healthy: boolean; latencyMs: number; error?: string }>;
  checkPostGis(): Promise<{
    healthy: boolean;
    version?: string;
    latencyMs: number;
    error?: string;
  }>;
  close(): Promise<void>;
}

export function createDatabasePool(connectionString: string): DatabasePool {
  const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

  return {
    async query<T extends pg.QueryResultRow = pg.QueryResultRow>(
      text: string,
      params?: unknown[],
    ): Promise<pg.QueryResult<T>> {
      return pool.query<T>(text, params);
    },

    async ping(): Promise<{ healthy: boolean; latencyMs: number; error?: string }> {
      const start = performance.now();
      try {
        await pool.query('SELECT 1');
        const latencyMs = Number((performance.now() - start).toFixed(2));
        return { healthy: true, latencyMs };
      } catch (err: unknown) {
        const latencyMs = Number((performance.now() - start).toFixed(2));
        return {
          healthy: false,
          latencyMs,
          error: err instanceof Error ? err.message : 'Unknown database error',
        };
      }
    },

    async checkPostGis(): Promise<{
      healthy: boolean;
      version?: string;
      latencyMs: number;
      error?: string;
    }> {
      const start = performance.now();
      try {
        const res = await pool.query<{ postgis_version: string }>('SELECT postgis_version();');
        const latencyMs = Number((performance.now() - start).toFixed(2));
        const version = res.rows[0]?.postgis_version;
        return { healthy: true, version, latencyMs };
      } catch (err: unknown) {
        const latencyMs = Number((performance.now() - start).toFixed(2));
        return {
          healthy: false,
          latencyMs,
          error: err instanceof Error ? err.message : 'PostGIS extension not found or query failed',
        };
      }
    },

    async close(): Promise<void> {
      await pool.end();
    },
  };
}
