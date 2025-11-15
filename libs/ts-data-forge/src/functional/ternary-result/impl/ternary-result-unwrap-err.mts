import { isErr } from './ternary-result-is-err.mjs';
import { type UnwrapErr } from './types.mjs';

/**
 * Safely unwraps the Err value.
 *
 * @example
 *
 * ```ts
 * const errValue = TernaryResult.err('fail');
 *
 * const okValue = TernaryResult.ok('value');
 *
 * assert.strictEqual(TernaryResult.unwrapErr(errValue), 'fail');
 *
 * // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
 * assert.strictEqual(TernaryResult.unwrapErr(okValue), undefined);
 * ```
 */
export const unwrapErr = <R extends UnknownTernaryResult>(
  result: R,
): UnwrapErr<R> | undefined =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  isErr(result) ? (result.value as UnwrapErr<R>) : undefined;
