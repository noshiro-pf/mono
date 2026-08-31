import { Result } from 'ts-data-forge';

/**
 * Formats a number in fixed-point notation without throwing.
 *
 * `Number.prototype.toFixed` throws a `RangeError` when `fractionDigits` is
 * outside the range 0–100, which is reachable whenever the digit count comes
 * from a variable. This wrapper returns the failure as a `Result` instead.
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
 * ```
 *
 * @param value The number to format.
 * @param fractionDigits The number of digits after the decimal point
 *   (0–100 inclusive).
 * @returns `Ok<string>` with the fixed-point representation, `Err<Error>` if
 *   `fractionDigits` is out of range.
 */
export const toFixed = (
  value: number,
  fractionDigits: number,
): Result<string, Error> =>
  Result.fromThrowable(() => value.toFixed(fractionDigits));
