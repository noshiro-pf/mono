---
'eslint-config-typed': patch
---

`vitest-coding-style`'s `no-expect-to-strict-equal`, `prefer-assert-is-true-over-expect-true` and `prefer-assert-is-false-over-expect-false` report an `expect` destructured from a test's context (`test.concurrent('x', ({ expect }) => …)`, with Vitest's own `test` or `it`) or from `import.meta.vitest`, without a fix, since neither offers an `assert` the fix could name. The `assert` rules also recognize an `assert` destructured from `import.meta.vitest`.
