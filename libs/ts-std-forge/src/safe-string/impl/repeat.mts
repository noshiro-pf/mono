import { Result } from 'ts-data-forge';
import { toUnexpectedError, type UnexpectedError } from '../../error/index.mjs';
import { toIntegerOrInfinity } from '../../internal/index.mjs';

/**
 * Repeats a string a given number of times without throwing.
 *
 * `String.prototype.repeat` throws a `RangeError` when `count` (after
 * ToIntegerOrInfinity truncation) is negative or `+Infinity` — the
 * spec-defined condition this wrapper validates up front and reports as a
 * tagged `Err`. The spec also lets the engine throw when the resulting
 * string would exceed its implementation-defined maximum length; that
 * residue cannot be predicted portably and surfaces as the `'unexpected'`
 * fallback instead.
 *
 * @example
 *
 * ```ts
 * const okResult = SafeString.repeat('ab', 3);
 *
 * assert.isTrue(Result.isOk(okResult));
 *
 * const errResult = SafeString.repeat('ab', -1);
 *
 * assert.isTrue(Result.isErr(errResult));
 *
 * assert.deepStrictEqual(errResult.value, {
 *   kind: 'invalid-count',
 *   count: -1,
 * });
 * ```
 *
 * @param value The string to repeat.
 * @param count The number of repetitions (a non-negative finite number after
 *   truncation).
 * @returns `Ok<string>` with the repeated string, or a tagged `Err` —
 *   `'invalid-count'` for the spec-defined failure, `'unexpected'` when the
 *   result would exceed the engine's string-length limit.
 */
export const repeat = (
  value: string,
  count: number,
): Result<string, RepeatError> => {
  const n = toIntegerOrInfinity(count);

  if (n < 0 || n === Number.POSITIVE_INFINITY) {
    return Result.err({ kind: 'invalid-count', count });
  }

  return Result.mapErr(
    Result.fromThrowable(() => value.repeat(count)),
    toUnexpectedError,
  );
};

/** The failure type of {@link repeat}. */
export type RepeatError =
  Readonly<{ kind: 'invalid-count'; count: number }> | UnexpectedError;
