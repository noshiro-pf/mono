import { Result } from 'ts-data-forge';

/**
 * Builds a string from Unicode code points without throwing.
 *
 * `String.fromCodePoint` throws a `RangeError` when a code point is not an
 * integer in the range 0–0x10FFFF, which is reachable whenever the code
 * points come from variables. This wrapper returns the failure as a `Result`
 * instead.
 *
 * @example
 *
 * ```ts
 * const okResult = SafeString.fromCodePoint(0x61, 0x1f600);
 *
 * assert.isTrue(Result.isOk(okResult));
 *
 * const errResult = SafeString.fromCodePoint(0x110000);
 *
 * assert.isTrue(Result.isErr(errResult));
 * ```
 *
 * @param codePoints The Unicode code points (each an integer in
 *   0–0x10FFFF).
 * @returns `Ok<string>` with the resulting string, `Err<Error>` if any code
 *   point is invalid.
 */
export const fromCodePoint = (
  ...codePoints: readonly number[]
): Result<string, Error> =>
  Result.fromThrowable(() => String.fromCodePoint(...codePoints));
