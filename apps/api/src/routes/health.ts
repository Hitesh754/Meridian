import type { FastifyPluginAsync } from 'fastify';
import type { DatabasePool } from '../db/pool.js';
import { createProblemDetails } from '../errors.js';

export const healthRoutes = (db: DatabasePool): FastifyPluginAsync => {
  return async (fastify) => {
    // Liveness Probe
    fastify.get('/healthz', async (_request, reply) => {
      return reply.status(200).send({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        service: 'api',
      });
    });

    // Readiness Probe
    fastify.get('/readyz', async (request, reply) => {
      const [pgHealth, postgisHealth] = await Promise.all([db.ping(), db.checkPostGis()]);

      const dependencies: Record<
        string,
        { status: 'healthy' | 'unhealthy'; latencyMs?: number; message?: string }
      > = {
        postgres: {
          status: pgHealth.healthy ? 'healthy' : 'unhealthy',
          latencyMs: pgHealth.latencyMs,
          ...(pgHealth.error ? { message: 'Database connection check failed' } : {}),
        },
        postgis: {
          status: postgisHealth.healthy ? 'healthy' : 'unhealthy',
          latencyMs: postgisHealth.latencyMs,
          ...(postgisHealth.error ? { message: 'PostGIS extension check failed' } : {}),
        },
      };

      const failing = Object.entries(dependencies).filter(([_, dep]) => dep.status === 'unhealthy');

      if (failing.length > 0) {
        const failedNames = failing.map(([name]) => name).join(', ');
        request.log.warn({ dependencies }, `Readiness check failed for: ${failedNames}`);

        const problem = createProblemDetails({
          status: 503,
          title: 'Service Unavailable',
          detail: `Readiness check failed for dependency: ${failedNames}`,
          type: 'https://api.meridian.app/v1/problems/dependency-unavailable',
          instance: '/readyz',
          code: 'DEPENDENCY_UNHEALTHY',
        });

        return reply
          .status(503)
          .header('content-type', 'application/problem+json')
          .send({
            ...problem,
            dependencies,
          });
      }

      return reply.status(200).send({
        status: 'ready',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        service: 'api',
        dependencies,
      });
    });
  };
};
