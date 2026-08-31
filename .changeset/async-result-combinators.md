---
'ts-data-forge': minor
---

Add `AsyncResult` — combinators for `Promise<Result>` values.

- `AsyncResult<S, E>` type alias for `Promise<Result<S, E>>`.
- `AsyncResult.fromPromise(promise, mapError?)` — converts a `Promise<S>` into an `AsyncResult<S, E>`; passing `mapError` gives the error channel a concrete type, and omitting it carries the rejection reason through as `unknown`, the same contract as `Result.fromPromise`.
- `AsyncResult.fromThrowable(fn, mapError?)` — catches both a synchronous `throw` and an asynchronous rejection of `fn`; `mapError` is optional here in the same way.
- `AsyncResult.map(asyncResult, mapFn)` / `AsyncResult.mapErr(asyncResult, mapFn)` — accept synchronous or `Promise`-returning mapping functions; a rejection thrown by the mapping function propagates as-is (no implicit error conversion).
- `AsyncResult.flatMap(asyncResult, flatMapFn)` — chains functions returning an `AsyncResult` or a plain `Result`, short-circuiting on `Err`.
- `AsyncResult.unwrapOr(asyncResult, defaultValue)`.
- `map` / `mapErr` / `flatMap` also come in the same curried form as their `Result` counterparts.
