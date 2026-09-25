---
'eslint-config-typed': minor
---

Turn `curly` on with `all`, and add two rules that normalize boolean
expressions:

- `ts-restrictions/prefer-logical-over-boolean-ternary` writes a ternary with
  one boolean literal branch as the logical operator it spells out:
  `a ? false : b` → `!a && b` and `a ? b : true` → `!a || b` always, and
  `a ? true : b` → `a || b` and `a ? b : false` → `a && b` when `a` is a
  boolean, since otherwise they would yield `a` itself instead of `true` or
  `false`.
- `ts-restrictions/no-negated-comparison` folds a negation into the comparison
  it negates: `!(a === b)` → `a !== b`, `!(a < b)` → `a >= b`. A relational
  comparison is fixed only when no operand can be `NaN` — strings, `bigint`,
  number literals, and number brands declaring `NaNValue: false`; for a plain
  `number` the inversion is offered as a suggestion, because `!(x >= 0)` is
  `true` for `NaN` and `x < 0` is not. It replaces
  `unicorn/no-negated-comparison`, which is turned off.

`curly` had been off with the rest of what eslint-config-prettier disables;
only its `multi-line` and `multi-or-nest` options can disagree with a
formatter, and `all` is neither.
