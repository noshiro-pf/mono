---
'ts-fortress': major
'eslint-plugin-ts-fortress': major
---

Upgrade to `ts-data-forge` 14 and `ts-type-forge` 9.

Both are dependencies whose types appear in this package's public
signatures, so consumers that also depend on them directly have to upgrade in
step. Internally this means the length-constrained guards are now called
length-first (`Arr.isFixedLengthTuple(1, xs)`), matching ts-data-forge 14.

BREAKING CHANGE: requires `ts-data-forge` >= 14 and `ts-type-forge` >= 9.
