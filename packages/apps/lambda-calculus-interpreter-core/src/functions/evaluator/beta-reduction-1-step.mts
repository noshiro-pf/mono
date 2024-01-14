import { Json, Result } from '@noshiro/ts-utils';
import { type LambdaTerm } from '../../types/index.mjs';
import { isAbstraction, isApplication } from '../is-lambda-term.mjs';
import { isVariable } from '../is-variable.mjs';
import { termEq } from '../term-eq.mjs';
import { substitute } from './substitute.mjs';

export const betaReduction1step = (term: LambdaTerm): LambdaTerm => {
  // console.log( 'betaReduction1step', term );
  if (isVariable(term)) return term;
  if (isAbstraction(term)) {
    return ['lambda', term[1], betaReduction1step(term[2])];
  }
  if (isApplication(term)) {
    const left = term[0];
    const right = term[1];
    if (isAbstraction(left)) {
      const arg = left[1];
      const body = left[2];
      return substitute(right, arg, body);
    } else {
      const leftAfter1step = betaReduction1step(left);
      return !termEq(leftAfter1step, left)
        ? [leftAfter1step, right]
        : [left, betaReduction1step(right)];
    }
  }
  console.error(
    `Syntax error: "${Result.unwrapThrow(
      Json.stringify(term),
    )}" is not lambda term.`,
  );
  return term;
};
