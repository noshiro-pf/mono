import type { LambdaTerm } from '../types';
import { isAbstraction, isApplication } from './is-lambda-term';
import { isVariable } from './is-variable';

export const termEq = (term1: LambdaTerm, term2: LambdaTerm): boolean => {
  if (isVariable(term1) && isVariable(term2)) {
    return term1 === term2;
  }
  if (isAbstraction(term1) && isAbstraction(term2)) {
    return term1[1] === term2[1] && termEq(term1[2], term2[2]);
  }
  if (isApplication(term1) && isApplication(term2)) {
    return termEq(term1[0], term2[0]) && termEq(term1[1], term2[1]);
  }
  return false;
};
