import { isErr } from './ternary-result-is-err.mjs';
import { isWarn } from './ternary-result-is-warn.mjs';
import { ok } from './ternary-result-ok.mjs';
import { warn } from './ternary-result-warn.mjs';

/**
 * Combines two `TernaryResult`s, prioritising Err over Warn over Ok.
 *
 * @example
 *
 * ```ts
 * const okPair = TernaryResult.zip(TernaryResult.ok('left'), TernaryResult.ok(1));
 * const warnPair = TernaryResult.zip(
 *   TernaryResult.warn('left', 'warn'),
 *   TernaryResult.ok(1),
 * );
 * const errPair = TernaryResult.zip(
 *   TernaryResult.ok('left'),
 *   TernaryResult.err('err'),
 * );
 *
 * assert.deepStrictEqual(okPair, TernaryResult.ok(['left', 1] as const));
 * assert.deepStrictEqual(
 *   warnPair,
 *   TernaryResult.warn(['left', 1] as const, 'warn'),
 * );
 * assert.deepStrictEqual(errPair, TernaryResult.err('err'));
 * ```
 */
export const zip = <S1, W1, E1, S2, W2, E2>(
  resultA: TernaryResult<S1, E1, W1>,
  resultB: TernaryResult<S2, E2, W2>,
): TernaryResult<readonly [S1, S2], E1 | E2, W1 | W2> => {
  if (isErr(resultA)) {
    return resultA;
  }

  if (isErr(resultB)) {
    return resultB;
  }

  const pair = [resultA.value, resultB.value] as const;

  if (isWarn(resultA)) {
    return warn(pair, resultA.warning);
  }

  if (isWarn(resultB)) {
    return warn(pair, resultB.warning);
  }

  return ok(pair);
};
