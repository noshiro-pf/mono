import { Result } from 'ts-data-forge';

/**
 * Converts a `Date` to an ISO 8601 string without throwing.
 *
 * `Date.prototype.toISOString` throws a `RangeError` when the date is invalid
 * (e.g. `new Date(Number.NaN)`). This wrapper returns the failure as a
 * `Result` instead. (`Date.prototype.toJSON` does not throw — it returns
 * `null` for invalid dates — so only `toISOString` needs wrapping.)
 *
 * @example
 *
 * ```ts
 * const okResult = SafeDate.toISOString(new Date(0));
 *
 * assert.isTrue(Result.isOk(okResult));
 *
 * const errResult = SafeDate.toISOString(new Date(Number.NaN));
 *
 * assert.isTrue(Result.isErr(errResult));
 * ```
 *
 * @param date The date to convert.
 * @returns `Ok<string>` with the ISO 8601 representation, `Err<Error>` if the
 *   date is invalid.
 */
export const toISOString = (date: Readonly<Date>): Result<string, Error> =>
  Result.fromThrowable(() => date.toISOString());
