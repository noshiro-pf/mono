---
'ts-data-forge': minor
---

Add `PanicError`, `isPanicError` and `createPanicError`: the error a panic throws (an `Error` named `PanicError`) for a programming error, as opposed to a recoverable failure carried by `Result`. The `panic` / `unreachable` / `todo` functions live in ts-std-forge. `Result.fromThrowable`, `Result.fromPromise`, `AsyncResult.fromThrowable` and `AsyncResult.fromPromise` rethrow a `PanicError` instead of converting it to `Err`, and the `unwrapThrow` / `unwrapErrThrow` / `expectToBe` / `safeUnwrap` families now throw a `PanicError` (still an `Error` with the same message).
