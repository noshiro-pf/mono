import { type Ok } from '../../../types.mjs';
import { type Result, type UnknownResult } from '../result.mjs';
import { err } from './result-err.mjs';
import { isOk } from './result-is-ok.mjs';
import { type UnwrapErr, type UnwrapOk } from './types.mjs';

/**
 * Maps a `Result<S, E>` to `Result<S, E2>` by applying a function to the
 * error value. If the `Result` is `Result.Ok`, returns the original `Ok`.
 *
 * @example
 *
 * ```ts
 * const okValue = Result.ok(3) as Result<number, string>;
 *
 * const errValue = Result.err('missing');
 *
 * const untouchedOk = Result.mapErr(okValue, (error) => error.toUpperCase());
 *
 * const uppercasedErr = Result.mapErr(errValue, (error) =>
 *   error.toUpperCase(),
 * );
 *
 * assert.deepStrictEqual(untouchedOk, Result.ok(3));
 *
 * assert.deepStrictEqual(uppercasedErr, Result.err('MISSING'));
 *
 * const mapError = Result.mapErr((error: Readonly<Error>) => error.message);
 *
 * const wrapped = mapError(Result.err(new Error('boom')));
 *
 * assert.deepStrictEqual(wrapped, Result.err('boom'));
 * ```
 *
 * @template R The input `UnknownResult` type.
 * @template E2 The type of the error value returned by the mapping function.
 * @param result The `Result` to map.
 * @param mapFn The function to apply to the error value if present.
 * @returns A new `Result<UnwrapOk<R>, E2>`.
 */
export function mapErr<R extends UnknownResult, E2>(
  result: R,
  mapFn: (error: UnwrapErr<R>) => E2,
): Result<UnwrapOk<R>, E2>;

// Curried version
//
// The returned function is generic over the *whole* result, mirroring the
// direct overload above, rather than fixing its parameter to `Result<S, E>`.
// Fixing it makes the curried form unusable from a caller that is itself
// generic over the result: with `E` bound to `UnwrapErr<R>` at currying time the
// parameter becomes `Result<...>` in terms of `R`, and TypeScript cannot show
// a bare `R extends UnknownResult` is assignable to that — although every
// concrete instantiation of `R` is.
//
// The conditional is what keeps the check: `R` is inferred from the argument
// and its error type still has to satisfy `E`, so the mismatched case stays an
// error. The cost is the message it produces — "not assignable to `never`"
// rather than naming the two results.
export function mapErr<E, E2>(
  mapFn: (error: E) => E2,
): <R extends UnknownResult>(
  result: UnwrapErr<R> extends E ? R : never,
) => Result<UnwrapOk<R>, E2>;

export function mapErr<R extends UnknownResult, E2>(
  ...args:
    | readonly [result: R, mapFn: (error: UnwrapErr<R>) => E2]
    | readonly [mapFn: (error: UnwrapErr<R>) => E2]
): Result<UnwrapOk<R>, E2> | ((result: R) => Result<UnwrapOk<R>, E2>) {
  switch (args.length) {
    case 2: {
      // Direct version: first argument is result
      const [result, mapFn] = args;

      return mapErrImpl(result, mapFn);
    }

    case 1: {
      // Curried version: first argument is mapping function
      const [mapFn] = args;

      return (result: R) => mapErrImpl(result, mapFn);
    }
  }
}

const mapErrImpl = <R extends UnknownResult, E2>(
  result: R,
  mapFn: (error: UnwrapErr<R>) => E2,
): Result<UnwrapOk<R>, E2> =>
  isOk(result)
    ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      (result as Ok<UnwrapOk<R>>)
    : // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      err(mapFn(result.value as UnwrapErr<R>));
