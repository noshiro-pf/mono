---
'ts-std-forge': patch
---

`Result.unwrapOkOr` and `Result.unwrapErrOr` return an `Ok` or `Err` value that is `undefined` or `null` instead of the default: they branch on `Result.isOk` / `Result.isErr` rather than on the value being nullish.
