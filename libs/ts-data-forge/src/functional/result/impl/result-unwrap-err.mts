import { isErr } from './result-is-err.mjs';
import { type UnwrapErr } from './types.mjs';

/**
 * Unwraps a `Result`, returning the error value or `undefined` if it is
 * `Result.Ok`.
 *
 * This provides a safe way to extract error values from Results without
 * throwing exceptions. Useful for error handling patterns where you want to
 * check for specific error conditions.
 *
 * @example
 *
 * ```ts
 * const okResult = Result.ok('data');
 * const errResult = Result.err('problem');
 *
 * // Result.unwrapErr returns undefined for Ok results
 *
 * // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
 * assert(Result.unwrapErr(okResult) === undefined);
 *
 * // Result.unwrapErr returns the error value for Err results
 *
 * assert(Result.unwrapErr(errResult) === 'problem');
 * ```
 *
 * @template R The `UnknownResult` type to unwrap.
 * @param result The `Result` to unwrap.
 * @returns The error value if `Result.Err`, otherwise `undefined`.
 */
export const unwrapErr = <R extends UnknownResult>(
  result: R,
): UnwrapErr<R> | undefined =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  isErr(result) ? (result.value as UnwrapErr<R>) : undefined;
