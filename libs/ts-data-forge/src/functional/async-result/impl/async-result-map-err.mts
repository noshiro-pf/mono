import { Result } from '../../result/index.mjs';
import { type AsyncResult } from '../async-result.mjs';

/**
 * Maps an `AsyncResult<S, E>` to `AsyncResult<S, E2>` by applying a function
 * to the error value. The mapping function may be synchronous or return a
 * `Promise`; both are handled transparently. If the `AsyncResult` resolves to
 * `Ok`, the original `Ok` is passed through and the function is not called.
 *
 * If `mapFn` throws or returns a rejecting Promise, the rejection propagates
 * as-is — it is **not** caught and converted into an `Err`.
 *
 * @example
 *
 * ```ts
 * const errValue = AsyncResult.fromPromise(
 *   Promise.reject(new Error('boom')),
 *   () => 'failure',
 * );
 *
 * const uppercased = await AsyncResult.mapErr(errValue, (error) =>
 *   error.toUpperCase(),
 * );
 *
 * assert.deepStrictEqual(uppercased, Result.err('FAILURE'));
 * ```
 *
 * @template S The type of the success value.
 * @template E The type of the error value of the input.
 * @template E2 The type of the error value returned by the mapping function.
 * @param asyncResult The `AsyncResult` to map.
 * @param mapFn The function to apply to the error value if present.
 * @returns A new `AsyncResult<S, E2>`.
 */
export function mapErr<S, E, E2>(
  asyncResult: AsyncResult<S, E>,
  mapFn: (error: E) => E2 | Promise<E2>,
): AsyncResult<S, E2>;

// Curried version
//
// Unlike `Result.mapErr`, the returned function can simply be generic over
// `S`: an `AsyncResult` is a `Promise`, not a discriminated union, so there
// is no literal-narrowing problem that would require the whole-result
// generic trick used by the synchronous combinators.
export function mapErr<E, E2>(
  mapFn: (error: E) => E2 | Promise<E2>,
): <S>(asyncResult: AsyncResult<S, E>) => AsyncResult<S, E2>;

export function mapErr<S, E, E2>(
  ...args:
    | readonly [
        asyncResult: AsyncResult<S, E>,
        mapFn: (error: E) => E2 | Promise<E2>,
      ]
    | readonly [mapFn: (error: E) => E2 | Promise<E2>]
):
  | AsyncResult<S, E2>
  | ((asyncResult: AsyncResult<S, E>) => AsyncResult<S, E2>) {
  switch (args.length) {
    case 2: {
      // Direct version: first argument is asyncResult
      const [asyncResult, mapFn] = args;

      return mapErrImpl(asyncResult, mapFn);
    }

    case 1: {
      // Curried version: first argument is mapping function
      const [mapFn] = args;

      return (asyncResult: AsyncResult<S, E>) => mapErrImpl(asyncResult, mapFn);
    }
  }
}

const mapErrImpl = async <S, E, E2>(
  asyncResult: AsyncResult<S, E>,
  mapFn: (error: E) => E2 | Promise<E2>,
): AsyncResult<S, E2> => {
  const result = await asyncResult;

  return Result.isOk(result) ? result : Result.err(await mapFn(result.value));
};
