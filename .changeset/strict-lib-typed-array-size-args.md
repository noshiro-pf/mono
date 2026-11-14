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

In the branded flavor, the `length`, `byteOffset` and `byteLength` parameters of
the typed-array, `DataView` and ES5 `ArrayBuffer` constructors, and
`Atomics.notify`'s `count`, are `NumberType.TypedArraySizeArgNonNegative`, as
`new SharedArrayBuffer(8)` takes, where they were a bare `TypedArraySize` or
`SafeUint` (the `BigInt64Array` and `BigUint64Array` `byteOffset` already took
it). An integer literal from 0 to 39, such as `new Uint8Array(4)` or
`new DataView(buffer, 0, 8)`, type-checks without a cast; a larger one still
needs one, and a negative one is rejected. `Float16Array`'s constructor takes
the same in the versions whose `Float16Array` declarations are converted.
