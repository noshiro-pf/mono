import { Result } from 'ts-data-forge';
import { toUnexpectedError, type UnexpectedError } from '../../error/index.mjs';
import { toIntegerOrInfinity } from '../../internal/index.mjs';

/**
 * Formats a number to a given precision without throwing.
 *
 * `Number.prototype.toPrecision` throws a `RangeError` when `precision` is
 * outside the range 1–100 (after ToIntegerOrInfinity truncation) — but only
 * for a finite `value`: the spec returns `"NaN"` / `"Infinity"` before it
 * reaches the range check. This wrapper validates the same condition in the
 * same order and returns the failure as a tagged `Err`.
 *
 * @example
 *
 * ```ts
 * const okResult = SafeNumber.toPrecision(123.456, 4);
 *
 * assert.isTrue(Result.isOk(okResult));
 *
 * const errResult = SafeNumber.toPrecision(1, 0);
 *
 * assert.isTrue(Result.isErr(errResult));
 *
 * assert.deepStrictEqual(errResult.value, {
 *   kind: 'precision-out-of-range',
 *   precision: 0,
 * });
 * ```
 *
 * @param value The number to format.
 * @param precision The number of significant digits (1–100 inclusive after
 *   truncation).
 * @returns `Ok<string>` with the formatted representation, or a tagged
 *   `Err` — `'precision-out-of-range'` for the spec-defined failure,
 *   `'unexpected'` for anything the engine throws beyond it.
 */
export const toPrecision = (
  value: number,
  precision: number,
): Result<string, ToPrecisionError> => {
  if (Number.isFinite(value)) {
    const p = toIntegerOrInfinity(precision);

    if (p < 1 || p > 100) {
      return Result.err({ kind: 'precision-out-of-range', precision });
    }
  }

  return Result.mapErr(
    Result.fromThrowable(() => value.toPrecision(precision)),
    toUnexpectedError,
  );
};

/** The failure type of {@link toPrecision}. */
export type ToPrecisionError =
  | Readonly<{ kind: 'precision-out-of-range'; precision: number }>
  | UnexpectedError;
