---
'eslint-rule-forge': minor
---

Add `isTsTypeWrapper`, `skipTsTypeWrappers` and their node type `TsTypeWrapper`, the TypeScript compiler API counterparts of `isTypeWrapper` and `skipTypeWrappers`: they see through `as`, `!`, `satisfies`, `<T>` and parentheses on a `ts.Node`, for a rule that reads the program's own nodes through the type checker.
