import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ESLint } from 'eslint';
import { describe, it } from 'vitest';

import {
  assertGitLabPolicy,
  assertStrictTypeScriptConfig,
  assertTypeAwareEslintConfig,
} from '../../common/policies/assert-config.mjs';

const stackRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const eslint = new ESLint({ cwd: stackRoot });

describe('Next.js engineering policy', () => {
  it.each([
    'app/policy-probe.ts',
    'app/policy-probe.tsx',
    'app/policy-probe.mts',
    'app/policy-probe.cts',
    'app/generated/policy-probe.ts',
    'app/policy-probe.generated.ts',
    'next-env.d.ts',
  ])('enforces the complete typed ESLint policy for %s', async (relativePath) => {
    const config = await eslint.calculateConfigForFile(path.join(stackRoot, relativePath));

    assertTypeAwareEslintConfig(config, relativePath);
  });

  it('inherits the complete strict TypeScript policy', () => {
    assertStrictTypeScriptConfig(stackRoot);
  });

  it('inherits every shared GitLab quality and security job', () => {
    assertGitLabPolicy(stackRoot, 'nextjs');
  });
});
