import { afterEach, describe, expect, it, vi } from 'vitest';

const genericMessage = 'Invalid server configuration.';

async function loadValidServerEnvironment() {
  vi.stubEnv('DATABASE_URL', 'postgresql://database.example.test/app');
  vi.stubEnv('REDIS_URL', 'rediss://cache.example.test');
  vi.stubEnv('NODE_ENV', 'test');
  vi.resetModules();

  return import('./env.server');
}

interface ServerOverrides {
  databaseUrl: string;
  redisUrl: string;
}

async function loadWithServerUrls(overrides: ServerOverrides): Promise<Error> {
  vi.stubEnv('DATABASE_URL', overrides.databaseUrl);
  vi.stubEnv('REDIS_URL', overrides.redisUrl);
  vi.stubEnv('NODE_ENV', 'test');
  vi.resetModules();

  try {
    await import('./env.server');
  } catch (error: unknown) {
    if (error instanceof Error) {
      return error;
    }

    throw new Error('Environment validation threw a non-Error value.');
  }

  throw new Error('Environment validation unexpectedly succeeded.');
}

function expectGenericError(error: Error, suppliedValue: string): void {
  expect(error.name).toBe('Error');
  expect(error.message).toBe(genericMessage);
  expect(error).not.toHaveProperty('code');
  expect(error).not.toHaveProperty('input');

  const renderedError = `${error.name}: ${error.message}\n${error.stack ?? ''}`;
  expect(renderedError).not.toContain(suppliedValue);
  expect(renderedError).not.toContain('Invalid URL');
  expect(renderedError).not.toContain('ERR_INVALID_URL');
}

describe('Next.js server environment validation', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('returns validated server configuration', async () => {
    const { serverEnv } = await loadValidServerEnvironment();

    expect(serverEnv).toEqual({
      DATABASE_URL: 'postgresql://database.example.test/app',
      REDIS_URL: 'rediss://cache.example.test',
      NODE_ENV: 'test',
    });
  });

  it.each(['definitely not a database URL', 'https://database.example.test'])(
    'returns only the generic error for rejected database URL %s',
    async (value) => {
      const error = await loadWithServerUrls({
        databaseUrl: value,
        redisUrl: 'rediss://cache.example.test',
      });

      expectGenericError(error, value);
    },
  );

  it.each(['definitely not a Redis URL', 'https://cache.example.test'])(
    'returns only the generic error for rejected Redis URL %s',
    async (value) => {
      const error = await loadWithServerUrls({
        databaseUrl: 'postgresql://database.example.test/app',
        redisUrl: value,
      });

      expectGenericError(error, value);
    },
  );
});
