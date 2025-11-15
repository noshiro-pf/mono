import { unknownToString } from '../../../others/index.mjs';
import { match } from '../../match.mjs';
import { isErr } from './result-is-err.mjs';
import { type UnwrapErr, type UnwrapOk } from './types.mjs';

/**
 * Unwraps a `Result`, returning the error value. Throws an error if the
 * `Result` is `Result.Ok`.
 *
 * This function is used when you expect a Result to be an error and want to
 * extract the error value. If the Result is unexpectedly Ok, it will throw an
 * error with information about the unexpected success value.
 *
 * @example
 *
 * ```ts
 * const errResult = Result.err(new Error('broken'));
 *
 * const okResult = Result.ok('value');
 *
 * assert(Result.unwrapErrThrow(errResult).message === 'broken');
 *
 * assert.throws(() => Result.unwrapErrThrow(okResult), /Expected Err/u);
 * ```
 *
 * @template R The `UnknownResult` type to unwrap.
 * @param result The `Result` to unwrap.
 * @param toStr An optional function to convert the success value to a string
 *   for the error message when the Result is unexpectedly Ok. Defaults to
 *   `String`.
 * @returns The error value if `Result.Err`.
 * @throws {Error} Error with message "Expected Err but got Ok: {value}" if
 *   the `Result` is `Result.Ok`.
 */
export const unwrapErrThrow = <R extends UnknownResult>(
  result: R,
  toStr: (v: UnwrapOk<R>) => string = unknownToString,
): UnwrapErr<R> => {
  if (isErr(result)) {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return result.value as UnwrapErr<R>;
  }

  const variant = match(result.$$tag, {
    'ts-data-forge::Result.ok': 'Ok',
    'ts-data-forge::Result.err': 'Err',
  });

  throw new Error(
    `Expected Err but got ${variant}: ${toStr(
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      result.value as UnwrapOk<R>,
    )}`,
  );
};
