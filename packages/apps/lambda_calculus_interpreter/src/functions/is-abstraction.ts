import { LAMBDA } from '../constants/lambda';
import { isLambdaTerm } from './is-lambda-term';
import { isVariable } from './is-variable';

export const isAbstraction = (term: any): boolean => {
  if (!term || !Array.isArray(term) || term.length !== 3) return false;
  return term[0] === LAMBDA && isVariable(term[1]) && isLambdaTerm(term[2]);
};
