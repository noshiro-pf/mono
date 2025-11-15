import { unwrapErr } from './ternary-result-unwrap-err.mjs';
import { type UnwrapErr } from './types.mjs';

/**
 * Returns the Err value or the provided default.
 *
 * @example
 *
 * ```ts
 * const okValue = TernaryResult.ok('value');
 *
 * assert.strictEqual(TernaryResult.unwrapErrOr(okValue, 'default'), 'default');
 *
 * const unwrapErr = TernaryResult.unwrapErrOr('fallback error');
 *
 * assert.strictEqual(unwrapErr(TernaryResult.err('boom')), 'boom');
 *
 * assert.strictEqual(
 *   unwrapErr(TernaryResult.warn('value', 'warn')),
 *   'fallback error',
 * );
 * ```
 */
export function unwrapErrOr<R extends UnknownTernaryResult, D>(
  result: R,
  defaultValue: D,
): D | UnwrapErr<R>;

// Curried version
export function unwrapErrOr<E, D>(
  defaultValue: D,
): <S, W>(result: TernaryResult<S, E, W>) => D | E;

export function unwrapErrOr<R extends UnknownTernaryResult, D>(
  ...args: readonly [result: R, defaultValue: D] | readonly [defaultValue: D]
): D | UnwrapErr<R> | ((result: R) => D | UnwrapErr<R>) {
  switch (args.length) {
    case 2: {
      const [result, defaultValue] = args;

      return unwrapErr(result) ?? defaultValue;
    }

    case 1: {
      const [defaultValue] = args;

      return (result: R) => unwrapErr(result) ?? defaultValue;
    }
  }
}
