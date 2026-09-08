import { z } from 'zod';

function hasAllowedProtocol(value: string, allowedProtocols: readonly string[]): boolean {
  try {
    return allowedProtocols.includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url().refine((value) => hasAllowedProtocol(value, ['http:', 'https:'])),
});

const result = clientEnvSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env['NEXT_PUBLIC_APP_URL'],
});

if (!result.success) {
  throw new Error('Invalid public application configuration.');
}

export const clientEnv = result.data;
