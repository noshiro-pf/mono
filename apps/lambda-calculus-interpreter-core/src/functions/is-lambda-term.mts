import { Arr } from 'ts-data-forge';
import type {
  LambdaAbstraction,
  LambdaApplication,
  LambdaTerm,
} from '../types/index.mjs';
import { isVariable } from './is-variable.mjs';

export const isLambdaTerm = (term: unknown): term is LambdaTerm =>
  isVariable(term) || isAbstraction(term) || isApplication(term);

export const isAbstraction = (term: unknown): term is LambdaAbstraction =>
  Arr.isArray(term) &&
  Arr.isFixedLengthTuple(3, term) &&
  term[0] === 'lambda' &&
  isVariable(term[1]) &&
  isLambdaTerm(term[2]);

export const isApplication = (term: unknown): term is LambdaApplication =>
  Arr.isArray(term) &&
  Arr.isFixedLengthTuple(2, term) &&
  isLambdaTerm(term[0]) &&
  isLambdaTerm(term[1]);
