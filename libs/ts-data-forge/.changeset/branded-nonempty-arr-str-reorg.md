---
'ts-data-forge': major
---

Adopt ts-type-forge v7's brand-based `NonEmptyArray` and reorganize the
length-constrained helpers so each type's helpers live in that type's
namespace.

**Breaking changes:**

- The branded array length **guards and casts** move from top-level into the
  **`Arr`** namespace: `isFixedLengthArray` / `isMinLengthArray` /
  `isMaxLengthArray` / `isBoundedLengthArray` (and the matching `as*` casts)
  are now `Arr.isFixedLengthArray` / `Arr.asFixedLengthArray` / … . The
  structural short-`N` guards (`Arr.is*LengthTuple`) are unchanged.
- The length-constrained **string guards** move into a new **`Str`** namespace
  (mirroring `Num`): `isFixedLengthString` / … are now
  `Str.isFixedLengthString` / … , and new `Str.as*LengthString` casts are
  added.
- Array producers now return the brand-based `NonEmptyArray` (an alias of
  `MinLengthArray<1>`) instead of the structural non-empty tuple. Input
  dispatch stays structural (`NonEmptyTuple`), so plain non-empty tuples are
  still accepted.

Requires `ts-type-forge@^7.0.0`.
