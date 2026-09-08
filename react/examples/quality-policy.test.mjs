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

describe('React engineering policy', () => {
  it.each([
    'src/policy-probe.ts',
    'src/policy-probe.tsx',
    'src/policy-probe.mts',
    'src/policy-probe.cts',
    'src/generated/policy-probe.ts',
    'public/generated/policy-probe.ts',
    'src/policy-probe.generated.ts',
  ])('enforces the complete typed ESLint policy for %s', async (relativePath) => {
    const config = await eslint.calculateConfigForFile(path.join(stackRoot, relativePath));

    assertTypeAwareEslintConfig(config, relativePath);
  });

  it('inherits the complete strict TypeScript policy', () => {
    assertStrictTypeScriptConfig(stackRoot);
  });

  it('inherits every shared GitLab quality and security job', () => {
    assertGitLabPolicy(stackRoot, 'react');
  });
});
