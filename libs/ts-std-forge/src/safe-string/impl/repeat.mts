import { Result } from 'ts-data-forge';

/**
 * Repeats a string a given number of times without throwing.
 *
 * `String.prototype.repeat` throws a `RangeError` when `count` is negative
 * or infinite (or when the resulting string would exceed the maximum string
 * length), which is reachable whenever the count comes from a variable. This
 * wrapper returns the failure as a `Result` instead.
 *
 * @example
 *
 * ```ts
 * const okResult = SafeString.repeat('ab', 3);
 *
 * assert.isTrue(Result.isOk(okResult));
 *
 * const errResult = SafeString.repeat('ab', -1);
 *
 * assert.isTrue(Result.isErr(errResult));
 * ```
 *
 * @param value The string to repeat.
 * @param count The number of repetitions (a non-negative finite number).
 * @returns `Ok<string>` with the repeated string, `Err<Error>` if `count` is
 *   out of range or the result would be too long.
 */
export const repeat = (value: string, count: number): Result<string, Error> =>
  Result.fromThrowable(() => value.repeat(count));
