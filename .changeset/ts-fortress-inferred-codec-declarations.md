---
'ts-fortress': patch
---

A module that exports a codec with an inferred type now emits declarations that type-check. `export const X = t.record({ … })` is written out structurally in the `.d.mts`, and that form did not satisfy the bound `t.TypeOf` and several combinators (`t.union`, `t.tuple`, `t.intersection`, `t.MapType`, `t.SetType`, `t.record`, `t.optional`, `t.annotate`, …) put on a codec, so `export type X = t.TypeOf<typeof X>` failed with TS2344 inside the emitted file for anyone compiling it with `skipLibCheck: false`. The bound no longer constrains the parameter of `prune`, which is what the structural form could not match. Packages already published with such declarations are repaired by installing this version.

`t.at(X, key)` on a record codec imported from another package's declarations now returns the member type the shape holds, constraints included, as it does in the module that declares `X`.

`t.Type`, `t.TypeStructure` and `t.UnknownShape` are as they were. `t.UnknownType` is the loosened bound itself: a bound of your own written as `<C extends t.UnknownType>` accepts a codec whose type another package's declarations wrote out structurally, which `<C extends t.Type<unknown>>` might not. A value typed by `t.UnknownType` is not a `t.Type<unknown>`: its `prune` cannot be called, and it cannot be passed where `t.Type<unknown>` is asked for. Two bounds still reject such a codec: `t.mergeRecords`, and a key of `t.keyValueRecord` narrower than `string`.
