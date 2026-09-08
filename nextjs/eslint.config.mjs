import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import tseslint from 'typescript-eslint';

import { createTypeScriptConfig } from '../common/eslint/typescript.mjs';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  createTypeScriptConfig({ tseslint, tsconfigRootDir: import.meta.dirname }),
  {
    files: ['examples/**/*.{ts,tsx}'],
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
  {
    files: ['next-env.d.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off',
    },
  },
  {
    files: ['*.config.{cjs,mjs}'],
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'coverage/**', '!next-env.d.ts']),
  prettier,
]);
