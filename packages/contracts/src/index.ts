import { z } from 'zod';

// ==========================================
// 1. HEALTH & READINESS CONTRACTS
// ==========================================

export const HealthDependencyStatusSchema = z.enum(['healthy', 'unhealthy']);
export type HealthDependencyStatus = z.infer<typeof HealthDependencyStatusSchema>;

export const HealthDependencyDetailSchema = z.object({
  status: HealthDependencyStatusSchema,
  latencyMs: z.number().nonnegative().optional(),
  message: z.string().optional(),
});
export type HealthDependencyDetail = z.infer<typeof HealthDependencyDetailSchema>;

export const HealthResponseSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string().datetime(),
  uptime: z.number().nonnegative(),
  service: z.literal('api'),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export const ReadyResponseSchema = z.object({
  status: z.literal('ready'),
  timestamp: z.string().datetime(),
  uptime: z.number().nonnegative(),
  service: z.literal('api'),
  dependencies: z.record(z.string(), HealthDependencyDetailSchema),
});
export type ReadyResponse = z.infer<typeof ReadyResponseSchema>;

export const UnreadyResponseSchema = z.object({
  status: z.literal('unready'),
  timestamp: z.string().datetime(),
  uptime: z.number().nonnegative(),
  service: z.literal('api'),
  dependencies: z.record(z.string(), HealthDependencyDetailSchema),
});
export type UnreadyResponse = z.infer<typeof UnreadyResponseSchema>;

// ==========================================
// 2. RFC 9457 PROBLEM+JSON CONTRACTS
// ==========================================

export const InvalidParamSchema = z.object({
  name: z.string().min(1),
  reason: z.string().min(1),
});
export type InvalidParam = z.infer<typeof InvalidParamSchema>;

export const ProblemDetailsSchema = z.object({
  type: z.string().url(),
  title: z.string().min(1),
  status: z.number().int().min(400).max(599),
  detail: z.string().min(1),
  instance: z.string().optional(),
  code: z.string().optional(),
  invalidParams: z.array(InvalidParamSchema).optional(),
});
export type ProblemDetails = z.infer<typeof ProblemDetailsSchema>;

// ==========================================
// 3. ROAD CATEGORIES CONTRACTS
// ==========================================

export const RoadSeveritySchema = z.enum(['low', 'medium', 'high', 'critical']);
export type RoadSeverity = z.infer<typeof RoadSeveritySchema>;

export const RoadCategoryIdSchema = z.enum([
  'pothole',
  'debris',
  'flooding',
  'signal_out',
  'accident',
  'roadwork',
]);
export type RoadCategoryId = z.infer<typeof RoadCategoryIdSchema>;

export const RoadCategorySchema = z.object({
  id: RoadCategoryIdSchema,
  label: z.string().min(1),
  iconName: z.string().min(1),
  severityOptions: z.array(RoadSeveritySchema).min(1),
});
export type RoadCategory = z.infer<typeof RoadCategorySchema>;

export const ROAD_CATEGORIES: readonly RoadCategory[] = [
  {
    id: 'pothole',
    label: 'Pothole',
    iconName: 'alert-circle',
    severityOptions: ['low', 'medium', 'high', 'critical'],
  },
  {
    id: 'debris',
    label: 'Road Debris / Obstacle',
    iconName: 'alert-triangle',
    severityOptions: ['low', 'medium', 'high'],
  },
  {
    id: 'flooding',
    label: 'Water Accumulation / Flooding',
    iconName: 'droplet',
    severityOptions: ['medium', 'high', 'critical'],
  },
  {
    id: 'signal_out',
    label: 'Traffic Signal Failure',
    iconName: 'traffic-cone',
    severityOptions: ['high', 'critical'],
  },
  {
    id: 'accident',
    label: 'Vehicle Accident',
    iconName: 'shield-alert',
    severityOptions: ['medium', 'high', 'critical'],
  },
  {
    id: 'roadwork',
    label: 'Unmarked Construction / Roadwork',
    iconName: 'tool',
    severityOptions: ['low', 'medium', 'high'],
  },
] as const;

export const ROAD_CATEGORIES_MAP: Readonly<Record<RoadCategoryId, RoadCategory>> = Object.freeze(
  ROAD_CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    },
    {} as Record<RoadCategoryId, RoadCategory>,
  ),
);
