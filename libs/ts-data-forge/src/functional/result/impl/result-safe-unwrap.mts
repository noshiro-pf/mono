import { type UnknownResult } from '../result.mjs';
import { isErr } from './result-is-err.mjs';
import { type NarrowToErr, type UnwrapOk } from './types.mjs';

/**
 * Unwraps a `Result` inside a {@link Result.safeTry} generator body via
 * `yield*`, emulating Rust's `?` operator.
 *
 * If the `Result` is `Ok`, the `yield*` expression evaluates to the contained
 * value and execution continues. If it is `Err`, the error is yielded to
 * {@link Result.safeTry}, which returns it immediately — the rest of the
 * generator body never runs.
 *
 * This generator must only be delegated to (`yield*`) inside a
 * {@link Result.safeTry} body; resuming it after it has yielded an `Err`
 * throws.
 *
 * @example
 *
 * ```ts
 * const result = Result.safeTry(function* () {
 *   const x = yield* Result.safeUnwrap(Result.ok(2));
 *
 *   const y = yield* Result.safeUnwrap(Result.ok(3));
 *
 *   return Result.ok(x + y);
 * });
 *
 * assert.deepStrictEqual(result, Result.ok(5));
 * ```
 *
 * @template R The input `UnknownResult` type.
 * @param result The `Result` to unwrap.
 * @returns A generator that yields the `Err` (if any) and returns the `Ok`
 *   value.
 */
export function* safeUnwrap<R extends UnknownResult>(
  result: R,
): Generator<NarrowToErr<R>, UnwrapOk<R>, unknown> {
  if (isErr(result)) {
    yield result;

    throw new Error(
      '`safeUnwrap()` generator was resumed after yielding an `Err`; it must only be used via `yield*` inside `safeTry()`',
    );
  }

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return result.value as UnwrapOk<R>;
}
