---
'ts-data-forge': minor
---

Add `Optional.match`, `Result.match`, `Result.fromOptional`, and `Result.safeTry` / `Result.safeUnwrap`

- `Optional.match(optional, { some, none })` / `Result.match(result, { ok, err })` — fold into a plain value by case handlers (the function form of pattern matching; unlike `Result.fold`, the result is not wrapped in another container). Both support the curried form.
- `Result.fromOptional(optional, error)` — the inverse of `Result.toOptional`, equivalent to Rust's `Option::ok_or`. Supports the curried form `Result.fromOptional(error)`.
- `Result.safeTry(function* () { ... })` with `yield* Result.safeUnwrap(result)` — early-return error propagation emulating Rust's `?` operator. Passing an `async function*` returns a `Promise` of the `Result`, so `await` can be used inside the body.
