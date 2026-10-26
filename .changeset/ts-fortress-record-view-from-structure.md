---
'ts-fortress': patch
---

The record operations (`pick`, `omit`, `partial`, `required`, `keyof`, `valueof`, `at`, `mergeRecords`) now read a record type off its `structure` instead of internal fields stored beside it, and `recursion` is no longer a `Proxy`. A record wrapped in `optional` or `annotate` is accepted by them, and `union` / `intersection` no longer run the definition of a `recursion` member when they are built, so a member may refer back to the union or intersection being defined.
