import { isAbstraction } from './is-abstraction';
import { isApplication } from './is-application';
import { isVariable } from './is-variable';

export const isLambdaTerm = (term: any): boolean => {
  return isVariable(term) || isAbstraction(term) || isApplication(term);
};
