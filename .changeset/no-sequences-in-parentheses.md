---
'eslint-config-typed': minor
---

`no-sequences` now reports a comma operator in parentheses too (`allowInParentheses: false`), so `(0, f)(x)` and `const r = (a(), b())` are errors. A `for` header's initializer and update are still allowed. Write the expressions as separate statements, or call `f` through a variable instead of `(0, f)`.
