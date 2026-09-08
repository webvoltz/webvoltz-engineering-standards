# React engineering standards template

A tooling template for a React 19 + TypeScript + Vite app. Drop the official Vite React
TypeScript scaffold into this directory and keep it next to the repo's `common/` folder — that's
it. There's no application source checked in here on purpose.

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

### React-specific

- React 19's JSX runtime rules, without the leftover `prop-types` noise.
- Hooks correctness plus the compiler-oriented hook rules.
- JSX accessibility checks.
- Browser globals are fine, but console use is restricted — and warnings fail here, they don't
  just get logged and ignored.
- Vite's environment types and bundler-style module resolution.
- `VITE_` config is validated so it can only point at HTTP(S) API URLs in a known environment.

## Setting it up

1. Put this directory next to `common/`, then drop the application scaffold in here.
2. Install Gitleaks 8.30.x — run `gitleaks version` to confirm it's actually on `PATH`.
3. `npm install` to pull the exact dependency versions and generate `package-lock.json`.
4. `npm run prepare` to wire up the Husky hooks.
5. Run `npm run quality`, `npm test`, and `npm run build` to confirm it's all green.
6. Commit `package-lock.json` along with whatever configuration you adopted.

## Merging into an existing project

If there's already a `package.json`, don't just overwrite it. Copy the other template files over,
merge each script and dependency into the existing manifest by hand, and keep whatever's genuinely
application-specific. Where something conflicts, the local standard wins unless the team has
signed off on an exception. Then run `npm install`, check the lockfile diff, `npm run prepare`,
and go through the full quality, test, and build sequence.

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

GitLab CI runs commitlint too, off the same shared logic every stack uses — see the root
[README's commit linting in CI section](../README.md#commit-linting-in-ci) for the full
branch-by-branch breakdown.

Worth knowing: `npm run build` only means something once real application code lives here. Point
it at this empty template and Vite will fail with a missing entry module — that's expected, not a
bug (more on that below, under the pre-commit gate). The tests that do exist just check that a
malformed or disallowed API URL fails with the generic config error, never a raw value or a
native URL-parsing error.

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
touched — and finally `npm run build`. Any of those failing blocks the commit. Since this template
has no entry point yet, the build step makes one specific exception: it accepts the documented
`Cannot resolve entry module index.html` failure (the same one `verify-all.mjs` accepts) and lets
the commit through anyway. Any other build failure still stops the commit cold.

### If Gitleaks flags something that isn't real

Look into it before assuming it's a false positive. If it genuinely turns out to be nothing, get
it reviewed before adding a narrowly scoped exception with a comment explaining why. Don't add a
blanket allowlist, and re-run both the local and CI scans once the exception is approved.
