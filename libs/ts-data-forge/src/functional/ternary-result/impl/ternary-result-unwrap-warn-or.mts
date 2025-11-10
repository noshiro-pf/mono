import { unwrapWarn } from './ternary-result-unwrap-warn.mjs';
import { type UnwrapWarn } from './types.mjs';

/**
 * Returns the Warn value or the provided default.
 *
 * @example
 *
 * ```ts
 * const okValue = TernaryResult.ok('value');
 *
 * assert.strictEqual(TernaryResult.unwrapWarnOr(okValue, 'warn'), 'warn');
 * const unwrapWarn = TernaryResult.unwrapWarnOr('fallback warn');
 *
 * assert.strictEqual(unwrapWarn(TernaryResult.warn('value', 'slow')), 'slow');
 * assert.strictEqual(unwrapWarn(TernaryResult.err('err')), 'fallback warn');
 * ```
 */
export function unwrapWarnOr<R extends UnknownTernaryResult, D>(
  result: R,
  defaultValue: D,
): D | UnwrapWarn<R>;

// Curried version
export function unwrapWarnOr<W, D>(
  defaultValue: D,
): <S, E>(result: TernaryResult<S, E, W>) => D | W;

export function unwrapWarnOr<R extends UnknownTernaryResult, D>(
  ...args: readonly [result: R, defaultValue: D] | readonly [defaultValue: D]
): D | UnwrapWarn<R> | ((result: R) => D | UnwrapWarn<R>) {
  switch (args.length) {
    case 2: {
      const [result, defaultValue] = args;
      return unwrapWarn(result) ?? defaultValue;
    }
    case 1: {
      const [defaultValue] = args;
      return (result: R) => unwrapWarn(result) ?? defaultValue;
    }
  }
}
