---
'ts-data-forge': minor
---

Add the `ts-data-forge/number` subpath, which exports the functions of `Num` one by one, as `ts-data-forge/array` does for `Arr`: `import * as Num from 'ts-data-forge/number'` keeps the call sites as they are, and a bundle keeps only the functions it calls. The `is*` and `as*` function of every branded number type (`isUint32`, `asSafeUint`, …) is now defined on its own instead of being taken from the shared operator factory, so a bundle that calls one no longer keeps the factory, `Num` and the ts-std-forge `Optional` and `Result` (esbuild, gzipped: `asUint32` 3.5 → 0.2 kB; Vite: 1.5 → 0.2 kB). The `Arr` functions that used them follow: through `ts-data-forge/array`, `Arr.filter` drops from 3.6 to 0.2 kB in esbuild and from 1.6 to 0.2 kB in Vite. The branded-number objects (`Uint32`, `SafeUint`, …) and `import { Num } from 'ts-data-forge'` are unchanged.
