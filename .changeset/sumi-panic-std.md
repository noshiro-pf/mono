---
'ts-std-forge': minor
---

Add the panic path for a programming error (Sumi D-48 / D-53): `panic`, `unreachable`, `todo`, and the `PanicError` type with `isPanicError`, `createPanicError` and `markAsPanic`.

`panic(message, { cause? })` throws a fresh `PanicError`. `panic(error)` marks the error the caller already holds and throws that very object, so its `name`, its tag, its payload and above all its stack — which points at where the failure happened rather than at the panic — all survive; that is what makes `throw error` port to `panic(error)` without losing anything. `unreachable(value: never, message?)` covers exhaustiveness checks and `todo(message?)` marks an unwritten path. All are declared with explicit `never`-returning types so that a call terminates control flow.

A panic is marked by a dedicated `$$panic` property rather than by the error's `name`, which is where a class-free error factory puts the error's own identity (`name: 'HttpError'`); marking on `name` would force an existing error to choose between keeping what it is and being recognized as a panic. `isPanicError` matches on the mark, not on the constructor, so an error that crossed a package boundary is recognized just the same — which is what keeps `Result.fromThrowable` and the other boundary functions re-throwing a panic instead of turning it into `Err`.
