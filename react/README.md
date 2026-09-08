# React engineering standards template

This directory is a tooling template for a React 19, TypeScript, and Vite application. Keep it
beside the repository's `common/` directory and add the official Vite React TypeScript scaffold
inside this directory. The template intentionally contains no application source.

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

### React-specific

- React 19 JSX-runtime rules without legacy `prop-types` duplication;
- React Hooks correctness and compiler-oriented hook rules;
- JSX accessibility checks;
- browser globals and restricted console use, with warnings treated as failures;
- Vite environment types and bundler module resolution; and
- validated `VITE_` configuration restricted to HTTP(S) API URLs and known environments.

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

| Command                  | Purpose                                                       |
| ------------------------ | ------------------------------------------------------------- |
| `npm run prepare`        | Install the repository's Husky hooks.                         |
| `npm run quality`        | Run formatting, linting, and TypeScript checks.               |
| `npm run lint`           | Lint JavaScript, JSX, TypeScript, and TSX with zero warnings. |
| `npm run format`         | Format supported repository files with Prettier.              |
| `npm run format:check`   | Check formatting without changing files.                      |
| `npm run typecheck`      | Type-check the application without emitting files.            |
| `npm test`               | Run the environment-validation tests once with Vitest.        |
| `npm run build`          | Create the Vite production build.                             |
| `npm run security:audit` | Fail on high-severity npm advisories.                         |

GitLab CI also runs commitlint over each merge-request or push commit range, using the shared
template every stack inherits. See the repository root
[README's commit linting in CI section](../README.md#commit-linting-in-ci)
for the full branch-by-branch behavior.

The build command assumes this template has been copied into a real React application. The empty
template has no application source, so `vite build` becomes meaningful after the application
scaffold is present. The checked-in tests verify that malformed or disallowed API URLs produce
only the generic configuration error and never expose the supplied value or a native URL error.

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
checking, or the production build fails, so a broken build cannot reach a deploy pipeline. Because
this template ships with no application entry point, the hook accepts only the same documented
`Cannot resolve entry module index.html` build boundary that `verify-all.mjs` accepts; any other
build failure still blocks the commit.

### False-positive review

Investigate each finding and remove any real secret. If a finding is confirmed to be a false
positive, obtain the required security review before adding a narrowly scoped exception with an
explanatory comment. Never add a blanket allowlist, and rerun the local and CI scans after any
exception is approved.
