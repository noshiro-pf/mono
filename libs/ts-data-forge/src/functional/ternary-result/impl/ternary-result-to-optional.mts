import { Optional } from '../../optional/index.mjs';
import { isOk } from './ternary-result-is-ok.mjs';
import { isWarn } from './ternary-result-is-warn.mjs';
import { type UnwrapOk } from './types.mjs';

/**
 * Converts a `TernaryResult` into an `Optional` by keeping only Ok values.
 *
 * @example
 *
 * ```ts
 * const okValue = TernaryResult.ok(7);
 * const warnValue = TernaryResult.warn(7, 'warn');
 *
 * assert.deepStrictEqual(TernaryResult.toOptional(okValue), Optional.some(7));
 * assert.deepStrictEqual(TernaryResult.toOptional(warnValue), Optional.some(7));
 * ```
 */
export const toOptional = <R extends UnknownTernaryResult>(
  result: R,
): Optional<UnwrapOk<R>> =>
  isOk(result) || isWarn(result)
    ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      Optional.some(result.value as UnwrapOk<R>)
    : Optional.none;
