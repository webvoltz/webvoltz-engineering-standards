# Contributing

## Changing the shared config

Anything under `common/` affects all three stacks at once, so it doesn't get a direct push. Open
a pull request, explain why, and confirm `node common/policies/verify-all.mjs` still passes for
all three stacks before asking for sign-off.

## Changing a single stack

Same idea, smaller blast radius: open a PR against `react/`, `nextjs/`, or `nodejs-backend/` and
make sure that stack's own checks pass before requesting review.

```sh
cd react # or nextjs / nodejs-backend
npm run quality
npm test
npm run build
```

## Commit messages

Conventional commits, enforced by commitlint in CI. Subjects and body/footer lines can run up to
1000 characters — there's no need to compress an explanation to fit an old 72-character limit.
