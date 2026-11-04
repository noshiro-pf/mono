---
'eslint-config-typed': patch
---

`vitest-coding-style`'s `prefer-assert-is-true-over-expect-true`, `prefer-assert-is-false-over-expect-false` and `no-expect-to-strict-equal` fixes now name Vitest's `assert` where they write it: its local name when imported under an alias, through a namespace import of `vitest`, added to the `vitest` import when `expect` is imported and `assert` is not, and no fix when `assert` is bound to something else there, such as `node:assert`. `no-expect-to-strict-equal` now reports only Vitest's `expect`, a global or an import from `vitest`, as the other two already do: not a Playwright or local one, and, for now, not one destructured from the test context or `import.meta.vitest`. The two `toBe` rules no longer report an `expect` call they cannot carry over — no argument, a spread argument, or more than a value and a message — and their fix keeps the message of `expect(X, message)` (`assert.isTrue(X, message)`) instead of dropping it.
