import { err } from './result-err.mjs';
import { ok } from './result-ok.mjs';

/**
 * @template P The Promise type.
 * @internal
 * Utility type to extract the resolved value type from a Promise.
 */
type UnwrapPromise<P extends Promise<unknown>> =
  P extends Promise<infer V> ? V : never;

/**
 * Converts a Promise into a Promise that resolves to a `Result`. If the input
 * Promise resolves, the `Result` will be `Ok` with the resolved value. If the
 * input Promise rejects, the `Result` will be `Err` with the rejection
 * reason.
 *
 * @example
 *
 * ```ts
 * const successPromise = Result.fromPromise(Promise.resolve('ok'));
 *
 * const failurePromise = Result.fromPromise(Promise.reject(new Error('fail')));
 *
 * const resolved = await successPromise;
 *
 * const rejected = await failurePromise;
 *
 * assert.deepStrictEqual(resolved, Result.ok('ok'));
 *
 * assert.isTrue(Result.isErr(rejected));
 * ```
 *
 * @template P The type of the input Promise.
 * @param promise The Promise to convert.
 * @returns A Promise that resolves to `Result<UnwrapPromise<P>, unknown>`.
 */
export const fromPromise = <P extends Promise<unknown>>(
  promise: P,
): Promise<Result<UnwrapPromise<P>, unknown>> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  promise.then((v) => ok(v) as Ok<UnwrapPromise<P>>).catch(err);
