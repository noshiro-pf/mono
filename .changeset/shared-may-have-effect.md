---
'eslint-config-typed': patch
---

`vitest-coding-style/no-expect-to-strict-equal`, `ts-restrictions/prefer-range-in-number-line-order` and `ts-restrictions/prefer-ternary` judge whether moving or dropping an expression is safe with `eslint-rule-forge`'s `mayHaveEffect`. `no-expect-to-strict-equal` no longer moves a message after a spread that runs an iterator (``expect(a, `seen ${it.count}`).toStrictEqual([...it])`` is reported without a fix), and fixes an expected value whose only tagged template is inside a function body. `prefer-range-in-number-line-order` only suggests reordering an operand that is a tagged template, and `prefer-ternary` does not merge a `let` whose initial value is one.
