import { err } from './ternary-result-err.mjs';
import { ok } from './ternary-result-ok.mjs';

/** @internal Utility type extracting the resolved value from a Promise. */
type UnwrapPromise<P extends Promise<unknown>> =
  P extends Promise<infer V> ? V : never;

/**
 * Converts a Promise into a Promise that resolves to a `TernaryResult`.
 *
 * @example
 *
 * ```ts
 * const resolved = await TernaryResult.fromPromise(Promise.resolve('ok'));
 * const rejected = await TernaryResult.fromPromise(
 *   Promise.reject(new Error('fail')),
 * );
 *
 * assert.deepStrictEqual(resolved, TernaryResult.ok('ok'));
 * assert.ok(TernaryResult.isErr(rejected));
 * ```
 */
export const fromPromise = <P extends Promise<unknown>>(
  promise: P,
): Promise<TernaryResult<UnwrapPromise<P>, unknown, never>> =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  promise.then((value) => ok(value) as TernaryOk<UnwrapPromise<P>>).catch(err);
