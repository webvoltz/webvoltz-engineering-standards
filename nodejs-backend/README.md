# Node.js backend engineering standards template

This directory is a framework-neutral tooling template for a Node.js 24 LTS service using
TypeScript and ECMAScript modules. Keep it beside the repository's `common/` directory and add
service source inside this directory. The template intentionally contains no framework or
application source.

## Enforced practices

### Inherited from `common/`

- strict TypeScript with unchecked-index, exact-optional, implicit-return, override, switch,
  index-signature, unused-code, casing, side-effect-import, and declaration-file checks;
- explicit and unsafe `any` rejection for `.ts`, `.tsx`, `.mts`, and `.cts`;
- no generated-code exemption from linting, type checking, formatting, or staged checks;
- typed promise handling, Error-only throws, exhaustive switches, safe assertions, type-only
  imports, and descriptive-only `@ts-expect-error` comments;
- deterministic formatting, conventional commits, Gitleaks, npm audits, exact dependencies,
  Node/npm version enforcement, real tests, and coverage thresholds; and
- shared GitLab security, quality, commitlint, test, and build jobs.

### Node.js backend-specific

- native ESM and NodeNext resolution with explicit emitted `.js` import specifiers;
- Node globals, declaration output, source maps, casing safety, production-only build inputs, and
  runtime entry-point scripts;
- Error-only throws, required `await` usage, typed asynchronous control flow, and exhaustive
  switches;
- validated ports from 1 through 65535 and at least one configured database;
- protocol restrictions for PostgreSQL, MongoDB, and optional Redis connections; and
- generic configuration failures that do not leak supplied connection strings.

## Installation

1. Keep this directory and `common/` as siblings, then place service source here.
2. Install Gitleaks 8.30.x and confirm that `gitleaks version` works locally.
3. Run `npm install` to install the exact dependency versions and generate `package-lock.json`.
4. Run `npm run prepare` to install the Husky hooks.
5. Run `npm run quality`, `npm test`, and `npm run build`.
6. Commit `package-lock.json` with the adopted configuration.

## Merge into an existing project

When the target already has a `package.json`, do not replace it wholesale. Copy the other
template files, merge every script and dependency from this template into the existing manifest,
and retain service-specific dependencies and metadata. Resolve configuration differences in
favor of the local standards unless the team has approved a documented exception. Then run
`npm install`, review the generated lockfile, run `npm run prepare`, and execute the complete
quality, test, and build sequence.

## Scripts

| Command                  | Purpose                                                        |
| ------------------------ | ---------------------------------------------------------------|
| `npm run dev`            | Run `src/index.ts` with tsx in watch mode.                     |
| `npm run prepare`        | Install the repository's Husky hooks.                          |
| `npm run quality`        | Run formatting, linting, and TypeScript checks.                |
| `npm run lint`           | Lint backend JavaScript and TypeScript with zero warnings.     |
| `npm run format`         | Format supported repository files with Prettier.               |
| `npm run format:check`   | Check formatting without changing files.                       |
| `npm run typecheck`      | Type-check the service without emitting files.                 |
| `npm test`               | Run real tests with enforced V8 coverage thresholds.           |
| `npm run build`          | Compile the service and declarations into `dist/`.             |
| `npm start`              | Run the compiled `dist/src/index.js` entry point with Node.js. |
| `npm run security:audit` | Fail on high-severity npm advisories.                          |

GitLab CI also runs commitlint over each merge-request or push commit range. For an initial
default-branch push, it lints every reachable commit in topological parent-before-child order from
root to the pipeline head. Other first pushes and tags fetch the default branch and lint every
commit after the merge base. Scheduled and manually started zero-SHA pipelines use that same
merge-base fallback instead of rescanning default-branch history. When the pipeline commit is
itself the base, CI lints its message through stdin. This keeps commit-message enforcement
authoritative when a local `commit-msg` hook is unavailable or bypassed. Workflow rules create
merge-request, tag, and branch pipelines while suppressing only duplicate branch push pipelines
for open merge requests; scheduled, manual, API, and triggered branch pipelines remain available.

This bare template has no `src/index.ts`; the build compiles the environment example and its
tests enforce the configuration boundary. The `dev` and `start` commands become meaningful after
application source is added.

## TypeScript and ESM

The package and compiler use native ECMAScript modules with NodeNext resolution. Use explicit
`.js` extensions for relative imports in TypeScript source so emitted imports resolve in Node.js.
Keep application source under `src/`; `rootDir` preserves that structure under `dist/` and emits
source maps and declaration files.

## Runtime configuration

The environment example parses an explicit object at startup and exports only validated values.
It requires `NODE_ENV`, a port from 1 through 65535, and at least one valid PostgreSQL or MongoDB
URL. Redis is optional. Validation failures use a generic error and do not include configuration
values.

The checked-in `.env.example` contains local, non-secret URLs without passwords. Copy it to an
ignored local environment file and supply deployed values through the approved secret-management
system. Never commit credentials or pass all of `process.env` beyond the configuration boundary.

## Optional infrastructure

PostgreSQL, MongoDB, Redis, and BullMQ are supported service capabilities, not mandatory template
dependencies. Add only the database client, cache client, or queue library the service actually
uses. BullMQ requires a Redis connection; services that do not use queues should not install it.
Keep connection setup behind validated configuration and add integration tests for each adopted
capability.

## Gitleaks

Download the v8.30.1 release for the development platform from the
[official Gitleaks releases](https://github.com/gitleaks/gitleaks/releases/tag/v8.30.1), verify it
according to organization policy, and place the `gitleaks` executable on `PATH`. The pre-commit
hook fails when `gitleaks` is unavailable, scans the staged diff before lint-staged, and redacts
findings. GitLab CI independently scans repository history with the pinned 8.30.1 container. Do
not bypass either control to force a commit or pipeline through.

### Pre-commit gate

After the Gitleaks scan, the pre-commit hook runs `lint-staged` (formats and lints staged files),
then `npm run quality` (Prettier `format:check`, ESLint, and TypeScript across the whole project,
not only staged files), then `npm run build`. A commit is rejected if formatting, linting, type
checking, or the production build fails, so a broken build cannot reach a deploy pipeline.

### False-positive review

Investigate each finding and remove any real secret. If a finding is confirmed to be a false
positive, obtain the required security review before adding a narrowly scoped exception with an
explanatory comment. Never add a blanket allowlist, and rerun the local and CI scans after any
exception is approved.
