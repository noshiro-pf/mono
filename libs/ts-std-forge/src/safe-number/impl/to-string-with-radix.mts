import { Result } from 'ts-data-forge';
import { toUnexpectedError, type UnexpectedError } from '../../error/index.mjs';
import { toIntegerOrInfinity } from '../../internal/index.mjs';

/**
 * Converts a number to a string in a given radix without throwing.
 *
 * `Number.prototype.toString` throws a `RangeError` when `radix` is outside
 * the range 2–36 (after ToIntegerOrInfinity truncation) — unlike
 * `toExponential` / `toPrecision`, the check applies regardless of whether
 * `value` is finite. This wrapper validates the same condition and returns
 * the failure as a tagged `Err`.
 *
 * @example
 *
 * ```ts
 * const okResult = SafeNumber.toStringWithRadix(255, 16);
 *
 * assert.isTrue(Result.isOk(okResult));
 *
 * const errResult = SafeNumber.toStringWithRadix(1, 37);
 *
 * assert.isTrue(Result.isErr(errResult));
 *
 * assert.deepStrictEqual(errResult.value, {
 *   kind: 'radix-out-of-range',
 *   radix: 37,
 * });
 * ```
 *
 * @param value The number to convert.
 * @param radix The base to use (2–36 inclusive after truncation).
 * @returns `Ok<string>` with the representation in the given radix, or a
 *   tagged `Err` — `'radix-out-of-range'` for the spec-defined failure,
 *   `'unexpected'` for anything the engine throws beyond it.
 */
export const toStringWithRadix = (
  value: number,
  radix: number,
): Result<string, ToStringWithRadixError> => {
  const r = toIntegerOrInfinity(radix);

  if (r < 2 || r > 36) {
    return Result.err({ kind: 'radix-out-of-range', radix });
  }

  return Result.mapErr(
    Result.fromThrowable(() => value.toString(radix)),
    toUnexpectedError,
  );
};

/** The failure type of {@link toStringWithRadix}. */
export type ToStringWithRadixError =
  Readonly<{ kind: 'radix-out-of-range'; radix: number }> | UnexpectedError;
