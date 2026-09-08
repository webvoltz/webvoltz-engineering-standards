import { z } from 'zod';

function hasAllowedProtocol(value: string, allowedProtocols: readonly string[]): boolean {
  try {
    return allowedProtocols.includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

const serverEnvSchema = z.object({
  DATABASE_URL: z.url().refine((value) => hasAllowedProtocol(value, ['postgres:', 'postgresql:'])),
  REDIS_URL: z
    .url()
    .refine((value) => hasAllowedProtocol(value, ['redis:', 'rediss:']))
    .optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']),
});

const result = serverEnvSchema.safeParse({
  DATABASE_URL: process.env['DATABASE_URL'],
  REDIS_URL: process.env['REDIS_URL'],
  NODE_ENV: process.env.NODE_ENV,
});

if (!result.success) {
  throw new Error('Invalid server configuration.');
}

export const serverEnv = result.data;
