import { Result } from '../../result/index.mjs';
import { type AsyncResult } from '../async-result.mjs';

/**
 * Converts a `Promise` into an `AsyncResult`. If the input Promise resolves,
 * the `AsyncResult` resolves to `Ok` with the resolved value. If the input
 * Promise rejects, the rejection reason is passed through `mapError` and the
 * `AsyncResult` resolves to `Err` with the mapped error.
 *
 * Passing `mapError` is what gives the error channel a concrete type `E`.
 * Omitting it carries the rejection reason through untouched, leaving the
 * error channel as `unknown` — the same contract as `Result.fromPromise`.
 *
 * @example
 *
 * ```ts
 * const resolved = await AsyncResult.fromPromise(
 *   Promise.resolve('ok'),
 *   (error) => `failed: ${String(error)}`,
 * );
 *
 * const rejected = await AsyncResult.fromPromise(
 *   Promise.reject(new Error('boom')),
 *   (error) => (Error.isError(error) ? error.message : 'unknown'),
 * );
 *
 * assert.deepStrictEqual(resolved, Result.ok('ok'));
 *
 * assert.deepStrictEqual(rejected, Result.err('boom'));
 *
 * // Without `mapError`, the rejection reason is carried as-is.
 * const untyped = await AsyncResult.fromPromise(
 *   Promise.reject(new Error('boom')),
 * );
 *
 * assert.isTrue(Result.isErr(untyped));
 * ```
 *
 * @template S The type of the success value.
 * @template E The type of the error value.
 * @param promise The Promise to convert.
 * @param mapError The function applied to the rejection reason to produce the
 *   error value. Omit it to carry the rejection reason as `unknown`.
 * @returns An `AsyncResult<S, E>` that never rejects for the input Promise's
 *   failure.
 */
export function fromPromise<S>(promise: Promise<S>): AsyncResult<S, unknown>;

export function fromPromise<S, E>(
  promise: Promise<S>,
  mapError: (error: unknown) => E,
): AsyncResult<S, E>;

export function fromPromise<S, E>(
  promise: Promise<S>,
  mapError?: (error: unknown) => E,
): AsyncResult<S, E> | AsyncResult<S, unknown> {
  return mapError === undefined
    ? fromPromiseImpl(promise, (error: unknown) => error)
    : fromPromiseImpl(promise, mapError);
}

const fromPromiseImpl = <S, E>(
  promise: Promise<S>,
  mapError: (error: unknown) => E,
): AsyncResult<S, E> =>
  promise
    .then((value) => Result.ok(value))
    .catch((error: unknown) => Result.err(mapError(error)));
