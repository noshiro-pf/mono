---
'ts-data-forge': minor
---

Add `panic`, `unreachable`, `todo` and `isPanicError`: a panic throws a `PanicError` (an `Error` named `PanicError`) for a programming error, as opposed to a recoverable failure carried by `Result`. `Result.fromThrowable`, `Result.fromPromise`, `AsyncResult.fromThrowable` and `AsyncResult.fromPromise` rethrow a `PanicError` instead of converting it to `Err`, and the `unwrapThrow` / `unwrapErrThrow` / `expectToBe` / `safeUnwrap` families now throw a `PanicError` (still an `Error` with the same message).
