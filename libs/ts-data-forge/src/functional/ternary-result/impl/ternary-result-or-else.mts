import { isOk } from './ternary-result-is-ok.mjs';
import { isWarn } from './ternary-result-is-warn.mjs';
import { type NarrowToOk, type NarrowToWarn } from './types.mjs';

/**
 * Returns the original result if it is Ok, otherwise the provided fallback.
 *
 * @example
 *
 * ```ts
 * const fallback = TernaryResult.ok('fallback');
 *
 * assert.deepStrictEqual(
 *   TernaryResult.orElse(TernaryResult.ok('value'), fallback),
 *   TernaryResult.ok('value'),
 * );
 * assert.deepStrictEqual(
 *   TernaryResult.orElse(TernaryResult.warn('value', 'warn'), fallback),
 *   TernaryResult.warn('value', 'warn'),
 * );
 * assert.deepStrictEqual(
 *   TernaryResult.orElse(TernaryResult.err('err'), fallback),
 *   fallback,
 * );
 * ```
 */
export function orElse<
  R extends UnknownTernaryResult,
  R2 extends UnknownTernaryResult,
>(result: R, alternative: R2): NarrowToOk<R> | NarrowToWarn<R> | R2;

// Curried version
export function orElse<S, W, E, S2, W2, E2>(
  alternative: TernaryResult<S2, E2, W2>,
): (
  result: TernaryResult<S, E, W>,
) => TernaryResult<S, E, W> | TernaryResult<S2, E2, W2>;

export function orElse<
  R extends UnknownTernaryResult,
  R2 extends UnknownTernaryResult,
>(
  ...args: readonly [result: R, alternative: R2] | readonly [alternative: R2]
):
  | (NarrowToOk<R> | NarrowToWarn<R> | R2)
  | ((result: R) => NarrowToOk<R> | NarrowToWarn<R> | R2) {
  switch (args.length) {
    case 2: {
      const [result, alternative] = args;
      return orElseImpl(result, alternative);
    }
    case 1: {
      const [alternative] = args;
      return (result: R) => orElseImpl(result, alternative);
    }
  }
}

const orElseImpl = <
  R extends UnknownTernaryResult,
  R2 extends UnknownTernaryResult,
>(
  result: R,
  alternative: R2,
): NarrowToOk<R> | NarrowToWarn<R> | R2 =>
  isOk(result) || isWarn(result) ? result : alternative;
