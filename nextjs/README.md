# Next.js engineering standards template

This directory is a tooling template for a Next.js 16 App Router application using React 19 and
TypeScript. Keep it beside the repository's `common/` directory and add the official Next.js
TypeScript scaffold inside this directory. The template intentionally contains no application
routes or source files.

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

### Next.js-specific

- Next.js Core Web Vitals and framework TypeScript rules;
- React and App Router conventions, framework-generated type inclusion, and bundler resolution;
- a Turbopack repository root that permits the sibling shared configuration without duplication;
- full safety linting for generated `next-env.d.ts`, with only the framework-required
  triple-slash declarations exempted and generator-compatible quote formatting;
- no unchecked JavaScript in the TypeScript program;
- explicit client/server environment boundaries so server secrets cannot enter client bundles;
- HTTP(S)-only public URLs, PostgreSQL-only database URLs, and Redis protocol validation; and
- the single-attribute-per-line JSX formatting convention.

## Installation

1. Keep this directory and `common/` as siblings, then place the application scaffold here.
2. Install Gitleaks 8.30.x and confirm that `gitleaks version` works locally.
3. Run `npm install` to install the exact dependency versions and generate `package-lock.json`.
4. Run `npm run prepare` to install the Husky hooks.
5. Run `npm run quality`, `npm test`, and `npm run build`.
6. Commit `package-lock.json` with the adopted configuration.

## Merge into an existing project

When the target already has a `package.json`, do not replace it wholesale. Copy the other
template files, merge every script and dependency from this template into the existing manifest,
and retain application-specific dependencies and metadata. Resolve configuration differences in
favor of the local standards unless the team has approved a documented exception. Then run
`npm install`, review the generated lockfile, run `npm run prepare`, and execute the complete
quality, test, and build sequence.

## Scripts

| Command                  | Purpose                                                |
| ------------------------ | ------------------------------------------------------ |
| `npm run prepare`        | Install the repository's Husky hooks.                  |
| `npm run quality`        | Run formatting, linting, and TypeScript checks.        |
| `npm run lint`           | Lint JavaScript and TypeScript with zero warnings.     |
| `npm run format`         | Format supported repository files with Prettier.       |
| `npm run format:check`   | Check formatting without changing files.               |
| `npm run typecheck`      | Type-check the application without emitting files.     |
| `npm test`               | Run the environment-validation tests once with Vitest. |
| `npm run build`          | Create the Next.js production build with `next build`. |
| `npm run security:audit` | Fail on high-severity npm advisories.                  |

GitLab CI also runs commitlint over each merge-request or push commit range, using the shared
template every stack inherits. See the repository root
[README's commit linting in CI section](../README.md#commit-linting-in-ci)
for the full branch-by-branch behavior.

The empty template builds a framework-provided static 404 route; application routes become part
of the build after the scaffold is added. The checked-in tests verify that malformed or disallowed
public, database, and Redis URLs produce only the appropriate generic configuration error without
exposing the supplied value or a native URL error.

`package.json` narrowly overrides Next.js's pinned PostCSS dependency to 8.5.19 because the
upstream 8.4.31 release is affected by GHSA-qx2v-qp2m-jg93. Revisit and remove the override once
the pinned Next.js release resolves PostCSS to a non-vulnerable version, then regenerate and audit
the lockfile.

## Environment boundaries

Only variables prefixed with `NEXT_PUBLIC_` may be read by client code. The client example parses
an explicit object containing only `NEXT_PUBLIC_APP_URL`; it never passes all of `process.env` to
Zod. The server example separately parses `DATABASE_URL`, optional `REDIS_URL`, and `NODE_ENV`.
Keep that separation when extending either schema so server-only values cannot enter client
bundles. Validation failures use generic messages and never include environment values.

The checked-in `.env.example` contains local, non-secret placeholders. Copy it to an ignored local
environment file and supply real values through the approved secret-management system. Never
commit credentials or add server-only variables to the client schema.

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
