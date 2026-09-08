import { Result } from '../../result/index.mjs';
import { type AsyncResult } from '../async-result.mjs';

/**
 * Maps an `AsyncResult<S, E>` to `AsyncResult<S2, E>` by applying a function
 * to the success value. The mapping function may be synchronous or return a
 * `Promise`; both are handled transparently. If the `AsyncResult` resolves to
 * `Err`, the original `Err` is passed through and the function is not called.
 *
 * If `mapFn` throws or returns a rejecting Promise, the rejection propagates
 * as-is — it is **not** caught and converted into an `Err`. `map` performs no
 * implicit error conversion; write a fallible step as
 * `AsyncResult.flatMap` combined with `AsyncResult.fromThrowable` instead, so
 * that the error type stays explicit.
 *
 * @example
 *
 * ```ts
 * const okValue = AsyncResult.fromPromise(
 *   Promise.resolve(5),
 *   () => 'failed',
 * );
 *
 * const doubled = await AsyncResult.map(okValue, (value) => value * 2);
 *
 * assert.deepStrictEqual(doubled, Result.ok(10));
 *
 * const double = AsyncResult.map((value: number) => value * 2);
 *
 * const curried = await double(
 *   AsyncResult.fromPromise(Promise.resolve(21), () => 'failed'),
 * );
 *
 * assert.deepStrictEqual(curried, Result.ok(42));
 * ```
 *
 * @template S The type of the success value of the input.
 * @template S2 The type of the success value returned by the mapping
 *   function.
 * @template E The type of the error value.
 * @param asyncResult The `AsyncResult` to map.
 * @param mapFn The function to apply to the success value if present.
 * @returns A new `AsyncResult<S2, E>`.
 */
export function map<S, S2, E>(
  asyncResult: AsyncResult<S, E>,
  mapFn: (value: S) => Promise<S2> | S2,
): AsyncResult<S2, E>;

// Curried version
//
// Unlike `Result.map`, the returned function can simply be generic over `E`:
// an `AsyncResult` is a `Promise`, not a discriminated union, so there is no
// literal-narrowing problem that would require the whole-result generic
// trick used by the synchronous combinators.
export function map<S, S2>(
  mapFn: (value: S) => Promise<S2> | S2,
): <E>(asyncResult: AsyncResult<S, E>) => AsyncResult<S2, E>;

export function map<S, S2, E>(
  ...args:
    | readonly [
        asyncResult: AsyncResult<S, E>,
        mapFn: (value: S) => Promise<S2> | S2,
      ]
    | readonly [mapFn: (value: S) => Promise<S2> | S2]
):
  | AsyncResult<S2, E>
  | ((asyncResult: AsyncResult<S, E>) => AsyncResult<S2, E>) {
  switch (args.length) {
    case 2: {
      // Direct version: first argument is asyncResult
      const [asyncResult, mapFn] = args;

      return mapImpl(asyncResult, mapFn);
    }

    case 1: {
      // Curried version
      const [mapFn] = args;

      return (asyncResult: AsyncResult<S, E>) => mapImpl(asyncResult, mapFn);
    }
  }
}

const mapImpl = async <S, S2, E>(
  asyncResult: AsyncResult<S, E>,
  mapFn: (value: S) => Promise<S2> | S2,
): AsyncResult<S2, E> => {
  const result = await asyncResult;

  return Result.isErr(result) ? result : Result.ok(await mapFn(result.value));
};
