---
'eslint-config-typed': patch
---

Read through `as`, `satisfies`, `!` and `<T>` in the rules on logical
operators and ternaries, and fix a wrong fix for parenthesized operands.

A type wrapper hid a pattern from these rules, or vouched for a type the
value did not have. Each now looks at the expression underneath:

- `ts-restrictions/prefer-logical-over-boolean-ternary`:
  `a ? (false satisfies boolean) : b` is `!a && b`. `(n as unknown as boolean) ? true : b`
  is left alone, because `n || b` would yield the number. Two literal
  branches that a wrapper hides from `no-unneeded-ternary` are written as
  `a` or `!a`.
- `ts-restrictions/prefer-optional-chain-over-ternary`: `undefined`, the
  checked value, the access and the whole check may be wrapped. A cast
  cannot rule out the `null` that a strict check leaves.
- `ts-restrictions/jsx-boolean-logical-operands`: an operand is judged by
  the type of its value. A cast to `boolean`, or a non-null assertion, does
  not make it one.
- `ts-restrictions/no-negated-comparison`: `!((a === b) satisfies boolean)` is
  `a !== b`. A `number` cast to a brand that excludes `NaN` is still treated
  as possibly `NaN`.
- `ts-restrictions/prefer-range-in-number-line-order`: finds a comparison
  wrapped in `satisfies boolean`, and a value tested written as
  `(x as number)`.
- `ts-restrictions/prefer-ternary`: `(o as T).x = …` and `o!.x = …` assign
  the same target.

`prefer-logical-over-boolean-ternary` also dropped the parentheses the
source wrote around an operand: `(a || b) ? false : c` became
`!a || b && c`, whose meaning is different. It now writes `!(a || b) && c`.
`prefer-range-in-number-line-order` reports a message whose parentheses
balance.
