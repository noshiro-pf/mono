---
'ts-std-forge': patch
'ts-data-forge': patch
---

A `DOMException`, or a subclass of it, now counts as an error. `Result.fromThrowable` and `TernaryResult.fromThrowable` keep a thrown one as the `Err` value instead of wrapping it in `Error: {}`, `unknownToString` gives its message instead of `{}`, `isPanicError` is true for one marked with `markAsPanic`, and such a marked one is rethrown by `Result.fromThrowable`, `Result.fromPromise` and `AsyncResult` instead of becoming an `Err`. `TernaryResult.fromThrowable` and `TernaryResult.fromPromise` now rethrow a panic too, as their `Result` counterparts do. ts-data-forge re-exports these, so the same holds there, and its `Arr.join` now goes through `Result.fromThrowable`: it keeps a `DOMException` an element throws as its `Err` value, and rethrows a panic.
