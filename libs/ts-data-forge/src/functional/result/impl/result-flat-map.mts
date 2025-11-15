import { isErr } from './result-is-err.mjs';
import { type UnwrapErr, type UnwrapOk } from './types.mjs';

/**
 * Applies a function that returns a `Result` to the success value of a
 * `Result`. If the input is `Err`, returns the original `Err`. This is the
 * monadic bind operation for `Result`.
 *
 * @example
 *
 * ```ts
 * const parseNumber = (input: string): Result<number, string> => {
 *   const num = Number.parseInt(input, 10);
 *
 *   return Number.isNaN(num) ? Result.err('not a number') : Result.ok(num);
 * };
 *
 * const parsed = Result.flatMap(Result.ok('42'), parseNumber);
 *
 * const failure = Result.flatMap(Result.ok('abc'), parseNumber);
 *
 * const passthrough = Result.flatMap(Result.err('fail'), parseNumber);
 *
 * assert.deepStrictEqual(parsed, Result.ok(42));
 *
 * assert.deepStrictEqual(failure, Result.err('not a number'));
 *
 * assert.deepStrictEqual(passthrough, Result.err('fail'));
 *
 * const parseThenDouble = Result.flatMap((input: string) =>
 *   Result.map(parseNumber(input), (value) => value * 2),
 * );
 *
 * assert.deepStrictEqual(parseThenDouble(Result.ok('10')), Result.ok(20));
 * ```
 *
 * @template R The input `UnknownResult` type.
 * @template S2 The success type of the `Result` returned by the function.
 * @template E2 The error type of the `Result` returned by the function.
 * @param result The `Result` to flat map.
 * @param flatMapFn The function to apply that returns a `Result`.
 * @returns The result of applying the function, or the original `Err`.
 */
export function flatMap<R extends UnknownResult, S2, E2>(
  result: R,
  flatMapFn: (value: UnwrapOk<R>) => Result<S2, E2>,
): Result<S2, E2 | UnwrapErr<R>>;

// Curried version
export function flatMap<S, S2, E2>(
  flatMapFn: (value: S) => Result<S2, E2>,
): <E>(result: Result<S, E>) => Result<S2, E | E2>;

export function flatMap<R extends UnknownResult, S2, E2>(
  ...args:
    | readonly [result: R, flatMapFn: (value: UnwrapOk<R>) => Result<S2, E2>]
    | readonly [flatMapFn: (value: UnwrapOk<R>) => Result<S2, E2>]
):
  | Result<S2, E2 | UnwrapErr<R>>
  | ((result: R) => Result<S2, UnwrapErr<R> | E2>) {
  switch (args.length) {
    case 2: {
      // Direct version: first argument is result
      const [result, flatMapFn] = args;

      return flatMapImpl(result, flatMapFn);
    }

    case 1: {
      // Curried version
      const [flatMapFn] = args;

      return (result: R) => flatMapImpl(result, flatMapFn);
    }
  }
}

const flatMapImpl = <R extends UnknownResult, S2, E2>(
  result: R,
  flatMapFn: (value: UnwrapOk<R>) => Result<S2, E2>,
): Result<S2, E2 | UnwrapErr<R>> =>
  isErr(result)
    ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      (result as Err<UnwrapErr<R>>)
    : // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      flatMapFn(result.value as UnwrapOk<R>);
