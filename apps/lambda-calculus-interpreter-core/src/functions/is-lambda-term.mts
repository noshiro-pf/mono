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

export const isAbstraction = (term: unknown): term is LambdaAbstraction =>
  !Arr.isArray(term) || !hasLength(term, 3)
    ? false
    : term[0] === 'lambda' && isVariable(term[1]) && isLambdaTerm(term[2]);

export const isApplication = (term: unknown): term is LambdaApplication =>
  !Arr.isArray(term) || !hasLength(term, 2)
    ? false
    : isLambdaTerm(term[0]) && isLambdaTerm(term[1]);
