# Node.js backend engineering standards template

A framework-neutral tooling template for a Node.js 24 LTS service using TypeScript and ECMAScript
modules. Keep this directory next to the repo's `common/` folder and add service source inside
it — there's no framework or application code checked in here on purpose.

## What's enforced

### From `common/`

- Strict TypeScript: unchecked-index, exact-optional, implicit-return, override, switch,
  index-signature, unused-code, casing, side-effect-import, and declaration-file checks are all on.
- No explicit or unsafe `any` in `.ts`, `.tsx`, `.mts`, or `.cts`. Full stop.
- Generated code doesn't get a pass — it's linted, type-checked, formatted, and staged-checked
  exactly like anything written by hand.
- Typed promise handling, `Error`-only throws, exhaustive switches, safe assertions, type-only
  imports, and `@ts-expect-error` comments that actually explain themselves instead of just
  suppressing the error.
- Deterministic formatting, conventional commits, Gitleaks, npm audits, exact dependency
  versions, Node/npm version enforcement, real tests, and coverage thresholds.
- The shared GitLab security, quality, commitlint, test, and build jobs.

### Node.js backend-specific

- Native ESM with NodeNext resolution, and explicit `.js` specifiers on emitted imports.
- Node globals, declaration output, source maps, casing safety, production-only build inputs, and
  runtime entry-point scripts.
- `Error`-only throws, required `await` usage, typed asynchronous control flow, and exhaustive
  switches.
- Validated ports from 1 through 65535, and at least one configured database.
- Protocol restrictions on PostgreSQL, MongoDB, and optional Redis connections.
- Generic configuration failures that never leak a connection string.

## Setting it up

1. Put this directory next to `common/`, then add service source here.
2. Install Gitleaks 8.30.x — run `gitleaks version` to confirm it's actually on `PATH`.
3. `npm install` to pull the exact dependency versions and generate `package-lock.json`.
4. `npm run prepare` to wire up the Husky hooks.
5. Run `npm run quality`, `npm test`, and `npm run build` to confirm it's all green.
6. Commit `package-lock.json` along with whatever configuration you adopted.

## Merging into an existing project

If there's already a `package.json`, don't just overwrite it. Copy the other template files over,
merge each script and dependency into the existing manifest by hand, and keep whatever's genuinely
service-specific. Where something conflicts, the local standard wins unless the team has signed
off on an exception. Then run `npm install`, check the lockfile diff, `npm run prepare`, and go
through the full quality, test, and build sequence.

## Scripts

| Command                  | Purpose                                                        |
| ------------------------ | -------------------------------------------------------------- |
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

GitLab CI runs commitlint too, off the same shared logic every stack uses — see the root
[README's commit linting in CI section](../README.md#commit-linting-in-ci) for the full
branch-by-branch breakdown.

This bare template has no `src/index.ts` yet — the build just compiles the environment example,
and its tests are what enforce the configuration boundary for now. `dev` and `start` only become
meaningful once real application source shows up.

## TypeScript and ESM

The package and compiler use native ECMAScript modules with NodeNext resolution. Relative imports
in TypeScript source need explicit `.js` extensions so the emitted imports actually resolve under
Node. Keep application source under `src/` — `rootDir` mirrors that layout under `dist/` and emits
source maps plus declaration files alongside it.

## Runtime configuration

The environment example parses an explicit object at startup and exports only the validated
result. It requires `NODE_ENV`, a port from 1 through 65535, and at least one valid PostgreSQL or
MongoDB URL — Redis is optional. Validation failures raise a generic error; they never echo back
the configuration values themselves.

The checked-in `.env.example` has local, non-secret URLs with no passwords. Copy it to an ignored
local environment file and pull real values from whatever secret-management system the org uses.
Never commit credentials, and never pass the whole `process.env` past the configuration boundary.

## Optional infrastructure

PostgreSQL, MongoDB, Redis, and BullMQ are supported capabilities, not requirements — only add the
client library a given service actually uses. BullMQ needs a Redis connection behind it, so don't
pull it in for a service that has no queues. Keep connection setup behind validated config, and
add an integration test for whatever capability gets adopted.

## Gitleaks

Grab the v8.30.1 release for your platform from the
[official releases page](https://github.com/gitleaks/gitleaks/releases/tag/v8.30.1), verify it
however your org requires, and put the `gitleaks` binary on `PATH`. Pre-commit refuses to run
without it. It scans the staged diff before `lint-staged` even runs, and redacts anything it finds
in the output. GitLab CI does its own independent scan over full repository history with the
pinned 8.30.1 container. Don't bypass either one just to force a commit or a pipeline through —
that's the whole control gone.

### Pre-commit gate

Order matters here: Gitleaks first, then `lint-staged` (formats and lints whatever's staged), then
`npm run quality` — a full format/lint/typecheck pass over the entire project, not just what was
touched — and finally `npm run build`. Any of those failing blocks the commit, so a broken build
never makes it anywhere near a deploy pipeline.

### If Gitleaks flags something that isn't real

Look into it before assuming it's a false positive. If it genuinely turns out to be nothing, get
it reviewed before adding a narrowly scoped exception with a comment explaining why. Don't add a
blanket allowlist, and re-run both the local and CI scans once the exception is approved.
