import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      exclude: ['examples/**/*.test.*'],
      include: ['examples/env.ts'],
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      reportsDirectory: 'coverage',
      thresholds: {
        branches: 85,
        functions: 100,
        lines: 90,
        statements: 90,
      },
    },
  },
});
