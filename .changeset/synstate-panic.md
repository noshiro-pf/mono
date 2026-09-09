---
'synstate': patch
---

Stop the program through ts-std-forge's panic path instead of a bare `throw`.

The two invariant violations — a circular dependency in the observable graph,
and `tryUpdate` reached on an observable that has no parents — used to be
`throw new Error(...)` with an `oxlint-disable-next-line sumi/no-throw` above
them, because Sumi's prelude had no panic function when they were written.
D-48 added one, so they are now `panic(message)` and `unreachable()`. Not
`todo()` for the second: nothing there is waiting to be written. It is the
base default of what used to be a base-class method — every observable that
can receive a parent update supplies its own `tryUpdate`, and one with no
parents never gets called — so reaching it is the invariant breaking.

The circular-dependency message is passed through unchanged, so the
`toThrow('...')` assertions on it keep matching. The other one changes from
`'not implemented'` to `'Reached code the types mark unreachable'`, which
nothing asserts on.

Both errors change identity: they carry the `$$panic` mark and their `name` is
`PanicError` rather than `Error`, which is what makes the `Result` /
`AsyncResult` boundaries rethrow them instead of turning an invariant
violation into an `Err` a caller might handle.

`ts-std-forge` is a new direct runtime dependency, which `ts-data-forge`
already brought in transitively since the D-49 inversion, so the README and
the docs site now say "two external runtime dependencies" rather than one.

The advertised bundle size is unchanged at ~4.6 kB, but getting a truthful
number needed a fix to the measurement: `embed-bundle-size.mts` marked only
`ts-data-forge` as external, so the moment synstate imported from
`ts-std-forge` the whole of that package was bundled into the figure and it
read 8.7 kB. Every runtime dependency is external now — the number is the size
of this package, not of its dependency tree inlined.
