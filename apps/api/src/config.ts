import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from cwd and monorepo root
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const ConfigSchema = z.object({
  PORT: z.coerce.number().int().min(1024).max(65535).default(8080),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  DATABASE_URL: z
    .string()
    .url()
    .refine((url) => url.startsWith('postgres://') || url.startsWith('postgresql://'), {
      message: 'DATABASE_URL must be a valid PostgreSQL connection URI',
    }),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(env = process.env): Config {
  const result = ConfigSchema.safeParse(env);
  if (!result.success) {
    const errorDetails = result.error.issues
      .map((err) => `  - ${err.path.join('.')}: ${err.message}`)
      .join('\n');
    console.error('FATAL: Meridian API configuration validation failed:');
    console.error(errorDetails);
    process.exit(1);
  }
  return result.data;
}
