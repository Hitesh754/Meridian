import { describe, expect, it } from 'vitest';
import {
  HealthResponseSchema,
  ProblemDetailsSchema,
  ReadyResponseSchema,
  ROAD_CATEGORIES,
  ROAD_CATEGORIES_MAP,
  RoadCategorySchema,
  UnreadyResponseSchema,
} from '../src/index.js';

describe('Contracts: Health & Readiness', () => {
  it('validates a valid HealthResponse', () => {
    const valid = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: 12.34,
      service: 'api',
    };
    const parsed = HealthResponseSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
  });

  it('rejects an invalid HealthResponse with wrong status', () => {
    const invalid = {
      status: 'up',
      timestamp: new Date().toISOString(),
      uptime: 12.34,
      service: 'api',
    };
    const parsed = HealthResponseSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it('validates a valid ReadyResponse with dependencies', () => {
    const ready = {
      status: 'ready',
      timestamp: new Date().toISOString(),
      uptime: 45.67,
      service: 'api',
      dependencies: {
        postgres: {
          status: 'healthy',
          latencyMs: 3.2,
        },
        postgis: {
          status: 'healthy',
          latencyMs: 1.1,
        },
      },
    };
    const parsed = ReadyResponseSchema.safeParse(ready);
    expect(parsed.success).toBe(true);
  });

  it('validates an UnreadyResponse when dependency is unhealthy', () => {
    const unready = {
      status: 'unready',
      timestamp: new Date().toISOString(),
      uptime: 10.0,
      service: 'api',
      dependencies: {
        postgres: {
          status: 'unhealthy',
          message: 'Connection timeout',
        },
      },
    };
    const parsed = UnreadyResponseSchema.safeParse(unready);
    expect(parsed.success).toBe(true);
  });
});

describe('Contracts: RFC 9457 Problem Details', () => {
  it('validates a compliant problem detail', () => {
    const problem = {
      type: 'https://api.meridian.app/v1/problems/service-unavailable',
      title: 'Service Unavailable',
      status: 503,
      detail: 'The database dependency is currently unreachable.',
      instance: '/readyz',
      code: 'DEPENDENCY_UNHEALTHY',
    };
    const parsed = ProblemDetailsSchema.safeParse(problem);
    expect(parsed.success).toBe(true);
  });

  it('validates validation error with invalidParams', () => {
    const validationProblem = {
      type: 'https://api.meridian.app/v1/problems/validation-failed',
      title: 'Request Validation Failed',
      status: 400,
      detail: 'The request payload failed validation.',
      invalidParams: [{ name: 'category', reason: 'Invalid category identifier' }],
    };
    const parsed = ProblemDetailsSchema.safeParse(validationProblem);
    expect(parsed.success).toBe(true);
  });

  it('rejects problem detail with invalid status code', () => {
    const invalid = {
      type: 'https://api.meridian.app/v1/problems/bad',
      title: 'Bad',
      status: 200, // Not an error status
      detail: 'Should fail',
    };
    const parsed = ProblemDetailsSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });
});

describe('Contracts: Road Categories', () => {
  it('has valid categories conforming to schema', () => {
    expect(ROAD_CATEGORIES.length).toBeGreaterThanOrEqual(6);
    for (const cat of ROAD_CATEGORIES) {
      const parsed = RoadCategorySchema.safeParse(cat);
      expect(parsed.success).toBe(true);
    }
  });

  it('contains expected categories in the map', () => {
    expect(ROAD_CATEGORIES_MAP.pothole.label).toBe('Pothole');
    expect(ROAD_CATEGORIES_MAP.debris.severityOptions).toContain('medium');
    expect(ROAD_CATEGORIES_MAP.flooding.iconName).toBe('droplet');
  });
});
