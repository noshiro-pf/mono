import { Result, type UnknownResult } from '../../result/index.mjs';
import { type AsyncResult } from '../async-result.mjs';
import {
  type UnknownAsyncResult,
  type UnwrapErr,
  type UnwrapOk,
} from './types.mjs';

/**
 * Applies a function that returns an `AsyncResult` or a `Result` to the
 * success value of an `AsyncResult`. If the input resolves to `Err`, the
 * original `Err` is passed through and the function is not called. This is
 * the monadic bind operation for `AsyncResult`.
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
 * const input = AsyncResult.fromPromise(
 *   Promise.resolve('42'),
 *   () => 'failed',
 * );
 *
 * const parsed = await AsyncResult.flatMap(input, parseNumber);
 *
 * assert.deepStrictEqual(parsed, Result.ok(42));
 * ```
 *
 * @template S The type of the success value of the input.
 * @template E The type of the error value of the input.
 * @template R2 The `AsyncResult` or `Result` type returned by the function.
 * @param asyncResult The `AsyncResult` to flat map.
 * @param flatMapFn The function to apply that returns an `AsyncResult` or a
 *   `Result`.
 * @returns The result of applying the function, or the original `Err`.
 */
export function flatMap<S, E, R2 extends UnknownAsyncResult | UnknownResult>(
  asyncResult: AsyncResult<S, E>,
  flatMapFn: (value: S) => R2,
): AsyncResult<UnwrapOk<R2>, E | UnwrapErr<R2>>;

// Curried version
//
// The function's return type is captured as a whole (`R2`) and unwrapped with
// `UnwrapOk` / `UnwrapErr`, instead of being written as
// `AsyncResult<S2, E2> | Result<S2, E2>` with separate `S2` / `E2` type
// parameters. With the union form, inference for `E2` collects a candidate
// from matching `Ok<S2>` against `Err<E2>` (both have a `value` property), so
// `E2` ends up as the success type and the call fails to type-check even for
// a function annotated as returning `Result<S2, E2>`.
export function flatMap<S, R2 extends UnknownAsyncResult | UnknownResult>(
  flatMapFn: (value: S) => R2,
): <E>(
  asyncResult: AsyncResult<S, E>,
) => AsyncResult<UnwrapOk<R2>, E | UnwrapErr<R2>>;

export function flatMap<S, E, R2 extends UnknownAsyncResult | UnknownResult>(
  ...args:
    | readonly [asyncResult: AsyncResult<S, E>, flatMapFn: (value: S) => R2]
    | readonly [flatMapFn: (value: S) => R2]
):
  | AsyncResult<UnwrapOk<R2>, E | UnwrapErr<R2>>
  | ((
      asyncResult: AsyncResult<S, E>,
    ) => AsyncResult<UnwrapOk<R2>, E | UnwrapErr<R2>>) {
  switch (args.length) {
    case 2: {
      // Direct version: first argument is asyncResult
      const [asyncResult, flatMapFn] = args;

      return flatMapImpl(asyncResult, flatMapFn);
    }

    case 1: {
      // Curried version
      const [flatMapFn] = args;

      return (asyncResult: AsyncResult<S, E>) =>
        flatMapImpl(asyncResult, flatMapFn);
    }
  }
}

const flatMapImpl = async <S, E, R2 extends UnknownAsyncResult | UnknownResult>(
  asyncResult: AsyncResult<S, E>,
  flatMapFn: (value: S) => R2,
): AsyncResult<UnwrapOk<R2>, E | UnwrapErr<R2>> => {
  const result = await asyncResult;

  return Result.isErr(result)
    ? result
    : // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      ((await flatMapFn(result.value)) as Result<UnwrapOk<R2>, UnwrapErr<R2>>);
};
