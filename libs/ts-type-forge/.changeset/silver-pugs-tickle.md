---
'ts-type-forge': patch
---

`packages/ts-type-forge/src` no longer references the standard library's
`Exclude`, `Extract`, `Omit`, `Pick` or `Record` anywhere — every internal use
now goes through this package's own `StrictExclude` / `RelaxedExclude`,
`StrictExtract` / `RelaxedExtract`, `StrictOmit` / `RelaxedOmit`,
`StrictPick` / `RelaxedPick` and `ReadonlyRecord` / `MutableRecord`, and an
ESLint rule (`@typescript-eslint/no-restricted-types`, configured in the
package's own flat config) keeps it that way.

**No type changes meaning.** `StrictPick<T, K>` and `StrictOmit<T, K>` have
exactly the bodies `Pick<T, K>` and `Omit<T, K>` have; `ReadonlyRecord<K, V>`
differs from `Record<K, V>` only by a `readonly` modifier, which assignability
does not consider, so the `T extends ReadonlyRecord<string, any>` guards select
the same branch the `Record` ones did; and the two brand-key helpers below
subtract exactly the members they subtracted before. `DeepReadonly`,
`DeepPartial`, `DeepRequired`, `DeepMutable`, `DeepPick`, `DeepOmit`,
`PartiallyPartial`, `RequiredKeys`, `HasLengthConstraint`,
`LengthConstraintBrandOf`, `GetBrandKeysPart`, `MonthEnum`, `DateEnum` and
everything downstream resolve identically.

What it fixes is compilation under a **standard library that narrows
`Exclude`** to `Exclude<T, U extends T>` (as `strict-typescript-lib` does).
There, subtracting a literal key union from a `keyof T` still deferred on a
type parameter is TS2344 — the checker cannot prove the union is a subset of a
`keyof T` it has not resolved:

```diff
-type ExtraKeysOf<T extends readonly unknown[]> =
-  Exclude<keyof T, keyof unknown[] | keyof (readonly unknown[]) | `${number}`>;
+type ExtraKeysOf<T extends readonly unknown[]> =
+  RelaxedExclude<keyof T, keyof unknown[] | keyof (readonly unknown[]) | `${number}`>;
```

`RelaxedExclude` carries no constraint on its second argument by definition, so
the subtrahend needs no proof and no `Extract<keyof T, …>` wrapper. Because the
same is now true of every other subtraction, pick and record in the package,
`ts-type-forge` is consumable under such a lib without patching, and cannot
regress into depending on those signatures again.
