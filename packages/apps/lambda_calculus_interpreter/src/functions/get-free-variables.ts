import { Variable } from '../types/variable';
import { isAbstraction } from './is-abstraction';
import { isApplication } from './is-application';
import { isVariable } from './is-variable';

export const getFreeVariables = (term: any): Variable[] => {
  if (isVariable(term)) return [term];
  if (isAbstraction(term)) {
    return getFreeVariables(term[2]).filter((ch) => ch !== term[1]);
  }
  if (isApplication(term)) {
    return [...getFreeVariables(term[0]), ...getFreeVariables(term[1])];
  }
  return [];
};
