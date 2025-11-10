import { unknownToString } from '../../../others/index.mjs';
import { isErr } from './ternary-result-is-err.mjs';
import { isWarn } from './ternary-result-is-warn.mjs';
import { type UnwrapErr, type UnwrapOk, type UnwrapWarn } from './types.mjs';
import { variantName } from './variant-name.mjs';

/**
 * Returns the Err value or throws if the result is not Err.
 *
 * @example
 *
 * ```ts
 * const errValue = TernaryResult.err('boom');
 *
 * assert.strictEqual(TernaryResult.unwrapErrThrow(errValue), 'boom');
 * assert.throws(
 *   () => TernaryResult.unwrapErrThrow(TernaryResult.ok('value')),
 *   /Expected Err/u,
 * );
 * ```
 */
export const unwrapErrThrow = <R extends UnknownTernaryResult>(
  result: R,
  toStr: (value: UnwrapOk<R> | UnwrapWarn<R>) => string = unknownToString,
): UnwrapErr<R> => {
  if (isErr(result)) {
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return result.value as UnwrapErr<R>;
  }

  const variant = variantName(result.$$tag);

  const payload = isWarn(result)
    ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      (result.warning as UnwrapWarn<R> as UnwrapOk<R> | UnwrapWarn<R>)
    : // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      (result.value as UnwrapOk<R> as UnwrapOk<R> | UnwrapWarn<R>);

  throw new Error(`Expected Err but got ${variant}: ${toStr(payload)}`);
};
