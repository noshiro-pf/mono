import { Result } from '../../result/index.mjs';
import { type AsyncResult } from '../async-result.mjs';

/**
 * Unwraps an `AsyncResult`, resolving to the success value or a default value
 * if it resolves to `Err`.
 *
 * @example
 *
 * ```ts
 * const okValue = AsyncResult.fromPromise(
 *   Promise.resolve(10),
 *   () => 'failed',
 * );
 *
 * const errValue = AsyncResult.fromPromise(
 *   Promise.reject(new Error('boom')),
 *   () => 'failed',
 * );
 *
 * assert.isTrue((await AsyncResult.unwrapOr(okValue, 0)) === 10);
 *
 * assert.isTrue((await AsyncResult.unwrapOr(errValue, 0)) === 0);
 * ```
 *
 * @template S The type of the success value.
 * @template E The type of the error value.
 * @template D The type of the default value.
 * @param asyncResult The `AsyncResult` to unwrap.
 * @param defaultValue The value to resolve to if `asyncResult` resolves to
 *   `Err`.
 * @returns A Promise of the success value if `Ok`, otherwise of
 *   `defaultValue`.
 */
export const unwrapOr = async <S, E, D>(
  asyncResult: AsyncResult<S, E>,
  defaultValue: D,
): Promise<D | S> => {
  const result = await asyncResult;

  return Result.isOk(result) ? result.value : defaultValue;
};
