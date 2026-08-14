import { Arr } from 'ts-data-forge';
import {
  type LambdaAbstraction,
  type LambdaApplication,
  type LambdaTerm,
} from '../types/index.mjs';
import { hasLength } from '../utils/index.mjs';
import { isVariable } from './is-variable.mjs';

export const isLambdaTerm = (term: unknown): term is LambdaTerm =>
  isVariable(term) || isAbstraction(term) || isApplication(term);

export const isAbstraction = (term: unknown): term is LambdaAbstraction => {
  if (!Arr.isArray(term) || !hasLength(term, 3)) return false;

  return term[0] === 'lambda' && isVariable(term[1]) && isLambdaTerm(term[2]);
};

export const isApplication = (term: unknown): term is LambdaApplication => {
  if (!Arr.isArray(term) || !hasLength(term, 2)) return false;

  return isLambdaTerm(term[0]) && isLambdaTerm(term[1]);
};
