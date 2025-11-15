import { err } from './result-err.mjs';
import { isOk } from './result-is-ok.mjs';
import { ok } from './result-ok.mjs';
import { type UnwrapErr, type UnwrapOk } from './types.mjs';

/**
 * Applies one of two functions depending on whether the `Result` is `Ok` or
 * `Err`.
 *
 * @example
 *
 * ```ts
 * const okValue = Result.ok(2);
 *
 * const errValue = Result.err('bad');
 *
 * const foldedOk = Result.fold(
 *   okValue,
 *   (value) => value * 2,
 *   (error) => error,
 * );
 *
 * const foldedErr = Result.fold(
 *   errValue,
 *   (value: number) => value * 2,
 *   (error) => error.toUpperCase(),
 * );
 *
 * assert.deepStrictEqual(foldedOk, Result.ok(4));
 *
 * assert.deepStrictEqual(foldedErr, Result.err('BAD'));
 *
 * const foldNumbers = Result.fold(
 *   (value: number) => value * 3,
 *   (error: string) => error.length,
 * );
 *
 * assert.deepStrictEqual(foldNumbers(Result.ok(3)), Result.ok(9));
 *
 * assert.deepStrictEqual(foldNumbers(Result.err('oops')), Result.err(4));
 * ```
 *
 * @template R The input `UnknownResult` type.
 * @template S2 The type of the success value returned by `mapFn`.
 * @template E2 The type of the error value returned by `mapErrFn`.
 * @param result The `Result` to fold.
 * @param mapFn The function to apply if `result` is `Ok`.
 * @param mapErrFn The function to apply if `result` is `Err`.
 * @returns A new `Result<S2, E2>` based on the applied function.
 */
export function fold<R extends UnknownResult, S2, E2>(
  result: R,
  mapFn: (value: UnwrapOk<R>) => S2,
  mapErrFn: (error: UnwrapErr<R>) => E2,
): Result<S2, E2>;

// Curried version
export function fold<S, E, S2, E2>(
  mapFn: (value: S) => S2,
  mapErrFn: (error: E) => E2,
): (result: Result<S, E>) => Result<S2, E2>;

export function fold<R extends UnknownResult, S2, E2>(
  ...args:
    | readonly [
        result: R,
        mapFn: (value: UnwrapOk<R>) => S2,
        mapErrFn: (error: UnwrapErr<R>) => E2,
      ]
    | readonly [
        mapFn: (value: UnwrapOk<R>) => S2,
        mapErrFn: (error: UnwrapErr<R>) => E2,
      ]
): Result<S2, E2> | ((result: R) => Result<S2, E2>) {
  switch (args.length) {
    case 3: {
      // Direct version: first argument is result
      const [result, mapFn, mapErrFn] = args;

      return foldImpl(result, mapFn, mapErrFn);
    }

    case 2: {
      // Curried version
      const [mapFn, mapErrFn] = args;

      return (result: R) => foldImpl(result, mapFn, mapErrFn);
    }
  }
}

const foldImpl = <R extends UnknownResult, S2, E2>(
  result: R,
  mapFn: (value: UnwrapOk<R>) => S2,
  mapErrFn: (error: UnwrapErr<R>) => E2,
): Result<S2, E2> =>
  isOk(result)
    ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      ok(mapFn(result.value as UnwrapOk<R>))
    : // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      err(mapErrFn(result.value as UnwrapErr<R>));
