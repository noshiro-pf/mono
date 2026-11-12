---
'strict-ts-lib-v5.0-source': patch
'strict-ts-lib-v5.1-source': patch
'strict-ts-lib-v5.2-source': patch
'strict-ts-lib-v5.3-source': patch
'strict-ts-lib-v5.4-source': patch
'strict-ts-lib-v5.5-source': patch
'strict-ts-lib-v5.6-source': patch
'strict-ts-lib-v5.7-source': patch
'strict-ts-lib-v5.8-source': patch
'strict-ts-lib-v5.9-source': patch
'strict-ts-lib-v6.0-source': patch
'strict-ts-lib-v7.0-source': patch
---

Three lib files reached no converter and shipped with upstream's types. They are
converted now:

- TypeScript 6.0 and 7.0: `Float16Array`, `Math.f16round` and
  `DataView#getFloat16` / `setFloat16` (`lib.es2025.float16.d.ts`), the same
  declarations as TypeScript 5.9's `lib.esnext.float16.d.ts`, are typed as in
  5.9 in both flavors: `BYTES_PER_ELEMENT` is `2` and the predicates of `every`,
  `filter` and the others return `boolean`, and the branded flavor brands the
  elements, indices and sizes as for the other typed arrays.
- TypeScript 6.0 and 7.0: the iterator helpers (`lib.es2025.iterator.d.ts`) are
  typed as in 5.9's `lib.esnext.iterator.d.ts`; in the branded flavor the
  `index` of `map`, `filter` and the others and the counts of `take` and `drop`
  are branded again.
- TypeScript 5.0 – 5.6, branded flavor: `Atomics.waitAsync`
  (`lib.es2022.sharedmemory.d.ts`) takes the same `index` and `value` types as
  in 5.7 and later.

The iterator helpers' `drop` takes `count`, as upstream names it, where 5.6 –
5.9 had renamed it `limit`.
