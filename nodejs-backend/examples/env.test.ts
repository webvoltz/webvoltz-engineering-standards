import { afterEach, describe, expect, it, vi } from 'vitest';

const genericMessage = 'Invalid service configuration.';

interface EnvironmentOverrides {
  databaseUrl?: string;
  mongodbUri?: string;
  port?: string;
  redisUrl?: string;
}

async function loadEnvironment(overrides: EnvironmentOverrides = {}) {
  vi.stubEnv('NODE_ENV', 'test');
  vi.stubEnv('PORT', overrides.port ?? '3000');
  if (overrides.databaseUrl !== undefined) {
    vi.stubEnv('DATABASE_URL', overrides.databaseUrl);
  }
  if (overrides.mongodbUri !== undefined) {
    vi.stubEnv('MONGODB_URI', overrides.mongodbUri);
  }
  if (overrides.redisUrl !== undefined) {
    vi.stubEnv('REDIS_URL', overrides.redisUrl);
  }
  vi.resetModules();

  return import('./env.js');
}

async function captureConfigurationError(overrides: EnvironmentOverrides): Promise<Error> {
  try {
    await loadEnvironment(overrides);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return error;
    }

    throw new Error('Environment validation threw a non-Error value.');
  }

  throw new Error('Environment validation unexpectedly succeeded.');
}

function expectGenericError(error: Error, suppliedValue?: string): void {
  expect(error.name).toBe('Error');
  expect(error.message).toBe(genericMessage);

  const renderedError = `${error.name}: ${error.message}\n${error.stack ?? ''}`;
  if (suppliedValue !== undefined) {
    expect(renderedError).not.toContain(suppliedValue);
  }
  expect(renderedError).not.toContain('Invalid URL');
  expect(renderedError).not.toContain('ERR_INVALID_URL');
}

describe('Node.js backend environment validation', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('accepts PostgreSQL configuration and coerces the port', async () => {
    const { env } = await loadEnvironment({
      databaseUrl: 'postgresql://database.example.test/app',
      redisUrl: 'rediss://cache.example.test',
    });

    expect(env).toEqual({
      NODE_ENV: 'test',
      PORT: 3000,
      DATABASE_URL: 'postgresql://database.example.test/app',
      REDIS_URL: 'rediss://cache.example.test',
    });
  });

  it('accepts MongoDB as the database alternative', async () => {
    const { env } = await loadEnvironment({
      mongodbUri: 'mongodb+srv://database.example.test/app',
    });

    expect(env.MONGODB_URI).toBe('mongodb+srv://database.example.test/app');
  });

  it.each(['0', '65536', 'not-a-port'])('rejects invalid port %s', async (value) => {
    const error = await captureConfigurationError({
      databaseUrl: 'postgresql://database.example.test/app',
      port: value,
    });

    expectGenericError(error);
  });

  it.each([
    ['databaseUrl', 'https://database.example.test'],
    ['mongodbUri', 'https://database.example.test'],
    ['redisUrl', 'https://cache.example.test'],
  ] as const)('rejects an invalid %s protocol', async (key, value) => {
    const overrides: EnvironmentOverrides =
      key === 'databaseUrl'
        ? { databaseUrl: value }
        : key === 'mongodbUri'
          ? { mongodbUri: value }
          : {
              databaseUrl: 'postgresql://database.example.test/app',
              redisUrl: value,
            };
    const error = await captureConfigurationError(overrides);

    expectGenericError(error, value);
  });

  it('requires at least one database connection', async () => {
    const error = await captureConfigurationError({});

    expectGenericError(error);
  });
});
