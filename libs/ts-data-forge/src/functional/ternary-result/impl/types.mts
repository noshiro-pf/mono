/**
 * Extracts the success value type `S` from a `TernaryResult.Ok<S>`.
 */
export type UnwrapOk<R extends UnknownTernaryResult> =
  R extends TernaryOk<infer S>
    ? S
    : R extends TernaryWarn<infer S, unknown>
      ? S
      : never;

/**
 * Extracts the warning value type `W` from a `TernaryResult.Warn<W>`.
 */
export type UnwrapWarn<R extends UnknownTernaryResult> =
  R extends TernaryWarn<unknown, infer E> ? E : never;

/**
 * Extracts the error value type `E` from a `TernaryResult.Err<E>`.
 */
export type UnwrapErr<R extends UnknownTernaryResult> =
  R extends TernaryErr<infer E> ? E : never;

/**
 * Narrows the provided `UnknownTernaryResult` to its Ok variant.
 */
export type NarrowToOk<R extends UnknownTernaryResult> =
  R extends TernaryOk<unknown> ? R : never;

/**
 * Narrows the provided `UnknownTernaryResult` to its Warn variant.
 */
export type NarrowToWarn<R extends UnknownTernaryResult> =
  R extends TernaryWarn<unknown, unknown> ? R : never;

/**
 * Narrows the provided `UnknownTernaryResult` to its Err variant.
 */
export type NarrowToErr<R extends UnknownTernaryResult> =
  R extends TernaryErr<unknown> ? R : never;
