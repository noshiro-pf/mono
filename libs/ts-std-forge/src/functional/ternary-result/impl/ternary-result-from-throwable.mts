import { isError } from '../../../built-in-tag.mjs';
import { unknownToString } from '../../../others/index.mjs';
import { isPanicError } from '../../../panic/index.mjs';
import type { TernaryResult } from '../ternary-result.mjs';
import { err } from './ternary-result-err.mjs';
import { ok } from './ternary-result-ok.mjs';

/**
 * Wraps a potentially-throwing function in a `TernaryResult`. A panic (see
 * `isPanicError`) is rethrown rather than wrapped, as `Result.fromThrowable`
 * does: it marks a bug, not a failure to hand back.
 *
 * @example
 *
 * ```ts
 * const success = TernaryResult.fromThrowable(() => 1 + 1);
 *
 * const failure = TernaryResult.fromThrowable(() => {
 *   throw new Error('boom');
 * });
 *
 * assert.deepStrictEqual(success, TernaryResult.ok(2));
 *
 * assert.isTrue(TernaryResult.isErr(failure));
 * ```
 */
export const fromThrowable = <T,>(
  fn: () => T,
): TernaryResult<T, Error, never> => {
  try {
    return ok(fn());
  } catch (error) {
    if (isPanicError(error)) {
      throw error;
    }

    return isError(error) ? err(error) : err(new Error(unknownToString(error)));
  }
};
