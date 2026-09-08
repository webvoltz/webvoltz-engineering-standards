# Next.js engineering standards template

A tooling template for a Next.js 16 App Router app on React 19 and TypeScript. Same deal as the
other stacks: keep this directory next to `common/`, drop the official Next.js TypeScript scaffold
in here, and there's no application code or routes checked in yet — that's intentional.

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

### Next.js-specific

- Next.js Core Web Vitals rules plus the framework's TypeScript rules.
- React and App Router conventions, framework-generated type inclusion, and bundler-style module
  resolution.
- A Turbopack repository root set so the sibling `common/` config works without duplicating it
  into this directory.
- Full safety linting on the generated `next-env.d.ts` — the only thing exempted is the
  framework-required triple-slash declaration, with quote formatting the generator is happy with.
- No unchecked JavaScript allowed into the TypeScript program.
- Explicit client/server environment boundaries, so a server secret can't accidentally end up in
  a client bundle.
- HTTP(S)-only public URLs, PostgreSQL-only database URLs, and Redis protocol validation.
- The single-attribute-per-line JSX formatting convention.

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

GitLab CI runs commitlint too, off the same shared logic every stack uses — see the root
[README's commit linting in CI section](../README.md#commit-linting-in-ci) for the full
branch-by-branch breakdown.

The empty template builds down to a framework-provided static 404 route; real application routes
become part of the build once the scaffold is added. The tests that do exist check that a
malformed or disallowed public, database, or Redis URL fails with the appropriate generic config
error, never a raw value or a native URL-parsing error.

One more thing worth flagging: `package.json` overrides Next.js's pinned PostCSS version up to
8.5.19, because the version Next.js ships by default (8.4.31) is affected by
GHSA-qx2v-qp2m-jg93. Once a Next.js release resolves PostCSS to a non-vulnerable version on its
own, drop the override, regenerate the lockfile, and re-run the audit.

## Environment boundaries

Only variables prefixed `NEXT_PUBLIC_` can be read by client code. The client example parses an
explicit object containing just `NEXT_PUBLIC_APP_URL` — it never hands the whole `process.env` to
Zod. The server example separately parses `DATABASE_URL`, an optional `REDIS_URL`, and `NODE_ENV`.
Keep that separation if either schema grows, or a server-only value could end up in a client
bundle. Validation failures use a generic message and never leak the actual value.

The checked-in `.env.example` has local, non-secret placeholders. Copy it to an ignored local
environment file and pull real values from whatever secret-management system the org uses. Never
commit credentials, and never add a server-only variable to the client schema.

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
