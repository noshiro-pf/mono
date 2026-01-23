import { unknownToString } from '../../../others/index.mjs';
import { isErr } from './ternary-result-is-err.mjs';
import { isWarn } from './ternary-result-is-warn.mjs';
import { type UnwrapErr, type UnwrapOk, type UnwrapWarn } from './types.mjs';

/**
 * Returns the Ok value or throws if the result is Warn or Err.
 *
 * @example
 *
 * ```ts
 * const okValue = TernaryResult.ok('ready');
 *
 * assert.strictEqual(TernaryResult.unwrapThrow(okValue), 'ready');
 *
 * const throwTest = (): void => {
 *   TernaryResult.unwrapThrow(TernaryResult.warn('warn', 'warned'));
 * };
 *
 * assert.throws(throwTest, /Expected Ok/u);
 * ```
 */
export const unwrapThrow = <R extends UnknownTernaryResult>(
  result: R,
  toStr: (value: UnwrapWarn<R> | UnwrapErr<R>) => string = unknownToString,
): UnwrapOk<R> => {
  if (isErr(result)) {
    throw new Error(
      `Expected Ok but got Err: ${toStr(
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        result.value as UnwrapErr<R>,
      )}`,
    );
  }

  if (isWarn(result)) {
    throw new Error(
      `Expected Ok but got Warn: ${toStr(
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        result.warning as UnwrapWarn<R>,
      )}`,
    );
  }

  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  return result.value as UnwrapOk<R>;
};
