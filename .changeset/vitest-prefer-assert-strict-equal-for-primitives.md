---
'eslint-config-typed': minor
---

Add `vitest-coding-style/prefer-assert-strict-equal-for-primitives`, enabled by `eslintConfigForVitest`, which rewrites `assert.deepStrictEqual(X, Y)` to `assert.strictEqual(X, Y)` when the types of `X` and `Y` are primitives. The two compare numbers differently — `deepStrictEqual` treats `NaN` as equal to itself and `-0` as unequal to `0` — so when both arguments may be `NaN` or a zero the rule offers a suggestion instead of a fix.
