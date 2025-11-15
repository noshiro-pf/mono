import { unknownToString } from '../../../others/index.mjs';
import { isWarn } from './ternary-result-is-warn.mjs';
import { type UnwrapErr, type UnwrapOk, type UnwrapWarn } from './types.mjs';
import { variantName } from './variant-name.mjs';

/**
 * Returns the Warn value or throws if the result is not Warn.
 *
 * @example
 *
 * ```ts
 * const warnValue = TernaryResult.warn('pending', 'check logs');
 *
 * assert.strictEqual(TernaryResult.unwrapWarnThrow(warnValue), 'check logs');
 *
 * assert.throws(
 *   () => TernaryResult.unwrapWarnThrow(TernaryResult.err('err')),
 *   /Expected Warn/u,
 * );
 * ```
 */
export const unwrapWarnThrow = <R extends UnknownTernaryResult>(
  result: R,
  toStr: (value: UnwrapOk<R> | UnwrapErr<R>) => string = unknownToString,
): UnwrapWarn<R> => {
  if (isWarn(result)) {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return result.warning as UnwrapWarn<R>;
  }

  const variant = variantName(result.$$tag);

  throw new Error(
    `Expected Warn but got ${variant}: ${toStr(
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      result.value as UnwrapOk<R> | UnwrapErr<R>,
    )}`,
  );
};
