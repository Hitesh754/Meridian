import crypto from 'node:crypto';
import Fastify, { type FastifyInstance } from 'fastify';
import type { Config } from './config.js';
import type { DatabasePool } from './db/pool.js';
import { errorHandler } from './errors.js';
import { healthRoutes } from './routes/health.js';

export function buildApp(config: Config, db: DatabasePool): FastifyInstance {
  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
      serializers: {
        req(req) {
          return {
            method: req.method,
            url: req.url,
            hostname: req.hostname,
            remoteAddress: req.ip,
          };
        },
      },
    },
    genReqId(req) {
      const headerId = req.headers['x-request-id'];
      if (typeof headerId === 'string' && headerId.length > 0) {
        return headerId;
      }
      return crypto.randomUUID();
    },
    requestIdHeader: 'x-request-id',
  });

  // Global RFC 9457 error handler
  app.setErrorHandler(errorHandler);

  // Operational health & readiness endpoints
  app.register(healthRoutes(db));

  return app;
}
