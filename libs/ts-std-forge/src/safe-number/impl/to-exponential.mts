import { Result } from 'ts-data-forge';

/**
 * Formats a number in exponential notation without throwing.
 *
 * `Number.prototype.toExponential` throws a `RangeError` when
 * `fractionDigits` is outside the range 0–100, which is reachable whenever
 * the digit count comes from a variable. This wrapper returns the failure as
 * a `Result` instead. When `fractionDigits` is omitted, as many digits as
 * necessary are used and the call cannot fail.
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
 * ```
 *
 * @param value The number to format.
 * @param fractionDigits Optional number of digits after the decimal point
 *   (0–100 inclusive). Omitted means as many digits as necessary.
 * @returns `Ok<string>` with the exponential representation, `Err<Error>` if
 *   `fractionDigits` is out of range.
 */
export const toExponential = (
  value: number,
  fractionDigits?: number,
): Result<string, Error> =>
  Result.fromThrowable(() => value.toExponential(fractionDigits));
