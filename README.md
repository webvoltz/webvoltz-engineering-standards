# Engineering standards configurations

This repository provides a shared engineering policy and isolated templates for React, Next.js,
and Node.js backend projects.

```text
common/          Framework-neutral compiler, lint, format, commit, CI, and policy checks
react/           React 19 and Vite-specific configuration
nextjs/          Next.js App Router-specific configuration
nodejs-backend/  Node.js ESM service-specific configuration
```

`common/` is deliberately not an npm package. It has no `package.json`, workspace metadata, or
third-party dependency. Each stack installs its own tooling and imports shared configuration by
relative path.

## Adoption

Keep `common/` and the selected stack directory as siblings. Application source belongs inside
the selected stack directory. If the directory is renamed, update `STACK_DIR` in its
`.gitlab-ci.yml`; relative common-config imports continue to work as long as both directories
remain siblings.

Install with the Node.js version in the stack's `.nvmrc`, then run:

```sh
cd react # or nextjs / nodejs-backend
npm ci
npm run prepare
npm run quality
npm test
npm run build
```

The React directory intentionally omits its application entry point, so aggregate verification
accepts only Vite's documented missing-entry failure. Next.js verifies as a successful 404-only
framework build until application routes are added.

## Verify every stack

```sh
node common/policies/verify-all.mjs
node common/policies/verify-all.mjs --security
```

The first command runs formatting checks, ESLint, TypeScript, tests with coverage, and build
boundary verification. `--security` additionally queries npm's current advisory database.

## Shared non-negotiable policy

- strict TypeScript, including unchecked-index and exact-optional-property safety;
- no explicit or unsafe `any` flow in any supported TypeScript module extension;
- generated source is checked exactly like handwritten source;
- type-aware promise, Error, switch-exhaustiveness, import, assertion, and suppression rules;
- deterministic Prettier formatting and zero ESLint warnings;
- real tests with V8 coverage thresholds; an absent suite fails;
- exact dependencies, lockfile installs, Node/npm compatibility enforcement, and npm audits;
- staged secret scanning, staged lint/format checks, conventional commits, and CI enforcement; and
- generic runtime-configuration failures that do not expose supplied environment values.

See each stack README for its additional framework-specific rules.
