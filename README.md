<img src="https://webvoltz.com/wp-content/uploads/2025/07/webvoltz.svg" alt="WebVoltz" width="180" />

# Engineering Standards

Shared engineering policy and starter templates for React, Next.js, and Node.js backend projects
at WebVoltz. If you're kicking off a new project, this is where it starts from.

```text
common/          Framework-neutral compiler, lint, format, commit, CI, and policy checks
react/           React 19 and Vite-specific configuration
nextjs/          Next.js App Router-specific configuration
nodejs-backend/  Node.js ESM service-specific configuration
```

`common/` isn't an npm package on purpose — no `package.json`, no workspace setup, nothing to
install. Each stack installs its own tooling and just imports the shared config by relative path.
Keep `common/` and whichever stack directory you're using as siblings, or those imports break.

## Why bother with a repo like this

"Please remember to run Prettier before committing" doesn't scale much past three people. Every
rule that actually matters here is wired into a hook or a CI job, not written on a wiki page
someone skims once and forgets. If a project genuinely needs to bend a rule, fine — but that
should be a documented, reviewed exception, not something that just quietly drifted because nobody
was watching.

## Getting started

Match the Node version in the stack's `.nvmrc`, then:

```sh
cd react # or nextjs / nodejs-backend
npm ci
npm run prepare
npm run quality
npm test
npm run build
```

Heads up: `react/` ships with no application entry point on purpose, so `npm run build` fails
there until real source is added — that's expected, not broken. `nextjs/` builds down to a bare
404 page until application routes exist, which is also fine.

## Checking everything at once

```sh
node common/policies/verify-all.mjs
node common/policies/verify-all.mjs --security
```

Runs format checks, ESLint, TypeScript, tests with coverage, and the build boundary check across
all three stacks in one go. Add `--security` to also run an npm audit.

## What's actually enforced

- Strict TypeScript, unchecked-index and exact-optional-property safety included — no explicit or
  unsafe `any` anywhere.
- Generated code is linted, type-checked, and formatted exactly like handwritten code. No
  exemptions just because a tool wrote it.
- Typed promise handling, `Error`-only throws, exhaustive switches, and no quietly suppressed
  lint rules.
- Deterministic Prettier formatting and zero ESLint warnings. "Mostly clean" doesn't pass.
- Real tests with enforced V8 coverage thresholds — a missing test suite is a failure, not a free
  pass.
- Exact dependency versions, lockfile installs, Node/npm version enforcement, and npm audits.
- Staged secret scanning before every commit, via Gitleaks.
- Conventional commits, with enough room to actually explain yourself — subjects and body/footer
  lines up to 1000 characters, because the old 72-character convention just trained people to
  write useless commit messages to fit.
- A pre-commit gate: `lint-staged` first, then a full format/lint/typecheck pass across the whole
  project (not just the files you touched), then the production build. If the build is broken,
  the commit doesn't go through — that's the whole point of putting it there.
- Runtime config failures are generic on purpose. They tell you something's wrong, never what
  value you passed in.

Each stack's own README has the framework-specific rules on top of this list.

## Commit linting in CI

All three stacks share the exact same commitlint job, defined once in
`common/gitlab/quality.yml`, so this behavior is identical everywhere:

- Merge request pipelines lint the diff against the target branch.
- A normal push lints just the commits in that push.
- The very first push to the default branch (GitLab hands you a zero before-SHA here) lints every
  commit in the repo, oldest first.
- Everything else with a zero before-SHA — a first push to a new branch, tags, scheduled runs,
  manual runs, API-triggered pipelines — falls back to fetching the default branch and linting
  everything after the merge base. If the pipeline's own commit is the merge base, it just lints
  that one commit directly instead of scanning history.

The point of all this branching is that commit-message enforcement still holds even when someone's
local `commit-msg` hook is missing or got bypassed.

## The three stacks

| Stack             | Framework           | README                                               |
| ----------------- | ------------------- | ---------------------------------------------------- |
| `react/`          | React 19 + Vite     | [react/README.md](react/README.md)                   |
| `nextjs/`         | Next.js App Router  | [nextjs/README.md](nextjs/README.md)                 |
| `nodejs-backend/` | Node.js ESM service | [nodejs-backend/README.md](nodejs-backend/README.md) |

## Changing the shared config

Anything under `common/` affects all three stacks at once, so it doesn't get a direct push. Open
a merge request, explain why, and confirm `node common/policies/verify-all.mjs` still passes for
all three stacks before asking for sign-off.

## License

Internal WebVoltz use only. See [LICENSE](LICENSE) — this isn't open source.
