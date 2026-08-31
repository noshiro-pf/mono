import { Result } from 'ts-data-forge';
import { toUnexpectedError, type UnexpectedError } from '../../error/index.mjs';
import { toIntegerOrInfinity } from '../../internal/index.mjs';

/**
 * Formats a number in fixed-point notation without throwing.
 *
 * `Number.prototype.toFixed` throws a `RangeError` when `fractionDigits` is
 * outside the range 0–100 (after ToIntegerOrInfinity truncation), which is
 * reachable whenever the digit count comes from a variable. This wrapper
 * validates that condition up front — mirroring the spec check exactly, so
 * classification never depends on engine error messages — and returns the
 * failure as a tagged `Err`.
 *
 * @example
 *
 * ```ts
 * const okResult = SafeNumber.toFixed(1.005, 2);
 *
 * assert.isTrue(Result.isOk(okResult));
 *
 * const errResult = SafeNumber.toFixed(1, 101);
 *
 * assert.isTrue(Result.isErr(errResult));
 *
 * assert.deepStrictEqual(errResult.value, {
 *   kind: 'fraction-digits-out-of-range',
 *   fractionDigits: 101,
 * });
 * ```
 *
 * @param value The number to format.
 * @param fractionDigits The number of digits after the decimal point (0–100
 *   inclusive after truncation).
 * @returns `Ok<string>` with the fixed-point representation, or a tagged
 *   `Err` — `'fraction-digits-out-of-range'` for the spec-defined failure,
 *   `'unexpected'` for anything the engine throws beyond it.
 */
export const toFixed = (
  value: number,
  fractionDigits: number,
): Result<string, ToFixedError> => {
  const digits = toIntegerOrInfinity(fractionDigits);

  if (digits < 0 || digits > 100) {
    return Result.err({
      kind: 'fraction-digits-out-of-range',
      fractionDigits,
    });
  }

  return Result.mapErr(
    Result.fromThrowable(() => value.toFixed(fractionDigits)),
    toUnexpectedError,
  );
};

/** The failure type of {@link toFixed}. */
export type ToFixedError =
  | Readonly<{ kind: 'fraction-digits-out-of-range'; fractionDigits: number }>
  | UnexpectedError;
