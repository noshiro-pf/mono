---
'synstate': patch
---

Import `Arr` from `ts-data-forge/array` and use standalone `asSafeUint` / `isPositiveSafeInt` in place of the `SafeUint` and `PositiveSafeInt` objects, so that esbuild no longer keeps those ts-data-forge objects whole in every bundle that uses synstate.

The only difference in behavior is past `Number.MAX_SAFE_INTEGER`, which one emission at a time does not reach: the index of `filter`, `skipWhile`, `takeWhile` and `attachIndex`, and the value of `counter`, would throw there instead of staying at the maximum.
