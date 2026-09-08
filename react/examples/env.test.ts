import { afterEach, describe, expect, it, vi } from 'vitest';

const genericMessage = 'Invalid application configuration.';

async function loadValidEnvironment() {
  vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test');
  vi.stubEnv('VITE_APP_ENV', 'test');
  vi.resetModules();

  return import('./env');
}

async function loadWithApiUrl(value: string): Promise<Error> {
  vi.stubEnv('VITE_API_BASE_URL', value);
  vi.stubEnv('VITE_APP_ENV', 'test');
  vi.resetModules();

  try {
    await import('./env');
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

describe('React environment validation', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('returns validated public configuration', async () => {
    const { env } = await loadValidEnvironment();

    expect(env).toEqual({
      VITE_API_BASE_URL: 'https://api.example.test',
      VITE_APP_ENV: 'test',
    });
  });

  it.each(['definitely not a URL', 'ftp://public.example.test'])(
    'returns only the generic error for rejected API URL %s',
    async (value) => {
      const error = await loadWithApiUrl(value);

      expectGenericError(error, value);
    },
  );
});
