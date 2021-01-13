import { LambdaTerm } from '../types/lambda-term';
import { isAbstraction } from './is-abstraction';
import { isApplication } from './is-application';
import { isVariable } from './is-variable';

export const isLambdaTerm = (term: unknown): term is LambdaTerm => {
  return isVariable(term) || isAbstraction(term) || isApplication(term);
};
