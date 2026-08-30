import { Result } from '../../result/index.mjs';
import { type AsyncResult } from '../async-result.mjs';

/**
 * Wraps a function returning a `Promise` in an `AsyncResult`. Both a
 * synchronous `throw` while calling `fn` and an asynchronous rejection of the
 * returned Promise are caught, passed through `mapError`, and carried as
 * `Err`.
 *
 * @example
 *
 * ```ts
 * const success = await AsyncResult.fromThrowable(
 *   () => Promise.resolve(2),
 *   (error) => `failed: ${String(error)}`,
 * );
 *
 * const failure = await AsyncResult.fromThrowable(
 *   (): Promise<number> => {
 *     throw new Error('boom');
 *   },
 *   (error) => (Error.isError(error) ? error.message : 'unknown'),
 * );
 *
 * assert.deepStrictEqual(success, Result.ok(2));
 *
 * assert.deepStrictEqual(failure, Result.err('boom'));
 * ```
 *
 * @template S The type of the success value.
 * @template E The type of the error value.
 * @param fn The function to execute; it may throw synchronously or return a
 *   rejecting Promise.
 * @param mapError The function applied to the thrown value or rejection
 *   reason to produce the error value.
 * @returns An `AsyncResult<S, E>` containing either the resolved value or the
 *   mapped error.
 */
export const fromThrowable = async <S, E>(
  fn: () => Promise<S>,
  mapError: (error: unknown) => E,
): AsyncResult<S, E> => {
  try {
    return Result.ok(await fn());
  } catch (error) {
    return Result.err(mapError(error));
  }
};
