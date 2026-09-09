---
'ts-std-forge': minor
'ts-data-forge': minor
---

Move the algebraic data type core from ts-data-forge to ts-std-forge and reverse the dependency between the two packages (Sumi D-49).

`Result`, `Optional`, `TernaryResult`, `AsyncResult`, `pipe` and `match` are now implemented in ts-std-forge, together with the helpers they need: the four variant types (`Ok`, `Err`, `Some`, `None`), `PanicError` and its constructor and guard, `unknownToString`, `hasKey` / `isRecord` / `keyIsIn` / `isNonNullObject`, and `expectType`. ts-data-forge re-exports every one of them and now depends on ts-std-forge, which no longer depends on ts-data-forge at all.

**Nothing is removed from either package, and the move itself changes no behavior.** The re-exports denote the same declarations, so `import { Result } from 'ts-data-forge'` and `import { Result } from 'ts-std-forge'` are interchangeable, values built through either are the same type, and the runtime tags are unchanged. New code should prefer `ts-std-forge`. Two behavior changes do arrive with the port, both described below: the boundary functions now rethrow a `PanicError`, and `Num.safeParseInt` rejects a value that overflows to `Infinity`.

The panic path arrives with it. `panic`, `unreachable` and `todo` live in ts-std-forge; `PanicError`, `isPanicError` and `createPanicError` are exported from both. `Result.fromThrowable`, `Result.fromPromise`, `AsyncResult.fromThrowable` and `AsyncResult.fromPromise` now rethrow a `PanicError` instead of converting it to `Err`, and the `unwrapThrow` / `unwrapErrThrow` / `expectToBe` / `safeUnwrap` families throw one (still an `Error` with the same message), so a programming error cannot masquerade as a recoverable failure.

`Num.safeParseFloat` and `Num.safeParseInt` are now implemented by delegating to `SafeNumber.parse` and `SafeNumber.parseInteger`, keeping their own contract on top: the `FiniteNumber` / `Int` brand on the success side and an `Error` on the failure side. **`Num.safeParseInt` rejects a value that overflows to `Infinity`, where it used to accept one.** `Number('1e400')` is `Infinity` while `parseInt('1e400', 10)` is `1`, so the old agreement check let it through and returned `Ok(Infinity)` branded as `Int` — a value the brand promised could not exist. `SafeNumber.parseInteger` already checked finiteness, and delegating closes the hole.

The samples and JSDoc examples that document the ADT core moved with the implementation.
