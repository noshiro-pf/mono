---
'eslint-config-typed': minor
---

Add `ts-restrictions/prefer-range-in-number-line-order`, which writes a range
check in the order of the number line, smaller to the left:
`x >= min && max >= x` → `min <= x && x <= max`, and
`min > x || x > max` → `x < min || max < x`. A range check is two relational
comparisons adjacent in a chain of `&&` or `||` that share the value tested;
the comparison with the lower bound is moved first if it is not. An operand
with a side effect gets a suggestion instead of a fix, since the fix changes
the order in which operands are evaluated.
