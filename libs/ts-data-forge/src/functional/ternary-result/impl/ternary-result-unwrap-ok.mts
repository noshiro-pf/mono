import { isOk } from './ternary-result-is-ok.mjs';
import { isWarn } from './ternary-result-is-warn.mjs';
import { type UnwrapOk } from './types.mjs';

/**
 * Safely unwraps the Ok value.
 *
 * @example
 *
 * ```ts
 * const okValue = TernaryResult.ok(3);
 * const warnValue = TernaryResult.warn(4, 'warn');
 *
 * assert.strictEqual(TernaryResult.unwrapOk(okValue), 3);
 * assert.strictEqual(TernaryResult.unwrapOk(warnValue), 4);
 * ```
 */
export function unwrapOk<R extends TernaryOk<unknown>>(result: R): UnwrapOk<R>;
export function unwrapOk<R extends UnknownTernaryResult>(
  result: R,
): UnwrapOk<R> | undefined;

export function unwrapOk<R extends UnknownTernaryResult>(
  result: R,
): UnwrapOk<R> | undefined {
  if (isOk(result) || isWarn(result)) {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return result.value as UnwrapOk<R>;
  }

  return undefined;
}
