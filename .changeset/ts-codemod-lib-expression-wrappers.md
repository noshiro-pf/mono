---
'ts-codemod-lib': minor
---

Add `isExpressionWrapper` and `isTypeAssertingWrapper`, which tell whether a ts-morph node is one of the wrappers an expression can sit in without changing its value (parentheses, `as`, `satisfies`, `!`, `<T>` and an instantiation expression), and whether it is one that asserts a type (`as`, `<T>`, `!`). `enableNoUncheckedIndexedAccessTransformer` now reads its "already asserted" test from the latter; its behavior is unchanged.
