import { isWarn } from './ternary-result-is-warn.mjs';
import { type UnwrapWarn } from './types.mjs';

/**
 * Safely unwraps the Warn value.
 *
 * @example
 *
 * ```ts
 * const warnValue = TernaryResult.warn('ok', 'careful');
 * const okValue = TernaryResult.ok('ok');
 *
 * assert.strictEqual(TernaryResult.unwrapWarn(warnValue), 'careful');
 * // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
 * assert.strictEqual(TernaryResult.unwrapWarn(okValue), undefined);
 * ```
 */
export const unwrapWarn = <R extends UnknownTernaryResult>(
  result: R,
): UnwrapWarn<R> | undefined =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  isWarn(result) ? (result.warning as UnwrapWarn<R>) : undefined;
