/**
 * Extracts the success value type `S` from a `Result.Ok<S>`. If the `Result`
 * is `Result.Err<E>`, resolves to `never`.
 *
 * @template R The `UnknownResult` type to unwrap.
 */
export type UnwrapOk<R extends UnknownResult> =
  R extends Ok<infer S> ? S : never;

/**
 * Extracts the error value type `E` from a `Result.Err<E>`. If the `Result`
 * is `Result.Ok<S>`, resolves to `never`.
 *
 * @template R The `UnknownResult` type to unwrap.
 */
export type UnwrapErr<R extends UnknownResult> =
  R extends Err<infer E> ? E : never;

/**
 * Narrows a `UnknownResult` type to `Result.Ok<S>` if it is an `Ok`. If the
 * `Result` is `Result.Err<E>`, resolves to `never`.
 *
 * @template R The `UnknownResult` type to narrow.
 */
export type NarrowToOk<R extends UnknownResult> =
  R extends Ok<unknown> ? R : never;

/**
 * Narrows a `UnknownResult` type to `Result.Err<E>` if it is an `Err`. If the
 * `Result` is `Result.Ok<S>`, resolves to `never`.
 *
 * @template R The `UnknownResult` type to narrow.
 */
export type NarrowToErr<R extends UnknownResult> =
  R extends Err<unknown> ? R : never;
