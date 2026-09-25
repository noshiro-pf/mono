import { type LambdaTerm } from '../types/index.mjs';
import { isAbstraction, isApplication } from './is-lambda-term.mjs';
import { isVariable } from './is-variable.mjs';

export const termEq = (term1: LambdaTerm, term2: LambdaTerm): boolean =>
  isVariable(term1) && isVariable(term2)
    ? term1 === term2
    : isAbstraction(term1) && isAbstraction(term2)
      ? term1[1] === term2[1] && termEq(term1[2], term2[2])
      : isApplication(term1) &&
        isApplication(term2) &&
        termEq(term1[0], term2[0]) &&
        termEq(term1[1], term2[1]);
