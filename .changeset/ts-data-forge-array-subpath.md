---
'ts-data-forge': minor
---

Add the `ts-data-forge/array` subpath, which exports the functions of `Arr` one by one: `import * as Arr from 'ts-data-forge/array'` keeps the call sites as they are, and esbuild then keeps only the functions a bundle calls, with what they use. Imported from the package root, `Arr` is kept whole by esbuild once any member is used (`Arr.isNonEmpty` alone is about 26 kB minified, 7.5 kB gzipped; through the subpath it is under 0.1 kB). Some `Arr` functions still use `Num` or the branded-number helpers, which esbuild keeps whole together with the ts-std-forge `Optional` and `Result` they use (about 3.6 kB gzipped for `Arr.filter`). `Obj` no longer goes through `Arr`, so a bundle that uses `Obj` in esbuild drops from 8.0 to 1.4 kB gzipped. `import { Arr } from 'ts-data-forge'` is unchanged.
