import { Result } from 'ts-data-forge';

/**
 * Formats a number to a given precision without throwing.
 *
 * `Number.prototype.toPrecision` throws a `RangeError` when `precision` is
 * outside the range 1–100, which is reachable whenever the precision comes
 * from a variable. This wrapper returns the failure as a `Result` instead.
 * (The zero-argument form of `toPrecision` is equivalent to `toString` and
 * never throws, so it is not wrapped here.)
 *
 * @example
 *
 * ```ts
 * const okResult = SafeNumber.toPrecision(123.456, 4);
 *
 * assert.isTrue(Result.isOk(okResult));
 *
 * const errResult = SafeNumber.toPrecision(1, 101);
 *
 * assert.isTrue(Result.isErr(errResult));
 * ```
 *
 * @param value The number to format.
 * @param precision The number of significant digits (1–100 inclusive).
 * @returns `Ok<string>` with the formatted representation, `Err<Error>` if
 *   `precision` is out of range.
 */
export const toPrecision = (
  value: number,
  precision: number,
): Result<string, Error> =>
  Result.fromThrowable(() => value.toPrecision(precision));
