import { z } from 'zod';

const connectionUrl = (...protocols: readonly string[]) =>
  z.url().refine((value) => {
    const parsedUrl = URL.parse(value);
    return parsedUrl !== null && protocols.includes(parsedUrl.protocol);
  });

const postgresUrl = connectionUrl('postgres:', 'postgresql:');
const mongoUrl = connectionUrl('mongodb:', 'mongodb+srv:');
const redisUrl = connectionUrl('redis:', 'rediss:');

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']),
    PORT: z.coerce.number().int().min(1).max(65535),
    DATABASE_URL: postgresUrl.optional(),
    MONGODB_URI: mongoUrl.optional(),
    REDIS_URL: redisUrl.optional(),
  })
  .refine((value) => value.DATABASE_URL !== undefined || value.MONGODB_URI !== undefined, {
    message: 'At least one database connection is required.',
  });

const result = envSchema.safeParse({
  NODE_ENV: process.env['NODE_ENV'],
  PORT: process.env['PORT'],
  DATABASE_URL: process.env['DATABASE_URL'],
  MONGODB_URI: process.env['MONGODB_URI'],
  REDIS_URL: process.env['REDIS_URL'],
});

if (!result.success) {
  throw new Error('Invalid service configuration.');
}

export const env = result.data;
