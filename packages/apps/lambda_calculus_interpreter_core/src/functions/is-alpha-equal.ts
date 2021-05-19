import type { LambdaTerm } from '../types';
import { alphaConversion } from './evaluator';
import { isAbstraction, isApplication } from './is-lambda-term';
import { isVariable } from './is-variable';

export const isAlphaEqual = (term1: LambdaTerm, term2: LambdaTerm): boolean => {
  if (isVariable(term1) && isVariable(term2)) {
    return term1 === term2;
  }
  if (isAbstraction(term1) && isAbstraction(term2)) {
    if (term1[1] === term2[1]) {
      return isAlphaEqual(term1[2], term2[2]);
    } else {
      const term2converted = alphaConversion(term1[1], term2);
      return isAlphaEqual(term1[2], term2converted[2]);
    }
  }
  if (isApplication(term1) && isApplication(term2)) {
    return isAlphaEqual(term1[0], term2[0]) && isAlphaEqual(term1[1], term2[1]);
  }
  return false;
};
