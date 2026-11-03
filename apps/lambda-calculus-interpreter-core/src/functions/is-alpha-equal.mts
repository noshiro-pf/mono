import { Arr } from 'ts-data-forge';
import type { FixedLengthTuple } from 'ts-type-forge';
import type { LambdaTerm, Variable } from '../types/index.mjs';
import { isAbstraction, isApplication } from './is-lambda-term.mjs';
import { isVariable } from './is-variable.mjs';

/**
 * Whether two terms differ only in the names of their bound variables.
 *
 * Abstractions are compared by pairing their binders rather than by renaming
 * one into the other, so a free variable named like the other term's binder is
 * never captured, and the result does not depend on the argument order.
 */
export const isAlphaEqual = (term1: LambdaTerm, term2: LambdaTerm): boolean =>
  isAlphaEqualUnder(term1, term2, []);

/**
 * @param binders The binders of the enclosing abstractions, outermost first,
 *   as pairs of the name in `term1` and the name in `term2`.
 */
const isAlphaEqualUnder = (
  term1: LambdaTerm,
  term2: LambdaTerm,
  binders: readonly FixedLengthTuple<2, Variable>[],
): boolean => {
  if (isVariable(term1) && isVariable(term2)) {
    const binder1 = binders.findLastIndex(([v]) => v === term1);

    const binder2 = binders.findLastIndex(([, v]) => v === term2);

    // Both bound by the same pair of binders, or both free and the same name.
    return binder1 === binder2 && (binder1 !== -1 || term1 === term2);
  }

  if (isAbstraction(term1) && isAbstraction(term2)) {
    return isAlphaEqualUnder(
      term1[2],
      term2[2],
      Arr.toPushed(binders, [term1[1], term2[1]]),
    );
  }

  return (
    isApplication(term1) &&
    isApplication(term2) &&
    isAlphaEqualUnder(term1[0], term2[0], binders) &&
    isAlphaEqualUnder(term1[1], term2[1], binders)
  );
};
