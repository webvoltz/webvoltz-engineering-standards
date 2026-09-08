import { afterEach, describe, expect, it, vi } from 'vitest';

const genericMessage = 'Invalid public application configuration.';

async function loadValidPublicEnvironment() {
  vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://app.example.test');
  vi.resetModules();

  return import('./env.client');
}

async function loadWithPublicAppUrl(value: string): Promise<Error> {
  vi.stubEnv('NEXT_PUBLIC_APP_URL', value);
  vi.resetModules();

  try {
    await import('./env.client');
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

describe('Next.js public environment validation', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('returns validated public configuration', async () => {
    const { clientEnv } = await loadValidPublicEnvironment();

    expect(clientEnv).toEqual({ NEXT_PUBLIC_APP_URL: 'https://app.example.test' });
  });

  it.each(['definitely not a URL', 'ftp://public.example.test'])(
    'returns only the generic error for rejected public URL %s',
    async (value) => {
      const error = await loadWithPublicAppUrl(value);

      expectGenericError(error, value);
    },
  );
});
