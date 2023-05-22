import { Arr } from '@noshiro/ts-utils';
import {
  type LambdaAbstraction,
  type LambdaApplication,
  type LambdaTerm,
} from '../types';
import { isVariable } from './is-variable';

export const isLambdaTerm = (term: unknown): term is LambdaTerm =>
  isVariable(term) || isAbstraction(term) || isApplication(term);

export const isAbstraction = (term: unknown): term is LambdaAbstraction => {
  if (!Array.isArray(term) || !Arr.isArrayOfLength3(term)) return false;
  return term[0] === 'lambda' && isVariable(term[1]) && isLambdaTerm(term[2]);
};

export const isApplication = (term: unknown): term is LambdaApplication => {
  if (!Array.isArray(term) || !Arr.isArrayOfLength2(term)) return false;
  return isLambdaTerm(term[0]) && isLambdaTerm(term[1]);
};
