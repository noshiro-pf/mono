import { unknownToString } from '../../../others/index.mjs';
import { isErr } from './result-is-err.mjs';
import { type UnwrapErr, type UnwrapOk } from './types.mjs';

/**
 * Unwraps a `Result`, returning the success value. Throws an error if the
 * `Result` is `Result.Err`.
 *
 * This is useful when you're confident that a Result should contain a success
 * value and want to treat errors as exceptional conditions. The error message
 * will be constructed from the error value using the provided string
 * conversion function.
 *
 * @example
 *
 * ```ts
 * const okResult = Result.ok('data');
 *
 * const errResult = Result.err(new Error('fail'));
 *
 * assert.isTrue(Result.unwrapThrow(okResult) === 'data');
 *
 * assert.throws(() => Result.unwrapThrow(errResult), Error, 'fail');
 * ```
 *
 * @template R The `UnknownResult` type to unwrap.
 * @param result The `Result` to unwrap.
 * @param toStr An optional function to convert the error value to a string
 *   for the error message. Defaults to `String`.
 * @returns The success value if `Result.Ok`.
 * @throws {Error} Error with the stringified error value if the `Result` is
 *   `Result.Err`.
 */
export const unwrapThrow = <R extends UnknownResult>(
  result: R,
  toStr: (e: UnwrapErr<R>) => string = unknownToString,
): UnwrapOk<R> => {
  if (isErr(result)) {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    throw new Error(toStr(result.value as UnwrapErr<R>));
  }

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return result.value as UnwrapOk<R>;
};
