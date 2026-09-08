import { z } from 'zod';

function hasAllowedProtocol(value: string, allowedProtocols: readonly string[]): boolean {
  try {
    return allowedProtocols.includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

const envSchema = z.object({
  VITE_API_BASE_URL: z.url().refine((value) => hasAllowedProtocol(value, ['http:', 'https:'])),
  VITE_APP_ENV: z.enum(['development', 'test', 'production']),
});

const result = envSchema.safeParse(import.meta.env);

if (!result.success) {
  throw new Error('Invalid application configuration.');
}

export const env = result.data;
