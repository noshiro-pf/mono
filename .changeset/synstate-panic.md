---
'synstate': patch
---

Stop the program through ts-std-forge's panic path instead of a bare `throw`.

The two invariant violations — a circular dependency in the observable graph,
and `tryUpdate` reached on an observable that has no parents — used to be
`throw new Error(...)` with an `oxlint-disable-next-line sumi/no-throw` above
them, because Sumi's prelude had no panic function when they were written.
D-48 added one, so they are now `panic(message)` and `todo()`.

Both messages are unchanged, so a `toThrow('...')` assertion keeps matching.
What changes is the error's identity: it carries the `$$panic` mark and its
`name` is `PanicError` rather than `Error`, which is what makes the `Result` /
`AsyncResult` boundaries rethrow it instead of turning an invariant violation
into an `Err` a caller might handle.

`ts-std-forge` is a new runtime dependency, which `ts-data-forge` already
brings in transitively since the D-49 inversion.
