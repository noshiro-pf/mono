import { type Err } from '../../../types.mjs';
import { type Result, type UnknownResult } from '../result.mjs';
import { isErr } from './result-is-err.mjs';
import { ok } from './result-ok.mjs';
import { type UnwrapErr, type UnwrapOk } from './types.mjs';

/**
 * Maps a `Result<S, E>` to `Result<S2, E>` by applying a function to the
 * success value. If the `Result` is `Result.Err`, returns the original
 * `Err`.
 *
 * @example
 *
 * ```ts
 * const okNumber = Result.ok(5);
 *
 * const errMessage = Result.err('error');
 *
 * const doubled = Result.map(okNumber, (value) => value * 2);
 *
 * const untouchedError = Result.map(errMessage, (value: number) => value * 2);
 *
 * assert.deepStrictEqual(doubled, Result.ok(10));
 *
 * assert.deepStrictEqual(untouchedError, errMessage);
 *
 * const mapToLength = Result.map((text: string) => text.length);
 *
 * assert.deepStrictEqual(mapToLength(Result.ok('abc')), Result.ok(3));
 *
 * assert.deepStrictEqual(mapToLength(Result.err('bad')), Result.err('bad'));
 * ```
 *
 * @template R The input `UnknownResult` type.
 * @template S2 The type of the success value returned by the mapping
 *   function.
 * @param result The `Result` to map.
 * @param mapFn The function to apply to the success value if present.
 * @returns A new `Result<S2, UnwrapErr<R>>`.
 */
export function map<R extends UnknownResult, S2>(
  result: R,
  mapFn: (value: UnwrapOk<R>) => S2,
): Result<S2, UnwrapErr<R>>;

// Curried version
//
// The returned function is generic over the *whole* result, mirroring the
// direct overload above, rather than fixing its parameter to `Result<S, E>`.
// Fixing it makes the curried form unusable from a caller that is itself
// generic over the result: with `S` bound to `UnwrapOk<R>` at currying time the
// parameter becomes `Result<...>` in terms of `R`, and TypeScript cannot show
// a bare `R extends UnknownResult` is assignable to that — although every
// concrete instantiation of `R` is.
//
// The conditional is what keeps the check: `R` is inferred from the argument
// and its success type still has to satisfy `S`, so the mismatched case stays an
// error. The cost is the message it produces — "not assignable to `never`"
// rather than naming the two results.
export function map<S, S2>(
  mapFn: (value: S) => S2,
): <R extends UnknownResult>(
  result: UnwrapOk<R> extends S ? R : never,
) => Result<S2, UnwrapErr<R>>;

export function map<R extends UnknownResult, S2>(
  ...args:
    | readonly [result: R, mapFn: (value: UnwrapOk<R>) => S2]
    | readonly [mapFn: (value: UnwrapOk<R>) => S2]
): Result<S2, UnwrapErr<R>> | ((result: R) => Result<S2, UnwrapErr<R>>) {
  switch (args.length) {
    case 2: {
      // Direct version: first argument is result
      const [result, mapFn] = args;

      return mapImpl(result, mapFn);
    }

    case 1: {
      // Curried version
      const [mapFn] = args;

      return (result: R) => mapImpl(result, mapFn);
    }
  }
}

const mapImpl = <R extends UnknownResult, S2>(
  result: R,
  mapFn: (value: UnwrapOk<R>) => S2,
): Result<S2, UnwrapErr<R>> =>
  isErr(result)
    ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      (result as Err<UnwrapErr<R>>)
    : // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      ok(mapFn(result.value as UnwrapOk<R>));
