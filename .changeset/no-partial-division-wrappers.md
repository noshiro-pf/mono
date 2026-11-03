---
'eslint-config-typed': patch
---

`total-functions/no-partial-division` reads the denominator through `as`, `satisfies`, `!` and `<T>`, and by its type whatever its shape. `x / (2 satisfies number)`, `x / -1`, `x / -(2 as number)` and `x / obj.n` with `n: 2` are no longer reported; `x / null`, `x / '0'`, `x / (y as unknown as 1)` with `y: number` and `x / (foo as 42 | null)` are. A denominator that is not a non-zero number or bigint literal (or a sign applied to one) is safe only when the type of every wrapper layer is a non-zero number or bigint literal, so `x / foo!` with `foo: 42 | undefined` stays reported: a `!` vouches for nothing.
