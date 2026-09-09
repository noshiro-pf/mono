---
'eslint-config-typed': patch
---

Resolve the binding behind `assert` and `expect` in the `vitest-coding-style` rules, instead of matching the identifier's spelling.

`includeSource` puts in-source tests in ordinary `src/**` modules, so `eslintConfigForVitest()` cannot be scoped to `*.test.*` files and is applied to every file. Matching on the name alone therefore reported `assert(x)` imported from `node:assert` — whose fix output, `assert.isTrue`, does not exist there — along with any local named `assert` or `expect`. Those are no longer reported.

The same change closes the opposite gap: `import { assert as a } from 'vitest'` is Vitest's `assert` under another name and is now recognized through the imported name. Fixes rewrite only the method, so the receiver keeps the name the file gave it (`a.ok(x)` becomes `a.isTrue(x)`, not `assert.isTrue(x)`).

Affects `prefer-assert-is-true-over-assert`, `prefer-assert-is-false-over-assert-not-ok`, `prefer-assert-deep-strict-equal-over-deep-equal`, `prefer-assert-is-false-over-negated-assert-is-true`, `prefer-assert-is-true-over-negated-assert-is-false`, `prefer-assert-is-true-over-expect-true` and `prefer-assert-is-false-over-expect-false`. A codebase that imports these from Vitest under an alias may see reports it did not before.
