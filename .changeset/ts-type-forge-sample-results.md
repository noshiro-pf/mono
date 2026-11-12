---
'ts-type-forge': patch
---

The `@example` of `DeepOmit` gave a wrong result for a union of paths (it said `DeepOmit<Data, ['a', 'b'] | ['a', 'c']>` is `{ a: { d: boolean } }`; it is `{ a: {}; e: boolean }`). The example now omits `['a', 'b', 'c'] | ['e']` and asserts its result. It and the examples of `DeepPick`, `DeepMutable`, `DeepReadonly`, `DeepRequired`, `Mutable`, `PartiallyNullable`, `PartiallyOptional`, `PartiallyPartial` and `PartiallyRequired` state their results as `expectType` assertions, which the type check holds to the real types.
