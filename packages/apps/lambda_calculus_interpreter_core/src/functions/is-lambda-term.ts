import { LambdaTerm } from '../types';
import { isAbstraction } from './is-abstraction';
import { isApplication } from './is-application';
import { isVariable } from './is-variable';

export const isLambdaTerm = (term: unknown): term is LambdaTerm =>
  isVariable(term) || isAbstraction(term) || isApplication(term);
