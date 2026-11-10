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

In the branded flavor (`libs-branded/`), `Math.trunc` of a finite branded number
returns a finite integer, as `Math.floor`, `Math.ceil` and `Math.round` do,
rather than `Int | InfiniteNumber | NaNType`. An `Int` argument comes back
unchanged, a non-negative one is a `NonNegativeInt`, a non-positive one a
`NonPositiveInt`, and any other finite one an `Int`. Truncation moves toward
zero, so a non-zero brand is never kept: `Math.trunc(0.5)` is `0`.
