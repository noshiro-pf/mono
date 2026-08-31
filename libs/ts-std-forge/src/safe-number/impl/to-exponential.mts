import { Result } from 'ts-data-forge';
import { toUnexpectedError, type UnexpectedError } from '../../error/index.mjs';
import { toIntegerOrInfinity } from '../../internal/index.mjs';

/**
 * Formats a number in exponential notation without throwing.
 *
 * `Number.prototype.toExponential` throws a `RangeError` when
 * `fractionDigits` is outside the range 0–100 (after ToIntegerOrInfinity
 * truncation) — but only for a finite `value`: the spec returns `"NaN"` /
 * `"Infinity"` before it reaches the range check. This wrapper validates the
 * same condition in the same order and returns the failure as a tagged
 * `Err`. When `fractionDigits` is omitted, as many digits as necessary are
 * used and the call cannot fail.
 *
 * @example
 *
 * ```ts
 * const okResult = SafeNumber.toExponential(123456, 2);
 *
 * assert.isTrue(Result.isOk(okResult));
 *
 * const errResult = SafeNumber.toExponential(1, 101);
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
 * @param fractionDigits Optional number of digits after the decimal point
 *   (0–100 inclusive after truncation). Omitted means as many digits as
 *   necessary.
 * @returns `Ok<string>` with the exponential representation, or a tagged
 *   `Err` — `'fraction-digits-out-of-range'` for the spec-defined failure,
 *   `'unexpected'` for anything the engine throws beyond it.
 */
export const toExponential = (
  value: number,
  fractionDigits?: number,
): Result<string, ToExponentialError> => {
  if (fractionDigits !== undefined && Number.isFinite(value)) {
    const digits = toIntegerOrInfinity(fractionDigits);

    if (digits < 0 || digits > 100) {
      return Result.err({
        kind: 'fraction-digits-out-of-range',
        fractionDigits,
      });
    }
  }

  return Result.mapErr(
    Result.fromThrowable(() => value.toExponential(fractionDigits)),
    toUnexpectedError,
  );
};

/** The failure type of {@link toExponential}. */
export type ToExponentialError =
  | Readonly<{ kind: 'fraction-digits-out-of-range'; fractionDigits: number }>
  | UnexpectedError;
