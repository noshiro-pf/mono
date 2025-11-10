import { unknownToString } from '../../../others/index.mjs';
import { err } from './result-err.mjs';
import { ok } from './result-ok.mjs';

/**
 * Wraps a function that may throw an exception in a `Result`.
 *
 * This is a fundamental utility for converting traditional exception-based
 * error handling into Result-based error handling. Any thrown value is
 * converted to an Error object for consistent error handling.
 *
 * If the function executes successfully, returns `Result.Ok` with the result.
 * If the function throws, returns `Result.Err` with the caught error.
 *
 * @example
 *
 * ```ts
 * const success = Result.fromThrowable(() => 1 + 1);
 * const failure = Result.fromThrowable(() => {
 *   throw new Error('boom');
 * });
 *
 * assert.deepStrictEqual(success, Result.ok(2));
 * assert.ok(Result.isErr(failure));
 * ```
 *
 * @template T The return type of the function.
 * @param fn The function to execute that may throw.
 * @returns A `Result<T, Error>` containing either the successful result or
 *   the caught error.
 */
export const fromThrowable = <T,>(fn: () => T): Result<T, Error> => {
  try {
    return ok(fn());
  } catch (error) {
    if (Error.isError(error)) {
      return err(error);
    }
    const msg = unknownToString(error);
    return err(new Error(msg));
  }
};
