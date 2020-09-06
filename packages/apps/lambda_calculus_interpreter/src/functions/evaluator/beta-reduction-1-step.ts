import { LAMBDA } from '../../constants/lambda';
import { isAbstraction } from '../is-abstraction';
import { isApplication } from '../is-application';
import { isVariable } from '../is-variable';
import { termEq } from '../term-eq';
import { substitute } from './substitute';

export const betaReduction1step = (term: any): any => {
  // console.log( 'betaReduction1step', term );
  if (isVariable(term)) return term;
  if (isAbstraction(term)) {
    return [LAMBDA, term[1], betaReduction1step(term[2])];
  }
  if (isApplication(term)) {
    const left = term[0];
    const right = term[1];
    if (isAbstraction(left)) {
      const arg = left[1];
      const body = left[2];
      return substitute(right, arg, body);
    } else {
      const leftAfter1step: any = betaReduction1step(left);
      if (!termEq(leftAfter1step, left)) {
        return [leftAfter1step, right];
      } else {
        return [left, betaReduction1step(right)];
      }
    }
  }
  console.error(`Syntax error: "${term}" is not lambda term.`);
  return term;
};
