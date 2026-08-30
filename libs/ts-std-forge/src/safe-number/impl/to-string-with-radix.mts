import { Result } from 'ts-data-forge';

/**
 * Converts a number to a string in a given radix without throwing.
 *
 * `Number.prototype.toString` throws a `RangeError` when `radix` is outside
 * the range 2–36, which is reachable whenever the radix comes from a
 * variable. This wrapper returns the failure as a `Result` instead. For the
 * default base-10 conversion, prefer `String(value)` or a template literal,
 * which never throw.
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
 * ```
 *
 * @param value The number to convert.
 * @param radix The base to use (2–36 inclusive).
 * @returns `Ok<string>` with the representation in the given radix,
 *   `Err<Error>` if `radix` is out of range.
 */
export const toStringWithRadix = (
  value: number,
  radix: number,
): Result<string, Error> => Result.fromThrowable(() => value.toString(radix));
