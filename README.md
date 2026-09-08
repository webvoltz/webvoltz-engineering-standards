<div align="center">

<img src="https://webvoltz.com/wp-content/uploads/2025/07/webvoltz.svg" alt="WebVoltz" width="220" />

### Engineering Standards

**Clarity, Capability, and Care at Every Step of the Build.**

[![Standards](https://img.shields.io/badge/standards-enforced-FFC107?style=flat-square&labelColor=111111)](#shared-non-negotiable-policy)
[![Node](https://img.shields.io/badge/node-24.x-FFC107?style=flat-square&labelColor=111111)](#adoption)
[![Commits](https://img.shields.io/badge/commits-conventional-FFC107?style=flat-square&labelColor=111111)](#shared-non-negotiable-policy)
[![Secrets](https://img.shields.io/badge/secrets-gitleaks%20protected-FFC107?style=flat-square&labelColor=111111)](#shared-non-negotiable-policy)
[![Usage](https://img.shields.io/badge/usage-internal%20%2F%20proprietary-111111?style=flat-square&labelColor=FFC107)](LICENSE)

</div>

---

This repository is WebVoltz's single source of truth for how we build. It holds the shared
engineering policy and the isolated project templates — React, Next.js, and Node.js backend —
that every WebVoltz codebase is expected to start from and stay aligned with. We build systems
with long-term value in mind: extensible, testable, and easy to evolve. This repo is where that
principle is turned into config, not just a slide.

If a rule matters enough to repeat to every new engineer, it belongs here — enforced by tooling,
not by memory.

```text
common/          Framework-neutral compiler, lint, format, commit, CI, and policy checks
react/           React 19 and Vite-specific configuration
nextjs/          Next.js App Router-specific configuration
nodejs-backend/  Node.js ESM service-specific configuration
```

`common/` is deliberately not an npm package. It has no `package.json`, workspace metadata, or
third-party dependency. Each stack installs its own tooling and imports shared configuration by
relative path.

## Why this repository exists

Clarity first: every stack starts from the same baseline, so scope and system design don't drift
project to project. Config is version-controlled, reviewed, and enforced by hooks and CI — not a
wiki page nobody re-reads. When a project needs an exception, it's a deliberate, documented one,
not a quiet omission. The goal is the same one we hold clients to: build what lasts, and make it
clear.

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
- staged secret scanning, conventional commits with room for a real explanation (commit headers
  and body/footer lines up to 1000 characters), and CI enforcement;
- a pre-commit gate that formats and lints staged files, then validates formatting, linting, and
  types across the whole project, then runs the production build — so a broken build never
  reaches a deploy pipeline; and
- generic runtime-configuration failures that do not expose supplied environment values.

See each stack README for its additional framework-specific rules.

## GitLab CI commit-message enforcement

Every stack includes the same `.commitlint-template` from `common/gitlab/quality.yml`, so this
behavior is identical across `react/`, `nextjs/`, and `nodejs-backend/`. GitLab CI runs commitlint
over each merge-request or push commit range:

- Merge-request pipelines lint the diff between the merge-request's target branch and the commit.
- Push pipelines with a real before-SHA lint just the pushed commit range.
- A zero before-SHA on the default branch — the repository's first-ever push — lints every
  reachable commit in topological parent-before-child order from the root through the pipeline
  head.
- Every other zero-before-SHA case (first pushes to non-default branches, tags, schedules, manual
  runs, and API or triggered pipelines) fetches the default branch and lints every commit after
  the merge base; when the pipeline commit is itself that base, CI lints its message through
  stdin instead of scanning history.

This keeps commit-message enforcement authoritative when a local `commit-msg` hook is unavailable
or bypassed. Workflow rules create merge-request, tag, and branch pipelines while suppressing only
duplicate branch-push pipelines for open merge requests; scheduled, manual, API, and triggered
branch pipelines remain available.

## Per-stack reference

| Stack             | Framework                | README                                     |
| ------------------ | ------------------------- | ------------------------------------------ |
| `react/`           | React 19 + Vite            | [react/README.md](react/README.md)                 |
| `nextjs/`          | Next.js App Router          | [nextjs/README.md](nextjs/README.md)               |
| `nodejs-backend/`  | Node.js ESM service         | [nodejs-backend/README.md](nodejs-backend/README.md) |

## Proposing a change

Shared policy in `common/` affects every stack, so changes go through review, not a direct push:
open a merge request, explain the rationale, and confirm `node common/policies/verify-all.mjs`
still passes for all three stacks before requesting sign-off from the standards owner.

## License

Proprietary and confidential — internal WebVoltz use only. See [LICENSE](LICENSE).

---

<div align="center">

Maintained by WebVoltz &middot; [webvoltz.com](https://webvoltz.com)

</div>
