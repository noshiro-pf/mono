import { unwrapOk } from './ternary-result-unwrap-ok.mjs';
import { type UnwrapOk } from './types.mjs';

/**
 * Returns the Ok value or the provided default.
 *
 * @example
 *
 * ```ts
 * const errValue = TernaryResult.err('err');
 *
 * assert.strictEqual(TernaryResult.unwrapOkOr(errValue, 0), 0);
 * const unwrapWithDefault = TernaryResult.unwrapOkOr('fallback');
 *
 * assert.strictEqual(unwrapWithDefault(TernaryResult.ok(5)), 5);
 * assert.strictEqual(
 *   unwrapWithDefault(TernaryResult.warn('warn-value', 'warn')),
 *   'warn-value',
 * );
 * ```
 */
export function unwrapOkOr<R extends UnknownTernaryResult, D>(
  result: R,
  defaultValue: D,
): D | UnwrapOk<R>;

// Curried version
export function unwrapOkOr<S, D>(
  defaultValue: D,
): <W, E>(result: TernaryResult<S, E, W>) => D | S;

export function unwrapOkOr<R extends UnknownTernaryResult, D>(
  ...args: readonly [result: R, defaultValue: D] | readonly [defaultValue: D]
): D | UnwrapOk<R> | ((result: R) => D | UnwrapOk<R>) {
  switch (args.length) {
    case 2: {
      const [result, defaultValue] = args;
      return unwrapOk(result) ?? defaultValue;
    }
    case 1: {
      const [defaultValue] = args;
      return (result: R) => unwrapOk(result) ?? defaultValue;
    }
  }
}
