---
'ts-codemod-lib': patch
---

`append-as-const` now treats `<const>x` as the `x as const` it means: it is removed inside a literal that gets `as const` and from an argument of a `const` type parameter, and written as `x as const` on a `const` initializer. Before, `const c = [<const>[1], 2];` kept the inner assertion (`[<const>[1], 2] as const`), and `f(<const>[1, 2])` kept it where `f([1, 2] as const)` had it removed.
