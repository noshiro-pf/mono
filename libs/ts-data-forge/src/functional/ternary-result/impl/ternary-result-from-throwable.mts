import { isError } from '@sindresorhus/is';
import { unknownToString } from '../../../others/index.mjs';
import { err } from './ternary-result-err.mjs';
import { ok } from './ternary-result-ok.mjs';

/**
 * Wraps a potentially-throwing function in a `TernaryResult`.
 *
 * @example
 *
 * ```ts
 * const success = TernaryResult.fromThrowable(() => 1 + 1);
 * const failure = TernaryResult.fromThrowable(() => {
 *   throw new Error('boom');
 * });
 *
 * assert.deepStrictEqual(success, TernaryResult.ok(2));
 * assert.ok(TernaryResult.isErr(failure));
 * ```
 */
export const fromThrowable = <T,>(
  fn: () => T,
): TernaryResult<T, Error, never> => {
  try {
    return ok(fn());
  } catch (error) {
    if (isError(error)) {
      return err(error);
    }
    return err(new Error(unknownToString(error)));
  }
};
